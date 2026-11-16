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
  squat: { name: 'Back squat',     tm: 145, inc: 5, bar: true, pattern: 'squat' },
  dead:  { name: 'Deadlift',       tm: 185, inc: 5, bar: true, pattern: 'hinge' },
  bench: { name: 'Bench press',    tm: 115, inc: 5, bar: true, pattern: 'hpush' },
  ohp:   { name: 'Overhead press', tm: 70,  inc: 5, bar: true, pattern: 'vpush' }
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
  bulgarian:      { name: 'Bulgarian split squat', pattern: 'squat', w: 35, sets: 2, reps: 8, repMin: 8, repMax: 10, inc: 5, bar: true, note: 'Barbell on back, rear foot up.', variants: ['db-bulgarian', 'walking-lunge'] },
  'db-bulgarian': { name: 'Bulgarian split squat (dumbbell)', pattern: 'squat', w: 20, dbl: true, sets: 3, reps: 10, repMin: 8, repMax: 12, inc: 2, home: true },
  /* Reps are total steps, alternating, so they move in twos: an odd number
     gives one leg an extra rep every set. */
  'walking-lunge':{ name: 'Walking lunge', pattern: 'squat', w: 30, sets: 3, reps: 10, repMin: 8, repMax: 12, repStep: 2, inc: 5, bar: true, home: true, note: 'Counted as total steps, alternating — so always an even number, and both legs do the same work.' },

  legpress:       { name: '45° leg press', pattern: 'squat', w: 200, sets: 2, reps: 8, repMin: 8, repMax: 10, inc: 10, machine: true, variants: ['hack', 'sl-legpress'] },
  hack:           { name: 'Hack squat', pattern: 'squat', w: 85, sets: 3, reps: 6, repMin: 6, repMax: 8, inc: 5, machine: true },
  'sl-legpress':  { name: 'Single-leg press', pattern: 'squat', w: 70, sets: 3, reps: 10, repMin: 8, repMax: 12, inc: 5, machine: true },


  /* Knee extension. You cannot isolate the vastus medialis — it is one head
     of the quadriceps and grows when the quads grow — but the last 30° of
     lockout recruits it hardest, and that is the range squats give you least
     of. Hence a hard, paused lockout on every rep. */
  legext:         { name: 'Leg extension', iso: true, pattern: 'squat', w: 60, sets: 3, reps: 12, repMin: 10, repMax: 15, inc: 5, machine: true, note: 'Squeeze hard at full lockout and hold a second there. Toes pointed slightly out. Three seconds on the way down — the lowering builds as much as the lifting.', variants: ['legext-sl', 'sissy'] },
  'legext-sl':    { name: 'Single-leg extension', iso: true, pattern: 'squat', w: 57.5, sets: 3, reps: 12, repMin: 10, repMax: 15, inc: 2.5, machine: true, note: 'One leg at a time finds the side that is lagging, which is usually the one you cannot see.' },
  sissy:          { name: 'Sissy squat', pattern: 'squat', w: 0, sets: 3, reps: 10, repMin: 8, repMax: 15, inc: 2.5, home: true, note: 'Hold something for balance, knees travel forward, hips stay extended. Brutal on the quads through the deepest knee flexion — the other end of the range from a leg extension.' },
  'goblet-heel':  { name: 'Heel-elevated goblet squat', pattern: 'squat', w: 24, sets: 3, reps: 12, repMin: 10, repMax: 15, inc: 2, home: true, note: 'Heels on a plate, upright torso, all the way down. The elevation shifts the work onto the quads and off the hips.' },
  beltsq:         { name: 'Belt squat', pattern: 'squat', w: 80, sets: 3, reps: 10, repMin: 8, repMax: 12, inc: 5, machine: true, note: 'Load hangs from the hips, so the spine carries nothing. Quads and glutes get a full squat with no bar on the back — which is why it sits well on the day after a hard trail run.', variants: ['hack', 'legpress'] },
  frontsq:        { name: 'Front squat', pattern: 'squat', w: 90, sets: 3, reps: 8, repMin: 8, repMax: 10, inc: 5, bar: true, variants: ['pausesq', 'hack', 'beltsq'] },
  pausesq:        { name: 'Pause squat', pattern: 'squat', w: 100, sets: 3, reps: 8, repMin: 6, repMax: 8, inc: 5, bar: true, note: '2s in the hole.' },

  /* The one lift in the programme aimed at the lower back rounding and tiring
     in a chair. That is an endurance problem in the spinal erectors, and this
     trains exactly those muscles — with load that progresses, which a
     bodyweight hold on the floor never could. */
  backext:        { name: '45° back extension', iso: true, pattern: 'hinge', w: 10, sets: 3, reps: 12, repMin: 12, repMax: 15, inc: 2.5, machine: true, note: 'Hips just over the pad. Round down over it, then come up to a straight line — not past it. Holding a plate to the chest is how it progresses.', variants: ['seatedgm', 'standgm'] },
  rdl:            { name: 'Romanian deadlift', pattern: 'hinge', w: 90, sets: 2, reps: 8, repMin: 8, repMax: 10, inc: 5, bar: true, note: 'Stop at the stretch, not the floor.', variants: ['seatedgm', 'standgm'] },
  seatedgm:       { name: 'Seated good morning', pattern: 'hinge', w: 35, sets: 3, reps: 8, repMin: 8, repMax: 12, inc: 5, bar: true, note: '~30° torso. Hamstring track — build this one slowly.' },
  standgm:        { name: 'Standing good morning', pattern: 'hinge', w: 40, sets: 3, reps: 10, repMin: 10, repMax: 15, inc: 5, bar: true, home: true },

  legcurl:        { name: 'Seated leg curl', iso: true, pattern: 'hinge', w: 45, sets: 3, reps: 10, repMin: 10, repMax: 12, inc: 2.5, machine: true, variants: ['sl-legcurl'] },
  'sl-legcurl':   { name: 'Single-leg lying curl', iso: true, pattern: 'hinge', w: 27.5, sets: 3, reps: 8, repMin: 8, repMax: 10, inc: 2.5, machine: true },

  calf:           { name: 'Standing calf raise', pattern: 'calf', w: 140, sets: 3, reps: 10, repMin: 10, repMax: 12, inc: 5, machine: true, note: 'Your log said stack + 80kg, so this is a guess at the total. Set it properly on the first session.' },
  seatedcalf:     { name: 'Seated calf raise', pattern: 'calf', w: 60, sets: 3, reps: 12, repMin: 12, repMax: 15, inc: 5, machine: true, note: 'Soleus. Cheap insurance for trail descents.' },


  /* Traps — you had shrugs in your log and I dropped them. For traps that
     pop at the top, heavy and high-rep both work; the mistake is rolling
     the shoulders instead of driving them straight up. */
  'shrug-bb':     { name: 'Barbell shrug', pattern: 'traps', w: 100, sets: 4, reps: 12, repMin: 10, repMax: 15, inc: 5, bar: true, note: 'Straight up, not round. Pause a beat at the top — the range is small, so the squeeze is the exercise.', variants: ['shrug-db', 'shrug-machine'] },
  'shrug-db':     { name: 'Dumbbell shrug', pattern: 'traps', w: 40, dbl: true, sets: 4, reps: 15, repMin: 12, repMax: 18, inc: 2, note: 'Arms hang, shoulders to ears. No rolling.' },
  'shrug-machine':{ name: 'Shrug on the press machine', pattern: 'traps', w: 180, sets: 3, reps: 13, repMin: 12, repMax: 15, inc: 10, machine: true, variants: ['shrug-db', 'shrug-hold'] },
  'shrug-hold':   { name: 'Shrug with a hold', pattern: 'traps', w: 80, sets: 3, reps: 8, repMin: 8, repMax: 10, inc: 5, bar: true, note: 'Three seconds at the top of every rep.' },

  /* Forearms — nothing was training them directly, and they are the one
     part of an aesthetic upper body you cannot hide under a sleeve. */
  revcurl:        { name: 'Reverse curl', pattern: 'forearms', w: 25, sets: 3, reps: 12, repMin: 10, repMax: 16, inc: 5, bar: true, home: true, note: 'Overhand, elbows pinned. Builds the brachioradialis, which is what makes the forearm look thick from the front.', variants: ['hammerrope', 'wristcurl'] },
  wristcurl:      { name: 'Wrist curl', pattern: 'forearms', w: 25, sets: 3, reps: 15, repMin: 12, repMax: 22, inc: 5, bar: true, home: true, note: 'Forearms on a bench or your thighs, let the bar roll to the fingertips, then curl it back.' },
  revwrist:       { name: 'Reverse wrist curl', pattern: 'forearms', w: 8, dbl: true, sets: 2, reps: 15, repMin: 12, repMax: 20, inc: 1, home: true, note: 'Dumbbells, deliberately — a 5kg jump on a lift this light is 40 percent. The extensors balance all the gripping and keep the elbow happy.' },
  hammerrope:     { name: 'Rope hammer curl', pattern: 'forearms', w: 25, sets: 3, reps: 12, repMin: 10, repMax: 15, inc: 2.5, machine: true },
  farmerhold:     { name: "Farmer's hold", pattern: 'forearms', grip: true, w: 40, dbl: true, sets: 3, reps: 40, repMin: 30, repMax: 60, inc: 2, home: true, note: 'Seconds, not reps. Heaviest you can hold with a full grip, stood tall.' },

  /* Bands and bodyweight — the home day had no pressing and no pulling at all,
     because everything needing a bar or a bench was ruled out. Bands cover the
     pulling; push-up variations cover the pressing. */
  pushup:         { name: 'Push-up', pattern: 'hpush', bodyweight: true, w: 0, sets: 3, reps: 15, repMin: 12, repMax: 25, inc: 0, home: true, note: 'Hands under the shoulders, elbows about 45°, body in one line. When 25 is easy, elevate the feet rather than adding reps.', variants: ['pushup-feet', 'pushup-weighted', 'pushup-deficit'] },
  'pushup-feet':  { name: 'Feet-elevated push-up', pattern: 'hpush', bodyweight: true, w: 0, sets: 3, reps: 12, repMin: 10, repMax: 20, inc: 0, home: true, note: 'Feet on a chair. Shifts the load upward onto the upper chest and shoulders.' },
  'pushup-deficit': { name: 'Deficit push-up', pattern: 'hpush', bodyweight: true, w: 0, sets: 3, reps: 12, repMin: 10, repMax: 18, inc: 0, home: true, note: 'Hands on two books or dumbbells so the chest drops below them. The deep stretch at the bottom is the point.' },
  'pushup-weighted': { name: 'Weighted push-up', pattern: 'hpush', bodyweight: true, w: 10, sets: 3, reps: 12, repMin: 8, repMax: 15, inc: 2.5, home: true, note: 'Plate on the upper back, or a loaded backpack. Once bodyweight sets run past 20 this is the way forward.' },
  pikepush:       { name: 'Pike push-up', pattern: 'vpush', bodyweight: true, w: 0, sets: 3, reps: 10, repMin: 8, repMax: 15, inc: 0, home: true, note: 'Hips high, head travels to the floor between the hands. The closest thing to an overhead press without a rack.' },

  bandrow:        { name: 'Band row', pattern: 'hpull', band: true, w: 0, sets: 3, reps: 15, repMin: 12, repMax: 20, inc: 0, home: true, note: 'Anchor the band at waist height, or sit with it round your feet. Pull to the belly, squeeze, slow release. Step back to make it harder.', variants: ['bandrow-single', 'dbrow'] },
  'bandrow-single': { name: 'Single-arm band row', pattern: 'hpull', band: true, w: 0, sets: 4, reps: 15, repMin: 12, repMax: 20, inc: 0, home: true, note: 'One side at a time finds the weaker one.' },
  bandpullover:   { name: 'Band pull-over', pattern: 'vpull', band: true, w: 0, sets: 3, reps: 15, repMin: 12, repMax: 20, inc: 0, home: true, note: 'Anchor high, arms straight, pull down to the thighs. The closest you get to a lat pulldown without a bar — and it is a genuine lat builder.', variants: ['bandlat', 'strarm'] },
  bandlat:        { name: 'Band lat pulldown, kneeling', pattern: 'vpull', band: true, w: 0, sets: 3, reps: 15, repMin: 12, repMax: 20, inc: 0, home: true, note: 'Anchor above a door, kneel, pull the elbows down and back.' },
  bandpullapart:  { name: 'Band pull-apart', pattern: 'rear', band: true, w: 0, sets: 4, reps: 20, repMin: 15, repMax: 30, inc: 0, home: true, note: 'Straight arms, pull to the chest, squeeze the blades. High reps, no shrugging. Cheap volume for a weak point.' },
  bandfacepull:   { name: 'Band face pull', pattern: 'rear', band: true, w: 0, sets: 4, reps: 18, repMin: 15, repMax: 25, inc: 0, home: true, note: 'To the eyebrows, rotate the knuckles up at the end.' },
  bandlateral:    { name: 'Band lateral raise', pattern: 'lat', band: true, w: 0, sets: 3, reps: 18, repMin: 15, repMax: 25, inc: 0, home: true, note: 'Band under the feet. Resistance builds towards the top, which is the opposite of a dumbbell — worth having both.' },
  bandcurl:       { name: 'Band curl', pattern: 'biceps', band: true, w: 0, sets: 3, reps: 18, repMin: 15, repMax: 25, inc: 0, home: true, note: 'Hardest at the top where a dumbbell is easiest.' },
  bandpushdown:   { name: 'Band pushdown', pattern: 'triceps', band: true, w: 0, sets: 3, reps: 18, repMin: 15, repMax: 25, inc: 0, home: true, note: 'Anchor high, elbows pinned, lock out hard.' },
  bbrow:          { name: 'Bent-over barbell row', pattern: 'hpull', w: 105, sets: 3, reps: 8, repMin: 6, repMax: 8, inc: 5, bar: true, variants: ['machinerow', 'dbrow'] },
  /* `was` keeps the names this exercise has had, so a history note written
     under an old name can still be matched back to it. */
  machinerow:     { name: 'T-bar row machine', was: ['Free-weight row machine'], pattern: 'hpull', w: 120, sets: 3, reps: 10, repMin: 10, repMax: 12, inc: 5, machine: true, variants: ['csrow', 'seatedrow'], note: 'Plate-loaded, chest off the pad, torso hinged. The one you have been loading — the weight history follows the name.' },
  csrow:          { name: 'Chest-supported row, wide grip', pattern: 'hpull', w: 60, sets: 3, reps: 12, repMin: 10, repMax: 14, inc: 5, machine: true, note: 'Chest stays on the pad and the elbows flare wide — that angle hits the mid-back and rear delts rather than the lats, so it earns its own slot alongside the T-bar.' },
  dbrow:          { name: 'Bent-over dumbbell row', pattern: 'hpull', w: 40, sets: 3, reps: 10, repMin: 10, repMax: 12, inc: 2, home: true },
  seatedrow:      { name: 'Seated row, 45° medium grip', pattern: 'hpull', w: 90, sets: 3, reps: 10, repMin: 10, repMax: 12, inc: 5, machine: true },

  pullup:         { name: 'Weighted pull-up', pattern: 'vpull', addedWeight: true, w: 15, sets: 3, reps: 4, repMin: 4, repMax: 6, inc: 2.5, note: 'Added weight. Slow on the way down.', variants: ['latpull', 'fixedlat'] },
  latpull:        { name: 'Lat pulldown', pattern: 'vpull', w: 95, sets: 3, reps: 8, repMin: 8, repMax: 10, inc: 5, machine: true },
  fixedlat:       { name: 'Lat pulldown, fixed machine', pattern: 'vpull', w: 150, sets: 3, reps: 10, repMin: 10, repMax: 12, inc: 5, machine: true },
  strarm:         { name: 'Straight-arm pulldown', iso: true, pattern: 'vpull', w: 40, sets: 3, reps: 10, repMin: 10, repMax: 12, inc: 2.5, machine: true },

  inclinebb:      { name: 'Incline barbell press', pattern: 'hpush', w: 90, sets: 3, reps: 8, repMin: 8, repMax: 9, inc: 5, bar: true, variants: ['inclinedb', 'smithincline'] },
  /* Thursday's full-body presses. Both are standing, so the legs and trunk
     brace the whole lift — which is what makes them full-body rather than
     another bench variation — and neither loads the elbow flexors. */
  cablerow1:      { name: 'Standing single-arm cable row', pattern: 'hpull', w: 25, sets: 3, reps: 10, repMin: 10, repMax: 12, inc: 2.5, machine: true, note: 'Staggered stance, cable at chest height, neutral handle. Row to the hip without letting the shoulders turn — the trunk resisting the twist is what makes it full-body. One arm at a time, so each side works at its own weight.', variants: ['dbrow', 'machinerow'] },
  landminepress:  { name: 'Landmine press, two hands', pattern: 'hpush', w: 20, sets: 3, reps: 10, repMin: 8, repMax: 12, inc: 2.5, note: 'Log the plates on the end of the bar, not the bar. Staggered stance, bar held at the chest with both hands, press up and forward until the arms are long. The angle lands between a flat and an incline press, so it works the upper chest without the shoulder strain of pressing overhead.', variants: ['inclinedb', 'smithincline'] },
  dbpushpress:    { name: 'Dumbbell push press', pattern: 'vpush', w: 20, dbl: true, sets: 3, reps: 8, repMin: 6, repMax: 10, inc: 2, note: 'Dumbbells at the shoulders. Dip the knees a few centimetres, drive up hard, and let that drive start the press — the legs begin it, the shoulders finish it. Lower slowly; the lowering is where the shoulders do the most work.', variants: ['stdbpress', 'dbpress'] },
  inclinedb:      { name: 'Incline dumbbell press', pattern: 'hpush', w: 23, dbl: true, sets: 3, reps: 6, repMin: 6, repMax: 8, inc: 2 },
  smithincline:   { name: 'Incline smith press', pattern: 'hpush', w: 70, sets: 3, reps: 8, repMin: 8, repMax: 10, inc: 5, machine: true },
  cableflye:      { name: 'Cable flye', iso: true, pattern: 'hpush', w: 41, sets: 3, reps: 8, repMin: 8, repMax: 12, inc: 2.5, machine: true, note: 'Foam roller behind your back.' },
  pecdeck:        { name: 'Pectoral machine', iso: true, pattern: 'hpush', w: 52.5, sets: 3, reps: 12, repMin: 12, repMax: 14, inc: 2.5, machine: true },
  flatdb:         { name: 'Flat dumbbell press', pattern: 'hpush', w: 30, dbl: true, sets: 3, reps: 8, repMin: 8, repMax: 10, inc: 2, note: 'Flat, not incline — the sternal pec does the most work here and it is the fibre that makes a chest look thick from the side. Dumbbells let the hands come together at the top, which a bar cannot.', variants: ['chestpress', 'inclinedb'] },
  chestpress:     { name: 'Chest press machine', pattern: 'hpush', w: 70, sets: 3, reps: 10, repMin: 10, repMax: 12, inc: 5, machine: true, note: 'Fixed path, so you can push to genuine failure without a spotter. Good second press of the week when bench has already taken the heavy work.', variants: ['flatdb', 'smithincline'] },
  declinedb:      { name: 'Decline dumbbell press', pattern: 'hpush', w: 26, dbl: true, sets: 3, reps: 10, repMin: 8, repMax: 12, inc: 2, note: 'Bench on the shallowest decline it has. The lower sternal fibres are the one part of the chest that neither bench nor an incline reaches well, and they are what squares off the bottom edge.', variants: ['chestpress', 'flatdb'] },
  dbflye:         { name: 'Dumbbell flye, flat bench', iso: true, pattern: 'hpush', w: 14, dbl: true, sets: 3, reps: 12, repMin: 10, repMax: 15, inc: 2, note: 'Soft elbows, wide arc, stretch at the bottom. Loaded stretch is where a flye earns its place — do not turn it into a press.', variants: ['cableflye', 'pecdeck'] },
  floorpress:     { name: 'Dumbbell floor press', pattern: 'hpush', w: 24, dbl: true, sets: 3, reps: 10, repMin: 8, repMax: 12, inc: 2, home: true, note: 'Upper arms stop on the floor.' },

  dbpress:        { name: 'Seated dumbbell press', pattern: 'vpush', w: 16, dbl: true, sets: 3, reps: 8, repMin: 8, repMax: 10, inc: 2 },
  machinepress:   { name: 'Shoulder press machine', pattern: 'vpush', w: 110, sets: 3, reps: 6, repMin: 6, repMax: 8, inc: 5, machine: true },
  stdbpress:      { name: 'Standing dumbbell press', pattern: 'vpush', w: 18, dbl: true, sets: 3, reps: 8, repMin: 8, repMax: 10, inc: 2, home: true },

  leancable:      { name: 'Leaning cable lateral raise', pattern: 'lat', w: 12.5, sets: 4, reps: 8, repMin: 8, repMax: 12, inc: 1.25, machine: true, note: 'Lean away from the stack, arm crossing the body at the bottom. That bottom position is why this one carries the most sets. Warm the cuff first — it bites cold.', variants: ['dblat', 'cablelat-light'] },
  dblat:          { name: 'Dumbbell lateral raise', pattern: 'lat', w: 14, sets: 4, reps: 8, repMin: 8, repMax: 12, inc: 2, home: true, note: 'Raise in the scapular plane — arms about 30° in front of your body, not straight out to the sides — with thumbs neutral. That keeps the space the rotator cuff runs through open. Turning the thumbs down closes it, which is the usual reason laterals start to ache.' },
  leandb:         { name: 'Leaning dumbbell lateral raise', pattern: 'lat', w: 8, sets: 3, reps: 12, repMin: 10, repMax: 15, inc: 1, home: true, note: 'Hold a rack upright and lean away. The lean loads the bottom of the range, which the standing version misses entirely.' },
  'cablelat-light': { name: 'Cable lateral raise, light', pattern: 'lat', w: 7.5, sets: 4, reps: 12, repMin: 10, repMax: 15, inc: 1.25, machine: true, note: 'Last set: when the reps stop, keep going with half reps out of the bottom until you cannot.' },

  /* Rear delts — flagged weak. Three exposures a week, all high rep, none heavy. */
  reardb:         { name: 'Bent-over rear delt raise', pattern: 'rear', w: 8, dbl: true, sets: 3, reps: 12, repMin: 12, repMax: 15, inc: 1, home: true, note: 'Thumbs down. No shrug, no swing.', variants: ['facepull', 'cablerear', 'proney'] },
  facepull:       { name: 'Face pull', pattern: 'rear', w: 25, sets: 4, reps: 15, repMin: 12, repMax: 18, inc: 2.5, machine: true, note: 'To the eyebrows, rotate at the end.' },
  cablerear:      { name: 'Single-arm cable rear delt', pattern: 'rear', w: 7.5, sets: 4, reps: 15, repMin: 12, repMax: 18, inc: 1.25, machine: true },
  proney:         { name: 'Prone Y raise on the floor', pattern: 'rear', w: 4, dbl: true, sets: 3, reps: 15, repMin: 12, repMax: 18, inc: 1, home: true, note: 'Light. Hold a beat at the top.' },

  /* Biceps — flagged weak. Three exposures, a different elbow position each time. */
  inclinecurl:    { name: 'Strict incline dumbbell curl', pattern: 'biceps', w: 16, dbl: true, sets: 3, reps: 11, repMin: 10, repMax: 12, inc: 1, note: 'No swing. Full stretch at the bottom.', variants: ['seatedhammer', 'cablecurl', 'assistcurl'] },
  ezpreacher:     { name: 'EZ-bar preacher curl', pattern: 'biceps', w: 30, sets: 3, reps: 8, repMin: 8, repMax: 10, inc: 2.5, variants: ['dbpreacher', 'inclinehammer'] },
  dbpreacher:     { name: 'Dumbbell preacher curl', pattern: 'biceps', w: 16, dbl: true, sets: 3, reps: 8, repMin: 6, repMax: 8, inc: 1 },
  inclinehammer:  { name: 'Incline hammer curl', pattern: 'biceps', w: 16, dbl: true, sets: 3, reps: 10, repMin: 8, repMax: 10, inc: 1 },
  seatedhammer:   { name: 'Seated hammer curl', pattern: 'biceps', w: 18, dbl: true, sets: 3, reps: 12, repMin: 12, repMax: 14, inc: 1, home: true },
  cablecurl:      { name: 'Single-arm cable curl, facing away', pattern: 'biceps', w: 17.5, sets: 3, reps: 8, repMin: 8, repMax: 10, inc: 1.25, machine: true },
  assistcurl:     { name: 'Concentration curl', pattern: 'biceps', w: 18, sets: 3, reps: 8, repMin: 8, repMax: 10, inc: 1, home: true },
  bbcurl:         { name: 'Standing barbell curl', pattern: 'biceps', w: 35, sets: 3, reps: 10, repMin: 8, repMax: 14, inc: 5, bar: true, home: true, note: 'Back to a wall if you start swinging.' },
  dragcurl:       { name: 'Drag curl', pattern: 'biceps', w: 30, sets: 4, reps: 10, repMin: 10, repMax: 14, inc: 5, bar: true, home: true, note: 'Bar stays against you, elbows travel back.' },

  dip:            { name: 'Weighted dip', pattern: 'hpush', addedWeight: true, w: 28, sets: 3, reps: 8, repMin: 8, repMax: 9, inc: 2.5, note: 'Lean forward for chest, stay upright for triceps. Counted here as pressing.', variants: ['closebench', 'inclinedb'] },
  closebench:     { name: 'Close-grip bench', pattern: 'triceps', w: 75, sets: 3, reps: 8, repMin: 8, repMax: 10, inc: 5, bar: true },
  skullcrusher:   { name: 'Skull crusher', pattern: 'triceps', w: 30, sets: 3, reps: 10, repMin: 8, repMax: 12, inc: 5, bar: true },
  ropepush:       { name: 'Rope triceps pushdown', pattern: 'triceps', w: 27.5, sets: 2, reps: 10, repMin: 10, repMax: 12, inc: 2.5, machine: true, variants: ['rollingbar', 'overheadrope'] },
  rollingbar:     { name: 'Rolling bar pushdown', pattern: 'triceps', w: 35, sets: 3, reps: 12, repMin: 12, repMax: 14, inc: 2.5, machine: true },
  overheadrope:   { name: 'Overhead rope extension', pattern: 'triceps', w: 25, sets: 3, reps: 8, repMin: 8, repMax: 10, inc: 2.5, machine: true },
  dbohext:        { name: 'Overhead dumbbell extension', pattern: 'triceps', w: 22, sets: 3, reps: 10, repMin: 8, repMax: 12, inc: 2, home: true, note: 'Two hands, one dumbbell.' },
  floorskull:     { name: 'Floor skull crusher', pattern: 'triceps', w: 25, sets: 3, reps: 10, repMin: 10, repMax: 15, inc: 5, bar: true, home: true }
};

