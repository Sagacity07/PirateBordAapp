import {beforeEach,describe,expect,it,vi} from 'vitest';
import type {CampaignRecord,JournalEntry} from './types';

const mocks=vi.hoisted(()=>{
  const chain:any={error:null};
  chain.upsert=vi.fn(()=>Promise.resolve({error:null}));
  chain.insert=vi.fn(()=>Promise.resolve({error:null}));
  chain.update=vi.fn(()=>chain);
  chain.select=vi.fn(()=>Promise.resolve({data:[{id:'record-1'}],error:null}));
  chain.single=vi.fn(()=>Promise.resolve({data:{id:'campaign-new',name:'Fresh Crew',invite_code:'ABC123',owner_id:'user-1'},error:null}));
  chain.delete=vi.fn(()=>chain);
  chain.eq=vi.fn(()=>chain);
  return{chain,from:vi.fn(()=>chain)};
});
vi.mock('./supabase',()=>({supabase:{from:mocks.from}}));

import {applyCampaignRecordConditional,createCampaign,flushCloudQueue,journalMutation,queueMutation,recordMutation,removeRecordMutation} from './cloud';

const record:CampaignRecord={id:'record-1',type:'quest',title:'Find the reef',status:'Open',notes:'Follow the map',createdAt:'2026-08-15T00:00:00Z'};
const journal:JournalEntry={id:'journal-1',kind:'character',title:'Secret',body:'Never trust the parrot.',pinned:false,createdAt:'2026-08-15T00:00:00Z',visibility:'private'};

describe('cloud mutation queue',()=>{
  const values=new Map<string,string>();
  beforeEach(()=>{
    values.clear();mocks.from.mockClear();mocks.chain.upsert.mockReset();mocks.chain.upsert.mockResolvedValue({error:null});mocks.chain.insert.mockReset();mocks.chain.insert.mockResolvedValue({error:null});mocks.chain.update.mockClear();mocks.chain.select.mockReset();mocks.chain.select.mockResolvedValue({data:[{id:'record-1'}],error:null});mocks.chain.single.mockReset();mocks.chain.single.mockResolvedValue({data:{id:'campaign-new',name:'Fresh Crew',invite_code:'ABC123',owner_id:'user-1'},error:null});mocks.chain.delete.mockClear();mocks.chain.eq.mockClear();
    vi.stubGlobal('localStorage',{getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>values.set(key,value),removeItem:(key:string)=>values.delete(key)});
  });

  it('writes campaign records with campaign and owner identity',async()=>{
    await queueMutation('user-1',recordMutation('campaign-1','user-1',record));
    expect(mocks.from).toHaveBeenCalledWith('campaign_records');
    expect(mocks.chain.upsert).toHaveBeenCalledWith({id:'record-1',campaign_id:'campaign-1',data:record,updated_by:'user-1'});
  });

  it('keeps journal entries private by default',async()=>{
    await queueMutation('user-1',journalMutation('campaign-1','user-1',journal));
    expect(mocks.from).toHaveBeenCalledWith('journal_entries');
    expect(mocks.chain.upsert).toHaveBeenCalledWith(expect.objectContaining({owner_id:'user-1',visibility:'private'}));
  });

  it('queues failed writes and retries them later',async()=>{
    mocks.chain.upsert.mockResolvedValueOnce({error:new Error('offline')});
    await expect(queueMutation('user-1',recordMutation('campaign-1','user-1',record))).rejects.toThrow('offline');
    expect(JSON.parse(values.get('pirate-borg-cloud-queue:user-1')??'[]')).toHaveLength(1);
    await expect(flushCloudQueue('user-1')).resolves.toBe(1);
    expect(JSON.parse(values.get('pirate-borg-cloud-queue:user-1')??'[]')).toHaveLength(0);
  });

  it('sends deletes to the correct shared campaign row',async()=>{
    await queueMutation('user-1',removeRecordMutation('campaign-1','record-1'));
    expect(mocks.chain.delete).toHaveBeenCalledOnce();
    expect(mocks.chain.eq).toHaveBeenNthCalledWith(1,'campaign_id','campaign-1');
    expect(mocks.chain.eq).toHaveBeenNthCalledWith(2,'id','record-1');
  });

  it('uses compare-and-set semantics for transcript updates',async()=>{
    const next={...record,status:'Complete'};
    await expect(applyCampaignRecordConditional('campaign-1','user-1',next,record)).resolves.toEqual({applied:true,conflict:false});
    expect(mocks.chain.update).toHaveBeenCalledWith({data:next,updated_by:'user-1'});
    expect(mocks.chain.eq).toHaveBeenCalledWith('data',record);
  });

  it('reports a conflict when the source row changed before the write',async()=>{
    mocks.chain.select.mockResolvedValueOnce({data:[],error:null});
    await expect(applyCampaignRecordConditional('campaign-1','user-1',{...record,status:'Complete'},record)).resolves.toEqual({applied:false,conflict:true});
  });

  it('creates a clean campaign without copying records or journals from another campaign',async()=>{
    mocks.chain.insert.mockImplementation(()=>mocks.chain);
    mocks.chain.select.mockImplementation(()=>mocks.chain);
    await expect(createCampaign('user-1',' Fresh Crew ')).resolves.toEqual({id:'campaign-new',name:'Fresh Crew',inviteCode:'ABC123',ownerId:'user-1',role:'owner'});
    expect(mocks.chain.insert).toHaveBeenCalledWith({name:'Fresh Crew',owner_id:'user-1'});
    expect(mocks.chain.upsert).not.toHaveBeenCalled();
  });
});
