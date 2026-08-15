import type {RealtimeChannel,User} from '@supabase/supabase-js';
import {normalizeData} from './data';
import {supabase} from './supabase';
import type {AppData,CampaignRecord,JournalEntry} from './types';

export interface CloudCampaign{id:string;name:string;inviteCode:string;ownerId:string;role:'owner'|'player'}
export interface CloudHydration{data:AppData;campaigns:CloudCampaign[];activeCampaignId:string|null}
export type CloudStatus='offline'|'syncing'|'synced'|'error';
type CloudMutation=
  |{kind:'upsert-record';campaignId:string;userId:string;record:CampaignRecord}
  |{kind:'delete-record';campaignId:string;recordId:string}
  |{kind:'upsert-journal';campaignId:string|null;userId:string;entry:JournalEntry}
  |{kind:'delete-journal';entryId:string};

const queueKey=(userId:string)=>`pirate-borg-cloud-queue:${userId}`;
const readQueue=(userId:string):CloudMutation[]=>{try{return JSON.parse(localStorage.getItem(queueKey(userId))||'[]')}catch{return[]}};
const writeQueue=(userId:string,value:CloudMutation[])=>localStorage.setItem(queueKey(userId),JSON.stringify(value));

function campaignFromMembership(row:any):CloudCampaign{
  const campaign=Array.isArray(row.campaigns)?row.campaigns[0]:row.campaigns;
  return{id:campaign.id,name:campaign.name,inviteCode:campaign.invite_code,ownerId:campaign.owner_id,role:row.role};
}

export async function listCampaigns():Promise<CloudCampaign[]>{
  const {data,error}=await supabase.from('campaign_members').select('role,campaigns!inner(id,name,invite_code,owner_id)').order('joined_at');
  if(error)throw error;return(data??[]).map(campaignFromMembership);
}

async function saveInitialPrivateState(userId:string,data:AppData){
  const {error}=await supabase.from('player_states').upsert({user_id:userId,character:data.character,rules:data.rules,rolls:data.rolls,settings:data.settings},{onConflict:'user_id'});
  if(error)throw error;
  if(data.journal.length){const {error:journalError}=await supabase.from('journal_entries').upsert(data.journal.map(entry=>({id:entry.id,campaign_id:null,owner_id:userId,visibility:entry.visibility??'private',data:{...entry,ownerId:userId}})));if(journalError)throw journalError}
}

export async function hydrateCloudData(user:User,fallback:AppData):Promise<CloudHydration>{
  const {data:state,error}=await supabase.from('player_states').select('*').eq('user_id',user.id).maybeSingle();
  if(error)throw error;
  if(!state)await saveInitialPrivateState(user.id,fallback);
  const campaigns=await listCampaigns();
  const activeCandidate=state?.active_campaign_id as string|null|undefined;
  const activeCampaignId=campaigns.some(c=>c.id===activeCandidate)?activeCandidate??null:campaigns[0]?.id??null;
  const privateData=state?normalizeData({...fallback,character:state.character,rules:state.rules,rolls:state.rolls,settings:state.settings}):fallback;
  if(activeCampaignId&&activeCampaignId!==activeCandidate)await setActiveCampaign(user.id,activeCampaignId);
  return{data:await refreshSharedData(user.id,activeCampaignId,privateData),campaigns,activeCampaignId};
}

export async function refreshSharedData(userId:string,campaignId:string|null,current:AppData):Promise<AppData>{
  const recordQuery=campaignId?supabase.from('campaign_records').select('data').eq('campaign_id',campaignId):null;
  const journalQuery=campaignId
    ?supabase.from('journal_entries').select('data,owner_id,visibility,campaign_id').or(`owner_id.eq.${userId},campaign_id.eq.${campaignId}`)
    :supabase.from('journal_entries').select('data,owner_id,visibility,campaign_id').eq('owner_id',userId);
  const [records,journals]=await Promise.all([recordQuery,journalQuery]);
  if(records?.error)throw records.error;if(journals.error)throw journals.error;
  const campaign=campaignId?(records?.data??[]).map((row:any)=>row.data as CampaignRecord):current.campaign;
  const journal=(journals.data??[]).map((row:any)=>({...row.data,ownerId:row.owner_id,visibility:row.visibility} as JournalEntry));
  return{...current,campaign,journal};
}

