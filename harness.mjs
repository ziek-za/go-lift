/* Run app.js against a stub DOM so runtime failures surface here rather than
   as a blank screen on a phone at the gym. */
const store = new Map();
const el = (id = '') => ({
  id, _cls: new Set(), innerHTML: '', textContent: '', hidden: false, dataset: {}, files: [],
  classList: { add(c){this._o._cls.add(c);}, remove(c){this._o._cls.delete(c);},
               toggle(c,f){f?this._o._cls.add(c):this._o._cls.delete(c);},
               contains(c){return this._o._cls.has(c);} },
  style: {}, value: '', parentElement: null, children: [],
  appendChild(){}, setAttribute(){}, getAttribute(){return null;},
  addEventListener(){}, removeEventListener(){}, querySelector(){return null;},
  querySelectorAll(){return [];}, closest(){return null;}, click(){}, focus(){},
  dispatchEvent(){}, remove(){}, insertAdjacentHTML(){},
  get outerHTML(){return '';}, set outerHTML(v){},
  offsetWidth: 1
});
const mk = id => { const e = el(id); e.classList._o = e; return e; };
const nodes = new Map();
const get$ = sel => { if(!nodes.has(sel)) nodes.set(sel, mk(sel)); return nodes.get(sel); };

const handlers = {};
global.document = {
  querySelector: get$, querySelectorAll: () => [],
  createElement: () => mk(), 
  addEventListener: (t, fn) => { handlers[t] = fn; },
  visibilityState: 'visible', body: mk('body')
};
global.__handlers = handlers;
/* A click target whose closest() answers only for the selector we mean */
global.__target = (sel, data = {}) => ({
  id: data.id || '', dataset: data,
  closest(q) { return q === sel ? { dataset: data, parentElement: { querySelectorAll: () => [] }, closest: () => null } : null; }
});
global.window = { showSaveFilePicker: undefined, addEventListener: () => {} };
Object.defineProperty(global, 'navigator', { value: { vibrate: () => {} }, configurable: true });
global.confirm = () => true;
global.Notification = undefined;
global.URL = { createObjectURL: () => '', revokeObjectURL: () => {} };
global.Blob = class {};

// minimal IndexedDB
const db = new Map();
global.indexedDB = {
  open() {
    const req = {};
    setTimeout(() => {
      req.result = {
        createObjectStore(){},
        transaction: () => ({ objectStore: () => ({
          get(k){ const r={}; setTimeout(()=>{ r.result = db.get(k); r.onsuccess && r.onsuccess(); },0); return r; },
          put(v,k){ const r={}; db.set(k,v); setTimeout(()=>r.onsuccess&&r.onsuccess(),0); return r; }
        })})
      };
      req.onupgradeneeded && req.onupgradeneeded();
      req.onsuccess && req.onsuccess();
    }, 0);
    return req;
  }
};

/* Pre-seed a state with completed sessions so Progress, Records and the
   on-track panel actually have something to render. */
const { MAINS, ACCESSORIES, CORE_TRACKS, SEED_RECORDS, DAYS } = await import('./data.js');
const mondayISO = (() => { const d = new Date(); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); 
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })();
const past = (() => { const d = new Date(); d.setDate(d.getDate() - ((d.getDay() + 6) % 7) - 3);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })();
const seeded = {
  v: 2, created: mondayISO, cycleStart: mondayISO, club: 'Foreshore', clubW: {}, clubOut: {},
  records: JSON.parse(JSON.stringify(SEED_RECORDS)), mains: {}, acc: {}, runs: [
    { date: mondayISO, type: 'hard', mins: 70 }
  ],
  coreSeen: [], coreQ: [], coreLevel: {}, coreClean: {}, sessions: [], lastSync: null,
  settings: { swaps: {}, runAdjust: true, coreStart: 'advanced' }
};
for (const [k, m] of Object.entries(MAINS)) seeded.mains[k] = { tm: m.tm + m.inc, misses: 0,
  hist: [{ d: past, e1rm: Math.round(m.tm * 1.15), tm: m.tm }] };
for (const [k, a] of Object.entries(ACCESSORIES)) seeded.acc[k] =
  { w: a.w, reps: a.reps, sets: a.sets, misses: k === 'legpress' ? 2 : 0, hist: [], lastDone: mondayISO };