/* ── Core ──────────────────────────────────────────────────
   Four qualities, trained every week, each as a ladder you climb rather than
   a fixed exercise. You start at level one whatever your training age — the
   entry rungs are meant to feel easy, because the point is to earn the harder
   ones with clean reps rather than to survive them on day one.

   Anti-extension  · refusing to let the lower back arch
   Anti-lateral    · refusing to bend sideways under a one-sided load
   Anti-rotation   · refusing to twist
   Flexion         · the one that actually loads the rectus, and the one most
                     programmes skip because holds feel more virtuous

   Every session takes one track from three different qualities, so nothing
   gets trained twice while something else goes untouched for a month. */

export const CORE_TRACKS = [
  {
    id: 'ext-wheel', quality: 'Anti-extension', home: true,
    levels: [
      { name: 'Dead bug, legs only', unit: 'reps', target: 10, sets: 3, w: 0,
        cue: 'On your back, knees over hips, lower back pressed flat into the floor. Lower one heel to touch and return. If the back lifts, you have gone too far.' },
      { name: 'Dead bug, full', unit: 'reps', target: 10, sets: 3, w: 0,
        cue: 'Same, but the opposite arm reaches overhead as the leg extends. Slow. The floor should stay in contact with your lower back the whole time.' },
      { name: 'Ab wheel, kneeling to half', unit: 'reps', target: 8, sets: 3, w: 0,
        cue: 'Knees down, roll out only as far as you can return from without the hips sagging. Ribs pulled down, glutes squeezed.' },
      { name: 'Ab wheel, kneeling full', unit: 'reps', target: 10, sets: 3, w: 0,
        cue: 'Full extension until you are almost flat, then pull back with the abs rather than the hips. Never let the lower back arch.' },
      { name: 'Ab wheel, kneeling with a pause', unit: 'reps', target: 8, sets: 3, w: 0,
        cue: 'Three seconds held at full extension on every rep. This is where the strength for a standing rollout actually gets built.' },
      { name: 'Band-assisted standing rollout', unit: 'reps', target: 8, sets: 3, w: 0,
        cue: 'Band anchored high behind you, looped round the wheel handles so it helps you back up. Feet stay planted. Move further from the anchor to make it harder.' },
      { name: 'Standing rollout to a raised stop', unit: 'reps', target: 8, sets: 3, w: 0,
        cue: 'Roll out until the wheel meets a bench or a box, then return. Lower the stop over the weeks and the range grows with you.' },
      { name: 'Ab wheel, standing to knees', unit: 'reps', target: 6, sets: 3, w: 0,
        cue: 'From standing, roll out, drop to the knees at the bottom and return from there.' },
      { name: 'Full standing rollout', unit: 'reps', target: 5, sets: 3, w: 0,
        cue: 'Out and back without the knees touching. Very few people get here. If the lower back arches at any point, drop a rung.' }
    ]
  },
  {
    id: 'ext-hollow', quality: 'Anti-extension', home: true,
    levels: [
      { name: 'Hollow hold, tucked', unit: 'secs', target: 30, sets: 3, w: 0,
        cue: 'On your back, knees tucked, shoulders and head just off the floor. Lower back stays flat. That contact is the whole exercise.' },
      { name: 'Hollow hold, one leg out', unit: 'secs', target: 30, sets: 3, w: 0,
        cue: 'One leg extends, the other stays tucked. Swap halfway. The moment the lower back lifts, tuck back in.' },
      { name: 'Hollow hold, full', unit: 'secs', target: 35, sets: 3, w: 0,
        cue: 'Both legs straight, arms overhead. Long and low. Lower the legs only as far as you can keep the back flat.' },
      { name: 'Hollow rock', unit: 'secs', target: 40, sets: 3, w: 0,
        cue: 'Hold the full position and rock from the upper back to the hips. The shape never changes — you are rocking, not crunching.' }
    ]
  },
  {
    id: 'lat-plank', quality: 'Anti-lateral', home: true,
    levels: [
      { name: 'Side plank, from knees', unit: 'secs', target: 30, sets: 3, w: 0,
        cue: 'Elbow under the shoulder, knees bent, hips pushed up in a straight line from knee to head. Each side.' },
      { name: 'Side plank, full', unit: 'secs', target: 40, sets: 3, w: 0,
        cue: 'Legs straight, stacked feet. Hips high — the sag is what makes this useless. Each side.' },
      { name: 'Side plank, top leg raised', unit: 'secs', target: 40, sets: 3, w: 0,
        cue: 'Full side plank, then lift the top leg and hold it there. Now the glute medius is working too.' },
      { name: 'Side plank, weighted', unit: 'secs', target: 40, sets: 3, w: 10,
        cue: 'Full side plank with a plate resting on the top hip. Add weight rather than adding minutes.' }
    ]
  },
  {
    id: 'lat-carry', quality: 'Anti-lateral', home: true, grip: true,
    levels: [
      { name: 'Suitcase carry', unit: 'secs', target: 40, sets: 3, w: 20,
        cue: 'One dumbbell, one side, walk tall. The job is refusing to lean towards it. Swap sides each set.' },
      { name: 'Suitcase carry, heavy', unit: 'secs', target: 40, sets: 3, w: 32,
        cue: 'Same, more load. Shoulders level, ribs down. If you tilt, the weight is too heavy.' },
      { name: 'Suitcase carry, very heavy', unit: 'secs', target: 45, sets: 3, w: 40,
        cue: 'Grip becomes the limiter here, which is fine — it is a real one for deadlifting too.' },
      { name: 'Single-arm overhead carry', unit: 'secs', target: 30, sets: 3, w: 16,
        cue: 'One dumbbell locked out overhead, elbow straight, walk. Harder than it looks and brutal on the shoulder stabilisers.' }
    ]
  },
  {
    id: 'lat-copen', quality: 'Anti-lateral', home: true,
    levels: [
      { name: 'Copenhagen, knee on bench', unit: 'secs', target: 20, sets: 3, w: 0,
        cue: 'Side plank position, top leg bent with the knee resting on a bench. Lift the hips. Short lever, gentle entry.' },
      { name: 'Copenhagen, mid shin', unit: 'secs', target: 25, sets: 3, w: 0,
        cue: 'Support moves down towards mid-shin. Longer lever, more adductor.' },
      { name: 'Copenhagen, full', unit: 'secs', target: 25, sets: 3, w: 0,
        cue: 'Ankle on the bench, bottom leg free. The best adductor insurance a trail runner can buy.' },
      { name: 'Copenhagen, full with raise', unit: 'secs', target: 25, sets: 3, w: 0,
        cue: 'Full position and lift the bottom leg to meet the top one, repeatedly, while holding the plank.' }
    ]
  },
  {
    id: 'rot-birddog', quality: 'Anti-rotation', home: true,
    levels: [
      { name: 'Bird dog', unit: 'reps', target: 10, sets: 3, w: 0,
        cue: 'All fours. Extend the opposite arm and leg without letting the hips rotate. A cup of water on your lower back should not spill.' },
      { name: 'Bird dog, with pause', unit: 'reps', target: 10, sets: 3, w: 0,
        cue: 'Same, holding the extended position for five seconds each rep.' },
      { name: 'Bird dog to elbow-knee', unit: 'reps', target: 10, sets: 3, w: 0,
        cue: 'Extend, then draw elbow and knee together underneath you without the hips shifting, then extend again.' },
      { name: 'Plank shoulder tap', unit: 'reps', target: 16, sets: 3, w: 0,
        cue: 'High plank, feet wide, tap the opposite shoulder. The hips must not rock. Narrow the feet to make it harder.' }
    ]
  },
  {
    id: 'rot-pallof', quality: 'Anti-rotation',
    levels: [
      { name: 'Pallof press, half kneeling', unit: 'reps', target: 12, sets: 3, w: 15,
        cue: 'Side-on to a cable, hands at the sternum, press straight out and resist the pull towards the stack. Each side.' },
      { name: 'Pallof press, standing', unit: 'reps', target: 12, sets: 3, w: 20,
        cue: 'Standing, feet hip width. More load, less base. Do not let the shoulders rotate.' },
      { name: 'Pallof press-out to overhead', unit: 'reps', target: 12, sets: 3, w: 20,
        cue: 'Press out, then continue overhead and back down without letting the ribs flare or the torso twist.' },
      { name: 'Half-kneeling cable chop', unit: 'reps', target: 12, sets: 3, w: 20,
        cue: 'Controlled rotation now rather than resisting it. Move from the ribcage, not the lower back.' }
    ]
  },
  {
    id: 'ext-plank', quality: 'Anti-extension', home: true,
    levels: [
      { name: 'Plank, elbows under shoulders', unit: 'secs', target: 45, sets: 3, w: 0,
        cue: 'Ribs down, glutes squeezed, straight line from heel to head. If your hips sag you are resting on your back.' },
      { name: 'Long-lever plank', unit: 'secs', target: 30, sets: 3, w: 0,
        cue: 'Walk the elbows forward past your head. Small move, enormous difference.' },
      { name: 'Body saw', unit: 'reps', target: 12, sets: 3, w: 0,
        cue: 'Feet on sliders or a towel, rock the whole body back and forth from the plank. Nothing bends.' },
      { name: 'Weighted long-lever plank', unit: 'secs', target: 30, sets: 3, w: 10,
        cue: 'Plate on the upper back. Add load rather than minutes.' }
    ]
  },
  {
    id: 'rot-landmine', quality: 'Anti-rotation',
    levels: [
      { name: 'Half-kneeling landmine press', unit: 'reps', target: 10, sets: 3, w: 20,
        cue: 'Bar in the corner, press across your body from half kneeling. The trunk resists the twist the press wants to create.' },
      { name: 'Standing landmine press', unit: 'reps', target: 10, sets: 3, w: 25,
        cue: 'Same, standing. Less base, more anti-rotation.' },
      { name: 'Landmine rainbow', unit: 'reps', target: 10, sets: 3, w: 20,
        cue: 'Arms straight, arc the bar from hip to hip. Move from the ribcage, not the lower back.' },
      { name: 'Renegade row', unit: 'reps', target: 10, sets: 3, w: 22,
        cue: 'Push-up position on dumbbells, row one without letting the hips rotate. Feet wide to start.' }
    ]
  },
  {
    id: 'flex-vup', quality: 'Flexion', home: true,
    levels: [
      { name: 'Tuck-up', unit: 'reps', target: 12, sets: 3, w: 0,
        cue: 'On your back, bring knees and chest together, hands reach past the shins. Lower slowly.' },
      { name: 'V-up, one leg', unit: 'reps', target: 12, sets: 3, w: 0,
        cue: 'One leg straight, alternate. The straight leg is what makes it hard.' },
      { name: 'Full V-up', unit: 'reps', target: 10, sets: 3, w: 0,
        cue: 'Legs and torso rise together into a V. If you have to throw yourself up, go back a rung.' },
      { name: 'Weighted V-up', unit: 'reps', target: 10, sets: 3, w: 5,
        cue: 'Dumbbell held overhead throughout.' }
    ]
  },
  {
    id: 'flex-lying', quality: 'Flexion', home: true,
    levels: [
      { name: 'Lying leg raise, knees bent', unit: 'reps', target: 12, sets: 3, w: 0,
        cue: 'On your back, hands under the hips if needed. Knees bent, raise until the hips just lift, lower slowly.' },
      { name: 'Lying leg raise, straight', unit: 'reps', target: 12, sets: 3, w: 0,
        cue: 'Legs straight. Lower until just before the lower back lifts off, then reverse. That point is your range.' },
      { name: 'Lying leg raise with hip lift', unit: 'reps', target: 12, sets: 3, w: 0,
        cue: 'At the top, drive the hips towards the ceiling. This is the part that gets the abs rather than the hip flexors.' },
      { name: 'Reverse crunch, weighted', unit: 'reps', target: 12, sets: 3, w: 5,
        cue: 'Dumbbell held between the feet. Curl the pelvis up, do not swing.' }
    ]
  },
  {
    id: 'flex-hang', quality: 'Flexion',
    levels: [
      { name: 'Hanging knee raise', unit: 'reps', target: 12, sets: 3, w: 0,
        cue: 'Hang, knees up to hip height, and stop swinging before the next rep. Control beats height.' },
      { name: 'Hanging knee raise, slow return', unit: 'reps', target: 10, sets: 3, w: 0,
        cue: 'Same up, three seconds down. The lowering is where the strength is built.' },
      { name: 'Hanging leg raise to 90°', unit: 'reps', target: 10, sets: 3, w: 0,
        cue: 'Straight legs to horizontal. If the knees bend, drop back a level rather than cheating the rep.' },
      { name: 'Hanging leg raise to the bar', unit: 'reps', target: 8, sets: 3, w: 0,
        cue: 'Toes to the bar, controlled the whole way down. The one you were already chasing in your log.' }
    ]
  },
  {
    id: 'flex-crunch', quality: 'Flexion',
    levels: [
      { name: 'Cable crunch', unit: 'reps', target: 15, sets: 3, w: 30,
        cue: 'Kneeling, rope at the head, curl the ribs towards the pelvis. The hips do not move — only the spine.' },
      { name: 'Cable crunch, heavier', unit: 'reps', target: 15, sets: 3, w: 42.5,
        cue: 'Same shape, more load. If you start hinging at the hips the weight is too heavy.' },
      { name: 'Cable crunch, slow eccentric', unit: 'reps', target: 12, sets: 3, w: 42.5,
        cue: 'Three seconds back up. Fewer reps, considerably more work.' },
      { name: 'Weighted decline sit-up', unit: 'reps', target: 12, sets: 3, w: 10,
        cue: 'Plate on the chest. Roll up one vertebra at a time rather than throwing yourself forward.' }
    ]
  }
];

