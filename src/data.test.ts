import {describe,expect,it} from 'vitest';
import {blankCharacter,classes,names,normalizeData,seedData,weapons} from './data';

describe('seed data',()=>{
  it('creates independent app states',()=>{const a=seedData(),b=seedData();a.character.conditions.push('Poisoned');expect(b.character.conditions).toEqual([]);expect(a.character.id).not.toBe(b.character.id)});
  it('creates a playable blank character',()=>expect(blankCharacter()).toMatchObject({name:'Unnamed Scoundrel',level:1,xp:0,hp:6,maxHp:6,devilsLuck:2,silver:0,armor:'None',weapon:'Fists (d2)',conditions:[],items:[]}));
  it('seeds unique rule IDs',()=>{const ids=seedData().rules.map(rule=>rule.id);expect(new Set(ids).size).toBe(ids.length)});
  it('provides non-empty generator tables',()=>{expect(names.length).toBeGreaterThan(5);expect(classes).toContain('Rapscallion');expect(weapons).toContain('Fists (d2)')});
  it('provides all five abilities',()=>expect(Object.keys(blankCharacter().abilities).sort()).toEqual(['agility','presence','spirit','strength','toughness']));
  it('migrates older saved data with editable condition settings',()=>{const old={...seedData(),settings:undefined} as any;const migrated=normalizeData(old);expect(migrated.settings.showHelp).toBe(true);expect(migrated.settings.conditionRules.Bleeding).toContain('blood loss')});
});
