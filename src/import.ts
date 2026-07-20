import type {Ability,AppData,CampaignRecord,Character,Item,JournalEntry,RuleCard} from './types';

export interface ImportDiagnostic {
  stage:'parse'|'detect'|'validate'|'migrate';
  code:string;
  message:string;
  path?:string;
  expected?:string;
  received?:string;
  suggestedFix?:string;
}

export class CompanionImportError extends Error {
  constructor(public diagnostic:ImportDiagnostic){super(diagnostic.message);this.name='CompanionImportError'}
}

const fail=(diagnostic:ImportDiagnostic):never=>{throw new CompanionImportError(diagnostic)};
const isObject=(value:unknown):value is Record<string,unknown>=>typeof value==='object'&&value!==null&&!Array.isArray(value);
const text=(value:unknown,fallback='')=>typeof value==='string'?value:fallback;
const record=(value:unknown)=>isObject(value)?value:{};
const list=(value:unknown)=>Array.isArray(value)?value:[];
const describe=(value:unknown)=>value===null?'null':Array.isArray(value)?'array':typeof value;
const safeId=(value:unknown,prefix:string)=>typeof value==='string'&&value.trim()?value:`${prefix}-${crypto.randomUUID()}`;

function requiredString(value:unknown,path:string):string {
  if(typeof value!=='string'||!value.trim()) fail({stage:'validate',code:'INVALID_STRING',message:`${path} must be a non-empty string.`,path,expected:'non-empty string',received:JSON.stringify(value)});
  return value as string;
}

function finiteNumber(value:unknown,path:string,fallback:number,options:{min?:number;max?:number;integer?:boolean}={}):number {
  if(value===undefined) return fallback;
  if(typeof value!=='number'||!Number.isFinite(value)||(options.integer&&!Number.isInteger(value))||(options.min!==undefined&&value<options.min)||(options.max!==undefined&&value>options.max)) {
    const bounds=[options.integer?'integer':'finite number',options.min!==undefined?`>= ${options.min}`:'',options.max!==undefined?`<= ${options.max}`:''].filter(Boolean).join(', ');
    fail({stage:'validate',code:'INVALID_NUMBER',message:`${path} has an invalid numeric value.`,path,expected:bounds,received:JSON.stringify(value)});
  }
  return value as number;
}

function itemFromRich(value:unknown,path:string):Item {
  if(!isObject(value)) fail({stage:'validate',code:'INVALID_ITEM',message:`${path} must be an object.`,path,expected:'object',received:describe(value)});
  const item=value as Record<string,unknown>;
  const uses=item.usesRemaining;
  return {
    id:safeId(item.id,'item'),
    name:requiredString(item.name,`${path}.name`),
    category:text(item.category,'gear'),
    quantity:finiteNumber(item.quantity,`${path}.quantity`,1,{min:0,integer:true}),
    ...(uses!==undefined&&uses!==null?{uses:finiteNumber(uses,`${path}.usesRemaining`,0,{min:0,integer:true})}:{}),
    die:text(item.damage)||text(item.die)||undefined,
    equipped:item.equipped===true,
    notes:[text(item.rulesSummary),text(item.notes)].filter(Boolean).join('\n')
  };
}