/* Two clean sessions at the target and the track moves up a rung. */
export const CORE_LEVEL_UP = 2;

/* Which qualities a session draws from, in order of how much they matter
   when you can only fit two or three. */
export const CORE_ROTATION = ['Anti-extension', 'Flexion', 'Anti-lateral', 'Anti-rotation'];

/* A slot can hold a list of exercises. The app works through them one per
   cycle, so each gets a full four weeks to progress before it hands over —
   variety without losing the thread of whether you are actually getting
   stronger. Plain strings are fixed slots. */
export const DAYS = {
  /* ── v45 rebalance ─────────────────────────────────────────────
     Two things drove this. Chest moves up the priority list, and the
     programme had become a posture problem in its own right: eighteen sets a
     week of horizontal pressing against six of horizontal rowing, three to
     one, which is the textbook recipe for rounded shoulders — and the v41
     chest work had made it worse. So chest stays where the evidence tops out
     (about eighteen sets) and rowing doubles to meet it; counting rear delts,
     pulling now outweighs pushing about one-and-a-half to one.

     It is paid for by taking volume off the side delts (eleven sets down to
     seven) and off biceps and triceps (both were well over target, and both
     get far more indirect work from the extra rowing and pressing).

     ── v46 ────────────────────────────────────────────────────────
     Chest is still lagging — bench flat at an estimated 127–136 since late
     September — so it now gets trained four days a week instead of two: a
     dumbbell floor press at home on Tuesday and a flye on Thursday, on top of
     Wednesday and Friday. Twenty-four straight sets a week, up from eighteen.
     Nothing comes out of shoulders, arms, core or legs to pay for it.

     The supersets are gone: walking between two machines mid-set was awkward,
     and the row fell away inside the pair. Drop sets replace them — on the
     same exercise, so no walking — after the last set of chest and arm
     isolation work, never on a press. */
  lowerA: {
    key: 'lowerA', label: 'Lower · heavy', weekday: 1, venue: 'gym', load: 'heavy',
    main: 'squat', backoff: { pct: 0.65, sets: 2, reps: 8 },
    work: [['walking-lunge', 'bulgarian'], ['legext-sl', 'legext'], 'calf', 'shrug-bb', 'farmerhold', ['hammerrope', 'wristcurl'], 'overheadrope'],
    dropsets: ['overheadrope'],
    prepKey: 'squat', prep: 4,
    core: 2, coreQ: ['Anti-extension', 'Anti-rotation', 'Anti-lateral']
  },
  home: {
    key: 'home', label: 'Home · weak points', weekday: 2, venue: 'home', load: 'light',
    main: null,
    /* The band pull-over and kneeling pulldown make way for a dumbbell floor
       press — a loaded chest press is possible here, and those two were the
       weakest work in the session. The band row stays: with more pressing at
       home, it is the pull that keeps the session balanced. The lateral raise
       stays too; shoulders are not being traded for chest. */
    /* v47: the dumbbell lateral raise replaces the band one — shoulder size is
       a primary focus, and a dumbbell loads the side delt hardest low in the
       range, where a band barely loads it at all. */
    work: ['floorpress', 'pushup-deficit', 'bandrow-single', 'bbcurl', 'seatedhammer',
           'bandpullapart', 'dbohext', 'dblat'],
    prepKey: 'home', prep: 3,
    /* Three, not four. Core runs at about twice its weekly target across the
       week, and this was the longest session of the five. */
    core: 3, coreQ: ['Flexion', 'Anti-extension', 'Anti-rotation', 'Anti-lateral', 'Flexion'],
    note: 'Trail run tonight. Nothing here should touch your legs. This is where the abs actually get trained.'
  },
  upperA: {
    key: 'upperA', label: 'Upper · chest & back', weekday: 3, venue: 'gym', load: 'heavy',
    main: 'bench', backoff: { pct: 0.65, sets: 2, reps: 8 },
    work: ['inclinedb', 'csrow', 'bbrow', 'dip', ['pullup', 'latpull'], 'cablerear', 'inclinecurl'],
    dropsets: ['inclinecurl'],
    prepKey: 'bench', prep: 3,
    /* Anti-extension rather than crunches here. Holding the ribs down against
       an arching back is the core quality that keeps the pelvis level when you
       stand; the abs still get their flexion work at home, twice. */
    core: 1, coreQ: ['Anti-extension']
  },
  lowerB: {
    key: 'lowerB', label: 'Full body · moderate', weekday: 4, venue: 'gym', load: 'moderate',
    main: 'dead', backoff: { pct: 0.65, sets: 2, reps: 5 },
    /* The back extension takes the cable curl's place: a fourth biceps slot was
       the least useful thing on a leg day, and the lower back is the part of
       your posture the programme was doing nothing for. */
    /* v47: a full-body day rather than a second leg day. Two standing presses
       come in — the landmine press for chest, the push press for shoulders —
       and both use the legs and trunk to brace or drive. The RDL goes (the
       deadlift, leg curl and back extension keep hamstrings over target) and
       so does the reverse curl, which is one of the two exercises your right
       elbow cannot tolerate. A standing cable row takes the shrug's slot: two
       new presses with no pull would have tipped the week's balance back
       towards pushing, and traps are covered by Monday's shrugs, the farmer's
       hold and the deadlift. The presses are split by the row and the leg
       curl, so the shoulders get a breather between them.

       The dumbbell flye stays last: chest work that asks nothing of the legs
       that have a run in them tonight. */
    work: [['frontsq', 'hack', 'beltsq'], 'landminepress', 'cablerow1', ['legcurl', 'sl-legcurl'], 'dbpushpress',
           'backext', 'dbflye'],
    dropsets: ['dbflye'],
    prepKey: 'dead', prep: 4,
    core: 2, coreQ: ['Anti-lateral', 'Anti-extension', 'Anti-rotation', 'Flexion'],
    note: 'Easy run today, so the leg work is lighter than Monday by design — do not add it back. The presses and the flye are upper body; the legs only brace or drive them.'
  },
  upperB: {
    key: 'upperB', label: 'Upper · press & arms', weekday: 5, venue: 'gym', load: 'heavy',
    main: 'ohp', backoff: { pct: 0.65, sets: 2, reps: 8 },
    /* Chest first after the press, because it is now the priority and the
       muscle trained first in a session is the one trained hardest. The flat
       chest press became an incline: bench already covers the middle of the
       chest, and the upper chest is what fills it out from the front — so
       pressing now covers all three regions across the week (flat bench,
       incline twice, dips low) rather than the middle three times over.

       Shoulder work here is unchanged. Drop sets go on the pec deck and both
       arm movements: all three are a pin or a cable, so the drop takes
       seconds. */
    work: ['smithincline', 'dbrow', ['fixedlat', 'pullup'], 'pecdeck', 'facepull', 'cablelat-light',
           'ezpreacher', ['ropepush', 'rollingbar']],
    dropsets: ['pecdeck', 'ezpreacher', 'ropepush', 'cablelat-light'],
    prepKey: 'ohp', prep: 3, core: 0
  }
};

