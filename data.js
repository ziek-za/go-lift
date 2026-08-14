/* Seed programme — built from Darryn's log and the week as it actually runs.
   Mon heavy lower · Tue home weak points + evening trail · Wed upper horizontal
   Thu moderate lower + easy run · Fri upper vertical · Sat long run · Sun loose */

export const BAR = 20;
export const PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];
export const PLATE_COLOUR = {
  25: '#C8202D', 20: '#1B4FA0', 15: '#E8B305',
  10: '#1E7A46', 5: '#E4E4DE', 2.5: '#9AA1AC', 1.25: '#6C7480'
};

/* Home kit: barbell, dumbbells, 50kg of plates all in, an ab wheel, a floor.
   No bench, no rack, nothing to hang from. */
export const HOME_MAX = 50;

export const MAINS = {
  squat: { name: 'Back squat',     tm: 147.5, inc: 5,   bar: true, pattern: 'squat' },
  dead:  { name: 'Deadlift',       tm: 185,   inc: 5,   bar: true, pattern: 'hinge' },
  bench: { name: 'Bench press',    tm: 117.5, inc: 2.5, bar: true, pattern: 'hpush' },
  ohp:   { name: 'Overhead press', tm: 72.5,  inc: 2.5, bar: true, pattern: 'vpush' }
};

export const WAVE = [
  { name: '5s',     sets: [[0.70, 5, false], [0.80, 5, false], [0.875, 5, true]], floor: 5 },
  { name: '3s',     sets: [[0.75, 3, false], [0.85, 3, false], [0.925, 3, true]], floor: 3 },
  { name: '5/3/1',  sets: [[0.75, 5, false], [0.85, 3, false], [0.95, 1, true]],  floor: 1 },
  { name: 'Deload', sets: [[0.55, 5, false], [0.65, 5, false], [0.75, 5, false]], floor: 0 }
];

/* `machine` means the number will not survive a change of club — cable stacks
   and plate-loaded machines differ between Wembley and Foreshore.
   `home` means it needs nothing beyond what you own. */
