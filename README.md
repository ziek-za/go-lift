# Load

A training app for one person. Built around your log, your week, and the fact
that you run 30–50km on top of all of it.

## The week

| Day | Session | Notes |
|---|---|---|
| Mon | Lower · heavy | Squat wave. ~74 min |
| Tue | Home · weak points | Biceps, laterals, rear delts, core. Trail run in the evening. ~50 min |
| Wed | Upper · horizontal | Bench wave, rows, pull-ups, laterals. ~73 min |
| Thu | Lower · moderate | Deadlift wave, trimmed accessories. Easy run. ~74 min |
| Fri | Upper · vertical | Press wave, machine press, incline, laterals. ~75 min |
| Sat | Long run | — |
| Sun | Loose | Log a run, or build something |

Every session fits inside 75 minutes including prescribed rest. The estimate at
the top of each day is calculated from the actual sets, so it drops when the app
trims volume.

Thursday is the lighter lower day on purpose — it carries a run. Tuesday is your
weak-point day precisely because you have no rack: a barbell, dumbbells and an ab
wheel are exactly what biceps, rear delts and abs need, and none of it touches
your legs before an evening trail run.

Weak points get three exposures a week each: biceps in four places, lateral
raises in three, rear delts in three, core in three sessions. Shoulders now
carry two pressing movements on top of that — the overhead press wave plus a
machine press — which is what the size you are after actually needs.

Both upper days open with a warm-up block, and light lateral raises always lead
it. The rest rotates.

## Getting it onto your phone

The file APIs need a secure origin, so opening `index.html` from Downloads will
not work — Chrome gives `file://` pages an opaque origin and storage fails
silently.

1. New public repo. Upload every file here to the root.
2. Settings → Pages → Deploy from branch → `main` / `(root)`.
3. Open `https://<you>.github.io/<repo>/` in Chrome.
4. Menu → Add to Home screen.

Or from Termux: `python -m http.server 8080`, then `http://localhost:8080`.

## Progression

**Main lifts** run a four-week wave off a training max — 5s, 3s, 5/3/1, deload.
The last set each week is open-ended. On the 5/3/1 week the engine decides:

| Open set | Result |
|---|---|
| 5+ reps | Training max up two increments |
| 2–4 reps | Up one increment |
| Exactly 1 | Held |
| Missed | Strike. Two strikes drops the training max 10%. |

RPE breaks ties. A double bump logged at RPE 9.5+ becomes a single — you got the
reps but there was nothing left. A minimum hit at RPE 7.5 or below still earns an
increment, because it was clearly not your limit.

Starting maxes: squat 147.5, deadlift 185, bench 117.5, press 72.5. The deadlift
is deliberately low given the hamstring. Raise it in *Plan* once it feels silly.

**Everything else** runs the double progression you already do by hand. Your
`16kg × 10(12) × 3` is exactly this: hold the load, add a rep to the target, and
when the target tops out, add weight and drop back down the range.

## Running

Log each run with a type and duration. The app keeps a rolling seven-day load —
minutes weighted by effort — and compares it to your baseline, which it
recalculates from your own trailing four weeks once it has them.

When load runs 25% above normal it drops a set from each lower-body accessory.
Above 50%, it also drops the last accessory entirely. A hard or long run within
18 hours of a lower day does the same.

It never touches the main lift. That is the point: intensity is what maintains
strength, volume is what costs recovery, so when something has to give it should
be the fifth set of leg press rather than the squat.

Sets removed this way are not counted as missed sets — a trimmed session cannot
trigger a false plateau.

Turn the whole thing off in *Data* if it ever annoys you.

## Logging a set

Each set has three buttons. **Done** logs the prescribed reps, fires the
animation and starts your rest timer in one tap. **±** opens a stepper if you
got a different number. **Start** runs a clock for the duration of the set
itself — useful for timed holds, and it records time under tension on
everything else.

Tap a logged result to undo it. Sets can be completed in any order.

The word that pops up is cosmetic. Switch between gym language and clean in
*Data → Language*.

## What the words mean

Every set type has a **?** next to it that explains itself:

- **Warm-up** — lighter preparation, never counted against progression
- **Working set** — the prescribed weight for the prescribed reps
- **Open set** — the number shown is a minimum, do as many clean reps as you
  can beyond it. This is the set that decides your training max.
- **Back-off** — same exercise, lighter, more reps, done after the heavy work.
  Nothing changes about how you perform it. Heavy sets build strength, these
  build tissue.
- **RPE** — 10 is nothing left, 9 is one more, 8 is two

Each exercise also carries a form cue and a link to video of the movement.

## Adding to a session

*Add an exercise* sits at the bottom of every session before you finish it.
Suggestions are filtered by what kind of day it is — horizontal upper gets
presses and rows, lower gets squats and hinges — and sorted by what you have
trained least recently. Anything you add progresses like everything else.

## Rest timers

Tap the stopwatch on a set once you rack it. The interval is computed from what
you just did: four minutes after a top set above 85% of training max, three on
mid sets, two and a half on back-offs, ninety seconds on isolation, sixty on
anything above twelve reps, forty-five on core.

It adds thirty seconds if you missed the set and a minute if you logged RPE 9.5
or above. The bias towards longer rests on compounds is deliberate — the evidence
fairly consistently favours around three minutes over one for hypertrophy.

## Bad days

*Not feeling great* drops everything to 85% and keeps the same movements. The
important part is invisible: that session is excluded from progression entirely.
It logs for volume, but nothing moves up and nothing counts as a miss, so a week
of flu cannot strip weight off lifts that were fine.

## When you stall

Two sessions short of target and the card turns red with three ways out: swap to
a variant of the same pattern, back off ten percent and rebuild, or go lighter
for more reps. Swaps stick until you change them back.

## Clubs

Machine and cable weights are stored per club. A 150kg pulldown at Wembley is not
150kg at Foreshore — different stacks, different pulley ratios. Switch club in
*Data* and the app saves the old numbers and restores that club's. Free weights
carry across untouched.

Set it to Foreshore for the closure, 17 August to 11 September.

## Backup

Data lives in IndexedDB on the phone. *Data → Save to file* opens a picker once —
point it at a folder the Drive app syncs — and every save after that writes to
the same file with one tap. It also saves whenever you background the app.

Chrome re-asks permission on the file handle once per session. Browser rule, not
something the app can skip.

## Files

| File | What it is |
|---|---|
| `data.js` | Your programme. Edit here to change exercises or starting weights. |
| `app.js` | Progression, plateaus, rest, running load, storage, sync |
| `styles.css` | Palette, type, the bar diagram |
| `index.html` | Shell |
| `sw.js` | Offline cache |

## Still to calibrate

Two things I could not settle from the log:

- Which dumbbell figures are per hand and which are pair totals. The app assumes
  per hand where it says "each hand" and total otherwise — check the first
  session of each and correct the weight.
- Machine starting weights at Foreshore. Your log's numbers are Wembley's. Set
  the club first, then fix each machine as you meet it.
