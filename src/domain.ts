export const nonNegativeInteger=(value:number)=>Number.isFinite(value)?Math.max(0,Math.floor(value)):0;
export const clampHp=(hp:number,maxHp:number)=>Math.min(nonNegativeInteger(hp),Math.max(1,nonNegativeInteger(maxHp)));
export const healHp=(hp:number,maxHp:number,amount:number)=>clampHp(hp+nonNegativeInteger(amount),maxHp);
export const damageHp=(hp:number,amount:number)=>Math.max(0,nonNegativeInteger(hp)-nonNegativeInteger(amount));
export const spendResource=(current:number,amount=1)=>Math.max(0,nonNegativeInteger(current)-nonNegativeInteger(amount));

export function addUniqueCondition(conditions:string[],condition:string):string[]{
  const clean=condition.trim();
  if(!clean||conditions.some(existing=>existing.toLocaleLowerCase()===clean.toLocaleLowerCase()))return conditions;
  return [...conditions,clean];
}

export const removeById=<T extends {id:string}>(records:T[],id:string)=>records.filter(record=>record.id!==id);

export function campaignHighlights<T extends {type:string;status:string}>(records:T[]):T[]{
  const latestSession=records.find(record=>record.type==='session');
  const activeQuest=records.find(record=>record.type==='quest'&&record.status.toLocaleLowerCase().includes('active'));
  const ship=records.find(record=>record.type==='ship');
  const treasure=records.find(record=>record.type==='treasure');
  return [latestSession,activeQuest,ship,treasure].filter((record):record is T=>Boolean(record));
}

export interface AdvancementResult{abilityRolls:Record<string,number>;abilities:Record<string,number>;hpGain:number;findRoll:number;silverGain:number;find:string}
export function rollAdvancement(abilities:Record<string,number>,rollDie=()=>Math.floor(Math.random()*6)+1,rollD10=()=>Math.floor(Math.random()*10)+1):AdvancementResult{
  const abilityRolls:Record<string,number>={},next:Record<string,number>={};
  for(const [name,current] of Object.entries(abilities)){
    const roll=rollDie();abilityRolls[name]=roll;
    const increases=current<=1?roll!==1:roll>=current;
    next[name]=Math.max(-3,Math.min(6,current+(increases?1:-1)));
  }
  const hpGain=rollDie(),findRoll=rollDie();
  const silverGain=findRoll===4?rollD10()+rollD10()+rollD10():0;
  const find=findRoll<=2?'Nothing':findRoll===3?'A weapon (roll d12 on the weapon table)':findRoll===4?`${silverGain} silver (3d10)`:findRoll===5?'One Ancient Relic':'One Arcane Ritual';
  return {abilityRolls,abilities:next,hpGain,findRoll,silverGain,find};
}
