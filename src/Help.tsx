import {useMemo,useState} from 'react';
import {BookOpen,Box,Download,Dices,HelpCircle,NotebookPen,Search,Shield,Swords,Users,X} from 'lucide-react';

export type HelpDestination='character'|'combat'|'dice'|'inventory'|'campaign'|'journal'|'rules'|'transfer'|'settings';

export const helpTopics=[
  {title:'Start with your pirate',icon:Shield,keywords:'create character import sheet name class',body:'Open Character to create a new pirate or edit an existing sheet. If someone sent you a character JSON file, use Import / Export instead.'},
  {title:'Your changes save automatically',icon:Download,keywords:'save offline browser local backup device cloud sync',body:'Changes are cached on this device and synchronized to your Supabase account. The cloud badge shows whether everything is saved, syncing, offline, or waiting for a retry.'},
  {title:'Use another device',icon:Download,keywords:'backup export import move phone tablet computer json sign in cloud',body:'Sign in with the same email on another device to load your character and campaigns. A downloadable JSON backup is still useful as a portable safety copy.'},
  {title:'Equipment and ranged weapons',icon:Box,keywords:'equipment inventory weapon ammo ranged reload uses equip',body:'Equipment holds weapons, armor, relics, pets, and supplies. Edit quantities, uses, damage dice, range, ammunition, reload actions, notes, and equipped status there.'},
  {title:'Built-in or physical dice',icon:Dices,keywords:'dice manual physical roll advantage formula',body:'Use Dice for the built-in roller. If you roll real dice, enter the number under Physical dice so the result still appears in roll history.'},
  {title:'Combat and conditions',icon:Swords,keywords:'combat attack damage hp armor bleeding poisoned condition',body:'Combat tracks HP, Devil’s Luck, attacks, damage, armor, ammunition, and conditions. Active condition effects appear beneath the condition; their definitions can be edited in Settings.'},
  {title:'Campaign or Journal?',icon:NotebookPen,keywords:'campaign journal notes npc quest ship location session captain log',body:'Use Campaign for structured facts the whole group may reference: sessions, NPCs, locations, quests, ships, treasure, and rumors. Use Journal for free-form session notes, quick notes, and your character’s private point of view.'},
  {title:'Rules and stars',icon:BookOpen,keywords:'rules reference star favorite bookmark search',body:'Rules is a searchable index and personal reference—not a replacement for the book. A gold star marks a rule as a favorite so it sorts ahead of other results.'},
];

export function HelpPage({go,restart}:{go:(page:HelpDestination)=>void;restart:()=>void}){
  const [query,setQuery]=useState('');
  const shown=useMemo(()=>{const needle=query.trim().toLowerCase();return needle?helpTopics.filter(topic=>`${topic.title} ${topic.keywords} ${topic.body}`.toLowerCase().includes(needle)):helpTopics},[query]);
  return <>
    <div className="title"><div><span className="eyebrow">ALL HANDS BRIEFING</span><h1>How to use the app</h1></div><button className="secondary" onClick={restart}><HelpCircle/>Start walkthrough</button></div>
    <section className="card help-welcome"><h2>The short version</h2><p>Sign in, create or join a campaign, and update your pirate as you play. Changes synchronize automatically and remain cached for temporary offline use.</p><div className="help-actions"><button onClick={()=>go('character')}>Open character</button><button onClick={()=>go('inventory')}>Edit equipment</button><button onClick={()=>go('transfer')}>Download backup</button></div></section>
    <label className="search help-search"><Search/><input aria-label="Search help" placeholder="Search help—backup, physical dice, conditions…" value={query} onChange={event=>setQuery(event.target.value)}/></label>
    <div className="help-grid">{shown.map(topic=><section className="card help-topic" key={topic.title}><topic.icon/><div><h2>{topic.title}</h2><p>{topic.body}</p></div></section>)}</div>
    {!shown.length&&<section className="card help-empty"><h2>No matching help topic</h2><p>Try a shorter search such as “backup,” “dice,” or “conditions.”</p></section>}
    <section className="card help-warning"><h2>Portable safety copy</h2><p>Cloud synchronization protects normal device changes, but a full JSON export gives you an independent copy of the character and currently loaded campaign data.</p><button className="primary" onClick={()=>go('transfer')}><Download/>Go to Import / Export</button></section>
  </>;
}

const walkthroughSteps=[
  {title:'Welcome aboard',body:'This companion keeps your character sheet, equipment, rolls, notes, and campaign records together. Start on the Deck during play.'},
  {title:'Sign in without a password',body:'Enter your email and use the one-time link Supabase sends you. Your account identifies your character, private journal entries, and campaign memberships.'},
  {title:'Create or join a campaign',body:'Create a campaign and share its invite code with your group, or enter the code supplied by another player. Campaign records synchronize for every member.'},
  {title:'Play your way',body:'Use Combat and the built-in Dice roller, or enter results from physical dice. Equipment tracks weapons, ammunition, supplies, and uses.'},
  {title:'Cloud plus backup',body:'Your data synchronizes through Supabase and is cached for temporary offline play. Download a JSON backup occasionally as an independent safety copy.'},
];