function migrateCharacterEnvelope(envelope:Record<string,unknown>,current:AppData):AppData {
  if(envelope.schemaVersion!=='1.0') fail({stage:'detect',code:'UNSUPPORTED_SCHEMA_VERSION',message:`Schema version ${String(envelope.schemaVersion)} is not supported.`,path:'$.schemaVersion',expected:'"1.0"',received:JSON.stringify(envelope.schemaVersion),suggestedFix:'Export the file using schema version 1.0.'});
  if(!isObject(envelope.character)) fail({stage:'validate',code:'MISSING_CHARACTER',message:'The character import has no character object.',path:'$.character',expected:'object',received:describe(envelope.character),suggestedFix:'Add a character object to the import file.'});
  const source=envelope.character as Record<string,unknown>;
  const name=requiredString(source.name,'$.character.name');
  const hp=record(source.hitPoints),luck=record(source.devilsLuck),klass=record(source.class),armor=record(source.armor);
  const abilities=record(source.abilities),clothing=record(source.clothing),hat=record(source.hat);
  const weapons=list(source.weapons),relics=list(source.relics);
  const specialties=list(klass.specialties).map(record);
  const background=record(source.background),flaw=record(source.distinctiveFlaw),trademark=record(source.physicalTrademark);
  const idiosyncrasy=record(source.idiosyncrasy),incident=record(source.unfortunateIncident),important=record(source.thingOfImportance);
  const maximum=finiteNumber(hp.maximum,'$.character.hitPoints.maximum',1,{min:1,integer:true});
  const currentHp=finiteNumber(hp.current,'$.character.hitPoints.current',maximum,{min:0,integer:true});
  if(currentHp>maximum) fail({stage:'validate',code:'HP_EXCEEDS_MAXIMUM',message:'Current HP cannot exceed maximum HP.',path:'$.character.hitPoints.current',expected:`<= ${maximum}`,received:String(currentHp)});
  const weaponRecords=weapons.map((weapon,index)=>{if(!isObject(weapon)) fail({stage:'validate',code:'INVALID_ITEM',message:'Weapon must be an object.',path:`$.character.weapons[${index}]`,expected:'object',received:describe(weapon)});return weapon});
  const primary=weaponRecords.find(weapon=>weapon.equipped===true)??weaponRecords[0];
  const items:Item[]=[
    ...weaponRecords.map((weapon,index)=>({...itemFromRich(weapon,`$.character.weapons[${index}]`),category:'weapon'})),
    ...list(source.inventory).map((item,index)=>itemFromRich(item,`$.character.inventory[${index}]`)),
    ...relics.map((relic,index)=>{const item=itemFromRich(relic,`$.character.relics[${index}]`);const rich=record(relic);return {...item,category:'relic',notes:[text(rich.rulesSummary),text(rich.singleUseClarification),`Times used: ${finiteNumber(rich.timesUsed,`$.character.relics[${index}].timesUsed`,0,{min:0,integer:true})}; remaining uses: ${rich.usesRemaining==null?'unknown':String(rich.usesRemaining)}`].filter(Boolean).join('\n')}})
  ];
  const backgroundLines=[
    text(background.name)&&`Background: ${text(background.name)}`,
    text(flaw.name)&&`Distinctive flaw: ${text(flaw.name)}`,
    text(trademark.name)&&`Physical trademark: ${text(trademark.name)}`,
    text(idiosyncrasy.name)&&`Idiosyncrasy: ${text(idiosyncrasy.name)}${text(idiosyncrasy.quote)?` — “${text(idiosyncrasy.quote)}”`:''}`,
    text(incident.summary)&&`Unfortunate incident: ${text(incident.summary)}`,
    text(important.name)&&`Thing of importance: ${text(important.name)}`,
    ...list(source.backstory).filter((entry):entry is string=>typeof entry==='string')
  ].filter(Boolean);
  const featureLines=[...specialties.map(s=>`${text(s.name,'Specialty')}: ${text(s.rulesSummary)}`),`Devil's Luck recovery die: ${text(luck.recoveryDie,'unknown')}`,`Clothing: ${text(clothing.name,'None')}`,`Hat: ${text(hat.name,'None')}`];
  const character:Character={
    id:safeId(source.id,'character'),name,nickname:text(source.nickname),className:text(klass.name,'Unclassed'),level:finiteNumber(source.level,'$.character.level',1,{min:1,integer:true}),xp:finiteNumber(source.xp,'$.character.xp',0,{min:0,integer:true}),
    hp:currentHp,maxHp:maximum,devilsLuck:finiteNumber(luck.current,'$.character.devilsLuck.current',0,{min:0,integer:true}),silver:finiteNumber(source.silver,'$.character.silver',0,{min:0,integer:true}),
    abilities:{strength:finiteNumber(abilities.strength,'$.character.abilities.strength',0,{min:-10,max:10,integer:true}),agility:finiteNumber(abilities.agility,'$.character.abilities.agility',0,{min:-10,max:10,integer:true}),presence:finiteNumber(abilities.presence,'$.character.abilities.presence',0,{min:-10,max:10,integer:true}),toughness:finiteNumber(abilities.toughness,'$.character.abilities.toughness',0,{min:-10,max:10,integer:true}),spirit:finiteNumber(abilities.spirit,'$.character.abilities.spirit',0,{min:-10,max:10,integer:true})},
    armor:text(armor.name,'None'),weapon:primary?`${text(primary.name,'Weapon')} (${text(primary.damage,'d4')})`:'Fists (d2)',background:backgroundLines.join('\n'),features:featureLines.join('\n'),conditions:[],items
  };
  return {...current,character};
}

const abilities:Ability[]=['strength','agility','presence','toughness','spirit'];
const campaignTypes=new Set<CampaignRecord['type']>(['session','npc','location','quest','ship','rumor','treasure']);
const journalKinds=new Set<JournalEntry['kind']>(['quick','session','character']);

