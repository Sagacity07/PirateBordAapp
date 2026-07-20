import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {VitePWA} from 'vite-plugin-pwa';
export default defineConfig({plugins:[react(),VitePWA({registerType:'autoUpdate',includeAssets:['icon.svg'],manifest:{name:'Pirate Borg Companion',short_name:'Pirate Borg',description:'An offline player companion for PIRATE BORG',theme_color:'#12100d',background_color:'#12100d',display:'standalone',orientation:'any',icons:[{src:'icon.svg',sizes:'any',type:'image/svg+xml',purpose:'any maskable'}]}})]});
