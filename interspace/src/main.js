import Lenis from 'lenis';
import { createScene } from './scene.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (p, a, b) => { const t = clamp((p - a) / (b - a)); return t * t * (3 - 2 * t); };

const FLOW = '(max-width:860px),(max-height:520px),(prefers-reduced-motion:reduce)';
const mqFlow = matchMedia(FLOW);
const mqReduce = matchMedia('(prefers-reduced-motion:reduce)');
const touch = matchMedia('(pointer:coarse)').matches;

const hero = $('#hero'), stage = $('#stage'), canvas = $('#gl');
const steps = $$('.step').map((el) => ({ el, a: +el.dataset.a, b: +el.dataset.b, shape: el.dataset.shape, label: el.dataset.label, o: -1, k: -1, on: null }));
const poster = $('#poster'), takeN = $('#takeN'), takeL = $('#takeL');

// ---------- scena ----------
let scene = null;
try {
  scene = createScene(canvas, stage, { touch, reduce: mqReduce.matches });
} catch (e) {
  $('#nogl').hidden = false;
}

// ---------- stan gościa ----------
const state = { name: '', pick: null, glaze: '#141412', glazeName: 'Atrament', step: -1 };
let live = false;
const cleanName = (s) => String(s || '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 28);

function applyName(raw, fromInput) {
  state.name = cleanName(raw);
  const shown = state.name || 'Twoja Firma';
  $$('[data-name]').forEach((n) => { n.textContent = shown; });
  if (scene) scene.setName(state.name);
  if (!fromInput) $('#nm').value = state.name;
  updateMail();
}
function updateMail() {
  const who = state.name ? `: ${state.name}` : '';
  const shape = { flakon: 'Flakon', miska: 'Miska', dzwonek: 'Dzwonek' }[state.pick || 'dzwonek'];
  const body = `Dzień dobry,\n\nułożyłem swój kadr na interspace.studio i chcę taką stronę.\n\nFirma: ${state.name || ''}\nBohater: ${shape}\nKolor: ${state.glazeName}\n\nCzym się zajmuję: `;
  $('#mail').href = `mailto:kontakt@interspace.studio?subject=${encodeURIComponent('Chcę taką stronę' + who)}&body=${encodeURIComponent(body)}`;
}

$('#nm').addEventListener('input', (e) => applyName(e.target.value, true));
$$('[data-pick]').forEach((b) => b.addEventListener('click', () => {
  state.pick = b.dataset.pick;
  $$('[data-pick]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  if (scene) scene.morphTo(state.pick);
  updateMail();
}));
$$('[data-glaze]').forEach((b) => b.addEventListener('click', () => {
  state.glaze = b.dataset.glaze; state.glazeName = b.getAttribute('aria-label');
  $$('[data-glaze]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  if (scene) { scene.setGlaze(state.glaze); scene.kick(3); }
  updateMail();
}));
$('#copy').addEventListener('click', async (e) => {
  const b = e.currentTarget, mail = b.dataset.mail;
  try { await navigator.clipboard.writeText(mail); b.textContent = 'Skopiowane'; }
  catch (err) { b.textContent = mail; }
  setTimeout(() => { b.textContent = 'Skopiuj e-mail'; }, 2400);
});

// link osobisty: ?firma=Nazwa
const qp = new URLSearchParams(location.search).get('firma');
applyName(qp || '');

// ---------- ujęcia ----------
function shapeFor(i) {
  if (i <= 1) return 'flakon';
  if (i === 2) return 'miska';
  if (i === 3) return 'dzwonek';
  return state.pick || 'dzwonek';
}
function setStep(i) {
  if (i === state.step) return;
  state.step = i;
  takeN.textContent = String(i).padStart(2, '0');
  takeL.textContent = steps[i].label;
  stage.classList.toggle('at-final', i === 5);
  if (scene && live) {
    const s = shapeFor(i);
    if (scene.shape !== s) scene.morphTo(s);
  }
}

// tryb przypięty: postęp scrolla steruje wszystkim
let pinOn = false, lenis = null, rafId = 0;
function heroProgress() {
  const r = hero.getBoundingClientRect();
  return clamp(-r.top / Math.max(1, r.height - innerHeight));
}
let lastP = -1;
function drive() {
  const p = heroProgress();
  if (Math.abs(p - lastP) < 0.0002) return;
  lastP = p;
  root.style.setProperty('--p', p.toFixed(4));
  let active = 0;
  steps.forEach((s, i) => {
    const f = 0.02;
    let o = (i === 0 ? 1 : smooth(p, s.a, s.a + f)) * (i === steps.length - 1 ? 1 : 1 - smooth(p, s.b - f, s.b));
    const k = i === 0 ? 1 - smooth(p, s.b - 0.05, s.b) * 0.6 : clamp((p - s.a) / 0.035);
    if (Math.abs(o - s.o) > 0.008 || (o === 0) !== (s.o === 0) || (o === 1) !== (s.o === 1)) { s.o = o; s.el.style.setProperty('--o', o.toFixed(3)); }
    if (Math.abs(k - s.k) > 0.008 || k === 1 || k === 0) { if (k !== s.k) { s.k = k; s.el.style.setProperty('--k', k.toFixed(3)); } }
    const on = o > 0.001;
    if (on !== s.on) { s.on = on; s.el.classList.toggle('on', on); }
    if (p >= s.a - 0.02) active = i;
  });
  setStep(active);
  const po = smooth(p, 0.88, 0.94);
  poster.style.setProperty('--o', po.toFixed(3)); poster.style.setProperty('--k', smooth(p, 0.88, 1).toFixed(3));
  if (scene) {
    const wide = innerWidth / innerHeight;
    const side = clamp(0.2 + (wide - 1.4) * 0.03, 0.17, 0.24);
    const toCenter = smooth(p, 0.86, 0.94);
    scene.setLayout({ ox: side * (1 - toCenter), oy: 0.03 - toCenter * 0.24, zoom: 1 + smooth(p, 0.1, 0.18) * 0.1 - toCenter * 0.42 });
  }
}
function loop(t) { if (lenis) lenis.raf(t); drive(); rafId = requestAnimationFrame(loop); }

// tryb płynny: bloki jeden pod drugim, aktywny wybiera bryłę
let io = null;
function enableFlow() {
  steps.forEach((s) => { s.o = s.k = -1; s.on = null; s.el.classList.add('on'); s.el.style.removeProperty('--o'); s.el.style.removeProperty('--k'); });
  if (scene) scene.setLayout({ ox: 0, oy: 0.04, zoom: 1.45 }, true);
  io = new IntersectionObserver((es) => {
    es.forEach((e) => { if (e.isIntersecting) setStep(+e.target.dataset.step); });
  }, { rootMargin: '-58% 0px -30% 0px' });
  steps.forEach((s) => io.observe(s.el));
  setStep(0);
}
function applyMode() {
  const flow = mqFlow.matches;
  root.classList.toggle('flow', flow);
  if (io) { io.disconnect(); io = null; }
  cancelAnimationFrame(rafId);
  if (lenis) { lenis.destroy(); lenis = null; }
  pinOn = !flow;
  if (flow) enableFlow();
  else {
    lenis = new Lenis({ lerp: 0.1, anchors: true });
    lastP = -1; state.step = -1;
    rafId = requestAnimationFrame(loop);
  }
  if (scene) scene.resize();
}
mqFlow.addEventListener('change', applyMode);

// kotwica do finału działa w obu trybach
$$('a[href="#final"]').forEach((a) => a.addEventListener('click', (e) => {
  if (!pinOn) return;
  e.preventDefault();
  const y = hero.offsetTop + (hero.offsetHeight - innerHeight);
  if (lenis) lenis.scrollTo(y, { duration: 2.2 }); else scrollTo(0, y);
}));

// widoczność: scena odpoczywa poza kadrem i w ukrytej karcie
let inView = true;
const sync = () => { if (!scene) return; if (inView && !document.hidden) scene.start(); else scene.stop(); };
new IntersectionObserver((es) => { inView = es[0].isIntersecting; sync(); }).observe(stage);
document.addEventListener('visibilitychange', sync);
addEventListener('resize', () => { if (scene) scene.resize(); lastP = -1; });
if (scene) scene.onGrab = () => root.classList.add('grabbed');

// ---------- start ----------
async function boot() {
  const words = $$('.ld-words span, .ld-words em'), ldn = $('#ldn');
  const reduce = mqReduce.matches;
  const t0 = performance.now(), dur = reduce ? 0 : 1250;
  const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
  await new Promise((res) => {
    (function tick(now) {
      const t = dur ? clamp((now - t0) / dur) : 1;
      ldn.textContent = String(Math.round(t * 100)).padStart(3, '0');
      words.forEach((w, i) => w.classList.toggle('lit', t >= (i + 0.6) / (words.length + 0.6)));
      if (t < 1) requestAnimationFrame(tick); else res();
    })(t0);
  });
  await Promise.race([fonts, new Promise((r) => setTimeout(r, 1500))]);
  if (scene) scene.setName(state.name);
  applyMode();
  root.classList.add('loaded', 'ready');
  sync();
  // bryła zamienia się w pierwszy produkt, gdy kurtyna idzie w górę
  setTimeout(() => { live = true; if (scene) scene.morphTo(shapeFor(Math.max(0, state.step))); }, reduce ? 0 : 420);
}
boot();