export const ACCESSORIES = {
  bulgarian:      { name: 'Bulgarian split squat', pattern: 'squat', w: 35, sets: 3, reps: 8, repMin: 8, repMax: 10, inc: 2.5, bar: true, note: 'Barbell on back, rear foot up.', variants: ['db-bulgarian', 'walking-lunge'] },
  'db-bulgarian': { name: 'Bulgarian split squat (dumbbell)', pattern: 'squat', w: 20, dbl: true, sets: 3, reps: 10, repMin: 8, repMax: 12, inc: 2, home: true },
  'walking-lunge':{ name: 'Walking lunge', pattern: 'squat', w: 30, sets: 3, reps: 10, repMin: 8, repMax: 12, inc: 5, bar: true, home: true },

  legpress:       { name: '45° leg press', pattern: 'squat', w: 200, sets: 3, reps: 8, repMin: 8, repMax: 10, inc: 10, machine: true, variants: ['hack', 'sl-legpress'] },
  hack:           { name: 'Hack squat', pattern: 'squat', w: 85, sets: 3, reps: 6, repMin: 6, repMax: 8, inc: 5, machine: true },
  'sl-legpress':  { name: 'Single-leg press', pattern: 'squat', w: 70, sets: 3, reps: 10, repMin: 8, repMax: 12, inc: 5, machine: true },

  frontsq:        { name: 'Front squat', pattern: 'squat', w: 90, sets: 3, reps: 8, repMin: 8, repMax: 10, inc: 2.5, bar: true, variants: ['pausesq', 'hack'] },
  pausesq:        { name: 'Pause squat', pattern: 'squat', w: 100, sets: 3, reps: 8, repMin: 6, repMax: 8, inc: 5, bar: true, note: '2s in the hole.' },

  rdl:            { name: 'Romanian deadlift', pattern: 'hinge', w: 90, sets: 3, reps: 8, repMin: 8, repMax: 10, inc: 5, bar: true, note: 'Stop at the stretch, not the floor.', variants: ['seatedgm', 'standgm'] },
  seatedgm:       { name: 'Seated good morning', pattern: 'hinge', w: 35, sets: 3, reps: 8, repMin: 8, repMax: 10, inc: 2.5, bar: true, note: '~30° torso. Hamstring track — build this one slowly.' },
  standgm:        { name: 'Standing good morning', pattern: 'hinge', w: 40, sets: 3, reps: 10, repMin: 10, repMax: 12, inc: 2.5, bar: true, home: true },

  legcurl:        { name: 'Seated leg curl', pattern: 'hinge', w: 45, sets: 3, reps: 10, repMin: 10, repMax: 12, inc: 2.5, machine: true, variants: ['sl-legcurl'] },
  'sl-legcurl':   { name: 'Single-leg lying curl', pattern: 'hinge', w: 27.5, sets: 3, reps: 8, repMin: 8, repMax: 10, inc: 2.5, machine: true },

  calf:           { name: 'Standing calf raise', pattern: 'calf', w: 80, sets: 3, reps: 10, repMin: 10, repMax: 12, inc: 5, machine: true, note: 'Stack + 80kg. Long pause at the bottom.' },
  seatedcalf:     { name: 'Seated calf raise', pattern: 'calf', w: 60, sets: 3, reps: 12, repMin: 12, repMax: 15, inc: 5, machine: true, note: 'Soleus. Cheap insurance for trail descents.' },

  bbrow:          { name: 'Bent-over barbell row', pattern: 'hpull', w: 105, sets: 3, reps: 8, repMin: 6, repMax: 8, inc: 2.5, bar: true, variants: ['machinerow', 'dbrow'] },
  machinerow:     { name: 'Free-weight row machine', pattern: 'hpull', w: 120, sets: 3, reps: 10, repMin: 10, repMax: 12, inc: 5, machine: true },
  dbrow:          { name: 'Bent-over dumbbell row', pattern: 'hpull', w: 40, sets: 3, reps: 10, repMin: 10, repMax: 12, inc: 2, home: true },
  seatedrow:      { name: 'Seated row, 45° medium grip', pattern: 'hpull', w: 90, sets: 3, reps: 10, repMin: 10, repMax: 12, inc: 5, machine: true },

  pullup:         { name: 'Weighted pull-up', pattern: 'vpull', w: 15, sets: 3, reps: 4, repMin: 4, repMax: 6, inc: 2.5, note: 'Added weight. Slow on the way down.', variants: ['latpull', 'fixedlat'] },
  latpull:        { name: 'Lat pulldown', pattern: 'vpull', w: 95, sets: 3, reps: 8, repMin: 8, repMax: 10, inc: 5, machine: true },
  fixedlat:       { name: 'Lat pulldown, fixed machine', pattern: 'vpull', w: 150, sets: 3, reps: 10, repMin: 10, repMax: 12, inc: 5, machine: true },
  strarm:         { name: 'Straight-arm pulldown', pattern: 'vpull', w: 40, sets: 3, reps: 10, repMin: 10, repMax: 12, inc: 2.5, machine: true },

  inclinebb:      { name: 'Incline barbell press', pattern: 'hpush', w: 90, sets: 3, reps: 8, repMin: 8, repMax: 9, inc: 2.5, bar: true, variants: ['inclinedb', 'smithincline'] },
  inclinedb:      { name: 'Incline dumbbell press', pattern: 'hpush', w: 23, dbl: true, sets: 3, reps: 6, repMin: 6, repMax: 8, inc: 2 },
  smithincline:   { name: 'Incline smith press', pattern: 'hpush', w: 70, sets: 3, reps: 8, repMin: 8, repMax: 10, inc: 5, machine: true },
  cableflye:      { name: 'Cable flye', pattern: 'hpush', w: 41, sets: 3, reps: 8, repMin: 8, repMax: 12, inc: 2.5, machine: true, note: 'Foam roller behind your back.' },
  pecdeck:        { name: 'Pectoral machine', pattern: 'hpush', w: 52.5, sets: 3, reps: 12, repMin: 12, repMax: 14, inc: 2.5, machine: true },
  floorpress:     { name: 'Dumbbell floor press', pattern: 'hpush', w: 24, dbl: true, sets: 3, reps: 10, repMin: 8, repMax: 12, inc: 2, home: true, note: 'Upper arms stop on the floor.' },

  dbpress:        { name: 'Seated dumbbell press', pattern: 'vpush', w: 16, dbl: true, sets: 3, reps: 8, repMin: 8, repMax: 10, inc: 2 },
  machinepress:   { name: 'Shoulder press machine', pattern: 'vpush', w: 110, sets: 3, reps: 6, repMin: 6, repMax: 8, inc: 5, machine: true },
  stdbpress:      { name: 'Standing dumbbell press', pattern: 'vpush', w: 18, dbl: true, sets: 3, reps: 8, repMin: 8, repMax: 10, inc: 2, home: true },

  leancable:      { name: 'Leaning cable lateral raise', pattern: 'lat', w: 12.5, sets: 3, reps: 8, repMin: 8, repMax: 10, inc: 1.25, machine: true, note: 'Warm the cuff first. This one bites cold.', variants: ['dblat', 'cablelat-light'] },
  dblat:          { name: 'Dumbbell lateral raise', pattern: 'lat', w: 14, sets: 3, reps: 8, repMin: 8, repMax: 10, inc: 2, home: true },
  'cablelat-light': { name: 'Cable lateral raise, light', pattern: 'lat', w: 7.5, sets: 4, reps: 12, repMin: 10, repMax: 15, inc: 1.25, machine: true },

  /* Rear delts — flagged weak. Three exposures a week, all high rep, none heavy. */
  reardb:         { name: 'Bent-over rear delt raise', pattern: 'rear', w: 8, dbl: true, sets: 3, reps: 12, repMin: 12, repMax: 15, inc: 1, home: true, note: 'Thumbs down. No shrug, no swing.', variants: ['facepull', 'revpec', 'cablerear'] },
  facepull:       { name: 'Face pull', pattern: 'rear', w: 25, sets: 3, reps: 15, repMin: 12, repMax: 18, inc: 2.5, machine: true, note: 'To the eyebrows, rotate at the end.' },
  revpec:         { name: 'Reverse pec deck', pattern: 'rear', w: 30, sets: 3, reps: 15, repMin: 12, repMax: 18, inc: 2.5, machine: true },
  cablerear:      { name: 'Single-arm cable rear delt', pattern: 'rear', w: 7.5, sets: 3, reps: 15, repMin: 12, repMax: 18, inc: 1.25, machine: true },
  proney:         { name: 'Prone Y raise on the floor', pattern: 'rear', w: 4, dbl: true, sets: 3, reps: 15, repMin: 12, repMax: 18, inc: 1, home: true, note: 'Light. Hold a beat at the top.' },

  /* Biceps — flagged weak. Three exposures, a different elbow position each time. */
  inclinecurl:    { name: 'Strict incline dumbbell curl', pattern: 'biceps', w: 16, dbl: true, sets: 3, reps: 11, repMin: 10, repMax: 12, inc: 1, note: 'No swing. Full stretch at the bottom.', variants: ['seatedhammer', 'cablecurl', 'assistcurl'] },
  ezpreacher:     { name: 'EZ-bar preacher curl', pattern: 'biceps', w: 30, sets: 3, reps: 8, repMin: 8, repMax: 10, inc: 2.5, variants: ['dbpreacher', 'inclinehammer'] },
  dbpreacher:     { name: 'Dumbbell preacher curl', pattern: 'biceps', w: 16, dbl: true, sets: 3, reps: 8, repMin: 6, repMax: 8, inc: 1 },
  inclinehammer:  { name: 'Incline hammer curl', pattern: 'biceps', w: 16, dbl: true, sets: 3, reps: 10, repMin: 8, repMax: 10, inc: 1 },
  seatedhammer:   { name: 'Seated hammer curl', pattern: 'biceps', w: 18, dbl: true, sets: 3, reps: 12, repMin: 12, repMax: 14, inc: 1, home: true },
  cablecurl:      { name: 'Single-arm cable curl, facing away', pattern: 'biceps', w: 17.5, sets: 3, reps: 8, repMin: 8, repMax: 10, inc: 1.25, machine: true },
  assistcurl:     { name: 'Concentration curl', pattern: 'biceps', w: 18, sets: 3, reps: 8, repMin: 8, repMax: 10, inc: 1, home: true },
  bbcurl:         { name: 'Standing barbell curl', pattern: 'biceps', w: 35, sets: 3, reps: 10, repMin: 8, repMax: 12, inc: 2.5, bar: true, home: true, note: 'Back to a wall if you start swinging.' },
  dragcurl:       { name: 'Drag curl', pattern: 'biceps', w: 30, sets: 3, reps: 10, repMin: 10, repMax: 12, inc: 2.5, bar: true, home: true, note: 'Bar stays against you, elbows travel back.' },

  dip:            { name: 'Weighted dip', pattern: 'triceps', w: 28, sets: 3, reps: 8, repMin: 8, repMax: 9, inc: 2.5, variants: ['closebench', 'skullcrusher'] },
  closebench:     { name: 'Close-grip bench', pattern: 'triceps', w: 75, sets: 3, reps: 8, repMin: 8, repMax: 10, inc: 2.5, bar: true },
  skullcrusher:   { name: 'Skull crusher', pattern: 'triceps', w: 30, sets: 3, reps: 10, repMin: 8, repMax: 10, inc: 2.5, bar: true },
  ropepush:       { name: 'Rope triceps pushdown', pattern: 'triceps', w: 27.5, sets: 3, reps: 10, repMin: 10, repMax: 12, inc: 2.5, machine: true, variants: ['rollingbar', 'overheadrope'] },
  rollingbar:     { name: 'Rolling bar pushdown', pattern: 'triceps', w: 35, sets: 3, reps: 12, repMin: 12, repMax: 14, inc: 2.5, machine: true },
  overheadrope:   { name: 'Overhead rope extension', pattern: 'triceps', w: 25, sets: 3, reps: 8, repMin: 8, repMax: 10, inc: 2.5, machine: true },
  dbohext:        { name: 'Overhead dumbbell extension', pattern: 'triceps', w: 22, sets: 3, reps: 10, repMin: 8, repMax: 12, inc: 2, home: true, note: 'Two hands, one dumbbell.' },
  floorskull:     { name: 'Floor skull crusher', pattern: 'triceps', w: 25, sets: 3, reps: 10, repMin: 10, repMax: 12, inc: 2.5, bar: true, home: true }
};

