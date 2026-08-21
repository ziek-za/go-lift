import {
  BAR, PLATES, PLATE_COLOUR, MAINS, WAVE, ACCESSORIES, PREP,
  CORE_TRACKS, CORE_LEVEL_UP, CORE_ROTATION, CORE_START,
  DAYS, ADHOC_FOCUS, RUN_TYPES, RUN_BASELINE, REST, REST_FLOOR, RECOVERY_WINDOW_H, CLUBS,
  GLOSSARY, CUES, howToUrl, PHRASES, MISS_PHRASES, RPE_SCALE,
  VOLUME_TARGET, MUSCLE_OF, SEED_RECORDS, BUILD, FINISH_LINES
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
/* Dates are handled entirely in local time. toISOString() converts to UTC,
   which in SAST (UTC+2) rolls midnight back to the previous day and quietly
   shifts the whole cycle by a week. */
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const parseDay = ds => new Date(ds + 'T12:00');
const today = () => iso(new Date());
const round = (w, step = 2.5) => Math.max(step, Math.round(w / step) * step);
/* Barbell loads land on multiples of 5. Anything ending in 2.5 or 7.5 means
   fishing for the small plates between every set, which is not worth the
   precision it buys. Dumbbells, cables and machines keep their own steps. */
const BAR_STEP = 5;
const barRound = w => round(w, BAR_STEP);
const e1rm = (w, r) => w * (1 + Math.min(r, 12) / 30);
const mmss = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

function mondayOf(d) { const x = new Date(d); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); x.setHours(0, 0, 0, 0); return x; }
const weeksApart = ds => Math.round((mondayOf(parseDay(ds)) - mondayOf(parseDay(S.cycleStart))) / 6048e5);
function weekIndex(ds) { const w = weeksApart(ds); return ((w % 4) + 4) % 4; }
function cycleNo(ds) { return Math.floor(weeksApart(ds) / 4) + 1; }

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
    club: 'Foreshore', clubW: {}, clubOut: {}, records: {}, mains: {}, acc: {}, runs: [],
    coreSeen: [], mobSeen: [], sessions: [], lastSync: null,
    settings: { swaps: {}, runAdjust: true, coreStart: 'advanced' }
  };
  for (const [k, m] of Object.entries(MAINS)) st.mains[k] = { tm: m.tm, misses: 0, hist: [] };
  for (const [k, r] of Object.entries(SEED_RECORDS)) st.records[k] = JSON.parse(JSON.stringify(r));
  st.coreLevel = {};
  for (const t of CORE_TRACKS) st.coreLevel[t.id] = Math.min(CORE_START.advanced.rung, t.levels.length - 1);
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
  const end = parseDay(endStr), start = new Date(end - days * 864e5);
  return S.runs.filter(r => { const d = parseDay(r.date); return d > start && d <= end; })
    .reduce((t, r) => t + runLoad(r), 0);
}

function runBaseline() {
  const first = S.runs.length ? parseDay(S.runs[0].date) : null;
  if (!first || (Date.now() - first) < 14 * 864e5) return RUN_BASELINE;
  return Math.max(60, Math.round(loadWindow(28) / 4));
}

/* Was there a hard run in the hours just before now? */
function hardRunRecently(h = 18) {
  const cut = Date.now() - h * 36e5;
  return S.runs.some(r => (r.type === 'hard' || r.type === 'long') &&
    parseDay(r.date).getTime() > cut);
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
  if (set.warm) r = REST.warm;
  if (set.reps != null && set.reps < set.target) r += 30;
  if (set.rpe >= 9.5) r += 60;
  return Math.max(REST_FLOOR, r);
}

/* Rough clock for a session: work plus prescribed rest, so the estimate
   moves when the app trims sets rather than staying a decorative number. */
function estimateMinutes(sess) {
  let s = 0;
  for (const it of sess.items) {
    if (it.kind === 'mobility' || it.kind === 'prep') { s += it.list.reduce((t, m) => t + m.secs, 0); continue; }
    for (const set of it.sets) {
      s += it.unit === 'secs' ? set.target : Math.max(25, set.target * 4);
      s += restFor(it, set);
    }
    s += 45; // finding the thing, loading it, waiting for someone to finish
  }
  return Math.round(s / 60);
}

/* Every clock stores an absolute deadline rather than counting a variable
   down. Android throttles or suspends setInterval when the screen locks, so
   anything decrementing per tick loses time; recomputing from Date.now()
   survives a locked phone, a backgrounded app, even a killed process. */

let timer = null;

function startRest(secs, label) {
  clearInterval(timer?.h);
  timer = { endAt: Date.now() + secs * 1000, label, fired: false };
  S.restEnd = timer.endAt; S.restLabel = label; save();
  timer.h = setInterval(paintRest, 250);
  paintRest();
}

function paintRest() {
  const bar = $('#timerbar');
  if (!timer) { bar.classList.remove('on'); return; }
  const left = Math.round((timer.endAt - Date.now()) / 1000);
  if (left <= 0) {
    if (!timer.fired) {
      timer.fired = true;
      if (navigator.vibrate) navigator.vibrate([120, 80, 120]);
      notify('Rest done', timer.label);
      toast('Rest done');
    }
    stopRest();
    return;
  }
  bar.classList.add('on');
  bar.innerHTML = `<span class="mono">${mmss(left)}</span>
    <span class="lb">${timer.label}</span><button class="skip">Skip</button>`;
}

function stopRest() {
  clearInterval(timer?.h);
  timer = null;
  S.restEnd = null; S.restLabel = null; save();
  $('#timerbar').classList.remove('on');
}

/* A rest interval that ends while the screen is off is useless unless the
   phone says something. Opt-in; degrades to vibration alone. */
function notify(title, body) {
  try {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    if (document.visibilityState === 'visible') return;
    new Notification(title, { body, icon: './icon-192.png', tag: 'load-rest' });
  } catch (e) { /* unsupported */ }
}

function resumeRest() {
  if (!S.restEnd || S.restEnd <= Date.now()) { S.restEnd = null; return; }
  timer = { endAt: S.restEnd, label: S.restLabel || 'Rest', fired: false };
  timer.h = setInterval(paintRest, 250);
  paintRest();
}

/* ═══ session clock ═════════════════════════════════════════ */

function startSession(sess) { S.active = { id: sess.id, t0: Date.now() }; save(); paintSession(); }
function endSession() { S.active = null; save(); paintSession(); }

function paintSession() {
  const el = $('#sessionclock');
  if (!el) return;
  if (!S.active) { el.classList.remove('on'); el.textContent = ''; return; }
  el.classList.add('on');
  const t = Math.round((Date.now() - S.active.t0) / 1000);
  const h = Math.floor(t / 3600);
  el.textContent = (h ? h + ':' : '') + mmss(t % 3600);
}

setInterval(() => { paintSession(); if (timer) paintRest(); }, 1000);


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


function setCoreStart(key) {
  const rung = CORE_START[key]?.rung ?? 1;
  S.coreLevel = S.coreLevel || {};
  for (const t of CORE_TRACKS) S.coreLevel[t.id] = Math.min(rung, t.levels.length - 1);
  S.coreClean = {};
  S.settings.coreStart = key;
}

/* ═══ core ══════════════════════════════════════════════════
   Each quality is a ladder. You enter at the bottom rung whatever your
   training age, and two clean sessions moves you up one. Levels change the
   leverage, not just the number — which is how core work actually progresses,
   since adding minutes to a plank stops doing anything fairly quickly. */

const coreLevel = id => Math.min((S.coreLevel?.[id] ?? 0), trackOf(id).levels.length - 1);
const trackOf = id => CORE_TRACKS.find(t => t.id === id);
const coreRung = id => trackOf(id).levels[coreLevel(id)];

function coreW(trackId) {
  const key = `${trackId}:${coreLevel(trackId)}`;
  return (S.coreW && S.coreW[key] != null) ? S.coreW[key] : coreRung(trackId).w;
}

/* Pick n tracks from n different qualities, rotating both which qualities
   come up and which track represents each one. */
function pickCore(n, homeOnly, wanted) {
  /* Least recently used wins. Never-used sorts ahead of everything, then
     oldest first — an index of 0 means it was the last thing you did, so it
     must sort last, which the obvious version of this gets backwards. */
  const rank = (list, id) => { const i = list.indexOf(id); return i === -1 ? Infinity : i; };
  const seen = S.coreSeen || [], qSeen = S.coreQ || [];
  const order = wanted && wanted.length
    ? wanted.slice(0, n)
    : [...CORE_ROTATION].sort((a, b) => rank(qSeen, b) - rank(qSeen, a)).slice(0, n);

  const chosen = [], used = new Set();
  for (const q of order) {
    const pool = CORE_TRACKS.filter(t => t.quality === q && !used.has(t.id) && (!homeOnly || t.home));
    if (!pool.length) continue;
    pool.sort((a, b) => rank(seen, b.id) - rank(seen, a.id));
    chosen.push(pool[0]); used.add(pool[0].id);
  }
  /* If a requested quality had nothing left, top up from anywhere. */
  if (chosen.length < n) {
    const rest = CORE_TRACKS.filter(t => !used.has(t.id) && (!homeOnly || t.home))
      .sort((a, b) => rank(seen, b.id) - rank(seen, a.id));
    for (const t of rest) { if (chosen.length >= n) break; chosen.push(t); used.add(t.id); }
  }
  return chosen;
}

function coreItem(track) {
  const rung = coreRung(track.id), lv = coreLevel(track.id);
  const next = track.levels[lv + 1];
  return {
    kind: 'core', ref: track.id, name: rung.name, note: rung.note, cue: rung.cue,
    unit: rung.unit, quality: track.quality, level: lv + 1, levels: track.levels.length,
    nextName: next ? next.name : null,
    sets: Array.from({ length: rung.sets }, () => ({ w: coreW(track.id), target: rung.target, reps: null }))
  };
}

/* ═══ weight adjustment ═════════════════════════════════════
   Seeded numbers are a starting guess, most of all on machines where the
   stack is unknown. Changing a weight here changes it everywhere — the
   remaining sets today, and every session after. */


function nudgeWeight(kind, ref, dir) {
  if (kind === 'core') {
    if (!trackOf(ref)) return null;
    const cur = coreW(ref), step = cur >= 40 ? 2.5 : cur >= 10 ? 1 : 0.5;
    const key = `${ref}:${coreLevel(ref)}`;
    S.coreW = S.coreW || {};
    S.coreW[key] = Math.max(0, round(cur + dir * step, step));
    return S.coreW[key];
  }
  const a = ACCESSORIES[ref], st = S.acc[ref];
  if (!a || !st) return null;
  st.w = Math.max(a.inc, round(st.w + dir * a.inc, a.inc));
  return st.w;
}

function setWeight(kind, ref, value) {
  const v = Math.max(0, parseFloat(value) || 0);
  if (kind === 'core') { S.coreW = S.coreW || {}; S.coreW[`${ref}:${coreLevel(ref)}`] = v; return v; }
  if (S.acc[ref]) S.acc[ref].w = v;
  return v;
}

