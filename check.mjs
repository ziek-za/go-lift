/* Static link check: every name app.js imports must actually be exported,
   and every capitalised identifier it uses must be defined or imported.
   A missing export is a link error — the module never runs and the page is
   blank, which no syntax check will ever catch. */
import * as data from './data.js';
import fs from 'fs';

const src = fs.readFileSync('./app.js', 'utf8');
const block = src.slice(src.indexOf('import {') + 8, src.indexOf("} from './data.js'"));
const imported = block.split(',').map(x => x.trim()).filter(Boolean);

const missing = imported.filter(n => !(n in data));
console.log('imported names:', imported.length);
console.log(missing.length ? '✗ NOT EXPORTED: ' + missing.join(', ') : '✓ every import resolves');

const unused = imported.filter(n => {
  const uses = src.split(new RegExp(`\\b${n}\\b`, 'g')).length - 1;
  return uses <= 1;
});
console.log(unused.length ? '· imported but unused: ' + unused.join(', ') : '· no unused imports');

// data.js exports nothing references
const exported = Object.keys(data);
const orphan = exported.filter(n => !src.includes(n));
console.log(orphan.length ? '· exported but unused by app: ' + orphan.join(', ') : '· all exports used');