/* Core pool — eighteen movements across five qualities, rotated so nothing
   repeats until the pool has turned over. `home` marks what works on a floor. */
export const CORE = [
  { id: 'hang-bar',    name: 'Hanging leg raise to bar',          unit: 'reps', target: 8,  w: 0,    tag: 'flexion' },
  { id: 'hang-top',    name: 'Hanging leg raise to top',          unit: 'reps', target: 8,  w: 0,    tag: 'flexion' },
  { id: 'hang-half',   name: 'Hanging raise to half, controlled', unit: 'reps', target: 8,  w: 0,    tag: 'flexion', note: 'Pause at the top.' },
  { id: 'rollout',     name: 'Ab wheel rollout',                  unit: 'reps', target: 10, w: 0,    tag: 'antiext', home: true },
  { id: 'rollout-st',  name: 'Ab wheel, standing to knees',       unit: 'reps', target: 6,  w: 0,    tag: 'antiext', home: true, note: 'Only once the kneeling version is easy.' },
  { id: 'cablecrunch', name: 'Cable crunch',                      unit: 'reps', target: 18, w: 42.5, tag: 'flexion' },
  { id: 'vertraise',   name: 'Vertical leg raise, weighted',      unit: 'reps', target: 8,  w: 9,    tag: 'flexion' },
  { id: 'inclraise',   name: 'Incline bench leg raise',           unit: 'reps', target: 11, w: 0,    tag: 'flexion' },
  { id: 'sideplank',   name: 'Side plank, top leg raised',        unit: 'secs', target: 40, w: 0,    tag: 'lateral', home: true },
  { id: 'copenhagen',  name: 'Copenhagen plank',                  unit: 'secs', target: 25, w: 0,    tag: 'lateral', home: true, note: 'Adductors. Worth its weight for trail running.' },
  { id: 'pallof',      name: 'Pallof press',                      unit: 'reps', target: 12, w: 20,   tag: 'antirot' },
  { id: 'suitcase',    name: 'Suitcase carry',                    unit: 'secs', target: 40, w: 32,   tag: 'antilat', home: true, note: 'One side. Do not lean.' },
  { id: 'twist',       name: 'Seated twist, weight in hands',     unit: 'secs', target: 35, w: 10,   tag: 'antirot', home: true },
  { id: 'hollow',      name: 'Hollow body hold',                  unit: 'secs', target: 35, w: 0,    tag: 'antiext', home: true },
  { id: 'deadbug',     name: 'Dead bug, slow',                    unit: 'reps', target: 10, w: 0,    tag: 'antiext', home: true },
  { id: 'birddog',     name: 'Bird dog',                          unit: 'reps', target: 10, w: 0,    tag: 'antirot', home: true },
  { id: 'dbswing',     name: 'Dumbbell swing',                    unit: 'reps', target: 25, w: 20,   tag: 'hinge',   home: true },
  { id: 'plankpause',  name: 'Plank, 5s pauses',                  unit: 'secs', target: 50, w: 0,    tag: 'antiext', home: true }
];