/* ═══ session construction ══════════════════════════════════ */

function pickRotating(pool, seen, n, filter) {
  const usable = filter ? pool.filter(filter) : pool;
  const fresh = usable.filter(p => !seen.includes(p.id));
  const src = fresh.length >= n ? fresh : [...fresh, ...usable.filter(p => !fresh.includes(p))];
  return src.slice(0, n);
}

/* Two ramp sets, not three. The prep block does the general warming;
   these groove the pattern under load. */
const warmupRamp = top => top < 60 ? []
  : [0.5, 0.75].map(p => ({ w: barRound(top * p), target: p < 0.6 ? 5 : 3, warm: true, reps: null }));

const RAMP_PATTERNS = ['squat', 'hinge', 'hpush', 'vpush', 'hpull', 'vpull'];

/* Front squats at 90kg were arriving with no ramp because the main lift that
   day was a deadlift — a different pattern entirely. Any heavy compound now
   warms itself up, with two ramp sets if the pattern is cold and one if
   something earlier in the session already loaded it. */
function accessoryRamp(a, working, patternsLoaded) {
  if (!RAMP_PATTERNS.includes(a.pattern)) return [];
  const cold = !patternsLoaded.has(a.pattern);

  /* Dips and pull-ups carry your bodyweight before any plate goes on, so
     half the added weight is not half the load. A bodyweight set is. */
  if (a.addedWeight) {
    const sets = [{ w: 0, target: 5, warm: true, reps: null, bodyweight: true }];
    if (cold && working >= 20) sets.push({ w: round(working * 0.5, a.inc), target: 3, warm: true, reps: null });
    return sets;
  }

  const effective = a.dbl ? working * 2 : working;
  if (effective < 20) return [];
  const step = w => (a.bar ? barRound(w) : round(w, a.inc));
  /* Two ramps only when the pattern is cold and the load is genuinely heavy;
     a 45kg leg curl does not need a staircase. */
  const pcts = effective >= 60 ? (cold ? [0.5, 0.75] : [0.6]) : (cold ? [0.6] : []);
  return pcts.map(p => ({ w: step(working * p), target: p < 0.7 ? 5 : 3, warm: true, reps: null }));
}

function buildPlanned(dateStr, dayKey) {
  const D = DAYS[dayKey], wk = weekIndex(dateStr), wave = WAVE[wk];
  const atHome = D.venue === 'home';
  const isLower = D.key.startsWith('lower');
  const verdict = isLower && S.settings.runAdjust ? runVerdict() : { trim: 0 };
  const items = [];

  if (D.prepKey && PREP[D.prepKey]) {
    const P = PREP[D.prepKey];
    const rank = id => { const i = (S.mobSeen || []).indexOf(id); return i === -1 ? Infinity : i; };
    const rest = [...P.pool].sort((a, b) => rank(b.id) - rank(a.id)).slice(0, Math.max(0, D.prep - 1));
    const list = [P.opener, ...rest].filter(Boolean);
    items.push({ kind: 'prep', ref: D.prepKey,
      name: `${P.label} · ${Math.round(list.reduce((t, m) => t + m.secs, 0) / 60)} min`,
      list, sets: [] });
  }

  if (D.core) for (const t of pickCore(D.core, atHome, D.coreQ)) items.push(coreItem(t));

  if (D.main) {
    const M = MAINS[D.main], tm = S.mains[D.main].tm;
    const top = barRound(tm * wave.sets.at(-1)[0]);
    const sets = warmupRamp(top);
    for (const [pct, reps, isOpen] of wave.sets)
      sets.push({ w: barRound(tm * pct), target: reps, open: isOpen, reps: null, rpe: null });
    for (let i = 0; i < D.backoff.sets; i++)
      sets.push({ w: barRound(tm * D.backoff.pct), target: D.backoff.reps, backoff: true, reps: null });
    items.push({ kind: 'main', ref: D.main, name: M.name, wave: wave.name, sets });
  }

  const work = resolveWork(D.work, atHome);
  if (verdict.trim >= 2) work.pop();
  const loaded = new Set();
  if (D.main) loaded.add(MAINS[D.main].pattern);
  for (const id of work) {
    const a = ACCESSORIES[id], s = S.acc[id];
    const n = Math.max(2, s.sets - (verdict.trim ? 1 : 0));
    const sets = [
      ...accessoryRamp(a, s.w, loaded),
      ...Array.from({ length: n }, () => ({ w: s.w, target: s.reps, reps: null }))
    ];
    items.push({ kind: 'acc', ref: id, name: a.name, note: a.note, dbl: a.dbl, bar: a.bar, sets });
    loaded.add(a.pattern);
  }

  return { id: `${dateStr}·${dayKey}`, date: dateStr, dayKey, week: wk, wave: wave.name,
    label: D.label, note: D.note, venue: D.venue, club: D.venue === 'home' ? 'Home' : S.club, adhoc: false, easy: false,
    runTrim: verdict.trim ? verdict : null, items, done: false };
}

function recentPatterns(h = RECOVERY_WINDOW_H) {
  const cut = Date.now() - h * 36e5, hot = new Set();
  for (const s of S.sessions) {
    if (!s.done || (s.completedAt ? new Date(s.completedAt) : parseDay(s.date)) < cut) continue;
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
    for (const t of pickCore(focusKey === 'core' ? Math.min(n, 4) : 2, atHome)) items.push(coreItem(t));
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
    venue: atHome ? 'home' : 'gym', club: atHome ? 'Home' : S.club, adhoc: true, easy: false, items, done: false };
}

/* Same movements, less load. Does not count towards progression. */
function makeEasy(sess, on) {
  sess.easy = on;
  for (const it of sess.items) {
    if (it.kind === 'mobility') continue;
    for (const s of it.sets) {
      if (on) {
        s.full = s.full ?? s.w;
        const step = (it.kind === 'main' || it.bar) ? BAR_STEP : 1.25;
        s.w = s.w ? round(s.full * 0.85, step) : s.w;
      }
      else if (s.full != null) { s.w = s.full; delete s.full; }
    }
  }
}

/* ═══ progression ═══════════════════════════════════════════ */

