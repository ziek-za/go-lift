/* Drive applyUpdate against stubs and check the sequence it performs */
const calls = [];
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
let unregistered=0, cachesDeleted=[];
Object.defineProperty(global,'navigator',{configurable:true,value:{
  vibrate(){},
  serviceWorker:{
    controller:{},
    register:async()=>{calls.push('register');return{};},
    getRegistration:async()=>({waiting:null,update:async()=>calls.push('update')}),
    getRegistrations:async()=>[{unregister:async()=>{unregistered++;calls.push('unregister');return true;}}],
    addEventListener(){}
  }}});
global.window={addEventListener(){}, caches:true};
global.caches={ keys:async()=>['load-v28','load-v29'], delete:async k=>{cachesDeleted.push(k);calls.push('delete:'+k);return true;} };
global.location={ href:'https://x.io/go-lift/', pathname:'/go-lift/', search:'',
  replace(u){calls.push('replace:'+u.split('?')[0]+'?u=<ts>');}, reload(){calls.push('reload');} };
global.history={replaceState(){}};
global.URL={createObjectURL:()=>'',revokeObjectURL(){}};global.Blob=class{};
global.scrollTo=()=>{}; global.fetch=async()=>({text:async()=>""});
const db=new Map();
global.indexedDB={open(){const r={};setTimeout(()=>{r.result={createObjectStore(){},
 transaction:()=>({objectStore:()=>({get(k){const q={};setTimeout(()=>{q.result=db.get(k);q.onsuccess&&q.onsuccess();},0);return q;},
 put(v,k){const q={};db.set(k,JSON.parse(JSON.stringify(v)));setTimeout(()=>q.onsuccess&&q.onsuccess(),0);return q;}})})};
 r.onupgradeneeded&&r.onupgradeneeded();r.onsuccess&&r.onsuccess();},0);return r;}};

await import('./app.js');
await new Promise(r=>setTimeout(r,300));
calls.length = 0;
await handlers.click({ target: { id:'applyupdate', closest:()=>null } });
await new Promise(r=>setTimeout(r,200));
console.log('sequence performed:');
calls.forEach(c=>console.log('  ' + c));
console.log('\nworkers unregistered:', unregistered);
console.log('caches deleted:', cachesDeleted.join(', ') || 'none');
const ok = unregistered>0 && cachesDeleted.length===2 && calls.some(c=>c.startsWith('replace:'));
console.log(ok ? '\n✓ unregisters, purges, then navigates to a fresh URL' : '\n✗ sequence is wrong');
process.exit(ok?0:1);
