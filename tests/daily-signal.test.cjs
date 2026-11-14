const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(require('node:path').join(__dirname, '../script.js'), 'utf8');
const preferences = source.slice(0, source.indexOf('const filterButtons ='));
const dailySource = preferences + source.slice(source.indexOf('const dailyDate ='), source.indexOf('const lightButton ='));
function fixture(date, stored = new Map(), storageDenied = false) {
  let now = +date;
  const listeners = {}, timers = new Map(), elements = {};
  let id = 0, finishCopy;
  for (const name of ['#daily-date','#daily-prompt','#daily-position','.daily-retune','.daily-copy']) {
    elements[name] = {textContent:'', innerHTML:'', events:{}, addEventListener(type, fn) { this.events[type] = fn; }};
  }
  class Clock extends Date { constructor(...args) { super(...(args.length ? args : [now])); } static now() { return now; } }
  const document = {visibilityState:'visible',querySelector: key => elements[key],addEventListener: (type,fn) => listeners[type] = fn};
  const window = {addEventListener: (type,fn) => listeners[type] = fn,setTimeout: (fn,delay) => { timers.set(++id,{fn,delay});return id; },clearTimeout: key => timers.delete(key)};
  const localStorage = { getItem: key => { if (storageDenied) throw Error('denied'); return stored.get(key) ?? null; }, setItem: (key, value) => { if (storageDenied) throw Error('denied'); stored.set(key, value); } };
  vm.runInNewContext(dailySource,{localStorage,Date:Clock,Intl,document,window,navigator:{clipboard:{writeText: text => new Promise(resolve => {finishCopy = resolve;})}}});
  return {elements, timers, document, stored, setDate: date => now = +date, emit: type => listeners[type](), click: key => elements[key].events.click(), resolveCopy: () => finishCopy()};
}
const f = fixture(new Date(2026,10,10,23,59,59));
assert.equal(f.elements['#daily-date'].dateTime,'2026-11-10');
assert.equal(f.elements['#daily-position'].textContent,'Signal 2 of 8');
assert.equal([...f.timers.values()][0].delay,1000);
f.click('.daily-retune');
assert.equal(f.elements['#daily-position'].textContent,'Signal 3 of 8');
f.emit('pageshow');f.emit('visibilitychange');
assert.equal(f.elements['#daily-position'].textContent,'Signal 3 of 8','same-day manual selection survives return');
assert.equal(f.timers.size,1,'refresh replaces midnight timer');
f.setDate(new Date(2026,10,11));[...f.timers.values()][0].fn();
assert.equal(f.elements['#daily-date'].dateTime,'2026-11-11');
assert.equal(f.elements['#daily-position'].textContent,'Signal 3 of 8');
f.setDate(new Date(2027,0,1,9));f.document.visibilityState='hidden';f.emit('visibilitychange');
assert.equal(f.elements['#daily-date'].dateTime,'2026-11-11','hidden tabs defer resume refresh');
f.document.visibilityState='visible';f.emit('visibilitychange');
assert.equal(f.elements['#daily-date'].dateTime,'2027-01-01');
assert.equal(f.elements['#daily-position'].textContent,'Signal 1 of 8');
for (const [start,end,expected] of [
 [new Date(2026,0,31),new Date(2026,1,1),'2026-02-01'],
 [new Date(2028,1,28),new Date(2028,1,29),'2028-02-29'],
 [new Date(2028,1,29),new Date(2028,2,1),'2028-03-01']]) {
 const x=fixture(start);x.setDate(end);x.emit('pageshow');assert.equal(x.elements['#daily-date'].dateTime,expected);
}
const persisted = fixture(new Date(2026,10,10));
persisted.click('.daily-retune');
assert.equal(fixture(new Date(2026,10,10), persisted.stored).elements['#daily-position'].textContent, 'Signal 3 of 8', 'same-day selection survives reload');
assert.equal(fixture(new Date(2026,10,12), persisted.stored).elements['#daily-position'].textContent, 'Signal 4 of 8', 'old saved choice cannot cross local calendar days');
for (const invalid of ['{bad json', JSON.stringify({day: +new Date(Date.UTC(2026,10,10)), index: 99}), 'null']) {
  const stored = new Map([['signal-garden:daily', invalid]]);
  assert.equal(fixture(new Date(2026,10,10), stored).elements['#daily-position'].textContent, 'Signal 2 of 8');
}
const denied = fixture(new Date(2026,10,10), new Map(), true);
denied.click('.daily-retune');
assert.equal(denied.elements['#daily-position'].textContent, 'Signal 3 of 8', 'storage denial preserves working controls');
if (process.env.TZ==='Europe/Stockholm') {
 for (const [date,hours] of [[new Date(2026,2,29),23],[new Date(2026,9,25),25]]) {
  const x=fixture(date);assert.equal([...x.timers.values()][0].delay,hours*3600000);
 }
}
(async () => {
 const x=fixture(new Date(2026,10,10));const copying=x.click('.daily-copy');
 x.setDate(new Date(2026,10,11));x.emit('pageshow');x.resolveCopy();await copying;
 assert.equal(x.elements['.daily-copy'].textContent,'Copy signal','old async copy result cannot overwrite new day');
 console.log('PASS rollover, resume, same-day selection, timer deduplication, month/year/leap boundaries, stale copy feedback, saved selections and storage fallbacks; TZ='+process.env.TZ);
})().catch(error => {console.error(error);process.exitCode=1;});
