import type {AppData,CampaignRecord,JournalEntry} from './types';

const createdAt='2026-07-20T00:00:00.000Z';

export const session1Campaign:CampaignRecord[]=[
  {id:'session-1',type:'session',title:'Session 1 — Shipwrecked and Bound for Yuma',status:'Complete',createdAt,notes:'A hurricane caught the Tarantula in the Bahamas. A bone galleon rammed the ship and black skeleton marauders boarded. The crew fought through the attack, but the Tarantula struck rocks and broke apart. Captain Bloodwick died after being impaled by wreckage and passed over his secret treasure map. Jerry Jones and Roger Rager were lost; Martin Bluegreen and Edmund Sea joined the surviving player crew. The survivors salvaged supplies, built a raft, reached Rum Cay, explored the wreck of the HMS Commander, and ended the session owning the longboat Driftwood.'},
  {id:'npc-skaggs',type:'npc',title:'Skaggs',status:'Alive — ally',createdAt,notes:'First mate of the Tarantula. Survived the wreck. Identified Yuma and Rum Cay from the hilltop and traveled with the crew.'},
  {id:'npc-billy-knives',type:'npc',title:'Billy Knives',status:'Alive — ally',createdAt,notes:'Cabin boy from the Tarantula. Survived the wreck and traveled with the crew. Recognized the ghost kraken Krawagoth from sailors’ legends.'},
  {id:'npc-captain-bloodwick',type:'npc',title:'Captain Bloodwick',status:'Dead',createdAt,notes:'Tyrannical captain of the Tarantula. Secretly held a treasure map. Died impaled on wreckage after the ship struck the rocks and handed the map to the survivors.'},
  {id:'npc-esperanza',type:'npc',title:'Esperanza',status:'Alive — business contact',createdAt,notes:'Older fisher in Port Nelson. Kept a well-maintained home and garden. Sold the crew her longboat Driftwood for 150 silver and four barrels of rum. Owns a newer tartane imported from Tortuga and sails with Reggie and Fernando.'},
  {id:'npc-juba',type:'npc',title:'Juba',status:'Alive — friendly',createdAt,notes:'Jovial cook at the Port Nelson tavern. Serves crab-stuffed local snails and bought four barrels of salvaged rum for 200 silver.'},
  {id:'npc-bottlesmith',type:'npc',title:'Bottlesmith',status:'Alive — uncertain',createdAt,notes:'Long-haired pirate from St. Martin looking for work in Port Nelson. Likes drinking and fighting. Warned that St. Martin is hostile to pirates and is called Gibbet Town. Also shared rumors about Esperanza and a traveling vampire.'},
  {id:'location-wreck-island',type:'location',title:'The Shipwreck Island',status:'Explored',createdAt,notes:'Small island, roughly three square miles, with white beaches and a central hill. The crew landed on its south shore after the Tarantula sank. An abandoned north-shore camp held weapons, ammunition, a medical kit, fishing gear, flint and steel, and a bedroll. From the hill the crew saw Yuma to the southwest and Rum Cay to the southeast.'},
  {id:'location-yuma',type:'location',title:'Yuma',status:'Destination',createdAt,notes:'Larger island southwest of the wreck island. Skaggs believes Captain Bloodwick’s treasure map points here. The crew intends to travel here after resupplying.'},
  {id:'location-rum-cay',type:'location',title:'Rum Cay',status:'Visited',createdAt,notes:'Island southeast of the wreck island. Port Nelson lies on its south side. Other visible features include dark sea caves on the north side, a tide pool, and the wreck of the HMS Commander off the southwest coast.'},
  {id:'location-port-nelson',type:'location',title:'Port Nelson',status:'Visited',createdAt,notes:'Small, sleepy settlement on the south side of Rum Cay, with palm-frond huts, driftwood shacks, tents, a tavern near the beach, and a trading post by the docks.'},
  {id:'quest-three-talons',type:'quest',title:'Follow Captain Bloodwick’s Map',status:'Active',createdAt,notes:'Find the treasure associated with three rock columns or “Three Talons.” Skaggs believes the destination is Yuma. The map includes a partially understood warning about only those with a heart of the sea passing the doors of blood.'},
  {id:'ship-driftwood',type:'ship',title:'Driftwood',status:'Owned — 5 hull',createdAt,notes:'Well-maintained longboat purchased from Esperanza for 150 silver and four barrels of rum. This is the crew’s current vessel.'},
  {id:'treasure-session-1-haul',type:'treasure',title:'Session 1 Shared Haul',status:'Held by crew',createdAt,notes:'From the HMS Commander: 200 silver, four gold cups, and nineteen barrels of rum. Four barrels were sold to Juba for 200 silver and four were traded to Esperanza with 150 silver for Driftwood. End-of-session shared totals stated at the table: 250 silver, four gold cups, and eleven barrels of rum.'},
  {id:'rumor-krawagoth',type:'rumor',title:'Krawagoth, the Ghost Kraken',status:'Confirmed sighting',createdAt,notes:'A huge glowing skeletal kraken passed beneath the raft during the night. Billy Knives identified it as Krawagoth, a kraken slain by fishermen whose ghost still haunts the waters.'},
];

