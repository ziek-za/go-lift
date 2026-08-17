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

  calf:           { name: 'Standing calf raise', pattern: 'calf', w: 140, sets: 3, reps: 10, repMin: 10, repMax: 12, inc: 5, machine: true, note: 'Your log said stack + 80kg, so this is a guess at the total. Set it properly on the first session.' },
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
  'cablelat-light': { name: 'Cable lateral raise, light', pattern: 'lat', w: 7.5, sets: 3, reps: 12, repMin: 10, repMax: 15, inc: 1.25, machine: true },

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
      { name: 'Ab wheel, standing to knees', unit: 'reps', target: 6, sets: 3, w: 0,
        cue: 'From standing, roll out, drop to the knees at the bottom and return. A serious exercise — only once the kneeling version is genuinely easy.' }
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
    id: 'lat-carry', quality: 'Anti-lateral', home: true,
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

export const MOBILITY = [
  { id: 'm-9090', name: '90/90 hip switch', secs: 120,
    cue: 'Sit with both knees bent at 90°, one shin in front, one out to the side. Keep the chest tall and rotate both knees over to the other side without using your hands.' },
  { id: 'm-couch', name: 'Couch stretch', secs: 120,
    cue: 'Back foot up on a bench, shin against it, front foot planted. Squeeze the back glute and stand the torso up. 60s a side.' },
  { id: 'm-ankle', name: 'Ankle dorsiflexion rock', secs: 90,
    cue: 'Half-kneeling, front foot flat. Drive the knee forward past the toes with the heel glued down. Small rocks, not a hold.' },
  { id: 'm-adduct', name: 'Adductor rock back', secs: 90,
    cue: 'On all fours, one leg straight out to the side, foot flat. Rock the hips backwards until the inner thigh loads, then return.' },
  { id: 'm-tspine', name: 'Thoracic opener over a bench', secs: 90,
    cue: 'Kneel with elbows on a bench, hands together behind the head. Let the chest sink towards the floor. The lower back stays neutral.' },
  { id: 'm-hang', name: 'Dead hang', secs: 60,
    cue: 'Hang from a bar with a full grip and let the shoulders rise around your ears. Relax into it rather than holding yourself up.' },
  { id: 'm-wgs', name: "World's greatest stretch", secs: 120,
    cue: 'Deep lunge, same-side hand to the floor inside the front foot. Drop the elbow towards the instep, then rotate that arm to the ceiling.' },
  { id: 'm-calf', name: 'Soleus wall stretch', secs: 90,
    cue: 'Foot against a wall, heel down, knee bent and driven forwards. The bent knee is the whole point — straight leg hits a different muscle.' },
  { id: 'm-glute', name: 'Glute bridge, slow', secs: 90,
    cue: 'On your back, heels close to your backside. Drive through the heels and squeeze at the top. Ribs stay down, do not arch the back.' },
  { id: 'm-band', name: 'Band shoulder pass-through', secs: 90,
    cue: 'Wide grip on a band, arms straight, take it from in front of the thighs over your head to behind you. Widen the grip if it pinches.' },
  { id: 'm-ham', name: 'Hamstring floss, gentle', secs: 90,
    cue: 'On your back, one leg up, hands behind the thigh. Straighten and bend the knee slowly. Nothing sharp — back off the moment it grabs.' }
];

/* The week. Thursday is deliberately the lighter lower day — it carries a run. */
export const DAYS = {
  lowerA: {
    key: 'lowerA', label: 'Lower · heavy', weekday: 1, venue: 'gym', load: 'heavy',
    main: 'squat', backoff: { pct: 0.65, sets: 2, reps: 8 },
    work: ['bulgarian', 'legpress', 'legcurl', 'calf'], core: 2, mobility: 4
  },
  home: {
    key: 'home', label: 'Home · weak points', weekday: 2, venue: 'home', load: 'light',
    main: null,
    work: ['bbcurl', 'seatedhammer', 'dblat', 'reardb', 'dbohext', 'floorskull'],
    core: 3, mobility: 0,
    note: 'Trail run tonight. Nothing here should touch your legs.'
  },
  /* Order alternates push and pull deliberately. Three presses in a row
     fatigues the front delts across all of them and the third one suffers. */
  upperA: {
    key: 'upperA', label: 'Upper · horizontal', weekday: 3, venue: 'gym', load: 'heavy',
    main: 'bench', backoff: { pct: 0.65, sets: 2, reps: 8 },
    work: ['bbrow', 'inclinedb', 'pullup', 'leancable', 'cablerear', 'inclinecurl'],
    core: 0, mobility: 0, prep: 4
  },
  lowerB: {
    key: 'lowerB', label: 'Lower · moderate', weekday: 4, venue: 'gym', load: 'moderate',
    main: 'dead', backoff: { pct: 0.65, sets: 2, reps: 5 },
    work: ['frontsq', 'rdl', 'sl-legcurl', 'seatedcalf'], core: 2, mobility: 4,
    note: 'Easy run today. Volume is trimmed on purpose — do not add it back.'
  },
  upperB: {
    key: 'upperB', label: 'Upper · vertical', weekday: 5, venue: 'gym', load: 'heavy',
    main: 'ohp', backoff: { pct: 0.65, sets: 2, reps: 8 },
    work: ['dbrow', 'dbpress', 'fixedlat', 'cablelat-light', 'revpec', 'ezpreacher'],
    core: 0, mobility: 0, prep: 3
  }
};