function validateFullBackup(value:Record<string,unknown>):AppData {
  if(!isObject(value.character)) fail({stage:'validate',code:'INVALID_BACKUP_CHARACTER',message:'Backup character must be an object.',path:'$.character',expected:'object',received:describe(value.character)});
  const c=value.character as Record<string,unknown>;
  requiredString(c.id,'$.character.id');requiredString(c.name,'$.character.name');
  finiteNumber(c.hp,'$.character.hp',0,{min:0,integer:true});const maxHp=finiteNumber(c.maxHp,'$.character.maxHp',1,{min:1,integer:true});
  if((c.hp as number)>maxHp) fail({stage:'validate',code:'HP_EXCEEDS_MAXIMUM',message:'Current HP cannot exceed maximum HP.',path:'$.character.hp',expected:`<= ${maxHp}`,received:String(c.hp)});
  const backupAbilities=record(c.abilities);
  if(!isObject(c.abilities)||abilities.some(key=>typeof backupAbilities[key]!=='number')) fail({stage:'validate',code:'INVALID_ABILITIES',message:'Backup abilities are incomplete or invalid.',path:'$.character.abilities',expected:'five numeric ability values',received:describe(c.abilities)});
  for(const field of ['campaign','journal','rules','rolls'] as const) if(!Array.isArray(value[field])) fail({stage:'validate',code:'INVALID_BACKUP_COLLECTION',message:`Backup ${field} must be an array.`,path:`$.${field}`,expected:'array',received:describe(value[field])});
  const ids=new Set<string>();
  const claimId=(entry:unknown,path:string):Record<string,unknown>=>{if(!isObject(entry)) fail({stage:'validate',code:'INVALID_RECORD',message:`${path} must be an object.`,path,expected:'object',received:describe(entry)});const item=entry as Record<string,unknown>;const id=requiredString(item.id,`${path}.id`);if(ids.has(id))fail({stage:'validate',code:'DUPLICATE_ID',message:`Duplicate ID ${id}.`,path:`${path}.id`,expected:'unique ID',received:id});ids.add(id);return item};
  list(c.items).forEach((entry,index)=>claimId(entry,`$.character.items[${index}]`));
  const campaign=value.campaign as unknown[],journal=value.journal as unknown[],rules=value.rules as unknown[],rolls=value.rolls as unknown[];
  campaign.forEach((entry,index)=>{const item=claimId(entry,`$.campaign[${index}]`);if(!campaignTypes.has(item.type as CampaignRecord['type']))fail({stage:'validate',code:'INVALID_RECORD_TYPE',message:'Unknown campaign record type.',path:`$.campaign[${index}].type`,expected:[...campaignTypes].join(' | '),received:JSON.stringify(item.type)})});
  journal.forEach((entry,index)=>{const item=claimId(entry,`$.journal[${index}]`);if(!journalKinds.has(item.kind as JournalEntry['kind']))fail({stage:'validate',code:'INVALID_RECORD_TYPE',message:'Unknown journal kind.',path:`$.journal[${index}].kind`,expected:[...journalKinds].join(' | '),received:JSON.stringify(item.kind)})});
  rules.forEach((entry,index)=>claimId(entry,`$.rules[${index}]`));rolls.forEach((entry,index)=>claimId(entry,`$.rolls[${index}]`));
  return value as unknown as AppData;
}

export function parseCompanionImport(raw:string,current:AppData):AppData {
  let parsed:unknown;
  try{parsed=JSON.parse(raw)}catch(error){fail({stage:'parse',code:'MALFORMED_JSON',message:'The selected file is not valid JSON.',path:'$',expected:'valid JSON',received:error instanceof Error?error.message:'parse error',suggestedFix:'Download or save the file again, then retry.'})}
  if(!isObject(parsed)) fail({stage:'detect',code:'INVALID_ROOT',message:'The import file must contain a JSON object.',path:'$',expected:'object',received:describe(parsed)});
  const root=parsed as Record<string,unknown>;
  if(root.importType==='character') return migrateCharacterEnvelope(root,current);
  const candidate=isObject(root.campaignContext)?root.campaignContext:isObject(root.after)?root.after:root;
  const looksLikeBackup='character' in candidate||'campaign' in candidate||'journal' in candidate||'rules' in candidate||'rolls' in candidate;
  if(looksLikeBackup)return validateFullBackup(candidate);
  return fail({stage:'detect',code:'UNSUPPORTED_IMPORT_TYPE',message:'This file is neither a character import nor a full companion backup.',path:'$.importType',expected:'"character" or a full AppData backup',received:JSON.stringify(root.importType),suggestedFix:'Choose a Pirate Borg Companion character export or full backup.'});
}
