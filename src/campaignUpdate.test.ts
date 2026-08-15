import {describe,expect,it} from 'vitest';
import {applyReviewedChanges,createAiPackage,parseCampaignUpdate,recordHash,reviewCampaignUpdate} from './campaignUpdate';
import {blankCharacter} from './data';
import type {CampaignRecord,JournalEntry} from './types';

const record:CampaignRecord={id:'quest-1',type:'quest',title:'Find the reef',status:'Open',notes:'Follow the map.',createdAt:'2026-08-15T00:00:00Z'};
const update=(baseHash=recordHash(record))=>({schemaVersion:'1.0',importType:'campaign-update',campaignId:'campaign-1',createdAt:'2026-08-15T01:00:00Z',changes:[{id:'change-1',action:'update',entityType:'quest',entityId:'quest-1',baseHash,data:{title:'Find the reef',status:'Complete',notes:'The reef was found.'}}]});

describe('AI package export',()=>{
  it('contains shared information but excludes private journals',()=>{const journals:JournalEntry[]=[{id:'shared',kind:'session',title:'Shared',body:'Crew saw a reef.',pinned:false,createdAt:'x',visibility:'shared'},{id:'private',kind:'character',title:'Secret',body:'No.',pinned:false,createdAt:'x',visibility:'private'}];const value=createAiPackage({campaignId:'campaign-1',campaignName:'Test Campaign',character:blankCharacter(),records:[record],journal:journals});expect(value.sharedCampaignRecords[0].contentHash).toBe(recordHash(record));expect(value.sharedJournalEntries.map(entry=>entry.id)).toEqual(['shared'])});
});

describe('campaign update review',()=>{
  it('accepts an unchanged record',()=>{const parsed=parseCampaignUpdate(JSON.stringify(update()));expect(reviewCampaignUpdate(parsed,'campaign-1',[record])[0].status).toBe('ready')});
  it('blocks stale updates instead of overwriting another player',()=>{const parsed=parseCampaignUpdate(JSON.stringify(update('old-hash')));expect(reviewCampaignUpdate(parsed,'campaign-1',[record])[0]).toMatchObject({status:'conflict'});expect(applyReviewedChanges([record],reviewCampaignUpdate(parsed,'campaign-1',[record]),new Set(['change-1'])).applied).toHaveLength(0)});
  it('blocks an update for a different campaign',()=>{const parsed=parseCampaignUpdate(JSON.stringify(update()));expect(()=>reviewCampaignUpdate(parsed,'other-campaign',[record])).toThrow('different campaign')});
  it('applies only selected, conflict-free changes',()=>{const parsed=parseCampaignUpdate(JSON.stringify(update()));const result=applyReviewedChanges([record],reviewCampaignUpdate(parsed,'campaign-1',[record]),new Set(['change-1']));expect(result.applied).toHaveLength(1);expect(result.records[0]).toMatchObject({status:'Complete',notes:'The reef was found.'})});
  it('requires base hashes for updates',()=>{const value:any=update();delete value.changes[0].baseHash;expect(()=>parseCampaignUpdate(JSON.stringify(value))).toThrow('baseHash')});
  it('rejects duplicate change IDs',()=>{const value:any=update();value.changes.push(structuredClone(value.changes[0]));expect(()=>parseCampaignUpdate(JSON.stringify(value))).toThrow('Duplicate change ID')});
});

