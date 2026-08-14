import {
  BAR, PLATES, PLATE_COLOUR, HOME_MAX, MAINS, WAVE, ACCESSORIES, CORE, MOBILITY,
  DAYS, ADHOC_FOCUS, RUN_TYPES, RUN_BASELINE, REST, RECOVERY_WINDOW_H, CLUBS
} from './data.js';

/* ═══ storage ═══════════════════════════════════════════════ */

const DB_NAME = 'lift', STORE = 'kv';
let db, S, fileHandle = null;

const open = () => new Promise((res, rej) => {
  const r = indexedDB.open(DB_NAME, 1);
  r.onupgradeneeded = () => r.result.createObjectStore(STORE);
  r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
});
const get = k => new Promise((res, rej) => {
  const t = db.transaction(STORE, 'readonly').objectStore(STORE).get(k);
  t.onsuccess = () => res(t.result); t.onerror = () => rej(t.error);
});
const put = (k, v) => new Promise((res, rej) => {
  const t = db.transaction(STORE, 'readwrite').objectStore(STORE).put(v, k);
  t.onsuccess = () => res(); t.onerror = () => rej(t.error);
});
const save = () => put('state', S);

/* ═══ helpers ═══════════════════════════════════════════════ */

const $ = (s, r = document) => r.querySelector(s);
const iso = d => d.toISOString().slice(0, 10);
const today = () => iso(new Date());
const round = (w, step = 2.5) => Math.max(step, Math.round(w / step) * step);
const e1rm = (w, r) => w * (1 + Math.min(r, 12) / 30);
const mmss = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

function mondayOf(d) { const x = new Date(d); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); x.setHours(0, 0, 0, 0); return x; }
function weekIndex(ds) { const w = Math.round((mondayOf(new Date(ds)) - mondayOf(new Date(S.cycleStart))) / 6048e5); return ((w % 4) + 4) % 4; }
function cycleNo(ds) { return Math.floor(Math.round((mondayOf(new Date(ds)) - mondayOf(new Date(S.cycleStart))) / 6048e5) / 4) + 1; }

function toast(m) {
  const t = $('#toast'); t.textContent = m; t.classList.add('on');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('on'), 2400);
}

function plateSplit(total) {
  let side = (total - BAR) / 2;
  if (side < 0) return { over: true };
  const out = [];
  for (const p of PLATES) while (side >= p - 1e-9) { out.push(p); side = +(side - p).toFixed(3); }
  return { side: out, rem: side };
}

/* ═══ seed ══════════════════════════════════════════════════ */

function seed() {
  const st = {
    v: 2, created: today(), cycleStart: iso(mondayOf(new Date())),
    club: 'Foreshore', clubW: {}, mains: {}, acc: {}, runs: [],
    coreSeen: [], mobSeen: [], sessions: [], lastSync: null,
    settings: { swaps: {}, runAdjust: true }
  };
  for (const [k, m] of Object.entries(MAINS)) st.mains[k] = { tm: m.tm, misses: 0, hist: [] };
  for (const [k, a] of Object.entries(ACCESSORIES))
    st.acc[k] = { w: a.w, reps: a.reps, sets: a.sets, misses: 0, hist: [], lastDone: null };
  return st;
}

/* ═══ running load ══════════════════════════════════════════
   Minutes weighted by effort. The interference literature is
   consistent that endurance volume, not lifting intensity, is
   the lever — so this only ever trims accessory sets.        */

const runLoad = r => Math.round(r.mins * (RUN_TYPES[r.type]?.factor || 1));

function loadWindow(days, endStr = today()) {
  const end = new Date(endStr + 'T23:59'), start = new Date(end - days * 864e5);
  return S.runs.filter(r => { const d = new Date(r.date + 'T12:00'); return d > start && d <= end; })
    .reduce((t, r) => t + runLoad(r), 0);
}

function runBaseline() {
  const first = S.runs.length ? new Date(S.runs[0].date) : null;
  if (!first || (Date.now() - first) < 14 * 864e5) return RUN_BASELINE;
  return Math.max(60, Math.round(loadWindow(28) / 4));
}

/* Was there a hard run in the hours just before now? */
function hardRunRecently(h = 18) {
  const cut = Date.now() - h * 36e5;
  return S.runs.some(r => (r.type === 'hard' || r.type === 'long') &&
    new Date(r.date + 'T18:00').getTime() > cut);
}

function runVerdict() {
  const l7 = loadWindow(7), base = runBaseline(), ratio = l7 / base;
  let trim = 0, why = null;
  if (ratio > 1.5) { trim = 2; why = `Running load is ${Math.round((ratio - 1) * 100)}% above your normal week`; }
  else if (ratio > 1.25) { trim = 1; why = `Running load is ${Math.round((ratio - 1) * 100)}% above your normal week`; }
  if (!trim && hardRunRecently()) { trim = 1; why = 'Hard run in the last 18 hours'; }
  return { l7, base, ratio, trim, why };
}

/* ═══ rest ══════════════════════════════════════════════════ */

function restFor(item, set) {
  let r;
  if (item.kind === 'core') r = REST.core;
  else if (item.kind === 'main') {
    const pct = set.w / (S.mains[item.ref]?.tm || set.w);
    r = set.warm ? REST.warm : set.backoff ? REST.backoff
      : pct >= 0.85 ? REST.mainHeavy : REST.mainMid;
  } else {
    const a = ACCESSORIES[item.ref] || {};
    const compound = ['squat', 'hinge', 'hpush', 'vpush', 'hpull', 'vpull'].includes(a.pattern);
    r = set.target > 12 ? REST.highRep : compound ? REST.compound : REST.isolation;
  }
  if (set.reps != null && set.reps < set.target) r += 30;
  if (set.rpe >= 9.5) r += 60;
  return r;
}

