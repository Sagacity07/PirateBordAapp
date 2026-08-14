import type {AppData,Character} from './types';

const LAST_BACKUP_KEY='pirate-borg-last-backup-at';
const CHANGE_COUNT_KEY='pirate-borg-changes-since-backup';
const INTRO_SEEN_KEY='pirate-borg-backup-intro-seen';
export const BACKUP_CHANGE_REMINDER=25;
export const BACKUP_AGE_REMINDER_DAYS=14;

export interface BackupStatus{lastBackupAt:string|null;changesSinceBackup:number;recommended:boolean;message:string}

export function backupStatus(lastBackupAt:string|null,changesSinceBackup:number,now=Date.now()):BackupStatus{
  if(!lastBackupAt)return{lastBackupAt:null,changesSinceBackup,recommended:true,message:'Never backed up on this device'};
  const age=now-new Date(lastBackupAt).getTime();
  const old=Number.isFinite(age)&&age>=BACKUP_AGE_REMINDER_DAYS*24*60*60*1000;
  const recommended=old||changesSinceBackup>=BACKUP_CHANGE_REMINDER;
  return{lastBackupAt,changesSinceBackup,recommended,message:recommended?`${changesSinceBackup} changes since the last backup`:`Last backup ${new Date(lastBackupAt).toLocaleDateString()}`};
}

export function readBackupStatus():BackupStatus{
  const last=localStorage.getItem(LAST_BACKUP_KEY);
  const changes=Math.max(0,Number(localStorage.getItem(CHANGE_COUNT_KEY))||0);
  return backupStatus(last,changes);
}

export function recordLocalChange():BackupStatus{
  const current=readBackupStatus();
  localStorage.setItem(CHANGE_COUNT_KEY,String(current.changesSinceBackup+1));
  return readBackupStatus();
}

export function recordBackup(at=new Date().toISOString()):BackupStatus{
  localStorage.setItem(LAST_BACKUP_KEY,at);
  localStorage.setItem(CHANGE_COUNT_KEY,'0');
  return readBackupStatus();
}

export const hasSeenBackupIntro=()=>localStorage.getItem(INTRO_SEEN_KEY)==='true';
export const markBackupIntroSeen=()=>localStorage.setItem(INTRO_SEEN_KEY,'true');

export function fullBackupEnvelope(data:AppData){return{schemaVersion:'1.0',importType:'full-backup',exportedAt:new Date().toISOString(),data}}
export function characterBackupEnvelope(character:Character){return{schemaVersion:'1.0',importType:'character',exportedAt:new Date().toISOString(),character}}
export function characterFileName(character:Character){const slug=(character.nickname||character.name||'character').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'character';return`${slug}.pirate-borg-character.json`}

export function downloadJson(name:string,value:unknown){
  const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));
  const anchor=document.createElement('a');
  anchor.href=url;anchor.download=name;anchor.click();
  setTimeout(()=>URL.revokeObjectURL(url),0);
}
