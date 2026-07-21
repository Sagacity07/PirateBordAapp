import {describe,expect,it} from 'vitest';
import {seedData} from './data';
import {mergeSession1,session1Campaign,session1Journal} from './session1';

describe('Session 1 records',()=>{
  it('adds the recap, structured records, and journal',()=>{const result=mergeSession1(seedData());expect(result.campaign).toHaveLength(session1Campaign.length);expect(result.campaign.find(record=>record.id==='ship-driftwood')?.notes).toContain('150 silver');expect(result.journal[0]).toEqual(session1Journal)});
  it('is idempotent and never creates duplicates',()=>{const once=mergeSession1(seedData()),twice=mergeSession1(once);expect(twice).toEqual(once);expect(new Set(twice.campaign.map(record=>record.id)).size).toBe(twice.campaign.length)});
  it('preserves existing records and character data',()=>{const data=seedData();data.character.name='Pip “Two-Toes”';data.campaign.push({id:'custom',type:'quest',title:'Custom',status:'Open',notes:'Keep me',createdAt:'now'});const result=mergeSession1(data);expect(result.character.name).toBe('Pip “Two-Toes”');expect(result.campaign.find(record=>record.id==='custom')?.notes).toBe('Keep me')});
  it('uses only supported campaign record types',()=>{expect(session1Campaign.every(record=>['session','npc','location','quest','ship','rumor','treasure'].includes(record.type))).toBe(true)});
});