export async function savePlayerState(userId:string,campaignId:string|null,data:AppData){
  const {error}=await supabase.from('player_states').upsert({user_id:userId,active_campaign_id:campaignId,character:data.character,rules:data.rules,rolls:data.rolls,settings:data.settings},{onConflict:'user_id'});if(error)throw error;
}

export async function createCampaign(userId:string,name:string):Promise<CloudCampaign>{
  const {data:created,error}=await supabase.from('campaigns').insert({name:name.trim(),owner_id:userId}).select('id,name,invite_code,owner_id').single();if(error)throw error;
  await setActiveCampaign(userId,created.id);
  return{id:created.id,name:created.name,inviteCode:created.invite_code,ownerId:created.owner_id,role:'owner'};
}

export async function joinCampaign(userId:string,code:string){const {data,error}=await supabase.rpc('join_campaign',{code:code.trim()});if(error)throw error;await setActiveCampaign(userId,data as string);return data as string}
export async function setActiveCampaign(userId:string,campaignId:string|null){const {error}=await supabase.from('player_states').update({active_campaign_id:campaignId}).eq('user_id',userId);if(error)throw error}

export async function applyCampaignRecordConditional(campaignId:string,userId:string,next:CampaignRecord,expected?:CampaignRecord){
  if(!expected){const {error}=await supabase.from('campaign_records').insert({id:next.id,campaign_id:campaignId,data:next,updated_by:userId});return{applied:!error,conflict:Boolean(error)}}
  const {data,error}=await supabase.from('campaign_records').update({data:next,updated_by:userId}).eq('campaign_id',campaignId).eq('id',next.id).eq('data',expected).select('id');
  if(error)throw error;
  return{applied:Boolean(data?.length),conflict:!data?.length};
}

async function applyMutation(mutation:CloudMutation){
  if(mutation.kind==='upsert-record'){const {error}=await supabase.from('campaign_records').upsert({id:mutation.record.id,campaign_id:mutation.campaignId,data:mutation.record,updated_by:mutation.userId});if(error)throw error;return}
  if(mutation.kind==='delete-record'){const {error}=await supabase.from('campaign_records').delete().eq('campaign_id',mutation.campaignId).eq('id',mutation.recordId);if(error)throw error;return}
  if(mutation.kind==='upsert-journal'){const entry={...mutation.entry,ownerId:mutation.userId};const {error}=await supabase.from('journal_entries').upsert({id:entry.id,campaign_id:mutation.campaignId,owner_id:mutation.userId,visibility:entry.visibility??'private',data:entry});if(error)throw error;return}
  const {error}=await supabase.from('journal_entries').delete().eq('id',mutation.entryId);if(error)throw error;
}

export async function queueMutation(userId:string,mutation:CloudMutation){try{await applyMutation(mutation)}catch(error){writeQueue(userId,[...readQueue(userId),mutation]);throw error}}
export async function flushCloudQueue(userId:string){const pending=readQueue(userId);if(!pending.length)return 0;const remaining:CloudMutation[]=[];for(const mutation of pending){try{await applyMutation(mutation)}catch{remaining.push(mutation)}}writeQueue(userId,remaining);if(remaining.length)throw new Error(`${remaining.length} offline changes still waiting`);return pending.length}

export const recordMutation=(campaignId:string,userId:string,record:CampaignRecord):CloudMutation=>({kind:'upsert-record',campaignId,userId,record});
export const removeRecordMutation=(campaignId:string,recordId:string):CloudMutation=>({kind:'delete-record',campaignId,recordId});
export const journalMutation=(campaignId:string|null,userId:string,entry:JournalEntry):CloudMutation=>({kind:'upsert-journal',campaignId,userId,entry});
export const removeJournalMutation=(entryId:string):CloudMutation=>({kind:'delete-journal',entryId});

export function subscribeToCampaign(campaignId:string,onChange:()=>void):RealtimeChannel{
  return supabase.channel(`campaign:${campaignId}`)
    .on('postgres_changes',{event:'*',schema:'public',table:'campaign_records',filter:`campaign_id=eq.${campaignId}`},onChange)
    .on('postgres_changes',{event:'*',schema:'public',table:'journal_entries',filter:`campaign_id=eq.${campaignId}`},onChange)
    .subscribe();
}