/* Rough clock for a session: work plus prescribed rest, so the estimate
   moves when the app trims sets rather than staying a decorative number. */
function estimateMinutes(sess) {
  let s = 0;
  for (const it of sess.items) {
    if (it.kind === 'mobility') { s += it.list.reduce((t, m) => t + m.secs, 0); continue; }
    for (const set of it.sets) {
      s += it.unit === 'secs' ? set.target : Math.max(25, set.target * 4);
      s += restFor(it, set);
    }
    s += 45; // finding the thing, loading it, waiting for someone to finish
  }
  return Math.round(s / 60);
}

let timer = null;
function startRest(secs, label) {
  clearInterval(timer?.h);
  const bar = $('#timerbar');
  timer = { left: secs, label, h: setInterval(tick, 1000) };
  bar.classList.add('on'); paint();
  function paint() {
    bar.innerHTML = `<span class="mono">${mmss(Math.max(0, timer.left))}</span>
      <span class="lb">${timer.label}</span><button class="skip">Skip</button>`;
  }
  function tick() {
    timer.left--;
    if (timer.left <= 0) {
      clearInterval(timer.h); bar.classList.remove('on');
      if (navigator.vibrate) navigator.vibrate([120, 80, 120]);
      toast('Rest done'); timer = null; return;
    }
    paint();
  }
}
function stopRest() { clearInterval(timer?.h); timer = null; $('#timerbar').classList.remove('on'); }

/* ═══ club weights ══════════════════════════════════════════
   Cable stacks and plate-loaded machines do not read the same
   across clubs. Free weights do, so only machines are swapped. */

function switchClub(to) {
  const from = S.club;
  S.clubW[from] = S.clubW[from] || {};
  for (const [id, a] of Object.entries(ACCESSORIES))
    if (a.machine) S.clubW[from][id] = S.acc[id].w;
  const saved = S.clubW[to];
  if (saved) for (const [id, w] of Object.entries(saved)) if (S.acc[id]) S.acc[id].w = w;
  S.club = to;
  toast(saved ? `Machine weights restored for ${to}` : `Now logging at ${to} — adjust machines as you go`);
}

/* ═══ session construction ══════════════════════════════════ */

function pickRotating(pool, seen, n, filter) {
  const usable = filter ? pool.filter(filter) : pool;
  const fresh = usable.filter(p => !seen.includes(p.id));
  const src = fresh.length >= n ? fresh : [...fresh, ...usable.filter(p => !fresh.includes(p))];
  return src.slice(0, n);
}

const warmupRamp = top => top < 60 ? []
  : [0.4, 0.6, 0.8].map(p => ({ w: round(top * p), target: p < 0.6 ? 5 : 3, warm: true, reps: null }));

function buildPlanned(dateStr, dayKey) {
  const D = DAYS[dayKey], wk = weekIndex(dateStr), wave = WAVE[wk];
  const atHome = D.venue === 'home';
  const isLower = D.key.startsWith('lower');
  const verdict = isLower && S.settings.runAdjust ? runVerdict() : { trim: 0 };
  const items = [];

  if (D.mobility) {
    const mob = pickRotating(MOBILITY, S.mobSeen, D.mobility);
    items.push({ kind: 'mobility', ref: 'mob', name: `Mobility · ${Math.round(mob.reduce((s, m) => s + m.secs, 0) / 60)} min`,
      list: mob.map(m => ({ id: m.id, name: m.name, secs: m.secs, note: m.note })), sets: [] });
  }
  if (D.core) {
    for (const c of pickRotating(CORE, S.coreSeen, D.core, atHome ? (x => x.home) : null))
      items.push({ kind: 'core', ref: c.id, name: c.name, note: c.note, unit: c.unit,
        sets: Array.from({ length: 3 }, () => ({ w: c.w, target: c.target, reps: null })) });
  }

  if (D.main) {
    const M = MAINS[D.main], tm = S.mains[D.main].tm;
    const top = round(tm * wave.sets.at(-1)[0]);
    const sets = warmupRamp(top);
    for (const [pct, reps, isOpen] of wave.sets)
      sets.push({ w: round(tm * pct), target: reps, open: isOpen, reps: null, rpe: null });
    for (let i = 0; i < D.backoff.sets; i++)
      sets.push({ w: round(tm * D.backoff.pct), target: D.backoff.reps, backoff: true, reps: null });
    items.push({ kind: 'main', ref: D.main, name: M.name, wave: wave.name, sets });
  }

  const work = [...D.work];
  if (verdict.trim >= 2) work.pop();
  for (const id of work) {
    const a = ACCESSORIES[id], s = S.acc[id];
    const n = Math.max(2, s.sets - (verdict.trim ? 1 : 0));
    items.push({ kind: 'acc', ref: id, name: a.name, note: a.note, dbl: a.dbl, bar: a.bar,
      sets: Array.from({ length: n }, () => ({ w: s.w, target: s.reps, reps: null })) });
  }

  return { id: `${dateStr}·${dayKey}`, date: dateStr, dayKey, week: wk, wave: wave.name,
    label: D.label, note: D.note, venue: D.venue, adhoc: false, easy: false,
    runTrim: verdict.trim ? verdict : null, items, done: false };
}

function recentPatterns(h = RECOVERY_WINDOW_H) {
  const cut = Date.now() - h * 36e5, hot = new Set();
  for (const s of S.sessions) {
    if (!s.done || new Date(s.completedAt || s.date + 'T18:00') < cut) continue;
    for (const it of s.items) {
      if (it.kind === 'main') hot.add(MAINS[it.ref].pattern);
      if (it.kind === 'acc') hot.add(ACCESSORIES[it.ref]?.pattern);
    }
  }
  return hot;
}

