import {useMemo,useState} from 'react';
import {BookOpen,Box,Download,Dices,HelpCircle,NotebookPen,Search,Shield,Swords,X} from 'lucide-react';

export type HelpDestination='character'|'combat'|'dice'|'inventory'|'campaign'|'journal'|'rules'|'transfer'|'settings';

export const helpTopics=[
  {title:'Start with your pirate',icon:Shield,keywords:'create character import sheet name class',body:'Open Character to create a new pirate or edit an existing sheet. If someone sent you a character JSON file, use Import / Export instead.'},
  {title:'Your changes save automatically',icon:Download,keywords:'save offline browser local backup device',body:'The “Saved offline” message means this browser has stored your latest changes. There is no account or cloud sync, so another device will not see them automatically.'},
  {title:'Back up or move devices',icon:Download,keywords:'backup export import move phone tablet computer json',body:'On the old device, download a full backup from the Deck, Settings, or Import / Export. On the new device, choose that JSON file under Import / Export and review the changes before applying them.'},
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
    <section className="card help-welcome"><h2>The short version</h2><p>Create or import your pirate, update the sheet as you play, and download a backup occasionally. Everything saves automatically on this device.</p><div className="help-actions"><button onClick={()=>go('character')}>Open character</button><button onClick={()=>go('inventory')}>Edit equipment</button><button onClick={()=>go('transfer')}>Backup or import</button></div></section>
    <label className="search help-search"><Search/><input aria-label="Search help" placeholder="Search help—backup, physical dice, conditions…" value={query} onChange={event=>setQuery(event.target.value)}/></label>
    <div className="help-grid">{shown.map(topic=><section className="card help-topic" key={topic.title}><topic.icon/><div><h2>{topic.title}</h2><p>{topic.body}</p></div></section>)}</div>
    {!shown.length&&<section className="card help-empty"><h2>No matching help topic</h2><p>Try a shorter search such as “backup,” “dice,” or “conditions.”</p></section>}
    <section className="card help-warning"><h2>Before clearing browser data</h2><p>Download a full backup first. Clearing this browser’s site data, using a different browser, or removing the installed app can remove locally stored characters and campaign records.</p><button className="primary" onClick={()=>go('transfer')}><Download/>Go to Import / Export</button></section>
  </>;
}

const walkthroughSteps=[
  {title:'Welcome aboard',body:'This companion keeps your character sheet, equipment, rolls, notes, and campaign records together. Start on the Deck during play.'},
  {title:'It saves on this device',body:'Changes save automatically in this browser. There is no login or cloud sync, so each player controls their own copy.'},
  {title:'Build or import your pirate',body:'Use Character to create and edit a pirate. Use Import / Export if you already have a character file from another device.'},
  {title:'Play your way',body:'Use Combat and the built-in Dice roller, or enter results from physical dice. Equipment tracks weapons, ammunition, supplies, and uses.'},
  {title:'Protect your pirate',body:'Download a backup before changing devices or clearing browser data. Export on the old device, then import the JSON file on the new one.'},
];

export function OnboardingWalkthrough({onClose,onDownload,onOpenHelp}:{onClose:()=>void;onDownload:()=>void;onOpenHelp:()=>void}){
  const [step,setStep]=useState(0);const item=walkthroughSteps[step];const last=step===walkthroughSteps.length-1;
  return <div className="modal-back"><div className="modal walkthrough" role="dialog" aria-modal="true" aria-labelledby="walkthrough-title"><div className="modal-head"><div><span className="eyebrow">STEP {step+1} OF {walkthroughSteps.length}</span><h2 id="walkthrough-title">{item.title}</h2></div><button className="icon-btn" aria-label="Close walkthrough" onClick={onClose}><X/></button></div><p>{item.body}</p><div className="progress" aria-hidden="true">{walkthroughSteps.map((_,index)=><i className={index<=step?'active':''} key={index}/>)}</div><div className="modal-actions walkthrough-actions">{step>0&&<button onClick={()=>setStep(step-1)}>Back</button>}{last?<><button onClick={onDownload}><Download/>Download backup</button><button className="primary" onClick={()=>{onClose();onOpenHelp()}}>Finish and open Help</button></>:<button className="primary" onClick={()=>setStep(step+1)}>Next</button>}</div></div></div>;
}
