import {describe,expect,it} from 'vitest';
import {seedData} from './data';
import {CompanionImportError,parseCompanionImport} from './import';

const pip={schemaVersion:'1.0',importType:'character',character:{id:'character-pip-two-toes',name:'Pip “Two-Toes”',class:{name:'Rapscallion',specialties:[{name:'Sneaky Bastard',rulesSummary:'Critical hit from shadows.'}]},abilities:{strength:-1,agility:2,presence:0,toughness:-1,spirit:-1},hitPoints:{current:7,maximum:7},devilsLuck:{current:1,recoveryDie:'d2'},silver:4,armor:{name:'None'},clothing:{name:'Old uniform'},hat:{name:'No hat'},weapons:[{id:'weapon-broadsword',name:'Broadsword',damage:'d8',quantity:1,equipped:true},{id:'weapon-throwing-axe',name:'Throwing Axe',damage:'d6',quantity:1,equipped:false}],inventory:[{id:'item-medical-kit',name:'Medical Kit',category:'gear',quantity:1,usesRemaining:1,equipped:false,notes:''}],relics:[{id:'relic-mermaid-scales',name:'Mermaid Scales',quantity:1,timesUsed:1,usesRemaining:null,rulesSummary:'Breathe underwater.'}],background:{name:'Former Servant'},idiosyncrasy:{name:'Voluntary Insomnia',quote:'Sleep is for the weak.'},backstory:['Shark story.']}};

const diagnostic=(input:unknown)=>{try{parseCompanionImport(typeof input==='string'?input:JSON.stringify(input),seedData())}catch(error){return (error as CompanionImportError).diagnostic}throw new Error('Expected import to fail')};

describe('character imports',()=>{
  it('migrates all important Pip fields',()=>{const result=parseCompanionImport(JSON.stringify(pip),seedData());expect(result.character).toMatchObject({id:'character-pip-two-toes',name:'Pip “Two-Toes”',hp:7,maxHp:7,silver:4,className:'Rapscallion',weapon:'Broadsword (d8)',abilities:{strength:-1,agility:2,presence:0,toughness:-1,spirit:-1}});expect(result.character.items).toHaveLength(4);expect(result.character.items.find(x=>x.name==='Medical Kit')?.uses).toBe(1);expect(result.character.items.find(x=>x.name==='Mermaid Scales')?.notes).toContain('remaining uses: unknown');expect(result.character.background).toContain('“Sleep is for the weak.”')});
  it('preserves unrelated campaign data',()=>{const current=seedData();current.campaign.push({id:'quest-1',type:'quest',title:'Quest',status:'Open',notes:'',createdAt:'2026-01-01'});expect(parseCompanionImport(JSON.stringify(pip),current).campaign).toEqual(current.campaign)});
  it('generates IDs when optional IDs are absent',()=>{const copy=structuredClone(pip);delete (copy.character as {id?:string}).id;expect(parseCompanionImport(JSON.stringify(copy),seedData()).character.id).toMatch(/^character-/)});
  it('uses the first weapon when none is equipped',()=>{const copy=structuredClone(pip);copy.character.weapons.forEach(x=>x.equipped=false);expect(parseCompanionImport(JSON.stringify(copy),seedData()).character.weapon).toBe('Broadsword (d8)')});
  it('uses fists when weapons are absent',()=>{const copy=structuredClone(pip);copy.character.weapons=[];expect(parseCompanionImport(JSON.stringify(copy),seedData()).character.weapon).toBe('Fists (d2)')});
  it('rejects current HP above maximum',()=>{const copy=structuredClone(pip);copy.character.hitPoints.current=8;expect(diagnostic(copy).code).toBe('HP_EXCEEDS_MAXIMUM')});
  it('rejects negative silver',()=>{const copy=structuredClone(pip);copy.character.silver=-1;expect(diagnostic(copy)).toMatchObject({code:'INVALID_NUMBER',path:'$.character.silver'})});
  it('rejects fractional item quantities',()=>{const copy=structuredClone(pip);copy.character.inventory[0].quantity=1.5;expect(diagnostic(copy)).toMatchObject({code:'INVALID_NUMBER',path:'$.character.inventory[0].quantity'})});
  it('rejects invalid ability types rather than silently defaulting',()=>{const copy:any=structuredClone(pip);copy.character.abilities.agility='2';expect(diagnostic(copy)).toMatchObject({code:'INVALID_NUMBER',path:'$.character.abilities.agility'})});
  it('rejects missing names',()=>{const copy=structuredClone(pip);copy.character.name=' ';expect(diagnostic(copy)).toMatchObject({code:'INVALID_STRING',path:'$.character.name'})});
  it('rejects missing character objects',()=>{expect(diagnostic({schemaVersion:'1.0',importType:'character'}).code).toBe('MISSING_CHARACTER')});
  it('rejects unsupported schema versions',()=>{expect(diagnostic({...pip,schemaVersion:'2.0'}).code).toBe('UNSUPPORTED_SCHEMA_VERSION')});
});

describe('backup imports',()=>{
  it('round-trips a complete backup',()=>{const data=seedData();expect(parseCompanionImport(JSON.stringify(data),seedData())).toEqual(data)});
  it('accepts campaignContext wrappers',()=>{const data=seedData();expect(parseCompanionImport(JSON.stringify({campaignContext:data}),seedData())).toEqual(data)});
  it('accepts after wrappers',()=>{const data=seedData();expect(parseCompanionImport(JSON.stringify({after:data}),seedData())).toEqual(data)});
  it('rejects missing collections',()=>{const data:any=seedData();delete data.rolls;expect(diagnostic(data)).toMatchObject({code:'INVALID_BACKUP_COLLECTION',path:'$.rolls'})});
  it('rejects duplicate IDs across collections',()=>{const data=seedData();data.campaign.push({id:data.rules[0].id,type:'quest',title:'Quest',status:'Open',notes:'',createdAt:'2026-01-01'});expect(diagnostic(data).code).toBe('DUPLICATE_ID')});
  it('rejects unknown campaign record types',()=>{const data:any=seedData();data.campaign.push({id:'x',type:'monster',title:'X',status:'',notes:'',createdAt:''});expect(diagnostic(data)).toMatchObject({code:'INVALID_RECORD_TYPE',path:'$.campaign[0].type'})});
  it('rejects unknown journal kinds',()=>{const data:any=seedData();data.journal.push({id:'x',kind:'gm',title:'X',body:'',pinned:false,createdAt:''});expect(diagnostic(data)).toMatchObject({code:'INVALID_RECORD_TYPE',path:'$.journal[0].kind'})});
  it('rejects invalid HP',()=>{const data=seedData();data.character.hp=data.character.maxHp+1;expect(diagnostic(data).code).toBe('HP_EXCEEDS_MAXIMUM')});
});

describe('format detection',()=>{
  it('reports malformed JSON',()=>{expect(diagnostic('{')).toMatchObject({code:'MALFORMED_JSON',stage:'parse',path:'$'})});
  it('rejects arrays at the root',()=>{expect(diagnostic([])).toMatchObject({code:'INVALID_ROOT',stage:'detect'})});
  it('rejects unsupported objects',()=>{expect(diagnostic({hello:'world'}).code).toBe('UNSUPPORTED_IMPORT_TYPE')});
});