export const MOBILITY = [
  { id: 'm-9090',   name: '90/90 hip switch',             secs: 120 },
  { id: 'm-couch',  name: 'Couch stretch',                secs: 120, note: '60s a side.' },
  { id: 'm-ankle',  name: 'Ankle dorsiflexion rock',      secs: 90,  note: 'Knee past toes, heel down.' },
  { id: 'm-adduct', name: 'Adductor rock back',           secs: 90 },
  { id: 'm-tspine', name: 'Thoracic opener over a bench', secs: 90 },
  { id: 'm-hang',   name: 'Dead hang',                    secs: 60 },
  { id: 'm-wgs',    name: "World's greatest stretch",     secs: 120 },
  { id: 'm-calf',   name: 'Soleus wall stretch',          secs: 90,  note: 'Bent knee. Trail descents load this hard.' },
  { id: 'm-glute',  name: 'Glute bridge, slow',           secs: 90 },
  { id: 'm-band',   name: 'Band shoulder pass-through',   secs: 90 },
  { id: 'm-ham',    name: 'Hamstring floss, gentle',      secs: 90,  note: 'Nothing sharp. Back off if it grabs.' }
];

/* The week. Thursday is deliberately the lighter lower day — it carries a run. */
export const DAYS = {
  lowerA: {
    key: 'lowerA', label: 'Lower · heavy', weekday: 1, venue: 'gym', load: 'heavy',
    main: 'squat', backoff: { pct: 0.65, sets: 3, reps: 8 },
    work: ['bulgarian', 'legpress', 'legcurl', 'calf'], core: 2, mobility: 5
  },
  home: {
    key: 'home', label: 'Home · weak points', weekday: 2, venue: 'home', load: 'light',
    main: null, work: ['bbcurl', 'seatedhammer', 'reardb', 'proney', 'dbohext'],
    core: 3, mobility: 0,
    note: 'Trail run tonight. Nothing here should touch your legs.'
  },
  upperA: {
    key: 'upperA', label: 'Upper · horizontal', weekday: 3, venue: 'gym', load: 'heavy',
    main: 'bench', backoff: { pct: 0.65, sets: 3, reps: 8 },
    work: ['bbrow', 'pullup', 'inclinecurl', 'facepull', 'dip'], core: 0, mobility: 0
  },
  lowerB: {
    key: 'lowerB', label: 'Lower · moderate', weekday: 4, venue: 'gym', load: 'moderate',
    main: 'dead', backoff: { pct: 0.65, sets: 2, reps: 5 },
    work: ['frontsq', 'rdl', 'sl-legcurl', 'seatedcalf'], core: 2, mobility: 5,
    note: 'Easy run today. Volume is trimmed on purpose — do not add it back.'
  },
  upperB: {
    key: 'upperB', label: 'Upper · vertical', weekday: 5, venue: 'gym', load: 'heavy',
    main: 'ohp', backoff: { pct: 0.65, sets: 3, reps: 8 },
    work: ['inclinebb', 'fixedlat', 'leancable', 'ezpreacher', 'ropepush'], core: 0, mobility: 0
  }
};

