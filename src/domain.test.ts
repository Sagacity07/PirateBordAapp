import {describe,expect,it} from 'vitest';
import {addUniqueCondition,campaignHighlights,clampHp,damageHp,fireWeapon,healHp,inferWeaponType,nonNegativeInteger,reloadWeapon,removeById,rollAdvancement,spendResource,weaponAbility} from './domain';

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
  it('applies Player Guide advancement rolls',()=>{const rolls=[1,2,3,4,5,6,4];const result=rollAdvancement({strength:-1,agility:0,presence:1,toughness:2,spirit:5},()=>rolls.shift()!,()=>10);expect(result.abilities).toEqual({strength:-2,agility:1,presence:2,toughness:3,spirit:6});expect(result.hpGain).toBe(6);expect(result.findRoll).toBe(4);expect(result.silverGain).toBe(30)});
  it('increases abilities from -3 through +1 unless the die is one',()=>{const rolls=[2,2,2,2,2,1,1];expect(rollAdvancement({strength:-3,agility:-2,presence:-1,toughness:0,spirit:1},()=>rolls.shift()!,()=>1).abilities).toEqual({strength:-2,agility:-1,presence:0,toughness:1,spirit:2})});
  it('never advances an ability above +6 or below -3',()=>{const rolls=[6,1,6,1,6,1,1];expect(rollAdvancement({strength:6,agility:-3,presence:6,toughness:-3,spirit:6},()=>rolls.shift()!,()=>1).abilities).toEqual({strength:6,agility:-3,presence:6,toughness:-3,spirit:6})});
  it('maps every among-the-dead reward result',()=>{for(const [roll,label] of [[1,'Nothing'],[2,'Nothing'],[3,'weapon'],[5,'Relic'],[6,'Ritual']] as const){const dice=[2,2,2,2,2,2,roll];expect(rollAdvancement({a:0,b:0,c:0,d:0,e:0},()=>dice.shift()!,()=>1).find).toContain(label)}});
  it('infers common ranged weapons and uses Presence for them',()=>{expect(inferWeaponType('Flintlock Pistol')).toBe('ranged');expect(inferWeaponType('Broadsword')).toBe('melee');expect(weaponAbility('ranged')).toBe('presence');expect(weaponAbility('melee')).toBe('strength')});
  it('spends ammunition and marks reloading after a ranged shot',()=>expect(fireWeapon({weaponType:'ranged',ammo:3,reloadActions:2,needsReload:false})).toMatchObject({ammo:2,needsReload:true,reloadProgress:0}));
  it('will not fire an unloaded or empty weapon',()=>{const reloading={weaponType:'ranged',ammo:3,needsReload:true};const empty={weaponType:'ranged',ammo:0};expect(fireWeapon(reloading)).toBe(reloading);expect(fireWeapon(empty)).toBe(empty)});
  it('completes a reload after the configured number of actions',()=>{const first=reloadWeapon({needsReload:true,reloadActions:2,reloadProgress:0});expect(first).toMatchObject({needsReload:true,reloadProgress:1});expect(reloadWeapon(first)).toMatchObject({needsReload:false,reloadProgress:0})});
});
