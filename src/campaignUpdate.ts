import type {CampaignRecord,Character,JournalEntry} from './types';

export type CampaignUpdateAction='create'|'update';
export interface CampaignUpdateChange{
  id:string;
  action:CampaignUpdateAction;
  entityType:CampaignRecord['type'];
  entityId:string;
  baseHash?:string;
  data:Pick<CampaignRecord,'title'|'status'|'notes'> & Partial<Pick<CampaignRecord,'createdAt'>>;
  confidence?:number;
  evidence?:string;
}
export interface CampaignUpdateFile{
  schemaVersion:'1.0';
  importType:'campaign-update';
  campaignId:string;
  createdAt:string;
  changes:CampaignUpdateChange[];
  warnings?:string[];
}
export interface CampaignUpdateReview{
  change:CampaignUpdateChange;
  status:'ready'|'conflict';
  message:string;
}

const campaignTypes=new Set<CampaignRecord['type']>(['session','npc','location','quest','ship','rumor','treasure']);
const isObject=(value:unknown):value is Record<string,unknown>=>typeof value==='object'&&value!==null&&!Array.isArray(value);
const required=(value:unknown,path:string)=>{if(typeof value!=='string'||!value.trim())throw new Error(`${path} must be a non-empty string`);return value};

export function recordHash(record:CampaignRecord){
  const value=JSON.stringify({id:record.id,type:record.type,title:record.title,status:record.status,notes:record.notes,createdAt:record.createdAt});
  let hash=2166136261;
  for(let index=0;index<value.length;index++){hash^=value.charCodeAt(index);hash=Math.imul(hash,16777619)}
  return (hash>>>0).toString(16).padStart(8,'0');
}

export function createAiPackage(input:{campaignId:string;campaignName:string;character:Character;records:CampaignRecord[];journal:JournalEntry[]}){
  return{
    schemaVersion:'1.0',
    packageType:'pirate-borg-ai-package',
    createdAt:new Date().toISOString(),
    campaign:{id:input.campaignId,name:input.campaignName},
    ownerCharacter:input.character,
    sharedCampaignRecords:input.records.map(record=>({...record,contentHash:recordHash(record)})),
    sharedJournalEntries:input.journal.filter(entry=>entry.visibility==='shared'),
    instructions:{
      outputType:'campaign-update',
      rule:'Return proposed create/update operations only. Never invent an existing entityId.',
      updates:'For every update, copy entityId and contentHash from the source record into entityId and baseHash. Preserve useful existing facts in the replacement data.',
      creations:'For every create, generate a unique entityId and omit baseHash.',
      safety:'Do not propose deleting records. Put uncertainties in warnings and include evidence when possible.'
    }
  };
}

export function parseCampaignUpdate(raw:string):CampaignUpdateFile{
  let value:unknown;
  try{value=JSON.parse(raw)}catch{throw new Error('The campaign update is not valid JSON.')}
  if(!isObject(value))throw new Error('The campaign update must contain a JSON object.');
  if(value.schemaVersion!=='1.0')throw new Error('Only campaign update schema version 1.0 is supported.');
  if(value.importType!=='campaign-update')throw new Error('This is not a campaign-update file.');
  const campaignId=required(value.campaignId,'campaignId');
  if(!Array.isArray(value.changes))throw new Error('changes must be an array.');
  const ids=new Set<string>();
  const changes=value.changes.map((rawChange,index)=>{
    if(!isObject(rawChange))throw new Error(`changes[${index}] must be an object.`);
    const id=required(rawChange.id,`changes[${index}].id`);
    if(ids.has(id))throw new Error(`Duplicate change ID: ${id}`);ids.add(id);
    if(rawChange.action!=='create'&&rawChange.action!=='update')throw new Error(`changes[${index}].action must be create or update.`);
    if(!campaignTypes.has(rawChange.entityType as CampaignRecord['type']))throw new Error(`changes[${index}].entityType is unsupported.`);
    const entityId=required(rawChange.entityId,`changes[${index}].entityId`);
    if(!isObject(rawChange.data))throw new Error(`changes[${index}].data must be an object.`);
    const data={title:required(rawChange.data.title,`changes[${index}].data.title`),status:required(rawChange.data.status,`changes[${index}].data.status`),notes:typeof rawChange.data.notes==='string'?rawChange.data.notes:'',...(typeof rawChange.data.createdAt==='string'?{createdAt:rawChange.data.createdAt}:{})};
    if(rawChange.action==='update')required(rawChange.baseHash,`changes[${index}].baseHash`);
    return{id,action:rawChange.action,entityType:rawChange.entityType as CampaignRecord['type'],entityId,baseHash:typeof rawChange.baseHash==='string'?rawChange.baseHash:undefined,data,confidence:typeof rawChange.confidence==='number'?rawChange.confidence:undefined,evidence:typeof rawChange.evidence==='string'?rawChange.evidence:undefined} as CampaignUpdateChange;
  });
  return{schemaVersion:'1.0',importType:'campaign-update',campaignId,createdAt:typeof value.createdAt==='string'?value.createdAt:new Date().toISOString(),changes,warnings:Array.isArray(value.warnings)?value.warnings.filter((item):item is string=>typeof item==='string'):[]};
}

export function reviewCampaignUpdate(update:CampaignUpdateFile,campaignId:string,records:CampaignRecord[]):CampaignUpdateReview[]{
  if(update.campaignId!==campaignId)throw new Error('This update belongs to a different campaign.');
  const byId=new Map(records.map(record=>[record.id,record]));
  return update.changes.map(change=>{
    const current=byId.get(change.entityId);
    if(change.action==='create')return current
      ?{change,status:'conflict',message:'That record ID already exists.'}
      :{change,status:'ready',message:'New shared campaign record.'};
    if(!current)return{change,status:'conflict',message:'The record no longer exists.'};
    if(current.type!==change.entityType)return{change,status:'conflict',message:'The record type changed since export.'};
    if(recordHash(current)!==change.baseHash)return{change,status:'conflict',message:'Someone changed this record after the AI package was exported.'};
    return{change,status:'ready',message:'The source record is unchanged and can be safely updated.'};
  });
}

export function applyReviewedChanges(records:CampaignRecord[],reviews:CampaignUpdateReview[],selectedIds:Set<string>){
  const accepted=reviews.filter(review=>review.status==='ready'&&selectedIds.has(review.change.id));
  const next=[...records];
  for(const {change} of accepted){
    const record:CampaignRecord={id:change.entityId,type:change.entityType,title:change.data.title,status:change.data.status,notes:change.data.notes,createdAt:change.data.createdAt??new Date().toISOString()};
    const index=next.findIndex(existing=>existing.id===change.entityId);
    if(index>=0)next[index]=record;else next.unshift(record);
  }
  return{records:next,applied:accepted.map(review=>review.change)};
}

