import type {AppData,AppSettings,Character,RuleCard} from './types';
export const uid=()=>crypto.randomUUID();
export const blankCharacter=():Character=>({id:uid(),name:'Unnamed Scoundrel',nickname:'',className:'Unclassed',level:1,xp:0,hp:6,maxHp:6,devilsLuck:2,silver:0,abilities:{strength:0,agility:0,presence:0,toughness:0,spirit:0},armor:'None',weapon:'Fists (d2)',background:'',features:'',conditions:[],items:[]});
const rules:RuleCard[]=[
 {id:uid(),title:'Ability Test',category:'Core',summary:'Roll d20 plus the relevant ability modifier against the Difficulty Rating. Meet or exceed the DR to succeed.',book:"Player's Guidebook",page:'Add page',favorite:true,notes:''},
 {id:uid(),title:'Attack',category:'Combat',summary:'Make an ability test using the relevant weapon modifier against the target DR, then roll weapon damage on a success.',book:"Player's Guidebook",page:'Add page',favorite:true,notes:''},
 {id:uid(),title:'Armor',category:'Combat',summary:'Armor reduces incoming damage by its listed die. Track damage after reduction.',book:"Player's Guidebook",page:'Add page',favorite:false,notes:''},
 {id:uid(),title:"Devil's Luck",category:'Resources',summary:"Spend Devil's Luck only as permitted by your table's rules. Record every use immediately.",book:"Player's Guidebook",page:'Add page',favorite:true,notes:''},
 {id:uid(),title:'Zero HP',category:'Combat',summary:'Consult the player guide immediately when HP reaches zero and resolve the required outcome.',book:"Player's Guidebook",page:'Add page',favorite:false,notes:''},
];
export const CONDITION_RULES_VERSION=2;
export const defaultConditionRules=()=>({
  Bleeding:'Player\'s Guide rule: you gain no healing from rest and instead lose d6 HP every morning. A medical kit stops bleeding and heals d6 HP; a kit has Presence + 4 uses when acquired.',
  Poisoned:'Player\'s Guide rule: you gain no healing from rest and instead lose d6 HP every morning. A medical kit stops poisoning and heals d6 HP. Any immediate poison test or damage is determined by its source.',
  Infected:'Player\'s Guide rule: you gain no healing from rest and instead lose d6 HP every morning. A medical kit stops infection and heals d6 HP.',
  Sick:'Player\'s Guide rule: you gain no healing from rest and instead lose d6 HP every morning. The specific disease may add effects stated by the GM or adventure.',
  'On fire':'The Player\'s Guide gives this rule for a fire pot: take d6 damage each turn; roll d6 each turn—on 1–2 the fire spreads and on 6 it goes out. Other fire sources may state different effects.',
  Blind:'The Player\'s Guide says a smoke bomb blinds creatures for d4 rounds, but it does not give a universal Blind penalty. Use the effect and duration stated by the source or GM.',
  Drunk:'The Player\'s Guide uses Toughness to resist rum, but does not define Drunk as one universal condition. Record the result, duration, and any penalty stated by the ability, item, or GM.',
  Frightened:'No universal Frightened condition rule is defined in the Player\'s Guide. Record the exact effect and how it ends when an adventure, creature, or GM applies it.',
  Cursed:'No universal Cursed condition rule is defined in the Player\'s Guide. Record the curse\'s exact effect, source, duration, and removal condition.',
});
export const defaultSettings=():AppSettings=>({showHelp:true,conditionRulesVersion:CONDITION_RULES_VERSION,conditionRules:defaultConditionRules()});
export const seedData=():AppData=>({character:blankCharacter(),campaign:[],journal:[],rules,rolls:[],settings:defaultSettings()});
export const normalizeData=(data:AppData):AppData=>{const saved=data.settings;const upgrading=(saved?.conditionRulesVersion??0)<CONDITION_RULES_VERSION;const bookRules=defaultConditionRules();const customRules=Object.fromEntries(Object.entries(saved?.conditionRules??{}).filter(([name])=>!(name in bookRules)));return {...data,settings:{...defaultSettings(),...(saved??{}),conditionRulesVersion:CONDITION_RULES_VERSION,conditionRules:upgrading?{...bookRules,...customRules}:{...bookRules,...(saved?.conditionRules??{})}}}};
export const names=['Anne Vane','Barnacle Bart','Calico Flint','Dread Mary','Elias Graves','Nell Blackwake','Pip Two-Toes','Silas Salt'];
export const classes=['Unclassed','Buccaneer','Rapscallion','Swashbuckler','Zealot','Sorcerer','Custom'];
export const weapons=['Fists (d2)','Knife (d4)','Pistol (d6)','Cutlass (d6)','Musket (d8)','Heavy weapon (d10)'];