function buildAdhoc(dateStr, focusKey, minutes, atHome, ignoreRecovery) {
  const F = ADHOC_FOCUS[focusKey];
  const n = minutes <= 20 ? 3 : minutes <= 35 ? 5 : 7;
  const hot = ignoreRecovery ? new Set() : recentPatterns();
  const items = [];

  if (F.patterns.includes('core')) {
    const k = focusKey === 'core' ? n : 2;
    for (const c of pickRotating(CORE, S.coreSeen, k, atHome ? (x => x.home) : null))
      items.push({ kind: 'core', ref: c.id, name: c.name, note: c.note, unit: c.unit,
        sets: Array.from({ length: 3 }, () => ({ w: c.w, target: c.target, reps: null })) });
  }
  if (focusKey !== 'core') {
    const want = n - items.length, perPattern = {};
    const cand = Object.entries(ACCESSORIES)
      .filter(([, a]) => F.patterns.includes(a.pattern))
      .filter(([, a]) => !atHome || a.home)
      .filter(([, a]) => !hot.has(a.pattern))
      .sort((a, b) => (S.acc[a[0]].lastDone || '').localeCompare(S.acc[b[0]].lastDone || ''));
    for (const [id, a] of cand) {
      if (items.filter(i => i.kind === 'acc').length >= want) break;
      if ((perPattern[a.pattern] = (perPattern[a.pattern] || 0) + 1) > 2) continue;
      const s = S.acc[id];
      items.push({ kind: 'acc', ref: id, name: a.name, note: a.note, dbl: a.dbl, bar: a.bar,
        sets: Array.from({ length: s.sets }, () => ({ w: s.w, target: s.reps, reps: null })) });
    }
  }
  return { id: `${dateStr}·extra·${Date.now().toString(36)}`, date: dateStr, dayKey: 'adhoc',
    week: weekIndex(dateStr), label: `Extra · ${F.label}${atHome ? ' at home' : ''}`,
    venue: atHome ? 'home' : 'gym', adhoc: true, easy: false, items, done: false };
}

/* Same movements, less load. Does not count towards progression. */
function makeEasy(sess, on) {
  sess.easy = on;
  for (const it of sess.items) {
    if (it.kind === 'mobility') continue;
    for (const s of it.sets) {
      if (on) { s.full = s.full ?? s.w; s.w = s.w ? round(s.full * 0.85, 1.25) : s.w; }
      else if (s.full != null) { s.w = s.full; delete s.full; }
    }
  }
}

/* ═══ progression ═══════════════════════════════════════════ */

function applyProgression(sess) {
  const notes = [];
  if (sess.easy) { notes.push('Logged as an easy day — nothing moved'); return notes; }

  for (const it of sess.items) {
    if (it.kind === 'main') {
      const st = S.mains[it.ref], M = MAINS[it.ref];
      const logged = it.sets.filter(s => s.reps != null && !s.warm);
      if (logged.length) st.hist.push({ d: sess.date, e1rm: Math.round(Math.max(...logged.map(s => e1rm(s.w, s.reps)))), tm: st.tm });
      const openSet = it.sets.find(s => s.open);
      if (sess.week === 2 && openSet?.reps != null) {
        const floor = WAVE[2].floor, rpe = openSet.rpe;
        let bump = 0;
        if (openSet.reps >= floor + 4) bump = 2;
        else if (openSet.reps >= floor + 1) bump = 1;
        else if (openSet.reps === floor) bump = 0;
        else bump = -1;
        /* Effort breaks the tie: a hard-won set does not earn a double bump,
           and an easy one at the minimum still earns a small one. */
        if (bump === 2 && rpe >= 9.5) bump = 1;
        if (bump === 0 && rpe != null && rpe <= 7.5) bump = 1;
        if (bump > 0) { st.tm = round(st.tm + M.inc * bump); st.misses = 0; notes.push(`${M.name} training max → ${st.tm}kg`); }
        else if (bump === 0) { st.misses = 0; notes.push(`${M.name} held at ${st.tm}kg`); }
        else {
          st.misses++;
          if (st.misses >= 2) { st.tm = round(st.tm * 0.9); st.misses = 0; notes.push(`${M.name} reset to ${st.tm}kg — two short cycles`); }
          else notes.push(`${M.name} held at ${st.tm}kg`);
        }
      }
    }
    if (it.kind === 'acc') {
      const a = ACCESSORIES[it.ref], st = S.acc[it.ref];
      const logged = it.sets.filter(s => s.reps != null);
      if (!logged.length) continue;
      st.lastDone = sess.date;
      st.hist.push({ d: sess.date, w: st.w, reps: logged.map(s => s.reps) });
      /* A set trimmed by running load is not a missed set. */
      const expected = sess.runTrim ? logged.length : st.sets;
      if (logged.length >= expected && logged.every(s => s.reps >= s.target)) {
        st.misses = 0;
        if (st.reps < a.repMax) { st.reps++; notes.push(`${a.name} → ${st.reps} reps`); }
        else { st.w = round(st.w + a.inc, a.inc); st.reps = a.repMin; notes.push(`${a.name} → ${st.w}kg`); }
      } else st.misses++;
    }
    if (it.kind === 'core') S.coreSeen = [it.ref, ...S.coreSeen.filter(x => x !== it.ref)].slice(0, 12);
    if (it.kind === 'mobility') for (const m of it.list) S.mobSeen = [m.id, ...S.mobSeen.filter(x => x !== m.id)].slice(0, 6);
  }
  return notes;
}

/* ═══ plateau ═══════════════════════════════════════════════ */

