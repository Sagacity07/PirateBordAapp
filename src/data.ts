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
export const defaultSettings=():AppSettings=>({showHelp:true,conditionRules:{
  Bleeding:'Ongoing blood loss. Record your table’s HP loss and timing here; the app displays the reminder but does not apply damage automatically.',
  Poisoned:'A poison is active. Record its test, damage, duration, and cure here; effects vary by poison and GM ruling.',
  'On fire':'The character is burning. Record the ongoing damage and action needed to extinguish the flames.',
  Frightened:'Fear is affecting the character. Record the exact test penalty, restriction, or end condition used by your table.',
  Drunk:'Rum can restore HP but temporarily lowers Agility. Record the number of drinks and remaining duration.',
  Cursed:'A supernatural curse is active. Record its exact mechanical effect, source, and removal condition.',
}});
export const seedData=():AppData=>({character:blankCharacter(),campaign:[],journal:[],rules,rolls:[],settings:defaultSettings()});
export const normalizeData=(data:AppData):AppData=>({...data,settings:{...defaultSettings(),...(data.settings??{}),conditionRules:{...defaultSettings().conditionRules,...(data.settings?.conditionRules??{})}}});
export const names=['Anne Vane','Barnacle Bart','Calico Flint','Dread Mary','Elias Graves','Nell Blackwake','Pip Two-Toes','Silas Salt'];
export const classes=['Unclassed','Buccaneer','Rapscallion','Swashbuckler','Zealot','Sorcerer','Custom'];
export const weapons=['Fists (d2)','Knife (d4)','Pistol (d6)','Cutlass (d6)','Musket (d8)','Heavy weapon (d10)'];
