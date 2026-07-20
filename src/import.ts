import type {AppData,Character,Item} from './types';

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
  constructor(public diagnostic:ImportDiagnostic){super(diagnostic.message)}
}

const fail=(diagnostic:ImportDiagnostic):never=>{throw new CompanionImportError(diagnostic)};
const isObject=(value:unknown):value is Record<string,unknown>=>typeof value==='object'&&value!==null&&!Array.isArray(value);
const text=(value:unknown,fallback='')=>typeof value==='string'?value:fallback;
const number=(value:unknown,fallback=0)=>typeof value==='number'&&Number.isFinite(value)?value:fallback;
const record=(value:unknown)=>isObject(value)?value:{};
const list=(value:unknown)=>Array.isArray(value)?value:[];
const safeId=(value:unknown,prefix:string)=>text(value)||`${prefix}-${crypto.randomUUID()}`;

function itemFromRich(value:unknown):Item {
  const item=record(value);
  const uses=item.usesRemaining;
  return {
    id:safeId(item.id,'item'),
    name:text(item.name,'Unnamed item'),
    category:text(item.category,'gear'),
    quantity:number(item.quantity,1),
    ...(typeof uses==='number'?{uses}:{}),
    die:text(item.damage)||text(item.die)||undefined,
    equipped:item.equipped===true,
    notes:[text(item.rulesSummary),text(item.notes)].filter(Boolean).join('\n')
  };
}

function migrateCharacterEnvelope(envelope:Record<string,unknown>,current:AppData):AppData {
  if(envelope.schemaVersion!=='1.0') fail({stage:'detect',code:'UNSUPPORTED_SCHEMA_VERSION',message:`Schema version ${String(envelope.schemaVersion)} is not supported.`,path:'$.schemaVersion',expected:'"1.0"',received:JSON.stringify(envelope.schemaVersion),suggestedFix:'Export the file using schema version 1.0.'});
  const source=record(envelope.character);
  if(!Object.keys(source).length) fail({stage:'validate',code:'MISSING_CHARACTER',message:'The character import has no character object.',path:'$.character',expected:'object',received:typeof envelope.character,suggestedFix:'Add a character object to the import file.'});
  if(typeof source.name!=='string'||!source.name.trim()) fail({stage:'validate',code:'INVALID_CHARACTER_NAME',message:'The character name is missing or invalid.',path:'$.character.name',expected:'non-empty string',received:JSON.stringify(source.name),suggestedFix:'Provide a character name.'});

  const hp=record(source.hitPoints),luck=record(source.devilsLuck),klass=record(source.class),armor=record(source.armor);
  const abilities=record(source.abilities),clothing=record(source.clothing),hat=record(source.hat);
  const weapons=list(source.weapons).map(record);
  const relics=list(source.relics).map(record);
  const specialties=list(klass.specialties).map(record);
  const background=record(source.background),flaw=record(source.distinctiveFlaw),trademark=record(source.physicalTrademark);
  const idiosyncrasy=record(source.idiosyncrasy),incident=record(source.unfortunateIncident),important=record(source.thingOfImportance);
  const primary=weapons.find(w=>w.equipped===true)??weapons[0];
  const items:Item[]=[
    ...weapons.map(w=>({...itemFromRich(w),category:'weapon'})),
    ...list(source.inventory).map(itemFromRich),
    ...relics.map(r=>({...itemFromRich(r),category:'relic',notes:[text(r.rulesSummary),text(r.singleUseClarification),`Times used: ${number(r.timesUsed,0)}; remaining uses: ${r.usesRemaining==null?'unknown':String(r.usesRemaining)}`].filter(Boolean).join('\n')}))
  ];
  const backgroundLines=[
    text(background.name)&&`Background: ${text(background.name)}`,
    text(flaw.name)&&`Distinctive flaw: ${text(flaw.name)}`,
    text(trademark.name)&&`Physical trademark: ${text(trademark.name)}`,
    text(idiosyncrasy.name)&&`Idiosyncrasy: ${text(idiosyncrasy.name)}${text(idiosyncrasy.quote)?` — “${text(idiosyncrasy.quote)}”`:''}`,
    text(incident.summary)&&`Unfortunate incident: ${text(incident.summary)}`,
    text(important.name)&&`Thing of importance: ${text(important.name)}`,
    ...list(source.backstory).filter((x):x is string=>typeof x==='string')
  ].filter(Boolean);
  const featureLines=[
    ...specialties.map(s=>`${text(s.name,'Specialty')}: ${text(s.rulesSummary)}`),
    `Devil's Luck recovery die: ${text(luck.recoveryDie,'unknown')}`,
    `Clothing: ${text(clothing.name,'None')}`,
    `Hat: ${text(hat.name,'None')}`
  ];
  const character:Character={
    id:safeId(source.id,'character'),name:text(source.name),nickname:'',className:text(klass.name,'Unclassed'),level:1,xp:0,
    hp:number(hp.current,1),maxHp:number(hp.maximum,1),devilsLuck:number(luck.current,0),silver:number(source.silver,0),
    abilities:{strength:number(abilities.strength),agility:number(abilities.agility),presence:number(abilities.presence),toughness:number(abilities.toughness),spirit:number(abilities.spirit)},
    armor:text(armor.name,'None'),weapon:primary?`${text(primary.name,'Weapon')} (${text(primary.damage,'d4')})`:'Fists (d2)',
    background:backgroundLines.join('\n'),features:featureLines.join('\n'),conditions:[],items
  };
  return {...current,character};
}

export function parseCompanionImport(raw:string,current:AppData):AppData {
  let parsed:unknown;
  try{parsed=JSON.parse(raw)}catch(error){fail({stage:'parse',code:'MALFORMED_JSON',message:'The selected file is not valid JSON.',path:'$',expected:'valid JSON',received:error instanceof Error?error.message:'parse error',suggestedFix:'Download or save the file again, then retry.'})}
  if(!isObject(parsed)) fail({stage:'detect',code:'INVALID_ROOT',message:'The import file must contain a JSON object.',path:'$',expected:'object',received:Array.isArray(parsed)?'array':typeof parsed});
  const root=parsed as Record<string,unknown>;
  if(root.importType==='character') return migrateCharacterEnvelope(root,current);
  const candidate=isObject(root.campaignContext)?root.campaignContext:isObject(root.after)?root.after:root;
  if(isObject(candidate.character)&&Array.isArray(candidate.campaign)&&Array.isArray(candidate.journal)&&Array.isArray(candidate.rules)&&Array.isArray(candidate.rolls)) return candidate as unknown as AppData;
  return fail({stage:'detect',code:'UNSUPPORTED_IMPORT_TYPE',message:'This file is neither a character import nor a full companion backup.',path:'$.importType',expected:'"character" or a full AppData backup',received:JSON.stringify(root.importType),suggestedFix:'Choose a Pirate Borg Companion character export or full backup.'});
}