function plateauFor(id) {
  const st = S.acc[id], a = ACCESSORIES[id];
  if (!st || st.misses < 2) return null;
  const opts = [];
  const v = (a.variants || []).filter(x => ACCESSORIES[x]);
  if (v.length) opts.push({ k: 'swap', to: v[0], label: `Swap to ${ACCESSORIES[v[0]].name}`,
    why: 'Same pattern, different leverage. Come back to this in a few weeks.' });
  opts.push({ k: 'backoff', label: `Drop to ${round(st.w * 0.9, a.inc)}kg and rebuild`,
    why: 'Ten percent off, then climb. You usually come through the old sticking point.' });
  opts.push({ k: 'reps', label: `Lighter for ${st.reps + 3} reps`,
    why: 'More reps at less load. Different stimulus, same tissue.' });
  return { misses: st.misses, opts };
}

function applyPlateau(id, c) {
  const st = S.acc[id], a = ACCESSORIES[id];
  if (c.k === 'swap') {
    S.settings.swaps[id] = c.to; rehydrateSwaps();
    toast(`Swapped in ${ACCESSORIES[c.to].name}`);
  } else if (c.k === 'backoff') { st.w = round(st.w * 0.9, a.inc); st.reps = a.repMin; toast(`${a.name} → ${st.w}kg`); }
  else { st.w = round(st.w * 0.85, a.inc); st.reps += 3; toast(`${a.name} → ${st.reps} reps`); }
  st.misses = 0; save(); render();
}

function rehydrateSwaps() {
  for (const [from, to] of Object.entries(S.settings.swaps || {}))
    if (ACCESSORIES[to]) for (const d of Object.values(DAYS))
      if (d.work.includes(from)) d.work = d.work.map(x => (x === from ? to : x));
}

/* ═══ views ═════════════════════════════════════════════════ */

let VIEW = 'today', draft = null;

function sessionFor(ds) {
  const found = S.sessions.find(s => s.date === ds && !s.adhoc);
  if (found) return found;
  const key = Object.values(DAYS).find(d => d.weekday === new Date(ds + 'T12:00').getDay())?.key;
  return key ? buildPlanned(ds, key) : null;
}

function barDiagram(w) {
  const sp = plateSplit(w);
  if (sp.over) return `<div class="bar"><span class="lbl mono">${w}kg</span></div>`;
  const pl = p => `<span class="pl" style="height:${16 + p * 1.05}px;background:${PLATE_COLOUR[p]}"></span>`;
  return `<div class="bar">${sp.side.slice().reverse().map(pl).join('')}<span class="sleeve"></span>
    <span class="lbl mono">${w}kg${sp.rem > 0.01 ? '≈' : ''}</span>
    <span class="sleeve"></span>${sp.side.map(pl).join('')}</div>`;
}

function setRow(it, s, i) {
  const cls = s.reps == null ? '' : s.reps >= s.target ? 'hit' : 'miss';
  const u = it.unit === 'secs' ? 's' : '';
  const tgt = s.open ? `<span class="open">${s.target}+</span>` : `${s.target}${u}`;
  const tag = s.warm ? '<em> warm-up</em>' : s.backoff ? '<em> back-off</em>' : '';
  const rpe = it.kind === 'main' && !s.warm && s.reps != null
    ? `<div class="rpe" data-set="${i}">${[6, 7, 8, 9, 10].map(v =>
        `<button data-rpe="${v}" aria-pressed="${s.rpe === v}">${v}</button>`).join('')}<span>RPE</span></div>` : '';
  const rest = s.reps != null ? `<button class="rest btn-sm" data-set="${i}">${mmss(restFor(it, s))}</button>` : '';
  return `<div class="set ${cls}" data-set="${i}">
      <span class="n mono">${s.warm ? '·' : i + 1}</span>
      <span class="presc mono">${s.w ? s.w + 'kg × ' : ''}${tgt}${tag}</span>
      <span class="step">
        <button data-act="dec" aria-label="One fewer">−</button>
        <input type="number" inputmode="numeric" value="${s.reps ?? ''}" placeholder="—" aria-label="Reps done">
        <button data-act="inc" aria-label="One more">+</button>
      </span></div>${rpe}${rest ? `<div class="restrow">${rest}</div>` : ''}`;
}

function itemCard(it, idx) {
  if (it.kind === 'mobility') return `<div class="card" data-item="${idx}">
    <div class="head"><span class="idx mono">${String(idx + 1).padStart(2, '0')}</span>
      <span class="nm"><span class="t">${it.name}</span><span class="s mono">rotates every session</span></span>
      <span class="tick">✓</span></div>
    <div class="body">${it.list.map(m => `<div class="set"><span class="n mono">·</span>
      <span class="presc mono">${m.name} <em>${m.secs}s</em></span></div>
      ${m.note ? `<p class="hint">${m.note}</p>` : ''}`).join('')}</div></div>`;

  const done = it.sets.length && it.sets.every(s => s.reps != null);
  const pl = it.kind === 'acc' ? plateauFor(it.ref) : null;
  const sub = it.kind === 'main' ? `${it.wave} · TM ${S.mains[it.ref].tm}kg`
    : it.kind === 'core' ? `3 × ${it.sets[0].target}${it.unit === 'secs' ? 's' : ''}${it.sets[0].w ? ' · ' + it.sets[0].w + 'kg' : ''}`
    : `${it.sets.length} × ${it.sets[0].target} · ${it.sets[0].w}kg${it.dbl ? ' each hand' : ''}`;

  return `<div class="card ${done ? 'done' : ''} ${pl ? 'stalled' : ''}" data-item="${idx}">
    <div class="head"><span class="idx mono">${String(idx + 1).padStart(2, '0')}</span>
      <span class="nm"><span class="t">${it.name}</span><span class="s mono">${sub}</span></span>
      <span class="tick">✓</span></div>
    <div class="body">
      ${it.kind === 'main' || it.bar ? barDiagram((it.sets.find(s => s.open) || it.sets.at(-1)).w) : ''}
      ${it.note ? `<p class="hint" style="margin-bottom:8px">${it.note}</p>` : ''}
      ${it.sets.map((s, i) => setRow(it, s, i)).join('')}
      ${pl ? `<div class="plateau" data-plateau="${it.ref}">
        <div class="why mono">Stalled ${pl.misses} sessions at this load</div>
        Two sessions short of target. Holding here rarely fixes it — change one variable.
        <div class="opts">${pl.opts.map((o, i) => `<button data-opt="${i}"><b>${o.label}</b><br>
          <span style="color:var(--dust);font-size:12px">${o.why}</span></button>`).join('')}</div></div>` : ''}
    </div></div>`;
}