/* Resolve a day's slots for a given cycle. */
export function slotsFor(day, cycle) {
  const c = Math.max(1, cycle || 1);
  return day.work.map(slot => Array.isArray(slot) ? slot[(c - 1) % slot.length] : slot);
}

/* Starting rung for every core ladder. You are not a beginner; the default
   assumes that, and you can move it. */
export const CORE_START = {
  easy:     { label: 'Build up',   rung: 0, blurb: 'Everything from the bottom. Slowest, safest, most boring.' },
  standard: { label: 'Standard',   rung: 1, blurb: 'Skip the entry rungs. Sensible if you already train core.' },
  advanced: { label: 'Advanced',   rung: 2, blurb: 'Straight to the real work. Matches what your log shows.' },
  hard:     { label: 'Send it',    rung: 3, blurb: 'Top rungs from day one. Only if nothing here scares you.' }
};

/* Weekly set targets per muscle, used by the on-track panel. Roughly the
   range the hypertrophy literature converges on, adjusted for your stated
   priorities: shoulders, arms and core high, chest and back at solid
   maintenance because 75 minutes and 40km of running will not carry more. */
/* Reweighted for the stated goal: an aesthetic upper body. Shoulders, lats,
   arms, forearms, traps and abs carry the volume. Legs sit at a genuine
   maintenance level, which is also about what 40km of running a week leaves
   room to recover from — this is a deliberate trade, not an oversight. */
