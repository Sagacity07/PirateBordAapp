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
