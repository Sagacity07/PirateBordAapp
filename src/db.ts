import {openDB} from 'idb';import type {AppData} from './types';import {seedData} from './data';
const dbp=openDB('pirate-borg-companion',1,{upgrade(db){db.createObjectStore('state')}});
export async function loadData(){return (await (await dbp).get('state','app')) as AppData|undefined ?? seedData()}
export async function saveData(data:AppData){await (await dbp).put('state',data,'app')}
