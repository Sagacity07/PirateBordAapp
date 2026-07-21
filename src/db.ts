import {openDB} from 'idb';import type {AppData} from './types';import {normalizeData,seedData} from './data';import {mergeSession1} from './session1';
const dbp=openDB('pirate-borg-companion',1,{upgrade(db){db.createObjectStore('state')}});
export async function loadData(){return mergeSession1(normalizeData((await (await dbp).get('state','app')) as AppData|undefined ?? seedData()))}
export async function saveData(data:AppData){await (await dbp).put('state',data,'app')}
