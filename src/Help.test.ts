import {describe,expect,it} from 'vitest';
import {helpTopics} from './Help';

describe('help topics',()=>{
  it('covers the essential first-time user tasks',()=>{
    const help=helpTopics.map(topic=>`${topic.title} ${topic.keywords} ${topic.body}`).join(' ').toLowerCase();
    for(const subject of ['character','backup','equipment','physical dice','combat','conditions','campaign','journal','rules'])expect(help).toContain(subject);
  });

  it('clearly explains that saved data is device-local',()=>{
    const saving=helpTopics.find(topic=>topic.title.includes('save'));
    expect(saving?.body).toContain('this browser');
    expect(saving?.body).toContain('no account or cloud sync');
  });

  it('distinguishes structured campaign records from free-form journal notes',()=>{
    const notes=helpTopics.find(topic=>topic.title.includes('Campaign'));
    expect(notes?.body).toContain('structured facts');
    expect(notes?.body).toContain('free-form');
  });
});
