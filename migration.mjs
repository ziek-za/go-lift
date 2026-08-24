/* Simulate exactly what happened: a state saved before v24, then loaded by v24 */
const mk = id => { const e = { id, _cls:new Set(), innerHTML:'', dataset:{}, style:{}, value:'',
  offsetWidth:1, classList:{add(c){e._cls.add(c);},remove(c){e._cls.delete(c);},
  toggle(c,f){f?e._cls.add(c):e._cls.delete(c);},contains(c){return e._cls.has(c);}},
  appendChild(){},setAttribute(){},getAttribute(){return null;},addEventListener(){},
  querySelector(){return null;},querySelectorAll(){return [];},closest(){return null;},
  click(){},focus(){},setSelectionRange(){},dispatchEvent(){},remove(){},
  get outerHTML(){return '';},set outerHTML(v){} }; return e; };
const nodes=new Map(); const get$=s=>{if(!nodes.has(s))nodes.set(s,mk(s));return nodes.get(s);};
const handlers={};
global.document={querySelector:get$,querySelectorAll:()=>[],createElement:()=>mk(),
  addEventListener:(t,fn)=>{handlers[t]=fn;},visibilityState:'visible',body:mk('body')};
global.window={addEventListener(){}};
Object.defineProperty(global,'navigator',{value:{vibrate(){}},configurable:true});
global.URL={createObjectURL:()=>'',revokeObjectURL(){}};global.Blob=class{};
global.caches={keys:async()=>[],delete:async()=>{}};global.location={reload(){}};
global.scrollTo=()=>{};global.fetch=async()=>({text:async()=>""});

const {ACCESSORIES,MAINS,CORE_TRACKS,SEED_RECORDS} = await import('./data.js');
/* the old library, before traps and forearms existed */
const OLD = new Set(Object.keys(ACCESSORIES).filter(k =>
  !['shrug-bb','shrug-db','shrug-machine','shrug-hold','revcurl','wristcurl','revwrist','hammerrope','farmerhold','leandb'].includes(k)));
const stale = { v:2, created:'2026-08-17', cycleStart:'2026-08-17', club:'Foreshore',
  clubW:{}, clubOut:{}, records:{}, mains:{}, acc:{}, runs:[], coreSeen:[], coreQ:[],
  coreLevel:{}, coreClean:{}, sessions:[], lastSync:null,
  settings:{ swaps:{}, runAdjust:true, coreStart:'advanced' } };
for (const [k,m] of Object.entries(MAINS)) stale.mains[k]={tm:m.tm,misses:0,hist:[]};
for (const k of OLD) stale.acc[k]={w:ACCESSORIES[k].w,reps:ACCESSORIES[k].reps,sets:ACCESSORIES[k].sets,misses:0,hist:[],lastDone:null};
for (const t of CORE_TRACKS) stale.coreLevel[t.id]=2;
console.log('stale state is missing ' + (Object.keys(ACCESSORIES).length - OLD.size) + ' exercises\n');

const db=new Map([['state',stale]]);
global.indexedDB={open(){const r={};setTimeout(()=>{r.result={createObjectStore(){},
 transaction:()=>({objectStore:()=>({get(k){const q={};setTimeout(()=>{q.result=db.get(k);q.onsuccess&&q.onsuccess();},0);return q;},
 put(v,k){const q={};db.set(k,JSON.parse(JSON.stringify(v)));setTimeout(()=>q.onsuccess&&q.onsuccess(),0);return q;}})})};
 r.onupgradeneeded&&r.onupgradeneeded();r.onsuccess&&r.onsuccess();},0);return r;}};
const target=(sel,d={})=>({id:d.id||'',dataset:d,closest(q){return q===sel?{dataset:d,parentElement:{querySelectorAll:()=>[]},closest:()=>null}:null;}});

await import('./app.js');
await new Promise(r=>setTimeout(r,300));
let bad = 0;
for (const v of ['plan','progress','data','today']) {
  try { await handlers.click({target:target('nav button',{v})});
    const n=get$('#v-'+v).innerHTML.length;
    if (n <= 200) bad++;
    console.log('  '+v.padEnd(9)+(n>200?n+' chars ✓':'EMPTY ✗'));
  } catch(e){ bad++; console.log('  '+v.padEnd(9)+'✗ '+e.message); }
}
/* the state written back must now carry every exercise */
const saved = db.get('state');
const missing = Object.keys(ACCESSORIES).filter(k => !saved.acc[k]);
console.log('\n  exercises backfilled into saved state: ' +
  (Object.keys(saved.acc).length - OLD.size));
if (missing.length) { bad++; console.log('  ✗ still missing: ' + missing.join(', ')); }
console.log(bad ? '\n✗ migration failed' : '\n✓ a pre-v24 save loads cleanly on every tab');
process.exit(bad ? 1 : 0);
