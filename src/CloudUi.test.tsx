import {renderToStaticMarkup} from 'react-dom/server';
import {describe,expect,it,vi} from 'vitest';

vi.mock('./supabase',()=>({supabase:{auth:{signOut:vi.fn()}}}));

import {cloudErrorMessage,CloudBadge,CloudPanel} from './CloudUi';

const user={id:'player-1',email:'pirate@example.com'} as any;
const noop=async()=>{};

describe('first-time cloud setup',()=>{
  it('explains how a new player creates or joins a campaign',()=>{
    const html=renderToStaticMarkup(<CloudPanel user={user} campaigns={[]} activeId={null} status="synced" onClose={()=>{}} onCreate={noop} onJoin={noop} onSwitch={noop} onRetry={noop}/>);
    expect(html).toContain('FIRST-TIME SETUP');
    expect(html).toContain('Welcome aboard');
    expect(html).toContain('Create a campaign');
    expect(html).toContain('Join with a code');
    expect(html).toContain('private journal');
  });

  it('describes a failed initial sync without claiming there are queued changes',()=>{
    const html=renderToStaticMarkup(<CloudBadge campaign={null} status="error" onClick={()=>{}}/>);
    expect(html).toContain('Cloud sync needs attention');
    expect(html).not.toContain('Offline changes waiting');
  });

  it('shows useful Supabase error objects instead of a generic failure',()=>{
    expect(cloudErrorMessage({message:'Campaign creation was denied'})).toBe('Campaign creation was denied');
  });
});