function renderToday() {
  const d = today(), el = $('#v-today');
  const sess = draft || sessionFor(d);
  const dayName = new Date(d + 'T12:00').toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'short' });

  if (!sess) {
    el.innerHTML = `<p class="eyebrow">${dayName}</p>
      <div class="empty">No session scheduled.<br>Rest, run, or build something.</div>
      ${runCard()}${adhocForm()}`;
    el._sess = null; return;
  }

  el.innerHTML = `
    <p class="eyebrow">${dayName}${sess.venue === 'home' ? ' · at home' : ` · ${S.club}`}</p>
    <h2 style="font-size:22px;margin-bottom:2px">${sess.label}</h2>
    <p class="hint" style="margin:0 0 12px">${sess.adhoc ? 'Unplanned — it still counts.'
      : sess.note || `Week ${sess.week + 1} of 4 · ${sess.wave} · cycle ${cycleNo(d)}`}
      <span class="mono" style="color:var(--dust-2)"> · about ${estimateMinutes(sess)} min</span></p>

    ${sess.runTrim ? `<div class="flag amber"><div class="why mono">${sess.runTrim.why}</div>
      Accessory sets trimmed, main lift untouched. Intensity keeps strength; volume is what costs you recovery.</div>` : ''}
    ${sess.easy ? `<div class="flag amber"><div class="why mono">Easy day</div>
      Everything at 85%. This session will not move any weights up or down.</div>` : ''}

    <div class="btn-row" style="margin:0 0 12px">
      <button class="btn-sm ${sess.easy ? 'btn-go' : ''}" id="easy">${sess.easy ? 'Back to full' : 'Not feeling great'}</button>
    </div>

    ${sess.items.map(itemCard).join('')}

    <div class="btn-row">
      <button class="btn-go" id="finish">${sess.done ? 'Saved' : 'Finish session'}</button>
      ${sess.adhoc ? '<button id="discard" class="btn-quiet">Discard</button>' : ''}
    </div>
    ${runCard()}
    ${!sess.adhoc ? `<hr class="rule"><p class="eyebrow">Something extra</p>${adhocForm()}` : ''}`;
  el._sess = sess;
}

function runCard() {
  const v = runVerdict();
  const week = S.runs.filter(r => new Date(r.date) >= mondayOf(new Date()));
  return `<p class="eyebrow">Running</p>
    <div class="card" style="padding:14px">
      <div style="display:flex;gap:10px;align-items:baseline;margin-bottom:8px">
        <span class="mono" style="font-size:12px;color:var(--dust)">7-day load</span>
        <span class="display" style="font-size:20px;margin-left:auto">${v.l7}</span>
        <span class="mono" style="font-size:11px;color:${v.ratio > 1.25 ? 'var(--warn)' : 'var(--dust-2)'}">
          ${Math.round(v.ratio * 100)}% of normal</span>
      </div>
      ${week.length ? `<div class="mono" style="font-size:11.5px;color:var(--dust);margin-bottom:10px">
        ${week.map(r => `${RUN_TYPES[r.type].label} ${r.mins}min`).join(' · ')}</div>` : ''}
      <div style="display:flex;gap:6px">
        <select id="rtype" style="flex:1">${Object.entries(RUN_TYPES).map(([k, t]) =>
          `<option value="${k}">${t.label}</option>`).join('')}</select>
        <input type="number" id="rmins" placeholder="min" inputmode="numeric" style="width:82px">
        <button class="btn-go" id="raddbtn" style="flex:0 0 auto">Log run</button>
      </div>
    </div>`;
}

function adhocForm() {
  return `<div class="card" style="padding:14px">
    <label class="f">Focus</label>
    <select id="af">${Object.entries(ADHOC_FOCUS).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('')}</select>
    <label class="f">Time</label>
    <div class="chips" id="amin">
      <button data-m="20" aria-pressed="false">20 min</button>
      <button data-m="35" aria-pressed="true">35 min</button>
      <button data-m="50" aria-pressed="false">50 min</button></div>
    <label class="f">Where</label>
    <div class="chips" id="awhere">
      <button data-h="0" aria-pressed="true">Gym</button>
      <button data-h="1" aria-pressed="false">Home</button></div>
    <div class="btn-row"><button class="btn-go" id="abuild">Build session</button></div>
    <p class="hint">Uses your current weights and skips anything loaded hard in the last two days.</p></div>`;
}