export const session1Journal:JournalEntry={
  id:'journal-session-1',kind:'session',title:'Session 1 — The Wreck of the Tarantula',pinned:true,createdAt,
  body:`PLAYER CREW
Sunny; Pip “Two-Toes”; Esme Dubois; Sylvan the Drowned; Martin Bluegreen (sorcerer, replaced Jerry Jones); Edmund Sea (brute, replaced Roger Rager).

OPENING AND BATTLE
The novice crew had sailed aboard Captain Bloodwick’s Tarantula for roughly three weeks, following his private map and searching for a peninsula marked by three west-linked rock columns. During a catastrophic hurricane, a galleon built from bones rammed the Tarantula. Black skeleton marauders boarded and the crew fought them across the deck.

THE SHIPWRECK
The Tarantula struck rocks and broke apart. Most of the crew were dragged into the water and had to fight their way to shore. Jerry Jones and Roger Rager were lost. Captain Bloodwick was impaled on wreckage; before dying, he passed over his treasure map. Skaggs and Billy Knives survived with the player crew.

STRANDED
The survivors awoke on a small island with no food. They salvaged a water barrel, a partly full rum barrel, wood and cloth, and enough eggs to begin feeding the group. The north-shore abandoned camp contained a bedroll, musket, loaded flintlock pistol, gunpowder and roughly twenty rounds, medical kit, hunting knife, fishing net, and flint and steel. The group used wreckage and the tent to build a raft with a sail and oars.

ISLANDS AND THE MAP
From the central hill, the crew saw Yuma to the southwest and Rum Cay to the southeast. Skaggs believes Yuma is the location shown on Bloodwick’s map. The crew chose to resupply at Port Nelson on Rum Cay before pursuing the treasure.

THE NIGHT CROSSING
At sea, a merman traded ten mermaid scales for ten silver. The scales allow underwater breathing for d4 hours and count as a relic; the merman warned that the journey would be perilous. Later, the crew stayed silent as the glowing skeleton of Krawagoth, a legendary ghost kraken, passed beneath their raft.

PORT NELSON
The crew reached Port Nelson, shopped for equipment and provisions, and met Juba, Bottlesmith, and Esperanza. A drinking contest informally settled the captaincy, though the crew also discussed operating democratically.

THE HMS COMMANDER
The crew investigated the submerged cargo freighter HMS Commander. Mermaid scales allowed several pirates to dive approximately thirty feet to the wreck. They killed two reef sharks and a fast, many-eyed shadow starfish guarding a barrel. The wreck was beyond field repair, but the crew recovered a chest containing 200 silver and four gold cups, plus nineteen barrels of rum.

END STATE
Juba bought four rum barrels for 200 silver. Esperanza sold the longboat Driftwood for 150 silver and four barrels of rum. The table recorded the shared end-of-session resources as Driftwood (5 hull), 250 silver, four gold cups, and eleven rum barrels. The active objective is to sail for Yuma and follow Captain Bloodwick’s treasure map.`
};

export function mergeSession1(data:AppData):AppData{
  const campaignIds=new Set(data.campaign.map(record=>record.id));
  const journalIds=new Set(data.journal.map(entry=>entry.id));
  return {
    ...data,
    campaign:[...session1Campaign.filter(record=>!campaignIds.has(record.id)),...data.campaign],
    journal:journalIds.has(session1Journal.id)?data.journal:[session1Journal,...data.journal],
  };
}