/* v47: the targets now count the way the seven-day panel counts. They were
   set as straight sets against the programme on paper, but the panel counts
   every logged set — a main lift's two back-off sets included, so bench is
   five chest sets, not three — and a drop set as half. Measured against
   different rules, several could never read true: calves needed three sets
   from a substitute that only had two, and core was asked for half of what
   the programme gives it.

   Each target sits just under what a fully logged week delivers, so green
   means the programme was done and a missed set or two still reads green. */
export const VOLUME_TARGET = {
  quads: 13, 'hams/glutes': 10, calves: 3,
  /* about 30 counted sets a week: high, deliberately, for the lagging muscle */
  chest: 28, 'front delts': 7,
  'back horizontal': 15, 'back vertical': 6, 'side delts': 8, 'rear delts': 11,
  /* biceps sit lower while the right elbow is rehabbing: no drop sets on curls */
  biceps: 11, triceps: 9,
  traps: 4, forearms: 6, core: 22
};

export const MUSCLE_OF = {
  squat: 'quads', hinge: 'hams/glutes', calf: 'calves', hpush: 'chest',
  vpush: 'front delts', hpull: 'back horizontal', vpull: 'back vertical',
  lat: 'side delts', rear: 'rear delts', biceps: 'biceps', triceps: 'triceps',
  traps: 'traps', forearms: 'forearms'
};