function renderPlan() {
  const wk = weekIndex(today());
  $('#v-plan').innerHTML = `
    <p class="eyebrow">Cycle ${cycleNo(today())} · week ${wk + 1} of 4</p>
    ${WAVE.map((w, i) => `<div class="card" style="padding:11px 14px;${i === wk ? 'border-color:var(--go)' : ''}">
      <div style="display:flex;gap:10px;align-items:baseline">
        <span class="mono" style="font-size:11px;color:var(--dust-2)">W${i + 1}</span>
        <span class="display" style="font-size:17px">${w.name}</span>
        <span class="mono" style="margin-left:auto;font-size:11px;color:var(--dust)">${w.sets.map(s => Math.round(s[0] * 100) + '%').join(' · ')}</span>
      </div></div>`).join('')}

    <p class="eyebrow">The week</p>
    ${Object.values(DAYS).map(d => `<div class="card" style="padding:12px 14px">
      <div style="display:flex;align-items:baseline;gap:8px">
        <span class="display" style="font-size:17px">${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.weekday]} — ${d.label}</span>
        ${d.venue === 'home' ? '<span class="mono" style="font-size:10px;color:var(--warn);margin-left:auto">HOME</span>' : ''}</div>
      <div class="mono" style="font-size:11.5px;color:var(--dust);margin-top:4px">
        ${d.main ? MAINS[d.main].name + ' · ' : ''}${d.work.map(w => ACCESSORIES[w]?.name).filter(Boolean).join(' · ')}${d.core ? ` · ${d.core} core` : ''}${d.mobility ? ' · mobility' : ''}
      </div></div>`).join('')}
    <p class="hint">Saturday is the long run. Sunday is yours.</p>

    <p class="eyebrow">Training maxes</p>
    ${Object.entries(MAINS).map(([k, m]) => `<div class="card" style="padding:12px 14px;display:flex;align-items:center;gap:10px">
      <span style="flex:1"><span class="display" style="font-size:17px">${m.name}</span>
        <span class="mono" style="display:block;font-size:11px;color:var(--dust)">top set ${round(S.mains[k].tm * 0.95)}kg this cycle</span></span>
      <span class="step"><button data-tm="${k}" data-d="-1">−</button>
        <input type="number" value="${S.mains[k].tm}" data-tmv="${k}" style="width:66px">
        <button data-tm="${k}" data-d="1">+</button></span></div>`).join('')}`;
}

function renderProgress() {
  const el = $('#v-progress'), done = S.sessions.filter(s => s.done);
  if (!done.length) { el.innerHTML = `<div class="empty">No finished sessions yet.<br>Log one and the trajectory draws itself.</div>`; return; }
  const stalls = Object.keys(S.acc).filter(id => S.acc[id].misses >= 2);
  const vol = done.slice(-8).map(s => s.items.reduce((t, it) =>
    t + it.sets.reduce((u, x) => u + (x.reps != null && x.w ? x.w * x.reps : 0), 0), 0));
  const v = runVerdict();

  el.innerHTML = `
    <p class="eyebrow">Estimated one-rep max · logged and projected</p>
    ${Object.entries(MAINS).map(([k, m]) => chartFor(k, m)).join('')}
    <p class="eyebrow">Where you are</p>
    <div class="stats">
      <div class="stat"><div class="k">Sessions</div><div class="v">${done.length}</div><div class="d flat mono">since ${S.created}</div></div>
      <div class="stat"><div class="k">Cycle</div><div class="v">${cycleNo(today())}<small> · wk ${weekIndex(today()) + 1}</small></div><div class="d flat mono">${WAVE[weekIndex(today())].name}</div></div>
      <div class="stat"><div class="k">Last volume</div><div class="v">${((vol.at(-1) || 0) / 1000).toFixed(1)}<small>t</small></div>
        <div class="d ${vol.length > 1 ? (vol.at(-1) >= vol.at(-2) ? 'up' : 'down') : 'flat'} mono">${vol.length > 1 ? (vol.at(-1) >= vol.at(-2) ? '▲' : '▼') + ' vs last' : '—'}</div></div>
      <div class="stat"><div class="k">Running</div><div class="v">${Math.round(v.ratio * 100)}<small>%</small></div><div class="d ${v.ratio > 1.25 ? 'down' : 'flat'} mono">of normal week</div></div>
    </div>
    ${stalls.length ? `<p class="eyebrow">Stalled</p>${stalls.map(id => `<div class="card" style="padding:12px 14px">
      <div class="display" style="font-size:16px">${ACCESSORIES[id].name}</div>
      <div class="mono" style="font-size:11px;color:var(--dust)">${S.acc[id].misses} short at ${S.acc[id].w}kg × ${S.acc[id].reps}</div></div>`).join('')}` : ''}`;
}

