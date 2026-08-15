import {describe,expect,it} from 'vitest';
import {helpTopics,quickSetupSteps} from './Help';

describe('help topics',()=>{
  it('covers the essential first-time user tasks',()=>{
    const help=helpTopics.map(topic=>`${topic.title} ${topic.keywords} ${topic.body}`).join(' ').toLowerCase();
    for(const subject of ['character','backup','equipment','physical dice','combat','conditions','campaign','journal','rules'])expect(help).toContain(subject);
  });

  it('clearly explains cloud sync and local caching',()=>{
    const saving=helpTopics.find(topic=>topic.title.includes('save'));
    expect(saving?.body).toContain('cached on this device');
    expect(saving?.body).toContain('synchronized');
  });

  it('distinguishes structured campaign records from free-form journal notes',()=>{
    const notes=helpTopics.find(topic=>topic.title.includes('Campaign'));
    expect(notes?.body).toContain('structured facts');
    expect(notes?.body).toContain('free-form');
  });

  it('walks a new campaign owner from setup through play and additional help',()=>{
    const guide=quickSetupSteps.map(step=>`${step.title} ${step.body}`).join(' ').toLowerCase();
    for(const subject of ['invite code','character','portrait','equipment','combat','physical dice','campaign','journal','share with crew','help'])expect(guide).toContain(subject);
  });
});
