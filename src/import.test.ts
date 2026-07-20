import {describe,expect,it} from 'vitest';
import {seedData} from './data';
import {CompanionImportError,parseCompanionImport} from './import';

const pip={schemaVersion:'1.0',importType:'character',character:{id:'character-pip-two-toes',name:'Pip “Two-Toes”',class:{name:'Rapscallion',specialties:[{name:'Sneaky Bastard',rulesSummary:'Critical hit from shadows.'}]},abilities:{strength:-1,agility:2,presence:0,toughness:-1,spirit:-1},hitPoints:{current:7,maximum:7},devilsLuck:{current:1,recoveryDie:'d2'},silver:4,armor:{name:'None'},clothing:{name:'Old uniform'},hat:{name:'No hat'},weapons:[{id:'weapon-broadsword',name:'Broadsword',damage:'d8',equipped:true},{id:'weapon-throwing-axe',name:'Throwing Axe',damage:'d6',equipped:false}],inventory:[{id:'item-medical-kit',name:'Medical Kit',category:'gear',quantity:1,usesRemaining:1,equipped:false,notes:''}],relics:[{id:'relic-mermaid-scales',name:'Mermaid Scales',quantity:1,timesUsed:1,usesRemaining:null,rulesSummary:'Breathe underwater.'}],background:{name:'Former Servant'},backstory:['Shark story.']}};

describe('parseCompanionImport',()=>{
  it('migrates Pip through the character import path',()=>{const result=parseCompanionImport(JSON.stringify(pip),seedData());expect(result.character.name).toBe('Pip “Two-Toes”');expect(result.character.hp).toBe(7);expect(result.character.className).toBe('Rapscallion');expect(result.character.weapon).toBe('Broadsword (d8)');expect(result.character.items.find(x=>x.name==='Medical Kit')?.uses).toBe(1);expect(result.character.items.find(x=>x.name==='Mermaid Scales')?.notes).toContain('remaining uses: unknown')});
  it('rejects malformed JSON with diagnostics',()=>{expect(()=>parseCompanionImport('{',seedData())).toThrow(CompanionImportError);try{parseCompanionImport('{',seedData())}catch(e){expect((e as CompanionImportError).diagnostic.code).toBe('MALFORMED_JSON')}});
  it('rejects unsupported schema versions',()=>{expect(()=>parseCompanionImport(JSON.stringify({...pip,schemaVersion:'2.0'}),seedData())).toThrow(/not supported/)});
  it('round-trips a full backup',()=>{const data=seedData();expect(parseCompanionImport(JSON.stringify(data),seedData()).character.id).toBe(data.character.id)});
});