function chartFor(k, m) {
  const st = S.mains[k], h = st.hist.slice(-14);
  const W = 320, H = 150, pad = { l: 30, r: 8, t: 10, b: 16 };
  const proj = Array.from({ length: 6 }, (_, i) => Math.round((st.tm + i * m.inc) / 0.9));
  const all = [...h.map(p => p.e1rm), ...proj];
  const lo = Math.floor(Math.min(...all) * 0.96 / 5) * 5, hi = Math.ceil(Math.max(...all) * 1.04 / 5) * 5;
  const span = Math.max(1, h.length + proj.length - 2);
  const x = i => pad.l + (i / span) * (W - pad.l - pad.r);
  const y = v => pad.t + (1 - (v - lo) / Math.max(1, hi - lo)) * (H - pad.t - pad.b);
  const path = (pts, off) => pts.map((v, i) => `${i ? 'L' : 'M'}${x(i + off).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const c = { squat: 'var(--p25)', dead: 'var(--p20)', bench: 'var(--p15)', ohp: 'var(--p10)' }[k];

  return `<div class="card" style="padding:12px 12px 10px">
    <div style="display:flex;align-items:baseline;gap:8px">
      <span class="display" style="font-size:17px">${m.name}</span>
      <span class="mono" style="margin-left:auto;font-size:12px;color:var(--dust)">TM ${st.tm}kg</span></div>
    <svg class="chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="${m.name} over time">
      ${[lo, (lo + hi) / 2, hi].map(v => `<line class="grid" x1="${pad.l}" x2="${W - pad.r}" y1="${y(v)}" y2="${y(v)}"/><text x="2" y="${y(v) + 3}">${Math.round(v)}</text>`).join('')}
      ${h.length ? `<path d="${path(h.map(p => p.e1rm), 0)}" fill="none" stroke="${c}" stroke-width="2"/>` : ''}
      ${h.map((p, i) => `<circle cx="${x(i)}" cy="${y(p.e1rm)}" r="2.5" fill="${c}"/>`).join('')}
      <path class="proj" d="${path(proj, Math.max(0, h.length - 1))}" fill="none" stroke="${c}" stroke-width="2"/>
    </svg>
    <div class="legend"><span><i style="background:${c}"></i>logged</span><span><i style="background:${c};opacity:.5"></i>projected</span></div></div>`;
}

function renderData() {
  const last = S.lastSync ? new Date(S.lastSync) : null;
  const ok = 'showSaveFilePicker' in window;
  $('#v-data').innerHTML = `
    <p class="eyebrow">Backup</p>
    <div class="sync"><span class="dot ${last ? 'ok' : ''}"></span>
      <span class="txt"><b>${last ? 'Last saved ' + last.toLocaleString('en-ZA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Not backed up yet'}</b>
      ${fileHandle ? fileHandle.name : ok ? 'Pick a file in your Drive folder once, then it saves there every time.' : 'This browser cannot write files. Use Export.'}</span></div>
    <div class="btn-row"><button class="btn-go" id="sync" ${ok ? '' : 'disabled'}>Save to file</button>
      <button id="export">Export copy</button></div>
    <div class="btn-row"><button id="import">Restore from file</button></div>

    <p class="eyebrow">Club</p>
    <div class="card" style="padding:14px">
      <div class="chips">${CLUBS.map(c => `<button data-club="${c}" aria-pressed="${S.club === c}">${c}</button>`).join('')}</div>
      <p class="hint">Machine and cable weights are stored per club — a 150kg pulldown at one is not 150kg at another. Free weights carry across.</p>
    </div>

    <p class="eyebrow">Running</p>
    <div class="card" style="padding:14px">
      <div class="chips">
        <button id="ra-on" aria-pressed="${S.settings.runAdjust !== false}">Adjust automatically</button>
        <button id="ra-off" aria-pressed="${S.settings.runAdjust === false}">Leave sessions alone</button></div>
      <p class="hint">Trims lower-body accessory sets when your seven-day load runs above normal. Never touches the main lift.</p>
    </div>

    <p class="eyebrow">Cycle</p>
    <div class="card" style="padding:14px">
      <div class="mono" style="font-size:12px;color:var(--dust)">Started ${S.cycleStart}</div>
      <div class="btn-row"><button id="restart" class="btn-sm">Restart from this Monday</button></div></div>

    <div class="btn-row" style="margin-top:22px"><button id="wipe" style="color:var(--stall)">Erase everything</button></div>`;
}

function render() {
  ({ today: renderToday, plan: renderPlan, progress: renderProgress, data: renderData })[VIEW]();
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('on', v.id === 'v-' + VIEW));
  document.querySelectorAll('nav button').forEach(b => b.setAttribute('aria-current', b.dataset.v === VIEW ? 'page' : 'false'));
  $('#cycle').innerHTML = `<b>Cycle ${cycleNo(today())}</b>wk ${weekIndex(today()) + 1} · ${WAVE[weekIndex(today())].name}`;
}

/* ═══ sync ══════════════════════════════════════════════════ */

async function ensureHandle(create) {
  if (fileHandle) {
    if (await fileHandle.queryPermission({ mode: 'readwrite' }) === 'granted') return fileHandle;
    if (await fileHandle.requestPermission({ mode: 'readwrite' }) === 'granted') return fileHandle;
  }
  if (!create) return null;
  fileHandle = await window.showSaveFilePicker({ suggestedName: 'lift-backup.json',
    types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }] });
  await put('handle', fileHandle);
  return fileHandle;
}

async function syncNow(silent) {
  try {
    const h = await ensureHandle(true); if (!h) return;
    const w = await h.createWritable();
    await w.write(JSON.stringify(S, null, 2)); await w.close();
    S.lastSync = new Date().toISOString(); await save();
    if (!silent) { toast('Saved'); if (VIEW === 'data') render(); }
  } catch (e) { if (e.name !== 'AbortError' && !silent) toast('Could not save — ' + e.message); }
}

function exportCopy() {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' }));
  a.download = `lift-${today()}.json`; a.click(); URL.revokeObjectURL(a.href);
}

function importFile() {
  const i = document.createElement('input'); i.type = 'file'; i.accept = 'application/json';
  i.onchange = async () => {
    const f = i.files[0]; if (!f) return;
    try {
      const p = JSON.parse(await f.text());
      if (!p.mains || !p.acc) throw new Error('not a backup from this app');
      S = p; S.settings = S.settings || {}; S.runs = S.runs || [];
      rehydrateSwaps(); await save(); render(); toast('Restored');
    } catch (e) { toast('Could not read that — ' + e.message); }
  };
  i.click();
}

/* ═══ events ════════════════════════════════════════════════ */

function wire() {
  document.addEventListener('click', async e => {
    const t = e.target;

    const nav = t.closest('nav button');
    if (nav) { VIEW = nav.dataset.v; render(); return; }

    if (t.closest('#timerbar .skip')) { stopRest(); return; }

    const head = t.closest('.card > .head');
    if (head) { head.parentElement.classList.toggle('open'); return; }

    const step = t.closest('.step button[data-act]');
    if (step) {
      const inp = step.parentElement.querySelector('input');
      inp.value = Math.max(0, (parseInt(inp.value) || 0) + (step.dataset.act === 'inc' ? 1 : -1));
      inp.dispatchEvent(new Event('change', { bubbles: true })); return;
    }

    const rest = t.closest('button.rest');
    if (rest) {
      const card = rest.closest('[data-item]'), sess = $('#v-today')._sess;
      const it = sess.items[+card.dataset.item], s = it.sets[+rest.dataset.set];
      startRest(restFor(it, s), it.name); return;
    }

    const rpe = t.closest('button[data-rpe]');
    if (rpe) {
      const card = rpe.closest('[data-item]'), sess = $('#v-today')._sess;
      const it = sess.items[+card.dataset.item];
      it.sets[+rpe.closest('.rpe').dataset.set].rpe = +rpe.dataset.rpe;
      rpe.parentElement.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b === rpe));
      await save(); return;
    }

    const tm = t.closest('[data-tm]');
    if (tm) { const k = tm.dataset.tm; S.mains[k].tm = round(S.mains[k].tm + (+tm.dataset.d) * MAINS[k].inc); await save(); render(); return; }

    const opt = t.closest('[data-opt]');
    if (opt) { const id = opt.closest('[data-plateau]').dataset.plateau; applyPlateau(id, plateauFor(id).opts[+opt.dataset.opt]); return; }

    const club = t.closest('[data-club]');
    if (club) { switchClub(club.dataset.club); await save(); render(); return; }

    const chip = t.closest('#amin button, #awhere button');
    if (chip) { chip.parentElement.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b === chip)); return; }

    if (t.id === 'raddbtn') {
      const mins = parseInt($('#rmins').value);
      if (!mins) return toast('How many minutes?');
      S.runs.push({ date: today(), type: $('#rtype').value, mins });
      S.runs.sort((a, b) => a.date.localeCompare(b.date));
      draft = null; await save(); render(); toast('Run logged'); return;
    }

    if (t.id === 'abuild') {
      const atHome = document.querySelector('#awhere button[aria-pressed=true]').dataset.h === '1';
      const m = +document.querySelector('#amin button[aria-pressed=true]').dataset.m;
      draft = buildAdhoc(today(), $('#af').value, m, atHome, false);
      if (!draft.items.length) draft = buildAdhoc(today(), $('#af').value, m, atHome, true);
      VIEW = 'today'; render(); scrollTo({ top: 0, behavior: 'smooth' }); return;
    }
    if (t.id === 'discard') { draft = null; render(); return; }

    if (t.id === 'easy') {
      const sess = $('#v-today')._sess; if (!sess) return;
      makeEasy(sess, !sess.easy);
      if (!S.sessions.find(x => x.id === sess.id)) S.sessions.push(sess);
      if (sess.adhoc) draft = sess;
      await save(); render(); return;
    }

    if (t.id === 'finish') {
      const sess = $('#v-today')._sess; if (!sess || sess.done) return;
      sess.done = true; sess.completedAt = new Date().toISOString();
      const notes = applyProgression(sess);
      if (!S.sessions.find(x => x.id === sess.id)) S.sessions.push(sess);
      draft = null; stopRest();
      await save(); await syncNow(true); render();
      toast(notes[0] || 'Session saved'); return;
    }

    if (t.id === 'ra-on' || t.id === 'ra-off') { S.settings.runAdjust = t.id === 'ra-on'; await save(); render(); return; }
    if (t.id === 'sync') return syncNow(false);
    if (t.id === 'export') return exportCopy();
    if (t.id === 'import') return importFile();
    if (t.id === 'restart') { S.cycleStart = iso(mondayOf(new Date())); await save(); render(); toast('Cycle restarted'); return; }
    if (t.id === 'wipe') {
      if (!confirm('Erase everything on this device? Your backup file is untouched.')) return;
      S = seed(); await save(); render(); toast('Erased'); return;
    }
  });

  document.addEventListener('change', async e => {
    if (e.target.matches('[data-tmv]')) {
      S.mains[e.target.dataset.tmv].tm = round(parseFloat(e.target.value) || 0);
      await save(); return;
    }
    if (!e.target.matches('.set input')) return;
    const sess = $('#v-today')._sess; if (!sess) return;
    const card = e.target.closest('[data-item]'), row = e.target.closest('.set');
    const it = sess.items[+card.dataset.item], s = it.sets[+row.dataset.set];
    s.reps = e.target.value === '' ? null : Math.max(0, parseInt(e.target.value) || 0);
    row.classList.toggle('hit', s.reps != null && s.reps >= s.target);
    row.classList.toggle('miss', s.reps != null && s.reps < s.target);
    card.classList.toggle('done', it.sets.every(x => x.reps != null));
    if (!S.sessions.find(x => x.id === sess.id)) S.sessions.push(sess);
    await save();
    /* Re-render only this card so the rest button and RPE chips appear. */
    const idx = +card.dataset.item, open = card.classList.contains('open');
    card.outerHTML = itemCard(it, idx);
    if (open) $(`[data-item="${idx}"]`).classList.add('open');
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && fileHandle) syncNow(true);
  });
}

/* ═══ boot ══════════════════════════════════════════════════ */

(async function init() {
  db = await open();
  S = await get('state') || seed();
  if (S.v !== 2) S = seed();
  fileHandle = await get('handle') || null;
  S.settings = S.settings || {}; S.settings.swaps = S.settings.swaps || {};
  S.runs = S.runs || []; S.clubW = S.clubW || {};
  rehydrateSwaps();
  await save(); wire(); render();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
})();
