import {describe,expect,it} from 'vitest';
import {backupStatus,characterBackupEnvelope,characterFileName} from './backup';
import {blankCharacter} from './data';

describe('backup reminders',()=>{
  it('recommends the first backup',()=>expect(backupStatus(null,0).recommended).toBe(true));
  it('recommends a backup after 25 changes',()=>expect(backupStatus('2026-08-14T12:00:00Z',25,new Date('2026-08-15T12:00:00Z').getTime()).recommended).toBe(true));
  it('recommends a backup after fourteen days',()=>expect(backupStatus('2026-08-01T12:00:00Z',0,new Date('2026-08-15T12:00:00Z').getTime()).recommended).toBe(true));
  it('reports a recent backup as current',()=>expect(backupStatus('2026-08-14T12:00:00Z',3,new Date('2026-08-15T12:00:00Z').getTime()).recommended).toBe(false));
});

describe('character exports',()=>{
  it('wraps the native character in a versioned import envelope',()=>{const character=blankCharacter();expect(characterBackupEnvelope(character)).toMatchObject({schemaVersion:'1.0',importType:'character',character})});
  it('uses the nickname in a safe file name',()=>{const character={...blankCharacter(),name:'Pip Vane',nickname:'Two-Toes'};expect(characterFileName(character)).toBe('two-toes.pirate-borg-character.json')});
});