/* Weekly set targets per muscle, used by the on-track panel. Roughly the
   range the hypertrophy literature converges on, adjusted for your stated
   priorities: shoulders, arms and core high, chest and back at solid
   maintenance because 75 minutes and 40km of running will not carry more. */
export const VOLUME_TARGET = {
  quads: 12, 'hams/glutes': 12, calves: 6, chest: 8, 'front delts': 8,
  'back horizontal': 6, 'back vertical': 6, 'side delts': 9,
  'rear delts': 9, biceps: 12, triceps: 6, core: 12
};

export const MUSCLE_OF = {
  squat: 'quads', hinge: 'hams/glutes', calf: 'calves', hpush: 'chest',
  vpush: 'front delts', hpull: 'back horizontal', vpull: 'back vertical',
  lat: 'side delts', rear: 'rear delts', biceps: 'biceps', triceps: 'triceps'
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

/* ── Upper-day preparation ─────────────────────────────────
   Light lateral raises always lead, because that is how you like to open,
   and warm cuffs make the heavy pressing later feel considerably better.
   The rest rotate. */
export const UPPER_PREP_OPENER = {
  id: 'p-lat', name: 'Light lateral raise', secs: 90, sets: '2 × 15 very light',
  cue: 'Tiny dumbbells — 4 to 6kg. Lead with the elbows to shoulder height and lower slowly. This warms the delts and the cuff; it should feel like almost nothing.'
};

export const UPPER_PREP = [
  { id: 'p-pullapart', name: 'Band pull-apart', secs: 60, sets: '20 reps',
    cue: 'Arms straight out in front holding a band. Pull it apart to your chest, squeezing the shoulder blades. Do not shrug.' },
  { id: 'p-scap', name: 'Scapular push-up', secs: 60, sets: '12 reps',
    cue: 'Push-up position, arms locked straight throughout. Let the chest sink between the shoulder blades, then push the upper back to the ceiling. Only the blades move.' },
  { id: 'p-dislocate', name: 'Shoulder pass-through', secs: 60, sets: '10 slow',
    cue: 'Wide grip on a band or broomstick. Straight arms, take it overhead and behind you, then back. Widen the grip if it pinches.' },
  { id: 'p-extrot', name: 'Cable external rotation', secs: 75, sets: '15 a side',
    cue: 'Elbow pinned to your ribs at 90°, rotate the forearm away from your body against a light cable. A rolled towel under the elbow helps.' },
  { id: 'p-wallslide', name: 'Wall slide', secs: 60, sets: '10 reps',
    cue: 'Forearms on a wall, elbows at shoulder height. Slide them up while keeping contact and keeping the ribs down.' },
  { id: 'p-tspine', name: 'Thoracic opener', secs: 75,
    cue: 'Kneel with elbows on a bench, hands behind the head, let the chest sink. Keep the lower back out of it.' },
  { id: 'p-hang', name: 'Dead hang', secs: 45,
    cue: 'Full grip on the bar, relax and let the shoulders come up around your ears.' },
  { id: 'p-catcow', name: 'Cat-cow', secs: 60,
    cue: 'On all fours, alternate rounding the spine towards the ceiling and letting it sag, moving one vertebra at a time.' }
];

/* ── What the words mean ───────────────────────────────────
   Shown against the set type it describes, not buried in a help screen. */
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
  seatedgm:   'Hinge from the hips with a flat back. Small range to start — this one is easy to overreach.',
  bbrow:      'Torso around 45°, pull to the belly button. No heaving with the lower back.',
  pullup:     'Start from a full hang. Chest to the bar, slow on the way down.',
  fixedlat:   'Pull the elbows down and back, not the hands. Let the shoulders rise fully at the top.',
  inclinebb:  'Bench around 30°. Higher than that and it becomes a shoulder press.',
  machinepress: 'Do not let the lower back arch off the pad. Stop just short of lockout to keep tension.',
  dblat:      'Lead with the elbows, thumbs slightly down, stop at shoulder height. If you swing, halve the weight.',
  leancable:  'Lean away from the stack, arm across the body at the bottom for a longer range.',
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
  suitcase:   'One dumbbell, one side. Stand tall — the job is refusing to lean.'
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