for (const t of CORE_TRACKS) seeded.coreLevel[t.id] = Math.min(2, t.levels.length - 1);
seeded.sessions.push({
  id: past + '·lowerA', date: past, dayKey: 'lowerA', week: 0, wave: '5s',
  label: 'Lower · heavy', venue: 'gym', adhoc: false, easy: false, done: true,
  completedAt: new Date().toISOString(), duration: 4200,
  items: [{ kind: 'main', ref: 'squat', name: 'Back squat', wave: '5s',
    sets: [{ w: 130, target: 5, open: true, reps: 7, rpe: 8 }] },
    { kind: 'acc', ref: 'bulgarian', name: 'Bulgarian split squat',
      sets: [{ w: 35, target: 8, reps: 8 }, { w: 35, target: 8, reps: 8 }] }]
});
db.set('state', seeded);

let failed = false;
process.on('uncaughtException', e => { failed = true; console.log('✗ RUNTIME ERROR:', e.message, '\n', e.stack.split('\n')[1]); });
process.on('unhandledRejection', e => { failed = true; console.log('✗ UNHANDLED REJECTION:', e && e.message, '\n', e && e.stack && e.stack.split('\n')[1]); });

await import('./app.js');
await new Promise(r => setTimeout(r, 400));

const today = get$('#v-today'), plan = get$('#v-plan'), cyc = get$('#cycle');
console.log(failed ? '' : '✓ module loaded and initial render completed');
console.log('  header:', cyc.innerHTML.replace(/<[^>]+>/g,' ').trim() || '(empty)');
console.log('  today view length:', today.innerHTML.length, 'chars');
console.log('  today heading:', (today.innerHTML.match(/<h2[^>]*>([^<]+)/)||[])[1] || '(none)');
const cards = (today.innerHTML.match(/class="card/g)||[]).length;
console.log('  cards rendered:', cards);

/* Drive every tab through the real click handler */
for (const view of ['plan', 'progress', 'data', 'today']) {
  try {
    await handlers.click({ target: global.__target('nav button', { v: view }) });
    const node = get$('#v-' + view);
    const len = node.innerHTML.length;
    console.log(`  ${view.padEnd(9)} ${String(len).padStart(6)} chars ${len > 200 ? '✓' : '✗ EMPTY'}`);
  } catch (e) {
    failed = true;
    console.log(`  ${view.padEnd(9)} ✗ THREW: ${e.message}`);
    console.log('             ' + (e.stack.split('\n')[1] || '').trim());
  }
}
/* Content checks — a view can render without throwing and still be wrong */
const strip = s => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
await handlers.click({ target: global.__target('nav button', { v: 'progress' }) });
const prog = strip(get$('#v-progress').innerHTML);
await handlers.click({ target: global.__target('nav button', { v: 'plan' }) });
const plan2 = strip(get$('#v-plan').innerHTML);
await handlers.click({ target: global.__target('nav button', { v: 'today' }) });
const tod = strip(get$('#v-today').innerHTML);

const expect = [
  ['on-track verdict', /On track|Too early|Behind|light on/.test(prog)],
  ['records: tested 220', /220/.test(prog)],
  ['records: estimated', /Estimated/.test(prog)],
  ['stall surfaced', /leg press/i.test(prog)],
  ['core start chips', /Advanced|Send it/.test(plan2)],
  ['core ladders listed', /anti-extension/i.test(plan2)],
  ['working weights list', /Working weights/.test(plan2)],
  ['squat-specific prep', /Squat prep|Ankle dorsiflexion/.test(tod)],
  ['core is bracing today', /Ab wheel|Bird dog|Pallof|Dead bug|Hollow/.test(tod)],
  ['start session button', /Start session/.test(tod)],
  ['glossary markers', /Back-off|Open set/.test(tod)]
];
console.log('\ncontent checks:');
let bad = 0;
for (const [name, ok] of expect) { if (!ok) bad++; console.log('  ' + (ok ? '✓' : '✗') + ' ' + name); }
console.log(failed || bad ? '\n✗ ' + (bad || '') + ' problems' : '\n✓ everything renders and contains what it should');
process.exit(failed || bad ? 1 : 0);