function applyProgression(sess) {
  const notes = [];
  if (sess.easy) { notes.push({ type: 'easy', label: 'Easy day', text: 'Nothing moved — that is what an easy day is for.' }); return notes; }

  for (const it of sess.items) {
    if (it.kind === 'main') {
      const st = S.mains[it.ref], M = MAINS[it.ref];
      const logged = it.sets.filter(s => s.reps != null && !s.warm);
      if (logged.length) {
        st.hist.push({ d: sess.date, e1rm: Math.round(Math.max(...logged.map(s => e1rm(s.w, s.reps)))), tm: st.tm });
        for (const l of logged) noteRecord(it.ref, l.w, l.reps, sess.date);
      }
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
        if (bump > 0) { const from = st.tm; st.tm = barRound(st.tm + M.inc * bump); st.misses = 0; notes.push({ type: 'tm', label: M.name, from, to: st.tm, unit: 'kg' }); }
        else if (bump === 0) { st.misses = 0; notes.push({ type: 'hold', label: M.name, to: st.tm, unit: 'kg' }); }
        else {
          st.misses++;
          if (st.misses >= 2) { const from = st.tm; st.tm = barRound(st.tm * 0.9); st.misses = 0; notes.push({ type: 'reset', label: M.name, from, to: st.tm, unit: 'kg' }); }
          else notes.push({ type: 'hold', label: M.name, to: st.tm, unit: 'kg' });
        }
      }
    }
    if (it.kind === 'acc') {
      const a = ACCESSORIES[it.ref], st = S.acc[it.ref];
      const logged = it.sets.filter(s => s.reps != null && !s.warm);
      if (!logged.length) continue;
      st.lastDone = sess.date;
      st.hist.push({ d: sess.date, w: st.w, reps: logged.map(s => s.reps) });
      /* A set trimmed by running load is not a missed set. */
      const working = it.sets.filter(s => !s.warm).length;
      const expected = sess.runTrim ? logged.length : working;
      if (logged.length >= expected && logged.every(s => s.reps >= s.target)) {
        st.misses = 0;
        if (st.reps < a.repMax) { const from = st.reps; st.reps++; notes.push({ type: 'reps', label: a.name, from, to: st.reps, unit: 'reps', w: st.w }); }
        else { const from = st.w; st.w = round(st.w + a.inc, a.inc); st.reps = a.repMin; notes.push({ type: 'load', label: a.name, from, to: st.w, unit: 'kg', reps: st.reps }); }
      } else {
        st.misses++;
        const short = logged.filter(x => x.reps < x.target).length;
        notes.push({ type: 'hold', label: a.name, to: st.w, unit: 'kg', reps: st.reps,
          why: logged.length < working
            ? `only ${logged.length} of ${working} sets logged`
            : `${short} set${short > 1 ? 's' : ''} short of ${st.reps}` });
      }
    }
    if (it.kind === 'core') {
      S.coreSeen = [it.ref, ...(S.coreSeen || []).filter(x => x !== it.ref)].slice(0, 12);
      S.coreQ = [it.quality, ...(S.coreQ || []).filter(x => x !== it.quality)].slice(0, 4);
      const logged = it.sets.filter(x => x.reps != null);
      if (!logged.length) continue;
      S.coreClean = S.coreClean || {};
      const clean = logged.length >= it.sets.length && logged.every(x => x.reps >= x.target);
      if (!clean) { S.coreClean[it.ref] = 0; continue; }
      S.coreClean[it.ref] = (S.coreClean[it.ref] || 0) + 1;
      const t = trackOf(it.ref), lv = coreLevel(it.ref);
      if (S.coreClean[it.ref] >= CORE_LEVEL_UP && lv < t.levels.length - 1) {
        S.coreLevel = S.coreLevel || {};
        S.coreLevel[it.ref] = lv + 1;
        S.coreClean[it.ref] = 0;
        notes.push({ type: 'core', label: t.quality, from: t.levels[lv].name, to: t.levels[lv + 1].name });
      }
    }
    if (it.kind === 'mobility' || it.kind === 'prep') for (const m of it.list) S.mobSeen = [m.id, ...S.mobSeen.filter(x => x !== m.id)].slice(0, 8);
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

/* Renders one progression change. Sessions logged before this existed stored
   plain sentences, so those pass straight through. */
function changeRow(n) {
  if (typeof n === 'string') return `<li>${n}</li>`;
  const delta = (n.to != null && n.from != null && typeof n.to === 'number')
    ? (n.to - n.from > 0 ? '+' : '') + +(n.to - n.from).toFixed(2) + (n.unit === 'kg' ? 'kg' : '') : '';
  const cls = ['tm', 'load', 'reps', 'core'].includes(n.type) ? 'up' : n.type === 'reset' ? 'down' : '';
  const detail = {
    tm:    () => `training max ${n.from} → <b>${n.to}kg</b>`,
    load:  () => `${n.from} → <b>${n.to}kg</b> · back to ${n.reps} reps`,
    reps:  () => `${n.from} → <b>${n.to} reps</b> at ${n.w}kg`,
    core:  () => `${n.from} → <b>${n.to}</b>`,
    hold:  () => `held at ${n.to}kg${n.reps ? ' × ' + n.reps : ''}${n.why ? ' · ' + n.why : ''}`,
    reset: () => `training max ${n.from} → <b>${n.to}kg</b>, two short cycles`,
    easy:  () => n.text
  }[n.type] || (() => '');
  return `<li class="${cls}">
    <span class="cl">${n.label}</span>
    <span class="cd">${detail()}</span>
    ${delta && cls ? `<span class="cx mono">${delta}</span>` : ''}
  </li>`;
}

const isGain = n => typeof n === 'string' ? /→/.test(n) : ['tm', 'load', 'reps', 'core'].includes(n.type);

/* Everything that moved, not just the first thing. A session usually
   progresses half a dozen lifts at once and a toast showed one of them. */
function showSummary(sess, notes) {
  const e = effortOf(sess);
  const gains = notes.filter(isGain).length;
  const pool = sess.easy ? FINISH_LINES.easy
    : e >= 4 ? FINISH_LINES.hard : e === 3 ? FINISH_LINES.solid : FINISH_LINES.light;
  const line = pool[Math.floor(Math.random() * pool.length)];
  const mins = sess.duration ? Math.round(sess.duration / 60) : null;

  const box = $('#sheet');
  box.innerHTML = `<div class="summary">
    <div class="finishline">${line}</div>
    <div class="sumstats mono">
      <span><b style="color:${EFFORT_COLOUR[e]}">${e}/5</b> session</span>
      <span><b>${(sessionTonnage(sess) / 1000).toFixed(1)}</b>t moved</span>
      ${mins ? `<span><b>${mins}</b> min</span>` : ''}
    </div>
    ${gains ? `<p class="hint">${gains} lift${gains > 1 ? 's' : ''} moved up. The detail is in History.</p>` : ''}
    <button class="btn-go" id="sheetclose">Done</button>
  </div>`;
  box.classList.add('on');
}

/* A destructive action deserves a sentence about what it destroys, not a
   native dialog people dismiss by reflex. */
function askConfirm({ title, body, label, act, danger }) {
  const box = $('#sheet');
  box.innerHTML = `<div class="summary">
    <h3>${title}</h3>
    <p>${body}</p>
    <button class="btn-go ${danger ? 'danger' : ''}" data-confirm="${act}">${label}</button>
    <button id="sheetclose" style="margin-top:8px">Cancel</button>
  </div>`;
  box.classList.add('on');
}

/* ═══ history ═══════════════════════════════════════════════ */

/* Effort out of five. RPE on the main lift is the honest signal when it is
   there; otherwise how much of what was prescribed actually landed. */
/* Session score out of five, where five is a good session. Completion is the
   backbone — did you do what was asked — and effort only sharpens it, so a
   session where everything landed comfortably still scores well rather than
   being punished for not hurting. */
function effortOf(sess) {
  const working = sess.items.flatMap(i => i.sets).filter(s => !s.warm && s.target != null);
  const logged = working.filter(s => s.reps != null);
  if (!logged.length) return 1;

  const hit = logged.filter(s => s.reps >= s.target).length;
  const completion = hit / Math.max(1, working.length);
  let score = 1 + completion * 4;

  const rpes = sess.items.filter(i => i.kind === 'main')
    .flatMap(i => i.sets).filter(s => s.rpe).map(s => s.rpe);
  if (rpes.length) {
    const mean = rpes.reduce((a, b) => a + b, 0) / rpes.length;
    if (mean >= 9 && completion >= 0.95) score = 5;
    else if (mean <= 6.5) score = Math.min(score, 3.5);
  }
  if (sess.easy) score = Math.min(score, 3);
  return Math.max(1, Math.min(5, Math.round(score)));
}

const EFFORT_COLOUR = ['#5C6470', '#C8202D', '#E07B1F', '#E8B305', '#5D9E3A', '#1E7A46'];

function sessionTonnage(sess) {
  return sess.items.reduce((t, it) => t + it.sets.reduce((u, s) =>
    u + (s.reps != null && s.w ? s.w * s.reps : 0), 0), 0);
}

/* Monday-keyed buckets, newest week first */
function sessionsByWeek() {
  const weeks = new Map();
  for (const s of S.sessions.filter(x => x.done)) {
    const k = iso(mondayOf(parseDay(s.date)));
    if (!weeks.has(k)) weeks.set(k, []);
    weeks.get(k).push(s);
  }
  /* Newest week at the top, but the week itself reads Monday to Sunday —
     a week reversed inside is harder to recognise than one in order. */
  for (const list of weeks.values())
    list.sort((a, b) => a.date.localeCompare(b.date) || (a.completedAt || '').localeCompare(b.completedAt || ''));
  return [...weeks.entries()].sort((a, b) => b[0].localeCompare(a[0]));
}

/* ═══ views ═════════════════════════════════════════════════ */

let VIEW = 'today', draft = null, openWeek = null;
let addQuery = '', addOpen = false, progressTab = 'status', openSession = null, libQuery = '';

/* Was this day's session completed in the current Monday-to-Sunday week? */
function doneThisWeek(dayKey) {
  const start = mondayOf(new Date());
  return S.sessions.some(x => x.done && x.dayKey === dayKey && parseDay(x.date) >= start);
}

function sessionFor(ds) {
  const found = S.sessions.find(s => s.date === ds && !s.adhoc);
  if (found) return found;
  const key = Object.values(DAYS).find(d => d.weekday === parseDay(ds).getDay())?.key;
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


/* ═══ equipment ═════════════════════════════════════════════
   Kit varies by club. Marking something unavailable removes it from that
   club only, and pulls in the nearest same-pattern replacement. */

const outAt = (club = S.club) => (S.clubOut && S.clubOut[club]) || [];

function substituteFor(id, taken = new Set(), homeOnly = false) {
  const out = outAt(), a = ACCESSORIES[id];
  if (!a) return null;
  const ranked = [
    ...(a.variants || []),
    ...Object.keys(ACCESSORIES).filter(k => ACCESSORIES[k].pattern === a.pattern)
  ];
  for (const c of ranked) {
    const cand = ACCESSORIES[c];
    if (!cand || c === id || out.includes(c) || taken.has(c)) continue;
    if (homeOnly && !cand.home) continue;
    return c;
  }
  return null;
}

function resolveWork(ids, homeOnly) {
  const out = outAt(), taken = new Set(), resolved = [];
  for (const id of ids) {
    if (!out.includes(id)) { taken.add(id); resolved.push(id); continue; }
    const sub = substituteFor(id, taken, homeOnly);
    if (sub) { taken.add(sub); resolved.push(sub); }
  }
  return resolved;
}

/* ═══ records ═══════════════════════════════════════════════ */

function noteRecord(lift, w, reps, date) {
  const r = S.records[lift] = S.records[lift] || {};
  if (!r.w || e1rm(w, reps) > e1rm(r.w, r.reps)) { r.w = w; r.reps = reps; r.date = date; }
}

const bestEstimate = lift => {
  const r = S.records[lift];
  if (!r) return null;
  const est = r.w ? Math.round(e1rm(r.w, r.reps)) : null;
  return { est, tested: r.tested || null, best: r.w ? r : null };
};

/* ═══ on track ══════════════════════════════════════════════ */

function setsLast7ByMuscle() {
  const cut = Date.now() - 7 * 864e5, m = {};
  for (const s of S.sessions) {
    if (!s.done || parseDay(s.date) < cut) continue;
    for (const it of s.items) {
      const logged = it.sets.filter(x => x.reps != null && !x.warm).length;
      if (!logged) continue;
      if (it.kind === 'core') { m.core = (m.core || 0) + logged; continue; }
      const pat = it.kind === 'main' ? MAINS[it.ref]?.pattern : ACCESSORIES[it.ref]?.pattern;
      const mus = MUSCLE_OF[pat];
      if (mus) m[mus] = (m[mus] || 0) + logged;
    }
  }
  return m;
}

/* How many programmed sessions fell between two moments, inclusive of today */
function scheduledBetween(fromMs, toMs) {
  const days = Object.values(DAYS).map(d => d.weekday);
  let n = 0;
  const d = new Date(fromMs); d.setHours(12, 0, 0, 0);
  const end = new Date(toMs); end.setHours(12, 0, 0, 0);
  while (d <= end) { if (days.includes(d.getDay())) n++; d.setDate(d.getDate() + 1); }
  return n;
}

function trackStatus() {
  const done = S.sessions.filter(s => s.done && !s.adhoc);
  const cut = Date.now() - 28 * 864e5;
  const recent = done.filter(s => parseDay(s.date) >= cut).length;
  /* Counting a whole week's sessions as due on Tuesday reads as "behind"
     when you are in fact bang on schedule. Only days that have already
     arrived count. */
  let expected = scheduledBetween(
    Math.max(parseDay(S.created).getTime(), cut), Date.now());
  /* The day you installed the app is only fairly counted as due if you
     actually trained it — otherwise a Friday install reports a missed Friday
     before the thing was even on your phone. */
  const born = parseDay(S.created);
  const scheduledDays = Object.values(DAYS).map(d => d.weekday);
  if (scheduledDays.includes(born.getDay())
      && born.getTime() >= cut
      && !S.sessions.some(x => x.done && x.date === S.created)) expected--;
  expected = Math.max(0, expected);
  const adherence = expected ? Math.min(1, recent / expected) : 1;

  const cycles = Math.max(0, cycleNo(today()) - 1);
  let gained = 0, due = 0;
  for (const [k, m] of Object.entries(MAINS)) {
    gained += S.mains[k].tm - m.tm;
    due += cycles * m.inc;
  }
  const strength = due > 0 ? gained / due : null;

  const vol = setsLast7ByMuscle();
  const short = Object.entries(VOLUME_TARGET)
    .filter(([k, t]) => (vol[k] || 0) < t * 0.7)
    .map(([k]) => k);
  const stalls = Object.keys(S.acc).filter(id => S.acc[id].misses >= 2).length;

  let verdict, tone;
  if (expected < 3) { verdict = 'Just started — nothing to judge yet'; tone = 'flat'; }
  else if (done.length < 3) { verdict = 'Too early to tell — log a couple more sessions'; tone = 'flat'; }
  else if (adherence < 0.7) { verdict = 'Behind on sessions. Consistency outranks everything else here'; tone = 'down'; }
  else if (strength !== null && strength < 0.5 && cycles >= 1) { verdict = 'Showing up, but the main lifts are not moving'; tone = 'down'; }
  else if (short.length > 3) { verdict = 'On the lifts, light on volume this week'; tone = 'warn'; }
  else { verdict = 'On track'; tone = 'up'; }

  return { verdict, tone, adherence, recent, expected, strength, gained, due, short, stalls, vol, cycles };
}

/* ═══ set completion ════════════════════════════════════════ */

let setClock = null;   // one running set at a time

function startSetClock(itemIdx, setIdx, label) {
  stopSetClock();
  setClock = { itemIdx, setIdx, t0: Date.now(), label };
  setClock.h = setInterval(() => {
    const el = $(`[data-item="${itemIdx}"] [data-set="${setIdx}"] .live`);
    if (!el) return stopSetClock();
    el.textContent = mmss(Math.round((Date.now() - setClock.t0) / 1000));
  }, 500);
}
function stopSetClock() {
  if (setClock?.h) clearInterval(setClock.h);
  const el = setClock;
  setClock = null;
  return el ? Math.round((Date.now() - el.t0) / 1000) : null;
}

function pop(text, miss) {
  const el = $('#pop');
  el.textContent = text;
  el.className = 'pop' + (miss ? ' miss' : '');
  void el.offsetWidth;               // restart the animation
  el.classList.add('go');
  if (!miss && navigator.vibrate) navigator.vibrate(35);
  clearTimeout(pop._t);
  pop._t = setTimeout(() => el.classList.remove('go'), 1300);
}

function phraseFor(hit) {
  if (!hit) return MISS_PHRASES[Math.floor(Math.random() * MISS_PHRASES.length)];
  const pool = S.settings.language === 'clean'
    ? PHRASES.clean : [...PHRASES.clean, ...PHRASES.salty];
  return pool[Math.floor(Math.random() * pool.length)];
}

async function completeSet(sess, itemIdx, setIdx, reps) {
  const it = sess.items[itemIdx], s = it.sets[setIdx];
  const dur = (setClock && setClock.itemIdx === itemIdx && setClock.setIdx === setIdx)
    ? stopSetClock() : null;
  s.reps = reps;
  if (dur) s.dur = dur;
  const hit = reps >= s.target;
  if (!s.warm) pop(phraseFor(hit), !hit);
  if (!S.sessions.find(x => x.id === sess.id)) S.sessions.push(sess);
  await save();
  redrawItem(sess, itemIdx);
  startRest(restFor(it, s), `${it.name} · set ${setIdx + 1} done`);
}

function applyWeightToSession(sess, idx, w) {
  const it = sess?.items?.[idx];
  if (!it) return;
  for (const set of it.sets) if (set.reps == null && !set.warm) { set.w = w; delete set.full; }
  if (sess.easy) for (const set of it.sets) if (set.reps == null) { set.full = w; set.w = round(w * 0.85, (it.kind === 'main' || it.bar) ? BAR_STEP : 1.25); }
}

function redrawItem(sess, idx) {
  const card = $(`[data-item="${idx}"]`);
  if (!card) return;
  const open = card.classList.contains('open');
  card.outerHTML = itemCard(sess.items[idx], idx);
  if (open) $(`[data-item="${idx}"]`).classList.add('open');
}

/* ═══ set rendering ═════════════════════════════════════════ */

function setKind(s) {
  return s.warm ? 'warm' : s.open ? 'open' : s.backoff ? 'backoff' : 'work';
}

function setRow(it, s, i) {
  const kind = setKind(s);
  const u = it.unit === 'secs' ? 's' : '';
  const done = s.reps != null;
  const hit = done && s.reps >= s.target;
  const running = setClock?.itemIdx === it._idx && setClock?.setIdx === i;

  const label = {
    warm: 'Warm-up', open: 'Open set — the number is a minimum',
    backoff: 'Back-off — lighter, more reps', work: null
  }[kind];

  const actions = done
    ? `<button class="result ${hit ? 'hit' : 'miss'}" data-undo="${i}">
         <b>${s.reps}${u}</b>${s.dur ? `<span class="mono dur"> ${mmss(s.dur)}</span>` : ''}
         <span class="undo">tap to undo</span></button>`
    : `<button class="go ${running ? 'live-on' : ''}" data-do="start" data-set="${i}">
         ${running ? '<span class="live mono">0:00</span>' : (it.unit === 'secs' ? 'Time it' : 'Start')}</button>
       <button class="ok" data-do="done" data-set="${i}">Done</button>
       <button class="alt" data-do="edit" data-set="${i}">Other<span>±</span></button>`;

  const editor = `<div class="editor" data-editor="${i}" hidden>
      <button data-adj="-1">−</button>
      <input type="number" inputmode="numeric" value="${s.target}" aria-label="Reps completed">
      <button data-adj="1">+</button>
      <button class="btn-go" data-save="${i}">Log it</button>
    </div>`;

  const rpe = it.kind === 'main' && !s.warm && done
    ? `<div class="rpe" data-set="${i}">
         <span class="q">How hard was that?<button class="what" data-what="rpe" aria-label="What RPE means">?</button></span>
         <span class="nums">${Object.entries(RPE_SCALE).map(([v, r]) =>
           `<button data-rpe="${v}" aria-pressed="${s.rpe === +v}" style="--rc:${r.colour}">${v}</button>`).join('')}</span>
         ${s.rpe ? `<span class="rdesc" style="--rc:${RPE_SCALE[s.rpe].colour}">
             <b>${RPE_SCALE[s.rpe].label}</b> · ${RPE_SCALE[s.rpe].rir}
             <span>${RPE_SCALE[s.rpe].body}</span></span>` : ''}
       </div>` : '';

  return `<div class="set ${done ? (hit ? 'hit' : 'miss') : ''} k-${kind}" data-set="${i}">
      <div class="line">
        <span class="n mono">${s.warm ? '·' : i + 1}</span>
        <span class="presc">
          <span class="w mono">${s.bodyweight ? 'bodyweight' : s.w ? s.w + 'kg' : 'bodyweight'}</span>
          <span class="x">×</span>
          <span class="r">${s.open ? s.target + '+' : s.target + u}</span>
          <button class="what" data-what="${kind === 'work' ? 'work' : kind}" aria-label="What this means">?</button>
        </span>
        ${label ? `<span class="kindlabel mono">${label}</span>` : ''}
      </div>
      <div class="acts">${actions}</div>
      ${editor}${rpe}
    </div>`;
}

function itemCard(it, idx) {
  it._idx = idx;

  if (it.kind === 'mobility' || it.kind === 'prep') {
    const ticked = it.doneIds || [];
    const allDone = ticked.length >= it.list.length;
    return `<div class="card ${it.kind === 'prep' ? 'prep' : ''} ${allDone ? 'done' : ''}" data-item="${idx}">
      <div class="head"><span class="idx mono">${String(idx + 1).padStart(2, '0')}</span>
        <span class="nm"><span class="t">${it.name}</span>
        <span class="s mono">${allDone ? 'done' : ticked.length + '/' + it.list.length + ' · before you touch anything heavy'}</span></span>
        <span class="tick">✓</span></div>
      <div class="body">${it.list.map(m => {
        const on = ticked.includes(m.id);
        return `<div class="movement ${on ? 'ticked' : ''}">
          <div class="prepline">
            <span class="presc mono">${m.name}</span>
            <span class="mono dur">${m.detail || m.sets || m.secs + 's'}</span>
          </div>
          ${m.cue ? `<p class="mcue">${m.cue}</p>` : ''}
          <div class="mrow">
            <a class="watch" href="${howToUrl(m.name)}" target="_blank" rel="noopener">Watch it →</a>
            <button class="mtick ${on ? 'on' : ''}" data-tick="${idx}|${m.id}">${on ? '✓ done' : 'Done'}</button>
          </div>
        </div>`;
      }).join('')}
      <div class="btn-row"><button class="btn-sm" data-tickall="${idx}">${allDone ? 'Clear all' : 'Mark the whole block done'}</button></div>
      </div></div>`;
  }

  const done = it.sets.length && it.sets.every(s => s.reps != null);
  const logged = it.sets.filter(s => s.reps != null).length;
  const pl = it.kind === 'acc' ? plateauFor(it.ref) : null;
  const cue = CUES[it.ref];
  const sub = it.kind === 'main' ? `${it.wave} · TM ${S.mains[it.ref].tm}kg`
    : it.kind === 'core' ? `${it.quality} · level ${it.level}/${it.levels} · ${it.sets.length} × ${it.sets[0].target}${it.unit === 'secs' ? 's' : ''}${it.sets[0].w ? ' · ' + it.sets[0].w + 'kg' : ''}`
    : (() => { const w = it.sets.filter(x => !x.warm);
        const r = it.sets.length - w.length;
        return `${w.length} × ${w[0].target} · ${w[0].w}kg${it.dbl ? ' each hand' : ''}${r ? ' · ' + r + ' ramp' : ''}`; })();

  return `<div class="card ${done ? 'done' : ''} ${pl ? 'stalled' : ''}" data-item="${idx}">
    <div class="head"><span class="idx mono">${String(idx + 1).padStart(2, '0')}</span>
      <span class="nm"><span class="t">${it.name}</span>
        <span class="s mono">${sub}${logged && !done ? ` · ${logged}/${it.sets.length}` : ''}</span></span>
      <span class="tick">✓</span></div>
    <div class="body">
      ${it.kind === 'main' || it.bar ? barDiagram((it.sets.find(s => s.open) || it.sets.filter(s => !s.warm).at(-1) || it.sets.at(-1)).w) : ''}
      <div class="howto">
        <p class="cue">${it.cue || cue || it.note || 'Control the weight through the whole range. If form breaks, the set is over.'}</p>
        ${it.kind === 'core' && it.nextName ? `<p class="nextrung mono">Two clean sessions unlocks: ${it.nextName}</p>` : ''}
        ${it.kind === 'core' && !it.nextName ? `<p class="nextrung mono">Top of this ladder</p>` : ''}
        <a class="watch" href="${howToUrl(it.name)}" target="_blank" rel="noopener">Watch how it is done →</a>
      </div>
      ${it.note && cue ? `<p class="hint">${it.note}</p>` : ''}
      ${it.kind !== 'main' ? `<div class="wadj">
        <span class="wl">Working weight${it.dbl ? ' · each hand' : ''}</span>
        <span class="step">
          <button data-wn="-1" data-wk="${it.kind}" data-wr="${it.ref}" data-wi="${idx}" aria-label="Less">−</button>
          <input type="number" inputmode="decimal" value="${(it.sets.find(x => !x.warm) || it.sets[0]).w}"
                 data-wv="${it.ref}" data-wk="${it.kind}" data-wi="${idx}" aria-label="Working weight">
          <button data-wn="1" data-wk="${it.kind}" data-wr="${it.ref}" data-wi="${idx}" aria-label="More">+</button>
        </span></div>` : ''}
      ${it.sets.map((s, i) => setRow(it, s, i)).join('')}
      <div class="btn-row">
        ${it.kind === 'acc' ? `<button class="btn-sm btn-quiet" data-unavailable="${idx}">Not available here</button>` : ''}
        ${it.added ? `<button class="btn-sm btn-quiet" data-remove="${idx}">Remove</button>` : ''}
      </div>
      ${pl ? `<div class="plateau" data-plateau="${it.ref}">
        <div class="why mono">Stalled ${pl.misses} sessions at this load</div>
        Two sessions short of target. Holding here rarely fixes it — change one variable.
        <div class="opts">${pl.opts.map((o, i) => `<button data-opt="${i}"><b>${o.label}</b><br>
          <span style="color:var(--dust);font-size:12px">${o.why}</span></button>`).join('')}</div></div>` : ''}
    </div></div>`;
}

/* ═══ adding to a session in progress ═══════════════════════ */

function suggestionsFor(sess) {
  const D = DAYS[sess.dayKey];
  const already = new Set(sess.items.map(i => i.ref));
  const atHome = sess.venue === 'home';
  let pats;
  if (D) pats = D.key.startsWith('lower') ? ['squat', 'hinge', 'calf']
    : D.key === 'home' ? ['biceps', 'rear', 'lat', 'triceps']
    : D.key === 'upperA' ? ['hpush', 'hpull', 'vpull', 'biceps', 'triceps', 'rear', 'lat']
    : ['vpush', 'lat', 'rear', 'hpush', 'vpull', 'biceps', 'triceps'];
  else pats = Object.keys(ADHOC_FOCUS).flatMap(k => ADHOC_FOCUS[k].patterns);

  return Object.entries(ACCESSORIES)
    .filter(([id, a]) => pats.includes(a.pattern) && !already.has(id))
    .filter(([, a]) => !atHome || a.home)
    .sort((a, b) => (S.acc[a[0]].lastDone || '').localeCompare(S.acc[b[0]].lastDone || ''))
    .slice(0, 8);
}

function addPanel(sess) {
  const q = (addQuery || '').trim().toLowerCase();
  const rec = new Set(suggestionsFor(sess).map(([id]) => id));
  const already = new Set(sess.items.map(i => i.ref));
  const atHome = sess.venue === 'home';

  let list = Object.entries(ACCESSORIES)
    .filter(([id]) => !already.has(id))
    .filter(([id, a]) => !q || (a.name + ' ' + a.pattern + ' ' + (CUES[id] || '')).toLowerCase().includes(q));

  /* Recommended for this session float to the top; a keyword search still
     reaches anything in the library, home kit or not. */
  list.sort((a, b) => {
    const ra = rec.has(a[0]) ? 0 : 1, rb = rec.has(b[0]) ? 0 : 1;
    if (ra !== rb) return ra - rb;
    return (S.acc[a[0]].lastDone || '').localeCompare(S.acc[b[0]].lastDone || '');
  });
  const shown = q ? list.slice(0, 20) : list.slice(0, 10);

  return `<details class="addex" ${addOpen ? 'open' : ''}>
    <summary data-addtoggle>Add an exercise</summary>
    <input type="text" class="exsearch" id="addsearch" placeholder="Search all ${Object.keys(ACCESSORIES).length} exercises"
           value="${addQuery || ''}" autocomplete="off">
    <p class="hint" style="margin:8px 0 10px">${q
      ? shown.length + ' match' + (shown.length === 1 ? '' : 'es')
      : 'Suggested for this session first. Search to reach anything else.'}</p>
    ${shown.map(([id, a]) => `<button class="addrow ${rec.has(id) ? 'rec' : ''}" data-add="${id}">
        <span class="an">${a.name}${rec.has(id) ? '<i>suggested</i>' : ''}${atHome && !a.home ? '<i class="warnflag">needs a gym</i>' : ''}</span>
        <span class="aw mono">${S.acc[id].w}kg × ${S.acc[id].reps} · ${S.acc[id].sets} sets · ${a.pattern}</span>
      </button>`).join('')}
    ${!shown.length ? '<p class="hint">Nothing matches that.</p>' : ''}
  </details>`;
}

function renderToday() {
  const d = today(), el = $('#v-today');
  const sess = draft || sessionFor(d);
  const dayName = parseDay(d).toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'short' });

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
      <span class="mono" style="color:var(--dust-2)"> · ${sess.duration
        ? 'took ' + Math.round(sess.duration / 60) + ' min'
        : 'about ' + estimateMinutes(sess) + ' min'}</span></p>

    ${sess.runTrim ? `<div class="flag amber"><div class="why mono">${sess.runTrim.why}</div>
      Accessory sets trimmed, main lift untouched. Intensity keeps strength; volume is what costs you recovery.</div>` : ''}
    ${sess.easy ? `<div class="flag amber"><div class="why mono">Easy day</div>
      Everything at 85%. This session will not move any weights up or down.</div>` : ''}

    ${sess.done ? '' : `<div class="btn-row" style="margin:0 0 14px">
      ${S.active?.id === sess.id
        ? `<button class="btn-sm" id="endsession">Stop clock</button>`
        : `<button class="btn-go" id="startsession">Start session</button>`}
      <button class="btn-sm ${sess.easy ? 'btn-go' : ''}" id="easy">${sess.easy ? 'Back to full' : 'Not feeling great'}</button>
    </div>`}

    ${sess.items.map(itemCard).join('')}
    ${sess.done ? '' : addPanel(sess)}

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
  const week = S.runs.filter(r => parseDay(r.date) >= mondayOf(new Date()));
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
    <p class="hint" style="margin:0 0 10px">Percentages are of your training max, for the three prescribed sets. Tap a week to see the actual weights.</p>
    ${WAVE.map((w, i) => `<div class="card wavecard ${i === wk ? 'now' : ''} ${openWeek === i ? 'open' : ''}" data-week="${i}">
      <div class="wavehead">
        <span class="mono wk">W${i + 1}</span>
        <span class="display wname">${w.name}</span>
        ${i === wk ? '<span class="mono badge">this week</span>' : ''}
        <span class="mono pcts">${w.sets.map(s => Math.round(s[0] * 100) + '%').join(' · ')}</span>
      </div>
      ${openWeek === i ? `<div class="wavebody">
        ${Object.entries(MAINS).map(([k, m]) => `<div class="wlift">
          <span class="wln">${m.name}</span>
          <span class="mono wls">${w.sets.map(([pct, reps, open]) =>
            `${barRound(S.mains[k].tm * pct)}×${reps}${open ? '+' : ''}`).join('   ')}</span>
        </div>`).join('')}
        <p class="hint" style="margin:8px 0 0">${w.name === 'Deload'
          ? 'Everything light. Nothing is measured and nothing moves — the point is to arrive at the next cycle fresh.'
          : `Last set is open-ended: at least ${w.floor} reps, as many more as stay clean.`}</p>
      </div>` : ''}
    </div>`).join('')}

    <p class="eyebrow">The week</p>
    ${Object.values(DAYS).map(d => {
      const hit = doneThisWeek(d.key);
      return `<div class="card dayrow ${hit ? 'done' : ''}" style="padding:12px 14px">
      <div style="display:flex;align-items:baseline;gap:8px">
        <span class="display" style="font-size:17px">${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.weekday]} — ${d.label}</span>
        ${d.venue === 'home' ? '<span class="mono" style="font-size:10px;color:var(--warn);margin-left:auto">HOME</span>' : ''}
        <span class="daytick ${hit ? 'on' : ''}" title="${hit ? 'done this week' : 'not yet'}">${hit ? '✓' : ''}</span>
      </div>
      <div class="mono" style="font-size:11.5px;color:var(--dust);margin-top:4px">
        ${d.main ? MAINS[d.main].name + ' · ' : ''}${d.work.map(w => ACCESSORIES[w]?.name).filter(Boolean).join(' · ')}${d.core ? ` · ${d.core} core` : ''}${d.prepKey ? ' · warm-up' : ''}
      </div></div>`;
    }).join('')}

    <p class="hint">Saturday is the long run. Sunday is yours.</p>

    <p class="eyebrow">Core starting level</p>
    <div class="card" style="padding:14px">
      <div class="chips">${Object.entries(CORE_START).map(([k, v]) =>
        `<button data-cstart="${k}" aria-pressed="${(S.settings.coreStart || 'advanced') === k}">${v.label}</button>`).join('')}</div>
      <p class="hint">${CORE_START[S.settings.coreStart || 'advanced'].blurb} Resets every ladder — tune individual ones below afterwards.</p>
    </div>

    <p class="eyebrow">Core ladders</p>
    <p class="hint" style="margin:0 0 10px">Four qualities, ten ladders. Each session takes one from three different qualities, so nothing gets neglected. Two clean sessions moves a ladder up a rung.</p>
    ${CORE_ROTATION.map(q => `<div class="card" style="padding:12px 14px">
      <div class="mono" style="font-size:10px;letter-spacing:.1em;color:var(--dust-2);margin-bottom:6px">${q.toUpperCase()}</div>
      ${CORE_TRACKS.filter(t => t.quality === q).map(t => {
        const lv = coreLevel(t.id), pct = Math.round(((lv + 1) / t.levels.length) * 100);
        return `<div class="ladder">
          <div class="lrow"><span class="ln">${t.levels[lv].name}</span>
            <span class="step lstep">
              <button data-clv="-1" data-ct="${t.id}" aria-label="Easier">−</button>
              <span class="mono lv">${lv + 1}/${t.levels.length}</span>
              <button data-clv="1" data-ct="${t.id}" aria-label="Harder">+</button>
            </span></div>
          <div class="track"><i style="width:${pct}%"></i></div>
        </div>`;
      }).join('')}
    </div>`).join('')}

    <p class="eyebrow">Every exercise</p>
    <div class="card" style="padding:13px 14px">
      <input type="text" class="exsearch" id="libsearch" placeholder="Search ${Object.keys(ACCESSORIES).length} exercises for your working weight"
             value="${libQuery || ''}" autocomplete="off">
      ${libQuery.trim() ? (() => {
        const q = libQuery.trim().toLowerCase();
        const hits = Object.entries(ACCESSORIES).filter(([id, a]) =>
          (a.name + ' ' + a.pattern).toLowerCase().includes(q)).slice(0, 25);
        if (!hits.length) return '<p class="hint" style="margin-top:10px">Nothing matches that.</p>';
        return '<div style="margin-top:10px">' + hits.map(([id, a]) => {
          const st = S.acc[id];
          return `<div class="librow">
            <span class="ln2">${a.name}${a.dbl ? ' <em>each hand</em>' : ''}
              <span class="lp mono">${a.pattern}${a.machine ? ' · machine' : a.bar ? ' · barbell' : ''}</span></span>
            <span class="lw mono">${st.w}kg<em> × ${st.reps}</em>
              <span class="lr">range ${a.repMin}–${a.repMax}${st.lastDone ? ' · last ' + st.lastDone : ' · never done'}</span></span>
          </div>`;
        }).join('') + '</div>';
      })() : '<p class="hint" style="margin-top:8px">Type a name or a pattern — biceps, hinge, lat — to see where a lift currently sits.</p>'}
    </div>

    <p class="eyebrow">Working weights</p>
    <p class="hint" style="margin:0 0 10px">Seeded from your log. Machine numbers especially are guesses — correct them here or on the exercise itself, and it sticks.</p>
    ${Object.values(DAYS).map(d => `<div class="card" style="padding:12px 14px">
      <div class="mono" style="font-size:10px;letter-spacing:.1em;color:var(--dust-2);margin-bottom:4px">${d.label.toUpperCase()}</div>
      ${d.work.map(id => ACCESSORIES[id] ? `<div class="wrow">
        <span class="wn">${ACCESSORIES[id].name}${ACCESSORIES[id].dbl ? ' <em>each hand</em>' : ''}</span>
        <span class="step">
          <button data-wn="-1" data-wk="acc" data-wr="${id}">−</button>
          <input type="number" inputmode="decimal" value="${S.acc[id].w}" data-wv="${id}" data-wk="acc">
          <button data-wn="1" data-wk="acc" data-wr="${id}">+</button>
        </span></div>` : '').join('')}
    </div>`).join('')}

    <p class="eyebrow">Training maxes</p>
    ${Object.entries(MAINS).map(([k, m]) => `<div class="card" style="padding:12px 14px;display:flex;align-items:center;gap:10px">
      <span style="flex:1"><span class="display" style="font-size:17px">${m.name}</span>
        <span class="mono" style="display:block;font-size:11px;color:var(--dust)">top set ${barRound(S.mains[k].tm * 0.95)}kg this cycle</span></span>
      <span class="step"><button data-tm="${k}" data-d="-1">−</button>
        <input type="number" value="${S.mains[k].tm}" data-tmv="${k}" style="width:66px">
        <button data-tm="${k}" data-d="1">+</button></span></div>`).join('')}`;
}

/* ═══ progress, in sections ═════════════════════════════════ */

const PROGRESS_TABS = [
  ['status',  'Status'],
  ['lifts',   'Lifts'],
  ['volume',  'Volume'],
  ['history', 'History']
];

function renderProgress() {
  const el = $('#v-progress');
  const done = S.sessions.filter(s => s.done);
  const tabs = `<div class="subtabs">${PROGRESS_TABS.map(([k, label]) =>
    `<button data-ptab="${k}" aria-pressed="${progressTab === k}">${label}</button>`).join('')}</div>`;

  if (!done.length && progressTab !== 'status') progressTab = 'status';
  el.innerHTML = tabs + ({
    status:  progressStatus,
    lifts:   progressLifts,
    volume:  progressVolume,
    history: progressHistory
  }[progressTab] || progressStatus)(done);
}

function progressStatus(done) {
  if (!done.length) return `<div class="empty">No finished sessions yet.<br>Log one and this fills in.</div>`;
  const tr = trackStatus();
  const durs = done.filter(s => s.duration).map(s => s.duration);
  const avg = durs.length ? Math.round(durs.reduce((a, b) => a + b, 0) / durs.length / 60) : null;
  const week = done.filter(s => parseDay(s.date) >= mondayOf(new Date()));
  const v = runVerdict();
  const tonnage = week.reduce((t, s) => t + sessionTonnage(s), 0);

  return `
    <div class="status ${tr.tone}">
      <div class="verdict">${tr.verdict}</div>
      <div class="bars">
        ${statusBar('Sessions', tr.recent + ' of ' + tr.expected + ' due', tr.adherence)}
        ${statusBar('Main lifts', tr.due ? (tr.gained >= 0 ? '+' : '') + tr.gained + 'kg of ' + tr.due + 'kg due' : 'first cycle', tr.strength ?? 1)}
        ${statusBar('Volume this week', tr.short.length ? tr.short.length + ' below target' : 'all groups met', tr.short.length ? 0.45 : 1)}
      </div>
      ${tr.short.length ? `<div class="shortlist mono">light on: ${tr.short.join(', ')}</div>` : ''}
      ${tr.stalls ? `<div class="shortlist mono">${tr.stalls} lift${tr.stalls > 1 ? 's' : ''} stalled — see Today</div>` : ''}
    </div>
    <div class="stats">
      <div class="stat"><div class="k">This week</div><div class="v">${week.length}<small> sessions</small></div>
        <div class="d flat mono">${(tonnage / 1000).toFixed(1)}t moved</div></div>
      <div class="stat"><div class="k">Cycle</div><div class="v">${cycleNo(today())}<small> · wk ${weekIndex(today()) + 1}</small></div>
        <div class="d flat mono">${WAVE[weekIndex(today())].name}</div></div>
      <div class="stat"><div class="k">Typical session</div><div class="v">${avg ?? '—'}<small>${avg ? ' min' : ''}</small></div>
        <div class="d flat mono">${durs.length} timed</div></div>
      <div class="stat"><div class="k">Running</div><div class="v">${Math.round(v.ratio * 100)}<small>%</small></div>
        <div class="d ${v.ratio > 1.25 ? 'down' : 'flat'} mono">of a normal week</div></div>
      <div class="stat"><div class="k">Total sessions</div><div class="v">${done.length}</div>
        <div class="d flat mono">since ${S.created}</div></div>
      <div class="stat"><div class="k">Core ladders</div><div class="v">${CORE_TRACKS.reduce((t, x) => t + coreLevel(x.id) + 1, 0)}<small>/${CORE_TRACKS.reduce((t, x) => t + x.levels.length, 0)}</small></div>
        <div class="d flat mono">rungs climbed</div></div>
    </div>`;
}

function progressLifts(done) {
  return `
    <p class="eyebrow">Records</p>
    ${Object.entries(MAINS).map(([k, m]) => recordCard(k, m)).join('')}
    <div class="card" style="padding:14px">
      <label class="f">Log a tested single</label>
      <div style="display:flex;gap:6px">
        <select id="prlift" style="flex:1">${Object.entries(MAINS).map(([k, m]) =>
          `<option value="${k}">${m.name}</option>`).join('')}</select>
        <input type="number" id="prw" placeholder="kg" inputmode="decimal" style="width:88px">
        <button class="btn-go" id="prsave" style="flex:0 0 auto">Save</button>
      </div>
      <p class="hint">A real single you actually performed. Kept separate from the estimate.</p>
    </div>
    <p class="eyebrow">Estimated one-rep max</p>
    ${Object.entries(MAINS).map(([k, m]) => chartFor(k, m)).join('')}`;
}

function progressVolume(done) {
  const vol = setsLast7ByMuscle();
  const last8 = done.slice(-8).map(s => ({ d: s.date, t: sessionTonnage(s) }));
  const max = Math.max(1, ...last8.map(x => x.t));
  return `
    <p class="eyebrow">Sets in the last seven days</p>
    <div class="card" style="padding:13px 14px">
      ${Object.entries(VOLUME_TARGET).map(([k, target]) => {
        const n = vol[k] || 0, pct = Math.min(100, Math.round((n / target) * 100));
        return `<div class="vrow">
          <span class="vn">${k}</span>
          <span class="mono vv ${n >= target ? 'up' : n >= target * 0.7 ? 'flat' : 'down'}">${n}<em>/${target}</em></span>
          <span class="vtrack"><i style="width:${pct}%;background:${n >= target ? 'var(--good)' : n >= target * 0.7 ? 'var(--warn)' : 'var(--stall)'}"></i></span>
        </div>`;
      }).join('')}
    </div>
    <p class="eyebrow">Tonnage, last eight sessions</p>
    <div class="card" style="padding:14px">
      ${last8.length ? `<div class="tbars">${last8.map(x => `<span class="tbar" title="${x.d}">
        <i style="height:${Math.max(4, Math.round((x.t / max) * 90))}px"></i>
        <em class="mono">${(x.t / 1000).toFixed(1)}</em></span>`).join('')}</div>
        <p class="hint" style="margin-top:8px">Tonnes lifted per session, oldest on the left.</p>`
        : '<p class="hint">Nothing logged yet.</p>'}
    </div>`;
}

function progressHistory(done) {
  if (openSession) {
    const s = S.sessions.find(x => x.id === openSession);
    if (s) return sessionDetail(s);
    openSession = null;
  }
  const weeks = sessionsByWeek();
  if (!weeks.length) return `<div class="empty">No finished sessions yet.</div>`;
  return weeks.map(([wk, list]) => {
    const tot = list.reduce((t, s) => t + sessionTonnage(s), 0);
    return `<p class="eyebrow">Week of ${parseDay(wk).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
      · ${list.length} session${list.length > 1 ? 's' : ''} · ${(tot / 1000).toFixed(1)}t</p>
    ${list.map(s => {
      const e = effortOf(s);
      return `<button class="card histrow" data-open="${s.id}">
        <span class="hbadge" style="--ec:${EFFORT_COLOUR[e]}">${e}</span>
        <span class="hmain">
          <span class="hl">${s.label}</span>
          <span class="hm mono">${parseDay(s.date).toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' })}
            · ${s.club || (s.venue === 'home' ? 'Home' : '—')}${s.duration ? ' · ' + Math.round(s.duration / 60) + ' min' : ''}${s.easy ? ' · easy' : ''}</span>
        </span>
        <span class="hton mono">${(() => { const g = (s.notes || []).filter(isGain).length;
          return (g ? `<i class="gain">+${g}</i>` : '') + (sessionTonnage(s) / 1000).toFixed(1) + 't'; })()}</span>
      </button>`;
    }).join('')}`;
  }).join('');
}

function sessionDetail(s) {
  const e = effortOf(s);
  return `<button class="btn-sm btn-quiet" id="histback">← All sessions</button>
    <h2 style="font-size:21px;margin:12px 0 2px">${s.label}</h2>
    <p class="hint" style="margin:0 0 12px">${parseDay(s.date).toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' })}
      ${s.duration ? ' · ' + Math.round(s.duration / 60) + ' min' : ''}
      · session score <b style="color:${EFFORT_COLOUR[e]}">${e}/5</b>
      · ${(sessionTonnage(s) / 1000).toFixed(1)}t</p>

    <div class="card" style="padding:13px 14px">
      <label class="f">Logged at</label>
      <div class="chips">${[...CLUBS, 'Home'].map(c =>
        `<button data-setclub="${s.id}|${c}" aria-pressed="${(s.club || '') === c}">${c}</button>`).join('')}</div>
      <p class="hint">Correcting this updates the session record and every later session that inherited the same gym.</p>
    </div>

    ${!s.notes ? `<div class="card" style="padding:13px 14px">
      <p class="hint" style="margin:0">Finished before the app started recording changes, so there is no
      breakdown for it. Your weights and rep targets did move — the record just was not kept.</p>
    </div>` : ''}
    ${s.notes && !s.notes.length ? (() => {
        /* An empty ledger is not the same as a missing one. Work out why it
           is empty rather than showing a blank space. */
        const acc = s.items.filter(i => i.kind === 'acc');
        const partial = acc.filter(i => {
          const w = i.sets.filter(x => !x.warm);
          return w.some(x => x.reps == null);
        }).length;
        const missed = acc.filter(i => i.sets.some(x => x.reps != null && !x.warm && x.reps < x.target)).length;
        return `<div class="card" style="padding:13px 14px">
          <div class="mono" style="font-size:10px;letter-spacing:.1em;color:var(--dust-2);margin-bottom:6px">NOTHING MOVED</div>
          <p class="hint" style="margin:0">${
            partial ? `${partial} exercise${partial > 1 ? 's had' : ' had'} sets left unlogged — a lift only progresses when every working set is marked done.`
            : missed ? `${missed} exercise${missed > 1 ? 's fell' : ' fell'} short of target, so ${missed > 1 ? 'they held' : 'it held'} at the same weight.`
            : 'No exercise met its target across every set. The main lifts only move on the 5/3/1 week, so a week 1 or 2 session will not shift them.'}</p>
        </div>`;
      })() : ''}
    ${s.notes && s.notes.length ? `<div class="card" style="padding:13px 14px">
      <div class="mono" style="font-size:10px;letter-spacing:.1em;color:var(--dust-2);margin-bottom:8px">WHAT THIS SESSION CHANGED</div>
      <ul class="changes">${s.notes.map(changeRow).join('')}</ul>
    </div>` : ''}

    ${s.items.filter(it => it.kind !== 'prep' && it.kind !== 'mobility').map(it => `
      <div class="card readonly" style="padding:12px 14px">
        <div class="display" style="font-size:16px">${it.name}</div>
        <div class="rosets">${it.sets.map(x => `<span class="roset ${x.reps == null ? 'skipped' : x.reps >= x.target ? 'hit' : 'miss'}">
          <b class="mono">${x.w ? x.w + 'kg' : 'bw'}</b>
          <em class="mono">${x.reps == null ? '—' : x.reps}${it.unit === 'secs' ? 's' : ''}</em>
          ${x.warm ? '<i>ramp</i>' : x.rpe ? `<i>RPE ${x.rpe}</i>` : ''}
        </span>`).join('')}</div>
      </div>`).join('')}`;
}

function statusBar(label, detail, ratio) {
  const pct = Math.max(3, Math.min(100, Math.round((ratio || 0) * 100)));
  return `<div class="sbar">
    <div class="srow"><span>${label}</span><span class="mono">${detail}</span></div>
    <div class="track"><i style="width:${pct}%"></i></div>
  </div>`;
}

function recordCard(k, m) {
  const r = bestEstimate(k), st = S.mains[k];
  if (!r) return '';
  return `<div class="card rec" style="padding:13px 14px">
    <div style="display:flex;align-items:baseline;gap:8px">
      <span class="display" style="font-size:17px">${m.name}</span>
      <span class="mono" style="margin-left:auto;font-size:11px;color:var(--dust)">TM ${st.tm}kg</span>
    </div>
    <div class="recgrid">
      <div><span class="k mono">Best set</span><span class="v">${r.best ? r.best.w + '×' + r.best.reps : '—'}</span>
        <span class="d mono">${r.best ? r.best.date : ''}</span></div>
      <div><span class="k mono">Estimated</span><span class="v">${r.est ? r.est + '<small>kg</small>' : '—'}</span>
        <span class="d mono">calculated</span></div>
      <div><span class="k mono">Tested</span><span class="v ${r.tested ? 'real' : ''}">${r.tested ? r.tested.w + '<small>kg</small>' : '—'}</span>
        <span class="d mono">${r.tested ? r.tested.date : 'never tested'}</span></div>
    </div></div>`;
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
    <p class="eyebrow">Version</p>
    <div class="card build">
      <div class="brow">
        <span class="bv">${BUILD.version}</span>
        <span class="bd mono">deployed ${BUILD.date}</span>
      </div>
      ${updateState.latest && updateState.latest.version !== BUILD.version
        ? `<div class="bnew">
             <b>${updateState.latest.version} is live on the server</b>
             <span>You are running a cached copy. Reloading clears it.</span>
             <button class="btn-go" id="applyupdate">Update and reload</button>
           </div>`
        : `<p class="hint" style="margin:6px 0 0">${
             updateState.checking ? 'Checking…'
             : updateState.checked ? 'Up to date as of ' + new Date(updateState.checked).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })
             : 'Tap to see whether a newer build has been deployed.'}</p>`}
      <div class="btn-row"><button class="btn-sm" id="checkupdate" ${updateState.checking ? 'disabled' : ''}>Check for a new version</button></div>
    </div>

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

    <p class="eyebrow">Language</p>
    <div class="card" style="padding:14px">
      <div class="chips">
        <button id="lang-gym" aria-pressed="${S.settings.language !== 'clean'}">Gym</button>
        <button id="lang-clean" aria-pressed="${S.settings.language === 'clean'}">Keep it clean</button></div>
      <p class="hint">What pops up when you finish a set.</p>
    </div>

    ${Object.keys(S.clubOut || {}).some(c => outAt(c).length) ? `<p class="eyebrow">Not available</p>
    ${Object.entries(S.clubOut).filter(([, v]) => v.length).map(([club, ids]) => `<div class="card" style="padding:13px 14px">
      <div class="mono" style="font-size:11px;color:var(--dust-2);margin-bottom:7px">${club.toUpperCase()}</div>
      ${ids.map(id => `<button class="addrow" data-restore="${club}|${id}">
        <span class="an">${ACCESSORIES[id]?.name || id}</span>
        <span class="aw mono">tap to put it back</span></button>`).join('')}
    </div>`).join('')}` : ''}

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

/* ═══ build ═════════════════════════════════════════════════
   Service workers happily serve a cached build for a launch or two after a
   deploy, which makes "did my change land" unanswerable from the phone. This
   fetches the copy on the server, bypassing every cache, and compares. */

let updateState = { checking: false, latest: null, checked: null };

async function checkForUpdate(quiet) {
  updateState.checking = true;
  if (!quiet && VIEW === 'data') render();
  try {
    const res = await fetch('./data.js?t=' + Date.now(), { cache: 'no-store' });
    const txt = await res.text();
    const m = txt.match(/BUILD\s*=\s*\{\s*version:\s*'([^']+)',\s*date:\s*'([^']+)'/);
    updateState.latest = m ? { version: m[1], date: m[2] } : null;
    updateState.checked = Date.now();
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) await reg.update();
    }
  } catch (e) {
    updateState.latest = null;
  }
  updateState.checking = false;
  if (VIEW === 'data') render();
}

async function applyUpdate() {
  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg?.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      if (reg) await reg.update();
    }
    if ('caches' in window) for (const k of await caches.keys()) await caches.delete(k);
  } catch (e) { /* carry on and reload anyway */ }
  location.reload(true);
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
    if (head) {
      const card = head.parentElement, wasOpen = card.classList.contains('open');
      /* One at a time — scrolling past six expanded cards mid-set is miserable */
      for (const c of document.querySelectorAll('#v-today .card.open')) c.classList.remove('open');
      if (!wasOpen) card.classList.add('open');
      return;
    }

    const step = t.closest('.step button[data-act]');
    if (step) {
      const inp = step.parentElement.querySelector('input');
      inp.value = Math.max(0, (parseInt(inp.value) || 0) + (step.dataset.act === 'inc' ? 1 : -1));
      inp.dispatchEvent(new Event('change', { bubbles: true })); return;
    }

    /* What does this word mean */
    const what = t.closest('button.what');
    if (what) {
      const g = GLOSSARY[what.dataset.what];
      if (!g) return;
      const box = $('#sheet');
      box.innerHTML = `<h3>${g.title}</h3><p>${g.body}</p><button class="btn-go" id="sheetclose">Got it</button>`;
      box.classList.add('on'); return;
    }
    if (t.id === 'sheetclose' || t.id === 'sheet') { $('#sheet').classList.remove('on'); return; }

    /* Set actions */
    const act = t.closest('[data-do]');
    if (act) {
      const sess = $('#v-today')._sess; if (!sess) return;
      const idx = +act.closest('[data-item]').dataset.item, si = +act.dataset.set;
      const it = sess.items[idx], s = it.sets[si];
      if (act.dataset.do === 'start') {
        if (setClock?.itemIdx === idx && setClock?.setIdx === si) { stopSetClock(); redrawItem(sess, idx); }
        else { startSetClock(idx, si, it.name); redrawItem(sess, idx); }
        return;
      }
      if (act.dataset.do === 'done') return completeSet(sess, idx, si, s.target);
      if (act.dataset.do === 'edit') {
        const ed = act.closest('.card').querySelector(`[data-editor="${si}"]`);
        ed.hidden = !ed.hidden;
        if (!ed.hidden) ed.querySelector('input').focus();
        return;
      }
    }

    const adj = t.closest('[data-adj]');
    if (adj) {
      const inp = adj.parentElement.querySelector('input');
      inp.value = Math.max(0, (parseInt(inp.value) || 0) + (+adj.dataset.adj));
      return;
    }
    const sv = t.closest('[data-save]');
    if (sv) {
      const sess = $('#v-today')._sess;
      const idx = +sv.closest('[data-item]').dataset.item, si = +sv.dataset.save;
      const val = parseInt(sv.parentElement.querySelector('input').value);
      if (isNaN(val)) return toast('How many reps?');
      return completeSet(sess, idx, si, Math.max(0, val));
    }
    const undo = t.closest('[data-undo]');
    if (undo) {
      const sess = $('#v-today')._sess;
      const idx = +undo.closest('[data-item]').dataset.item, si = +undo.dataset.undo;
      const s = sess.items[idx].sets[si];
      s.reps = null; delete s.dur; delete s.rpe;
      await save(); redrawItem(sess, idx); stopRest(); return;
    }

    const cs = t.closest('[data-cstart]');
    if (cs) { setCoreStart(cs.dataset.cstart); await save(); render(); toast('Core levels set'); return; }

    const clv = t.closest('[data-clv]');
    if (clv) {
      const id = clv.dataset.ct, tr = trackOf(id);
      S.coreLevel = S.coreLevel || {};
      S.coreLevel[id] = Math.max(0, Math.min(tr.levels.length - 1, coreLevel(id) + (+clv.dataset.clv)));
      S.coreClean[id] = 0;
      await save(); render(); return;
    }

    const pt = t.closest('[data-ptab]');
    if (pt) { progressTab = pt.dataset.ptab; openSession = null; render(); return; }

    const oh = t.closest('[data-open]');
    if (oh) { openSession = oh.dataset.open; render(); scrollTo({ top: 0 }); return; }
    if (t.id === 'histback') { openSession = null; render(); return; }

    const sc = t.closest('[data-setclub]');
    if (sc) {
      const [sid, club] = sc.dataset.setclub.split('|');
      const target = S.sessions.find(x => x.id === sid);
      if (target) {
        const was = target.club;
        target.club = club;
        /* Everything logged afterwards that inherited the wrong gym gets the
           correction too, which is the point of fixing it retroactively. */
        let also = 0;
        for (const other of S.sessions)
          if (other !== target && other.done && other.club === was
              && other.date >= target.date && other.venue !== 'home') { other.club = club; also++; }
        await save(); render();
        toast(also ? `Updated, plus ${also} later session${also > 1 ? 's' : ''}` : 'Updated');
      }
      return;
    }

    const wk = t.closest('[data-week]');
    if (wk) { const i = +wk.dataset.week; openWeek = openWeek === i ? null : i; render(); return; }

    /* Warm-up and mobility have no reps to log, so they tick instead */
    const tk = t.closest('[data-tick]');
    if (tk) {
      const sess = $('#v-today')._sess;
      const [idx, mid] = tk.dataset.tick.split('|');
      const it = sess.items[+idx];
      it.doneIds = it.doneIds || [];
      it.doneIds = it.doneIds.includes(mid) ? it.doneIds.filter(x => x !== mid) : [...it.doneIds, mid];
      if (!S.sessions.find(x => x.id === sess.id)) S.sessions.push(sess);
      if (sess.adhoc) draft = sess;
      await save(); redrawItem(sess, +idx); return;
    }
    const tka = t.closest('[data-tickall]');
    if (tka) {
      const sess = $('#v-today')._sess, idx = +tka.dataset.tickall;
      const it = sess.items[idx];
      it.doneIds = (it.doneIds || []).length >= it.list.length ? [] : it.list.map(m => m.id);
      if (!S.sessions.find(x => x.id === sess.id)) S.sessions.push(sess);
      if (sess.adhoc) draft = sess;
      await save(); redrawItem(sess, idx); return;
    }

    /* Working weight */
    const wn = t.closest('[data-wn]');
    if (wn) {
      const sess = $('#v-today')._sess;
      const v = nudgeWeight(wn.dataset.wk, wn.dataset.wr, +wn.dataset.wn);
      if (v == null) return;
      applyWeightToSession(sess, +wn.dataset.wi, v);
      await save(); redrawItem(sess, +wn.dataset.wi); return;
    }

    /* Kit not available at this club */
    const un = t.closest('[data-unavailable]');
    if (un) {
      const sess = $('#v-today')._sess, idx = +un.dataset.unavailable;
      const it = sess.items[idx], id = it.ref;
      S.clubOut[S.club] = [...new Set([...(S.clubOut[S.club] || []), id])];
      const taken = new Set(sess.items.map(x => x.ref));
      const sub = substituteFor(id, taken, sess.venue === 'home');
      if (sub) {
        const a = ACCESSORIES[sub], st = S.acc[sub];
        sess.items[idx] = { kind: 'acc', ref: sub, name: a.name, note: a.note, dbl: a.dbl, bar: a.bar,
          sets: Array.from({ length: st.sets }, () => ({ w: st.w, target: st.reps, reps: null })) };
        toast(`${a.name} instead — ${S.club} will not offer that again`);
      } else {
        sess.items.splice(idx, 1);
        toast(`Removed. Nothing else covers that pattern here.`);
      }
      if (!S.sessions.find(x => x.id === sess.id)) S.sessions.push(sess);
      if (sess.adhoc) draft = sess;
      await save(); render(); return;
    }

    const rs = t.closest('[data-restore]');
    if (rs) {
      const [club, id] = rs.dataset.restore.split('|');
      S.clubOut[club] = outAt(club).filter(x => x !== id);
      await save(); render(); toast(`${ACCESSORIES[id]?.name || id} restored`); return;
    }

    /* Tested single */
    if (t.id === 'prsave') {
      const lift = $('#prlift').value, w = parseFloat($('#prw').value);
      if (!w) return toast('What did you lift?');
      S.records[lift] = S.records[lift] || {};
      S.records[lift].tested = { w, date: today() };
      const suggested = barRound(w * 0.9);
      await save();
      const box = $('#sheet');
      box.innerHTML = `<h3>${MAINS[lift].name} · ${w}kg</h3>
        <p>Logged as a tested single. Your training max for this lift is ${S.mains[lift].tm}kg; ninety percent of what you just did would be ${suggested}kg.</p>
        <button class="btn-go" id="tmset" data-lift="${lift}" data-w="${suggested}">Set training max to ${suggested}kg</button>
        <button id="sheetclose" style="margin-top:8px">Leave it where it is</button>`;
      box.classList.add('on'); return;
    }
    const tset = t.closest('#tmset');
    if (tset) {
      S.mains[tset.dataset.lift].tm = +tset.dataset.w;
      $('#sheet').classList.remove('on');
      await save(); render(); toast('Training max updated'); return;
    }

    /* Add or remove an exercise mid-session */
    if (t.closest('[data-addtoggle]')) { addOpen = !addOpen; return; }

    const add = t.closest('[data-add]');
    if (add) {
      const sess = $('#v-today')._sess, id = add.dataset.add;
      const a = ACCESSORIES[id], st = S.acc[id];
      sess.items.push({ kind: 'acc', ref: id, name: a.name, note: a.note, dbl: a.dbl, bar: a.bar,
        added: true, sets: Array.from({ length: st.sets }, () => ({ w: st.w, target: st.reps, reps: null })) });
      if (!S.sessions.find(x => x.id === sess.id)) S.sessions.push(sess);
      if (sess.adhoc) draft = sess;
      await save(); render(); toast(`${a.name} added`); return;
    }
    const rm = t.closest('[data-remove]');
    if (rm) {
      const sess = $('#v-today')._sess;
      sess.items.splice(+rm.dataset.remove, 1);
      await save(); render(); return;
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
    if (tm) { const k = tm.dataset.tm; S.mains[k].tm = barRound(S.mains[k].tm + (+tm.dataset.d) * MAINS[k].inc); await save(); render(); return; }

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

    if (t.id === 'startsession') {
      const sess = $('#v-today')._sess; if (!sess) return;
      startSession(sess);
      if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
      render(); toast('Clock running'); return;
    }
    if (t.id === 'endsession') { endSession(); render(); return; }

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
      if (S.active?.id === sess.id) { sess.duration = Math.round((Date.now() - S.active.t0) / 1000); endSession(); }
      const notes = applyProgression(sess);
      sess.notes = notes;
      if (!S.sessions.find(x => x.id === sess.id)) S.sessions.push(sess);
      draft = null; stopRest(); stopSetClock();
      await save(); await syncNow(true); render();
      showSummary(sess, notes); return;
    }

    if (t.id === 'lang-gym' || t.id === 'lang-clean') {
      S.settings.language = t.id === 'lang-clean' ? 'clean' : 'gym'; await save(); render();
      pop(phraseFor(true)); return;
    }
    if (t.id === 'ra-on' || t.id === 'ra-off') { S.settings.runAdjust = t.id === 'ra-on'; await save(); render(); return; }
    if (t.id === 'checkupdate') return checkForUpdate(false);
    if (t.id === 'applyupdate') return applyUpdate();
    if (t.id === 'sync') return syncNow(false);
    if (t.id === 'export') return exportCopy();
    if (t.id === 'import') return importFile();
    if (t.id === 'restart') {
      const wk = weekIndex(today()) + 1;
      askConfirm({
        title: 'Restart the cycle?',
        body: `You are on week ${wk} of 4${wk === 4 ? ' — the deload' : ''}. Restarting sets this Monday as week 1,
               so the wave begins again at the 5s and you skip whatever is left of the current cycle.
               Training maxes, logged sessions and working weights are all untouched.`,
        label: 'Restart from this Monday', act: 'restart'
      });
      return;
    }
    if (t.id === 'wipe') {
      const n = S.sessions.filter(x => x.done).length;
      askConfirm({
        title: 'Erase everything?',
        body: `This deletes ${n} logged session${n === 1 ? '' : 's'}, every training max, every working weight,
               your records and your core levels, and puts the app back to the day you installed it.
               ${S.lastSync ? `Your backup file is untouched — last saved ${new Date(S.lastSync).toLocaleString('en-ZA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} — so you could restore from it afterwards.`
                 : 'You have never saved a backup, so there is nothing to restore from. This cannot be undone.'}`,
        label: `Erase ${n} session${n === 1 ? '' : 's'} and all progress`, act: 'wipe', danger: true
      });
      return;
    }

    const cf = t.closest('[data-confirm]');
    if (cf) {
      $('#sheet').classList.remove('on');
      if (cf.dataset.confirm === 'restart') {
        S.cycleStart = iso(mondayOf(new Date()));
        await save(); render(); toast('Cycle restarted at week 1');
      }
      if (cf.dataset.confirm === 'wipe') {
        S = seed(); await save(); render(); toast('Erased');
      }
      return;
    }
  });

  document.addEventListener('input', e => {
    if (e.target.id === 'addsearch') { addQuery = e.target.value; addOpen = true; renderToday();
      const el = $('#addsearch'); if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); } return; }
    if (e.target.id === 'libsearch') { libQuery = e.target.value; renderPlan();
      const el = $('#libsearch'); if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); } return; }
  });

  document.addEventListener('change', async e => {
    if (e.target.matches('[data-wv]')) {
      const sess = $('#v-today')._sess;
      const v = setWeight(e.target.dataset.wk, e.target.dataset.wv, e.target.value);
      const idx = e.target.dataset.wi;
      if (sess && idx != null) { applyWeightToSession(sess, +idx, v); redrawItem(sess, +idx); }
      await save();
      if (VIEW === 'plan') render();
      return;
    }
    if (e.target.matches('[data-tmv]')) {
      S.mains[e.target.dataset.tmv].tm = barRound(parseFloat(e.target.value) || 0);
      await save();
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') { if (fileHandle) syncNow(true); return; }
    /* Back from a locked screen — recompute every clock from its timestamp */
    paintSession();
    if (timer) paintRest(); else resumeRest();
  });
}

/* ═══ boot ══════════════════════════════════════════════════ */

(async function init() {
  db = await open();
  S = await get('state') || seed();
  if (S.v !== 2) S = seed();
  fileHandle = await get('handle') || null;
  S.settings = S.settings || {}; S.settings.swaps = S.settings.swaps || {};
  S.runs = S.runs || []; S.clubW = S.clubW || {}; S.clubOut = S.clubOut || {};
  S.coreClean = S.coreClean || {}; S.coreQ = S.coreQ || [];
  if (!S.coreLevel || !Object.keys(S.coreLevel).length) {
    S.coreLevel = {};
    const rung = CORE_START[S.settings.coreStart || 'advanced'].rung;
    for (const t of CORE_TRACKS) S.coreLevel[t.id] = Math.min(rung, t.levels.length - 1);
  }
  S.settings.coreStart = S.settings.coreStart || 'advanced';
  /* Old builds stored flat core exercise ids; only track ids mean anything now. */
  S.coreSeen = (S.coreSeen || []).filter(id => CORE_TRACKS.some(t => t.id === id));
  if (!S.records) {
    S.records = {};
    for (const [k, r] of Object.entries(SEED_RECORDS)) S.records[k] = JSON.parse(JSON.stringify(r));
  }
  /* Repair a cycle start written before dates were handled in local time.
     Safe while nothing has been logged; after that, use Restart in Data. */
  const anchor = iso(mondayOf(parseDay(S.cycleStart)));
  if (anchor !== S.cycleStart) {
    S.cycleStart = S.sessions.some(s => s.done) ? anchor : iso(mondayOf(new Date()));
  }
  rehydrateSwaps();
  await save(); wire(); render(); resumeRest(); paintSession();
  setTimeout(() => checkForUpdate(true), 2500);
  if ('serviceWorker' in navigator) {
    /* updateViaCache 'none' stops the browser handing back a cached sw.js */
    navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' }).catch(() => {});
    /* When a new worker takes control, reload once so the running code matches it */
    let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloaded) return;
      reloaded = true;
      location.reload();
    });
  }
})();
