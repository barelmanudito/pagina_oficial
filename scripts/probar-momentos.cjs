const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync('app.js', 'utf8');
const setup = source.slice(source.indexOf('function setupMomentsCarousel('), source.indexOf('const calendarGrid ='));
function element() {
  return {
    hidden: false, open: false, textContent: '', events: {},
    addEventListener(name, fn) { this.events[name] = fn; },
    setAttribute(name, value) { this[name] = value; },
    showModal() { this.open = true; },
    close() { this.open = false; this.events.close(); },
    contains() { return false; },
  };
}
function scenario({ overflow = true, reduced = false, count = 3 } = {}) {
  const nodes = new Map();
  const get = (id) => {
    if (!nodes.has(id)) nodes.set(id, element());
    return nodes.get(id);
  };
  let interval;
  let locked = false;
  const track = Object.assign(element(), {
    clientWidth: 500, scrollWidth: overflow ? 1000 : 500, scrollLeft: 0,
    firstElementChild: { getBoundingClientRect: () => ({ width: 234 }) },
    scrollTo({ left }) { this.scrollLeft = left; },
  });
  const document = {
    querySelector: get, hidden: false, activeElement: null,
    addEventListener() {},
    body: { classList: { add() { locked = true; }, remove() { locked = false; } } },
  };
  const moments = Array.from({ length: count }, (_, i) => ({ titulo: `Foto ${i}`, imagen: `assets/${i}.jpg` }));
  vm.runInNewContext(setup + '\nsetupMomentsCarousel(track, moments);', {
    document, track, moments,
    window: {
      matchMedia: () => ({ matches: reduced, addEventListener() {} }),
      setInterval(fn) { interval = fn; return 1; }, setTimeout(fn) { fn(); },
    },
    clearInterval() { interval = null; },
    ResizeObserver: class { constructor(fn) { this.fn = fn; } observe() { this.fn(); } },
    IntersectionObserver: class { constructor(fn) { this.fn = fn; } observe() { this.fn([{ isIntersecting: true }]); } },
  });
  return { get, track, playing: () => !!interval, tick: () => interval(), locked: () => locked };
}
const s = scenario();
assert.equal(s.playing(), true);
s.tick(); assert.equal(s.track.scrollLeft, 250);
s.tick(); assert.equal(s.track.scrollLeft, 500);
s.tick(); assert.equal(s.track.scrollLeft, 0);
s.get('#moments-carousel').events.mouseenter(); assert.equal(s.playing(), false);
s.get('#moments-carousel').events.mouseleave(); assert.equal(s.playing(), true);
s.get('#moments-pause').events.click(); assert.equal(s.playing(), false);
s.get('#moments-pause').events.click(); assert.equal(s.playing(), true);
s.track.events.click({ target: { closest: () => ({ dataset: { momentIndex: '1' } }) } });
assert.equal(s.get('#moment-dialog').open, true);
assert.equal(s.get('#moment-title').textContent, 'Foto 1');
assert.equal(s.playing(), false);
assert.equal(s.locked(), true);
s.get('#moment-next').events.click(); assert.equal(s.get('#moment-counter').textContent, '3 / 3');
s.get('#moment-next').events.click(); assert.equal(s.get('#moment-title').textContent, 'Foto 0');
s.get('#moment-close').events.click(); assert.equal(s.locked(), false);
assert.equal(s.playing(), true);
assert.equal(scenario({ overflow: false }).get('#moments-controls').hidden, true);
assert.equal(scenario({ reduced: true }).playing(), false);
assert.equal(scenario({ count: 1, overflow: false }).playing(), false);
console.log('OK: carrusel, vuelta al inicio, pausa, ampliacion, navegacion y movimiento reducido.');
