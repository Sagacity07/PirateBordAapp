import {beforeEach,describe,expect,it,vi} from 'vitest';
import {seedData} from './data';

const mocks=vi.hoisted(()=>({get:vi.fn(),put:vi.fn(),createObjectStore:vi.fn()}));
vi.mock('idb',()=>({openDB:vi.fn((_name:string,_version:number,options:{upgrade:(db:{createObjectStore:typeof mocks.createObjectStore})=>void})=>{options.upgrade({createObjectStore:mocks.createObjectStore});return Promise.resolve({get:mocks.get,put:mocks.put})})}));
import {loadData,saveData} from './db';

describe('persistence',()=>{
  beforeEach(()=>{mocks.get.mockReset();mocks.put.mockReset()});
  it('creates the state object store during upgrade',()=>expect(mocks.createObjectStore).toHaveBeenCalledWith('state'));
  it('returns persisted data with Session 1 merged in',async()=>{const data=seedData();mocks.get.mockResolvedValue(data);const loaded=await loadData();expect(loaded.character).toEqual(data.character);expect(loaded.campaign.find(record=>record.id==='session-1')).toBeDefined();expect(mocks.get).toHaveBeenCalledWith('state','app')});
  it('returns fresh seed data when storage is empty',async()=>{mocks.get.mockResolvedValue(undefined);const first=await loadData(),second=await loadData();expect(first.character.name).toBe('Unnamed Scoundrel');expect(first).not.toBe(second)});
  it('saves the complete state under the canonical key',async()=>{mocks.put.mockResolvedValue(undefined);const data=seedData();await saveData(data);expect(mocks.put).toHaveBeenCalledWith('state',data,'app')});
  it('propagates write failures to the caller',async()=>{mocks.put.mockRejectedValue(new Error('disk full'));await expect(saveData(seedData())).rejects.toThrow('disk full')});
});