/* Known bests from the log, so Records is populated before you log anything.
   `tested` is a real single actually performed; everything else is arithmetic. */
export const SEED_RECORDS = {
  squat: { w: 155, reps: 3, date: '2026-02-01' },
  dead:  { w: 180, reps: 6, date: '2026-03-12', tested: { w: 220, date: '2026-03-12' } },
  bench: { w: 120, reps: 3, date: '2026-02-01' },
  ohp:   { w: 70,  reps: 7, date: '2026-02-01' }
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
/* Accessory rest was cut in v39 to fit more exercises into a session, and
   the logs show what it cost: first sets hit and the last one collapses —
   a chest press going 10, 9, 6 and a barbell curl 11, 11, 9, 6 — and since
   progression needs every set to land, nearly a third of accessory sessions
   held instead of moving. Singer et al. (2024) found a small hypertrophy
   advantage for resting longer than 60 seconds and nothing detectable beyond
   90, so isolation work goes to 90 rather than three minutes. */
export const REST = {
  warm: 45, mainHeavy: 180, mainMid: 120, backoff: 90,
  compound: 120, isolation: 90, highRep: 75, core: 40,
  /* The pause before a drop set: long enough to move a pin or pick up the
     lighter dumbbells, short enough that the muscle has not recovered. */
  dropGap: 10,
  /* between rehab holds and sets: light load, and the tendon is the point,
     not the muscle */
  rehab: 45,
  /* Calves, forearms and traps held every set at 60 seconds in the same logs
     — not one of them dropped off — so they keep it. The longer rest goes
     where the collapse actually happened, not everywhere by default. */
  smallMuscle: 60
};
export const SHORT_REST_PATTERNS = ['calf', 'forearms', 'traps'];

/* Nothing drops below this, whatever the maths says. */
export const REST_FLOOR = 40;

export const RECOVERY_WINDOW_H = 40;
export const CLUBS = ['Wembley Square', 'Foreshore', 'Planet Fitness', 'Other'];

/* ── Preparation, matched to the lift ──────────────────────
   A generic stretching block warms you up but prepares nothing. Each day's
   prep is built around the bar you are about to pick up: ankles and adductors
   before squats, hinge and lats before deadlifts, cuff and pecs before bench,
   overhead range before pressing. Light lateral raises lead both upper days
   because you asked for them and because warm delts press better. */

export const PREP = {
  squat: {
    label: 'Squat prep',
    opener: { id: 'sp-open', name: 'Bodyweight squat, slow', secs: 60, detail: '10 slow reps', sets: '10 reps',
      cue: 'Full depth, three seconds down. Feel where you are tight before you load it.' },
    pool: [
      { id: 'sp-ankle', name: 'Ankle dorsiflexion rock', secs: 90, detail: '45s each side',
        cue: 'Half-kneeling, front foot flat, drive the knee past the toes with the heel down. The single biggest limiter on squat depth.' },
      { id: 'sp-adduct', name: 'Adductor rock back', secs: 90, detail: '45s each side',
        cue: 'On all fours, one leg straight out to the side, foot flat. Rock the hips back until the inner thigh loads.' },
      { id: 'sp-9090', name: '90/90 hip switch', secs: 120, detail: '60s, switching continuously',
        cue: 'Both knees at 90°, chest tall, rotate both legs to the other side without your hands. Opens the hips in both directions.' },
      { id: 'sp-couch', name: 'Couch stretch', secs: 120, detail: '60s each side',
        cue: 'Back shin against a bench, squeeze the back glute and stand the torso up. 60s a side. Undoes the desk.' },
      { id: 'sp-glute', name: 'Glute bridge, slow', secs: 90, detail: '12 slow reps',
        cue: 'Drive through the heels, squeeze hard at the top, ribs down. Wakes up what should be doing the work.' },
      { id: 'sp-goblet', name: 'Goblet squat hold', secs: 75, detail: '75s, one hold',
        cue: 'Light dumbbell at the chest, sit into the bottom and stay there, elbows pushing the knees out.' }
    ]
  },
  dead: {
    label: 'Deadlift prep',
    opener: { id: 'dp-open', name: 'Hip hinge, dowel on the back', secs: 60, detail: '10 slow reps', sets: '10 reps',
      cue: 'Bar or broomstick touching head, upper back and tailbone. Push the hips back keeping all three points in contact.' },
    pool: [
      { id: 'dp-ham', name: 'Hamstring floss, gentle', secs: 90, detail: '45s each leg',
        cue: 'On your back, one leg up, straighten and bend the knee slowly. Nothing sharp — back off the moment it grabs.' },
      { id: 'dp-hang', name: 'Dead hang', secs: 60, detail: '60s, one hang',
        cue: 'Full grip, let the shoulders rise. Decompresses the spine and wakes the grip before you pull.' },
      { id: 'dp-catcow', name: 'Cat-cow', secs: 60, detail: '60s, moving continuously',
        cue: 'One vertebra at a time. Finding the ends of the range makes it easier to hold neutral under load.' },
      { id: 'dp-glute', name: 'Glute bridge, slow', secs: 90, detail: '12 slow reps',
        cue: 'Squeeze hard at the top. If the hamstrings cramp, your glutes are not joining in.' },
      { id: 'dp-tspine', name: 'Thoracic opener over a bench', secs: 90, detail: '90s, one hold',
        cue: 'Elbows on a bench, hands behind the head, let the chest sink. A stiff upper back rounds under a heavy bar.' },
      { id: 'dp-birddog', name: 'Bird dog', secs: 75, detail: '8 reps each side',
        cue: 'Extend opposite arm and leg without the hips rotating. Cheap bracing rehearsal for the pull.' }
    ]
  },
  bench: {
    label: 'Bench prep',
    opener: { id: 'bp-open', name: 'Light lateral raise', secs: 90, detail: '2 × 15 very light', sets: '2 × 15 very light',
      cue: 'Tiny dumbbells, 4 to 6kg. Lead with the elbows to shoulder height, lower slowly. Should feel like almost nothing.' },
    /* No fixed posture drill on the bench day: the wall chin tuck read as a
       random warm-up, and the face pull, rear-delt and rowing work around it
       carry the posture side. The press and home days keep theirs. */
    /* An activator runs every bench day rather than waiting its turn in the
       rotation. The pool has six items and only one slot, so pec work was
       turning up roughly one session in six — which is why the bar felt like
       it was being moved by shoulders and triceps. Deliberately almost
       weightless: the aim is recruitment, not fatigue. */
    activator: { id: 'bp-act', name: 'Pec activation · flye into squeeze', secs: 110, detail: '2 × 10 light flyes, then 3 × 6s palm press', sets: '2 × 10 + 3 holds',
      cue: 'Band or the lightest cable on the stack. Ten slow flyes with a two-second squeeze at the top — free hand on the chest to find it if you need to — then press the palms together hard in front of you for six seconds, three times. Thinking about the muscle instead of the weight measurably raises pec activation at moderate loads; the effect shrinks as the bar gets near maximal, which is the whole reason to arrive already feeling it.' },
    pool: [
      { id: 'bp-pullapart', name: 'Band pull-apart', secs: 60, detail: '20 reps', sets: '20 reps',
        cue: 'Straight arms, pull the band to your chest squeezing the shoulder blades. No shrugging.' },
      { id: 'bp-scap', name: 'Scapular push-up', secs: 60, detail: '12 reps', sets: '12 reps',
        cue: 'Push-up position, arms locked. Only the shoulder blades move. Teaches the set position you want under the bar.' },
      { id: 'bp-extrot', name: 'Cable external rotation', secs: 75, detail: '15 reps each side', sets: '15 a side',
        cue: 'Elbow pinned to the ribs, rotate the forearm outwards against a light cable. Cuff insurance.' },
      { id: 'bp-pec', name: 'Doorway pec stretch', secs: 75, detail: '40s each side',
        cue: 'Forearm on the frame at shoulder height, step through gently. 30s a side, no forcing.' },
      { id: 'bp-tspine', name: 'Thoracic opener', secs: 75, detail: '75s, one hold',
        cue: 'Elbows on a bench, chest sinks. A stiff upper back costs you the arch and the shoulder position.' },
      { id: 'bp-pushup', name: 'Push-up, slow', secs: 60, detail: '8 slow reps', sets: '8 reps',
        cue: 'Three seconds down, elbows at 45°. Grooves the pattern before you load it.' },
      { id: 'bp-dbstretch', name: 'Loaded pec stretch', secs: 60, detail: '2 × 20s', sets: '2 × 20s',
        cue: 'Lightest dumbbells you own, flat on a bench, sink into the bottom of a flye and hold. Twenty seconds, no longer — a long static stretch costs you force, a short loaded one buys you range and leaves the pec switched on.' },
      { id: 'bp-emptybar', name: 'Empty bar, paused', secs: 75, detail: '8 reps, 2s on the chest', sets: '8 reps',
        cue: 'Just the bar. Two seconds resting on the chest every rep, staying tight. Finds the groove and the touch point before the plates make it expensive.' },
      { id: 'bp-pushuphold', name: 'Push-up, bottom hold', secs: 60, detail: '5 reps, 3s at the bottom', sets: '5 reps',
        cue: 'Chest an inch off the floor, hold three seconds, press up fast. The hold is where you feel the pec; the fast press is where you remind it to fire.' }
    ]
  },
  ohp: {
    label: 'Press prep',
    opener: { id: 'op-open', name: 'Light lateral raise', secs: 90, detail: '2 × 15 very light', sets: '2 × 15 very light',
      cue: 'Tiny dumbbells. Elbows lead, slow down. Warms the delts and the cuff for everything that follows.' },
    posture: { id: 'op-proney', name: 'Prone Y raise', secs: 75, detail: '2 × 12, no weight', sets: '2 × 12',
      cue: 'Face down on a bench or the floor, arms overhead in a Y with thumbs up. Lift the arms using the muscle below the shoulder blades, not the shoulders, and hold a beat at the top. The lower trapezius pulls the shoulder blades down and back — face pulls work the muscles above it and miss this one.' },
    pool: [
      { id: 'op-dislocate', name: 'Band pass-through', secs: 60, detail: '10 slow reps', sets: '10 slow',
        cue: 'Wide grip, straight arms, overhead and behind. Widen the grip if it pinches. This is the range the press needs.' },
      { id: 'op-wallslide', name: 'Wall slide', secs: 60, detail: '10 reps', sets: '10 reps',
        cue: 'Forearms on the wall, elbows at shoulder height, slide up keeping contact and the ribs down.' },
      { id: 'op-extrot', name: 'Cable external rotation', secs: 75, detail: '15 reps each side', sets: '15 a side',
        cue: 'Elbow at the ribs, rotate out. Light. The cuff has to work overhead whether you prepare it or not.' },
      { id: 'op-tspine', name: 'Thoracic extension', secs: 75, detail: '75s, one hold',
        cue: 'Over a bench or a foam roller. Without upper back extension you press from a lean instead of overhead.' },
      { id: 'op-hang', name: 'Dead hang', secs: 45, detail: '45s, one hang',
        cue: 'Let the shoulders come up around your ears. Opens the overhead position.' },
      { id: 'op-scap', name: 'Scapular push-up', secs: 60, detail: '12 reps', sets: '12 reps',
        cue: 'Arms locked, only the blades move. Serratus does a lot of the work overhead.' }
    ]
  },
  home: {
    label: 'Quick prep',
    opener: { id: 'hp-open', name: 'Light lateral raise', secs: 75, detail: '2 × 15 very light', sets: '2 × 15 very light',
      cue: 'Smallest dumbbells you own. Elbows lead. Wakes the shoulders before the curls and raises.' },
    posture: { id: 'hp-tspine-tuck', name: 'Thoracic extension, then chin tucks', secs: 90, detail: '45s over a roller, then 10 × 5s tucks', sets: '45s + 10 × 5s',
      cue: 'Roller or rolled towel across the upper back, hands behind the head, and sink back over it for 45 seconds — a stiff upper back is what drags the shoulders and head forward. Then lie flat and do ten chin tucks, nodding with just the top of the neck and holding each for five.' },
    pool: [
      { id: 'hp-catcow', name: 'Cat-cow', secs: 60, detail: '60s, moving continuously',
        cue: 'One vertebra at a time, slowly.' },
      { id: 'hp-pullapart', name: 'Rear delt raise, no weight', secs: 45, detail: '15 reps', sets: '15 reps',
        cue: 'Bent over, empty hands, thumbs down. Primes the pattern before you add dumbbells.' },
      { id: 'hp-wrist', name: 'Wrist circles and extension', secs: 45, detail: '45s total',
        cue: 'Curls and skull crushers both load the wrists. Thirty seconds now saves an ache later.' },
      { id: 'hp-tspine', name: 'Thoracic rotation on the floor', secs: 75, detail: '40s each side',
        cue: 'Side lying, knees stacked, open the top arm to the floor behind you.' }
    ]
  }
};

/* ── What the words mean ───────────────────────────────────
   Shown against the set type it describes, not buried in a help screen. */
/* ═══ right-arm rehab ═══════════════════════════════════════
   Pain on the outside of the right elbow where the tendon attaches, worst on
   reverse curls, preacher curls and wide-grip pull-ups, there during the lift
   and gone after. That pattern fits an irritated tendon, and tendons respond
   to graded load, not rest — so the arm keeps working, inside limits.

   The limits are the pain-monitoring model (Silbernagel et al.): pain during
   loading up to about 5/10 is acceptable, as long as it is back to baseline
   by the next morning and is not climbing week to week. This plan aims
   lower, at 3 or under, and treats anything above 5 — or a bad next morning —
   as a step back.

   Stages load the tendon progressively harder: a hold with no movement, then
   slow curls in the easiest grip, then the palm-up grip, then the stretched
   position that hurts most now. Two clean sessions moves you up a stage.
   Nothing here is a diagnosis; it is a loading plan. */
export const REHAB = {
  side: 'right',
  days: ['home', 'upperA', 'upperB'],   /* three times a week */
  /* The exercises that hurt, and what stands in while the arm settles. Each
     stand-in can be done one arm at a time or with a neutral grip, so the left
     arm keeps the programmed weight. */
  swaps: { revcurl: 'wristcurl', ezpreacher: 'seatedhammer', dbpreacher: 'seatedhammer', pullup: 'latpull' },
  /* No drop sets on these while rehabbing: training to failure is the
     hardest thing you can ask of an irritated tendon. */
  noDrop: ['biceps', 'forearms'],
  stages: [
    { name: 'Isometric hammer hold', unit: 'secs', sets: 4, target: 30, startW: 6, inc: 2,
      cue: 'Right arm only. Dumbbell in a hammer grip — thumb up — elbow bent to 90°, upper arm by your side. Hold still for thirty seconds at an effort around 6/10, with 45 seconds between holds. No movement means the tendon takes load without being stretched or squeezed.' },
    { name: 'Slow hammer curl', unit: 'reps', sets: 3, target: 12, startW: 6, inc: 2,
      cue: 'Right arm only, thumb up. Three seconds up, three seconds down, full range but stop short of the very bottom if that is where it bites. The slow tempo keeps the load on the tendon rather than on momentum.' },
    { name: 'Slow palm-up curl', unit: 'reps', sets: 3, target: 10, startW: 6, inc: 2,
      cue: 'Right arm only, palm up — the grip that loads the biceps tendon most. Same three-up, three-down tempo. If it bites above 3/10, go back to the hammer grip for another week.' },
    { name: 'Slow preacher curl, light', unit: 'reps', sets: 3, target: 10, startW: 4, inc: 2,
      cue: 'Right arm only, on the preacher pad with a light dumbbell — the stretched position that hurts most now. Three seconds down. Two clean sessions here and the arm is ready for the normal programme again.' }
  ],
  /* pain thresholds, 0–10 during the exercise */
  clean: 3, setback: 5, levelUp: 2
};

export const GLOSSARY = {
  warm: {
    title: 'Warm-up set',
    body: 'A lighter set to prepare the movement. Stop well short of struggling — the point is to reach the working sets ready, not tired. These are never logged against progression.'
  },
  work: {
    title: 'Working set',
    body: 'The prescribed weight for the prescribed reps. Hit the number with form you would be happy to show someone.'
  },
  open: {
    title: 'Open set',
    body: 'The number shown is the minimum. Do as many clean reps as you can beyond it, then stop — a rep that turns ugly does not count and is where people get hurt. This is the set the app reads to decide whether your training max goes up.'
  },
  drop: {
    title: 'Drop set',
    body: 'Straight after your last set, take about a quarter of the weight off and do as many clean reps as you can. Ten seconds between — just long enough to move the pin. It adds work without adding much time, and a meta-analysis found drop sets build muscle about as well as ordinary sets. It never decides whether the exercise moves up: that is still the working sets.'
  },
  backoff: {
    title: 'Back-off set',
    body: 'Same exercise, lighter weight, more reps, done after the heavy sets. Nothing changes about how you perform it. The purpose is extra volume for size without piling on more heavy fatigue — heavy sets build the strength, these build the tissue.'
  },
  rpe: {
    title: 'RPE',
    body: 'How hard the set was. 10 means nothing left, 9 means one more was possible, 8 means two. The app uses this to break ties: the same reps at RPE 7 and RPE 10 mean very different things about what to do next cycle.'
  }
};

/* ── Cues ──────────────────────────────────────────────────
   One or two lines each. Enough to fix the common error, not a manual. */
export const CUES = {
  squat:      'Brace before you unrack. Knees track over the toes, hips and chest rise together out of the hole.',
  dead:       'Bar over mid-foot, lats tight, take the slack out before you pull. Push the floor away rather than yanking.',
  bench:      'Shoulder blades pinned down and back, feet driving. Bar to the lower chest, elbows around 45°.',
  ohp:        'Squeeze the glutes so you do not press from a leaning back. Head moves through as the bar passes your forehead.',
  bulgarian:  'Front shin close to vertical. Most of the work belongs to the front leg.',
  legpress:   'Do not let the lower back round off the pad at the bottom. Stop short of locking the knees.',
  legcurl:    'Slow on the way back. The lengthening half is where the hamstring grows.',
  calf:       'Full stretch at the bottom, pause there. Bouncing turns this into nothing.',
  frontsq:    'Elbows high. The moment they drop, the bar follows.',
  rdl:        'Push the hips back, bar stays against the legs. Stop where the stretch is, not where the floor is.',
  backext:    'Squeeze the glutes before you rise and stop at a straight line. Going past it into an arch loads the joints, not the muscle.',
  landminepress: 'Brace as if about to be pushed: glutes tight, ribs down. Press up and slightly forward, and do not let the lower back arch to finish the rep.',
  cablerow1:  'Lead with the elbow, finish with the shoulder blade back. If the torso rotates to get the handle in, the weight is too heavy.',
  dbpushpress: 'Short, sharp dip — knees only, chest stays up. If the dip turns into a squat, the legs are doing the work the shoulders are meant to.',
  inclinedb:  'Bench at about 30°, not 45 — steeper hands the work to the front delts and takes it off the upper chest you are after. Shoulder blades pinned back and down, lower to the top of the chest, and press up and slightly in.',
  smithincline:'Same 30° bench, set so the bar meets the chest just under the collarbone. Shoulder blades back and down before the first rep, and keep them there — the moment they roll forward, the shoulders take over.',
  dbrow:      'Hinge until the back is near flat, then pull the elbow towards the hip, not the armpit. Finish by squeezing the shoulder blade back — that last inch is the part that pulls your shoulders back for the rest of the day.',
  pecdeck:    'Set the handles so you feel a real stretch across the chest at the back of the rep, without the shoulder joint complaining. Lead with the elbows. The stretched end is where the growth is, so do not cut it short.',
  cablerear:  'Cable at shoulder height, pull across and back with a slightly bent arm, leading with the elbow. Keep the shoulder down — if it shrugs up, the upper trap has taken the rep.',
  rollingbar: 'Upper arms pinned to your sides, and only the forearms move. Let the bar roll in the hands at the bottom for a full lockout.',
  seatedgm:   'Hinge from the hips with a flat back. Small range to start — this one is easy to overreach.',
  bbrow:      'Torso around 45°, pull to the belly button. No heaving with the lower back.',
  pullup:     'Start from a full hang. Chest to the bar, slow on the way down.',
  fixedlat:   'Pull the elbows down and back, not the hands. Let the shoulders rise fully at the top.',
  inclinebb:  'Bench around 30°. Higher than that and it becomes a shoulder press.',
  machinepress: 'Do not let the lower back arch off the pad. Stop just short of lockout to keep tension.',
  dblat:      'Arms slightly forward of your body, thumbs neutral or turned a touch up — never down. Elbows lead, stop at shoulder height.',
  leancable:  'Lean away, arm crossing the body at the bottom. Elbow leads, stop at shoulder height, no shrug.',
  facepull:   'Pull to the eyebrows and rotate the knuckles up at the end. High reps, light load.',
  revpec:     'Chest stays on the pad. Squeeze the shoulder blades, do not shrug.',
  reardb:     'Chest supported if you can. Thumbs down, small controlled arc, no momentum.',
  proney:     'Face down, arms in a Y. Tiny weight, hold a beat at the top.',
  inclinecurl:'Bench back so the arms hang behind you. That stretch is the whole reason for this exercise.',
  ezpreacher: 'Do not let the elbows drift back. Stop just short of straight at the bottom to keep tension.',
  bbcurl:     'Back against a wall if you start swinging. Elbows stay at your sides.',
  seatedhammer:'Neutral grip. Slow negatives — this one builds the thickness under the biceps.',
  dbohext:    'Elbows point forward, not out. Full stretch behind the head.',
  dip:        'Slight forward lean for chest, upright for triceps. Stop when the upper arms reach parallel.',
  ropepush:   'Elbows pinned. Spread the rope at the bottom.',
  rollout:    'Ribs down, do not let the lower back sag. Go only as far as you can come back from.',
  copenhagen: 'Top leg on the bench, hips up. Start with the knee on the bench if the ankle version is too much.',
  hollow:     'Lower back stays flat on the floor. Lower the legs until it lifts, then raise them slightly.',
  suitcase:   'One dumbbell, one side. Stand tall — the job is refusing to lean.',
  flatdb:     'Shoulder blades pinned back the way you set them for bench. Bring the dumbbells towards each other at the top, not just up.',
  chestpress: 'Set the seat so the handles sit at mid-chest. Let the chest stretch at the back of every rep rather than stopping short.',
  declinedb:  'Shallow decline, not steep. Dumbbells towards each other at the top and a full stretch at the bottom.',
  dbflye:     'Fixed, slightly bent elbows throughout. If the elbow angle changes you are pressing, and the stretch is the point.',
  csrow:      'Chest stays on the pad. Elbows flare out to about 45° and pull to the upper ribs — wide, not tucked.',
  machinerow: 'Chest off the pad, hinge at the hips, pull to the belly with the elbows close. Let the lats finish the rep.',
  beltsq:     'Hips back, chest up, all the way down. Nothing on the spine, so you can chase depth harder than you would with a bar.'
};

/* Constructed search rather than a hardcoded link, so it never rots. */
export const howToUrl = name =>
  'https://www.youtube.com/results?search_query=' + encodeURIComponent('how to ' + name + ' proper form');


/* ── Noise ─────────────────────────────────────────────────
   Fires on a completed set. `clean` shows regardless; `salty` only when
   language is set to gym in Data. */
export const PHRASES = {
  clean: [
    'Light weight, baby', 'Yeah buddy', 'Nothing but a peanut', 'Rep banked',
    'Clean', 'That is the one', 'Money', 'Locked in', 'Easy work',
    'Bar speed looked good', 'Filed', 'Sharp', 'Next', 'Textbook',
    'Own it', 'Chalk it up', 'Solid', 'Dialled'
  ],
  salty: [
    'Fucking send it', 'Get in', 'Absolute unit', 'Piss off, that was easy',
    'Hell yes', 'Bloody good', 'Damn right', 'Bosh'
  ]
};

/* Shown when a set falls short. Never scolding — the miss is information. */
export const MISS_PHRASES = [
  'Logged. That is data, not failure.', 'Noted. Next set.',
  'Short of target — the app will handle it.', 'Fine. Rest properly.',
  'Recorded. Keep the form honest.'
];

/* ── RPE ───────────────────────────────────────────────────
   The number on its own means nothing until you have calibrated it, so the
   app says what each one feels like and colours the scale from easy to
   maximal. Reps in reserve is the useful translation. */
export const RPE_SCALE = {
  6:  { label: 'Comfortable', rir: '4+ left', colour: '#1E7A46',
        body: 'Bar speed never slowed. You could have done four more. On a working set this usually means the weight is too light.' },
  7:  { label: 'Moderate', rir: '3 left', colour: '#5D9E3A',
        body: 'Smooth throughout. Three more were there. A good place for back-off sets.' },
  8:  { label: 'Hard', rir: '2 left', colour: '#E8B305',
        body: 'The last rep slowed a little. Two more were possible. Most productive working sets live here.' },
  9:  { label: 'Very hard', rir: '1 left', colour: '#E07B1F',
        body: 'Real grind on the last rep, one more was in you. Right for an open set on the 5/3/1 week.' },
  10: { label: 'Maximal', rir: 'nothing left', colour: '#C8202D',
        body: 'Nothing remaining, and the last rep may have broken form. Fine occasionally, expensive if it happens every session.' }
};

/* Bumped on every deploy. The app compares this against the copy actually
   being served, which is how you tell a stale cached build from a fresh one. */
export const BUILD = { version: 'v47', date: '2026-11-16' };

/* Shown when a session is finished. Kept plain — the detail lives in History,
   this is just the door closing behind you. */
export const FINISH_LINES = {
  hard: [
    'That was a hard one. Banked.',
    'Nothing left on the table.',
    'Heavy day, done properly.',
    'You earned the rest of today.',
    'That is how the numbers move.'
  ],
  solid: [
    'Clean session. Filed.',
    'Exactly what was asked for.',
    'Good work. Consistent beats spectacular.',
    'Logged and moving.',
    'That is another brick in the wall.'
  ],
  light: [
    'In and out. Still counts.',
    'Showed up. That is most of it.',
    'Done is done.',
    'Logged. Onwards.'
  ],
  easy: [
    'Easy day, taken properly. Nothing moved, and that is the point.',
    'Backed off on purpose. Good judgement.',
    'Recovery is training too.'
  ]
};
