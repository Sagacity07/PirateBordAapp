import {describe,expect,it} from 'vitest';
import {addUniqueCondition,campaignHighlights,clampHp,damageHp,healHp,nonNegativeInteger,removeById,spendResource} from './domain';

describe('character domain rules',()=>{
  it.each([[3,3],[-1,0],[2.9,2],[Number.NaN,0],[Number.POSITIVE_INFINITY,0]])('normalizes %s to %s',(input,expected)=>expect(nonNegativeInteger(input)).toBe(expected));
  it('clamps HP between zero and maximum',()=>{expect(clampHp(-3,7)).toBe(0);expect(clampHp(9,7)).toBe(7);expect(clampHp(4,7)).toBe(4)});
  it('heals without exceeding maximum',()=>expect(healHp(6,7,20)).toBe(7));
  it('ignores negative healing',()=>expect(healHp(4,7,-2)).toBe(4));
  it('takes damage without dropping below zero',()=>expect(damageHp(2,10)).toBe(0));
  it('never allows negative resources',()=>expect(spendResource(0)).toBe(0));
  it('trims and adds a new condition',()=>expect(addUniqueCondition([], ' Poisoned ')).toEqual(['Poisoned']));
  it('rejects empty and case-insensitive duplicate conditions',()=>{const conditions=['Poisoned'];expect(addUniqueCondition(conditions,'')).toBe(conditions);expect(addUniqueCondition(conditions,'poisoned')).toBe(conditions)});
  it('removes only the record with the requested ID',()=>{const records=[{id:'a',name:'A'},{id:'b',name:'B'}];expect(removeById(records,'a')).toEqual([{id:'b',name:'B'}]);expect(removeById(records,'missing')).toEqual(records)});
  it('selects useful Captain’s Log highlights',()=>{const records=[{type:'npc',status:'Alive'},{type:'session',status:'Complete'},{type:'quest',status:'Active'},{type:'ship',status:'Owned'},{type:'treasure',status:'Held'}];expect(campaignHighlights(records).map(record=>record.type)).toEqual(['session','quest','ship','treasure'])});
});