export const ADHOC_FOCUS = {
  weakpoints: { label: 'Weak points', patterns: ['biceps', 'rear', 'core'] },
  arms:       { label: 'Arms',        patterns: ['biceps', 'triceps'] },
  shoulders:  { label: 'Shoulders',   patterns: ['lat', 'rear', 'vpush'] },
  back:       { label: 'Back',        patterns: ['hpull', 'vpull'] },
  chest:      { label: 'Chest',       patterns: ['hpush'] },
  legs:       { label: 'Legs',        patterns: ['squat', 'hinge', 'calf'] },
  core:       { label: 'Core only',   patterns: ['core'] }
};

/* Running. Load units are minutes weighted by effort — crude, but it tracks
   the thing that actually interferes with lifting. */
export const RUN_TYPES = {
  easy:     { label: 'Easy',        factor: 1.0 },
  moderate: { label: 'Moderate',    factor: 1.4 },
  long:     { label: 'Long',        factor: 1.25 },
  hard:     { label: 'Hard / trail', factor: 1.9 }
};

/* 30–50km a week across three runs sits about here. Recalculated from your own
   trailing four weeks as soon as there are four weeks to read. */
export const RUN_BASELINE = 260;

/* Seconds of rest, before adjustment for a missed set or a high RPE. */
export const REST = {
  warm: 60, mainHeavy: 240, mainMid: 180, backoff: 150,
  compound: 150, isolation: 90, highRep: 60, core: 45
};

export const RECOVERY_WINDOW_H = 40;
export const CLUBS = ['Wembley Square', 'Foreshore', 'Other'];