export const quickSetupSteps=[
  {title:'Your campaign is ready',body:'Campaign facts such as sessions, NPCs, locations, quests, ships, treasure, and rumors are shared with everyone who joins your campaign. Give your invite code only to your gaming group.',icon:Users},
  {title:'Add your pirate',body:'Open Character to build a new pirate with the guided creator or enter the details manually. You can add a portrait and update HP, abilities, class features, and advancement at any time. If you already have a character JSON file, use Import / Export.',icon:Shield},
  {title:'Check your equipment',body:'Equipment is where you add and edit weapons, armor, ammunition, relics, pets, supplies, quantities, uses, range, and equipped status. Equipped weapons feed into Combat.',icon:Box},
  {title:'Use it during play',body:'The Deck is your five-second overview. Combat handles attacks, damage, HP, armor, conditions, ammunition, and Devil’s Luck. Dice supports built-in rolls and lets you record a result from physical dice.',icon:Dices},
  {title:'Record the adventure',body:'Use Campaign for structured facts the whole crew should know. Use Journal for free-form notes; entries stay private unless you choose Share with crew. Open Help anytime for searchable explanations or to restart this guide.',icon:NotebookPen},
];

const quickSetupKey=(userId:string)=>`pirate-borg-quick-setup-v1:${userId}`;
export const hasSeenQuickSetup=(userId:string)=>localStorage.getItem(quickSetupKey(userId))==='seen';
export const markQuickSetupSeen=(userId:string)=>localStorage.setItem(quickSetupKey(userId),'seen');

export function QuickSetupGuide({campaignName,inviteCode,onClose,onCharacter,onHelp}:{campaignName:string;inviteCode:string;onClose:()=>void;onCharacter:()=>void;onHelp:()=>void}){
  const [step,setStep]=useState(0);const item=quickSetupSteps[step];const last=step===quickSetupSteps.length-1;const StepIcon=item.icon;
  return <div className="modal-back"><div className="modal walkthrough quick-setup" role="dialog" aria-modal="true" aria-labelledby="quick-setup-title"><div className="modal-head"><div><span className="eyebrow">QUICK SETUP · STEP {step+1} OF {quickSetupSteps.length}</span><h2 id="quick-setup-title">{item.title}</h2></div><button className="icon-btn" aria-label="Close quick setup" onClick={onClose}><X/></button></div><div className="quick-setup-body"><StepIcon/><p>{item.body}</p></div>{step===0&&<section className="setup-campaign"><span>{campaignName}</span><p>Invite code: <b>{inviteCode}</b></p></section>}<div className="progress" aria-hidden="true">{quickSetupSteps.map((_,index)=><i className={index<=step?'active':''} key={index}/>)}</div><div className="modal-actions walkthrough-actions">{step>0&&<button onClick={()=>setStep(step-1)}>Back</button>}{last?<><button onClick={onHelp}><HelpCircle/>Open Help</button><button className="primary" onClick={onCharacter}><Shield/>Set up my pirate</button></>:<button className="primary" onClick={()=>setStep(step+1)}>Next</button>}</div></div></div>;
}

export function OnboardingWalkthrough({onClose,onDownload,onOpenHelp}:{onClose:()=>void;onDownload:()=>void;onOpenHelp:()=>void}){
  const [step,setStep]=useState(0);const item=walkthroughSteps[step];const last=step===walkthroughSteps.length-1;
  return <div className="modal-back"><div className="modal walkthrough" role="dialog" aria-modal="true" aria-labelledby="walkthrough-title"><div className="modal-head"><div><span className="eyebrow">STEP {step+1} OF {walkthroughSteps.length}</span><h2 id="walkthrough-title">{item.title}</h2></div><button className="icon-btn" aria-label="Close walkthrough" onClick={onClose}><X/></button></div><p>{item.body}</p><div className="progress" aria-hidden="true">{walkthroughSteps.map((_,index)=><i className={index<=step?'active':''} key={index}/>)}</div><div className="modal-actions walkthrough-actions">{step>0&&<button onClick={()=>setStep(step-1)}>Back</button>}{last?<><button onClick={onDownload}><Download/>Download backup</button><button className="primary" onClick={()=>{onClose();onOpenHelp()}}>Finish and open Help</button></>:<button className="primary" onClick={()=>setStep(step+1)}>Next</button>}</div></div></div>;
}
