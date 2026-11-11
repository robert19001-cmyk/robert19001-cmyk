// Plan zdjęciowy: jedna bryła na kole, miękki cień na białym tle, światło prowadzone wskaźnikiem.
import * as T from 'three';
import { N, SHAPES, sample } from './shapes.js';

const S = 96; // segmentów obrotu
const WHEEL_H = 0.16, WHEEL_R = 1.22;

export function createScene(canvas, stage, { touch = false, reduce = false } = {}) {
  const renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, touch ? 1.5 : 2));
  renderer.toneMapping = T.NeutralToneMapping;
  renderer.toneMappingExposure = 1.02;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.VSMShadowMap;
  renderer.setClearColor(0x000000, 0);

  const scene = new T.Scene();
  const cam = new T.PerspectiveCamera(24, 1, 0.1, 60);

  // Własne studio świetlne: białe blendy, jedna ciemna i jedna w kolorze akcentu.
  const es = new T.Scene();
  es.background = new T.Color(0xb9b8b3);
  const pan = (w, h, x, y, z, c, i) => {
    const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: new T.Color(c).multiplyScalar(i), side: T.DoubleSide }));
    m.position.set(x, y, z); m.lookAt(0, 0.6, 0); es.add(m);
  };
  pan(16, 9, 0, 12, 1, 0xffffff, 5.5);
  pan(5, 12, -11, 3, 5, 0xffffff, 3.4);
  pan(1.6, 10, 10, 3, 3, 0xffffff, 5);
  pan(9, 5, 2, 1.5, 12, 0xffffff, 1.4);
  pan(7, 7, -4, -6, 6, 0x0c0c0b, 1);
  pan(8, 4, 9, 2, -8, 0x161614, 1);
  pan(2.4, 2.4, 6.5, 5, -7, 0xff3d1f, 3.2);
  const pm = new T.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(es, 0.03).texture;
  pm.dispose();

  const key = new T.DirectionalLight(0xffffff, 1.5);
  key.castShadow = true;
  key.shadow.mapSize.set(touch ? 1024 : 2048, touch ? 1024 : 2048);
  key.shadow.radius = 7; key.shadow.blurSamples = touch ? 12 : 22; key.shadow.bias = -0.0006;
  const sc = key.shadow.camera; sc.left = -4; sc.right = 4; sc.top = 4; sc.bottom = -4; sc.near = 1; sc.far = 22;
  scene.add(key, key.target);
  key.target.position.set(0, 0.4, 0);

  const ground = new T.Mesh(new T.PlaneGeometry(60, 60), new T.ShadowMaterial({ opacity: 0.3 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);

  // Miękka plama kontaktu pod kołem.
  const bc = document.createElement('canvas'); bc.width = bc.height = 256;
  const bx = bc.getContext('2d'); const g = bx.createRadialGradient(128, 128, 30, 128, 128, 128);
  g.addColorStop(0, 'rgba(18,18,16,.5)'); g.addColorStop(0.55, 'rgba(18,18,16,.16)'); g.addColorStop(1, 'rgba(18,18,16,0)');
  bx.fillStyle = g; bx.fillRect(0, 0, 256, 256);
  const blob = new T.Mesh(new T.PlaneGeometry(3.5, 3.5), new T.MeshBasicMaterial({ map: new T.CanvasTexture(bc), transparent: true, depthWrite: false, toneMapped: false }));
  blob.rotation.x = -Math.PI / 2; blob.position.y = 0.004; scene.add(blob);

  const rig = new T.Group(); scene.add(rig);
  const spin = new T.Group(); rig.add(spin);

  // Koło z nazwą firmy gościa na obwodzie.
  const nc = document.createElement('canvas'); nc.width = 4096; nc.height = 128;
  const nx = nc.getContext('2d');
  const nameTex = new T.CanvasTexture(nc);
  nameTex.colorSpace = T.SRGBColorSpace; nameTex.anisotropy = 8; nameTex.wrapS = T.RepeatWrapping;
  const paper = new T.Color('#eeebe3');
  const wheel = new T.Mesh(
    new T.CylinderGeometry(WHEEL_R, WHEEL_R, WHEEL_H, 128, 1),
    [new T.MeshStandardMaterial({ map: nameTex, roughness: 0.55 }), new T.MeshStandardMaterial({ color: paper, roughness: 0.5 }), new T.MeshStandardMaterial({ color: paper, roughness: 0.9 })]
  );
  wheel.position.y = WHEEL_H / 2; wheel.castShadow = true; wheel.receiveShadow = true; spin.add(wheel);

  function setName(name) {
    const text = (name || 'Twoja Firma').toUpperCase();
    nx.fillStyle = '#eeebe3'; nx.fillRect(0, 0, nc.width, nc.height);
    nx.fillStyle = '#121210'; nx.textBaseline = 'middle';
    nx.font = '600 62px "Archivo", sans-serif';
    try { nx.letterSpacing = '7px'; } catch (e) {}
    const unit = `${text}   ●   W ROLI GŁÓWNEJ   ●   `;
    const w = Math.max(40, nx.measureText(unit).width);
    const reps = Math.max(1, Math.round(nc.width / w));
    nx.save(); nx.scale(nc.width / (w * reps), 1);
    for (let i = 0; i < reps; i++) {
      nx.fillStyle = '#121210'; nx.fillText(unit, i * w, 66);
    }
    nx.restore();
    nameTex.needsUpdate = true;
  }
  setName('');

  // Bryła obrotowa z własnymi atrybutami materiału na wierzchołek.
  const V = N * (S + 1);
  const geo = new T.BufferGeometry();
  const aPos = new T.BufferAttribute(new Float32Array(V * 3), 3);
  const aNor = new T.BufferAttribute(new Float32Array(V * 3), 3);
  const aCol = new T.BufferAttribute(new Float32Array(V * 3), 3);
  const aPbr = new T.BufferAttribute(new Float32Array(V * 3), 3);
  aPos.setUsage(T.DynamicDrawUsage); aNor.setUsage(T.DynamicDrawUsage);
  geo.setAttribute('position', aPos); geo.setAttribute('normal', aNor); geo.setAttribute('color', aCol); geo.setAttribute('aPbr', aPbr);
  const idx = new Uint32Array((N - 1) * S * 6);
  let q = 0;
  for (let i = 0; i < N - 1; i++) for (let j = 0; j < S; j++) {
    const a = i * (S + 1) + j, b = a + 1, c = a + S + 1, d = c + 1;
    idx[q++] = a; idx[q++] = c; idx[q++] = b; idx[q++] = b; idx[q++] = c; idx[q++] = d;
  }
  geo.setIndex(new T.BufferAttribute(idx, 1));
  geo.boundingSphere = new T.Sphere(new T.Vector3(0, 0.8, 0), 2.2);

  const mat = new T.MeshPhysicalMaterial({ vertexColors: true, clearcoat: 1, clearcoatRoughness: 0.06, envMapIntensity: 1.05 });
  mat.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nattribute vec3 aPbr;\nvarying vec3 vPbr;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvPbr = aPbr;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vPbr;')
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = vPbr.y;')
      .replace('#include <metalnessmap_fragment>', '#include <metalnessmap_fragment>\nmetalnessFactor = vPbr.x;')
      .replace('#include <lights_physical_fragment>', T.ShaderChunk.lights_physical_fragment.replace('material.clearcoat = clearcoat;', 'material.clearcoat = clearcoat * vPbr.z;'));
  };
  const body = new T.Mesh(geo, mat);
  body.position.y = WHEEL_H; body.castShadow = true; spin.add(body);

  const proxy = new T.Mesh(new T.CylinderGeometry(1.25, 1.25, 2, 16), new T.MeshBasicMaterial());
  proxy.position.y = 1; proxy.visible = false; rig.add(proxy);

  // Przenikanie brył na sprężynie.
  let glaze = '#141412';
  let from = sample('bryla', glaze), to = from, shapeName = 'bryla';
  const cur = { pos: new Float32Array(N * 2), col: new Float32Array(N * 3), pbr: new Float32Array(N * 3) };
  let m = 1, mv = 0, dirty = true;
  const look = { h: SHAPES.bryla.h, el: SHAPES.bryla.el, zoom: 1 };
  const lookT = { ...look };
  let squash = 0, squashV = 0;

  function snapshot() {
    return { pos: cur.pos.slice(), col: cur.col.slice(), pbr: cur.pbr.slice() };
  }
  function morphTo(name, instant) {
    if (!SHAPES[name]) return;
    const next = sample(name, glaze);
    if (instant || reduce) { from = to = next; m = 1; mv = 0; } else { from = snapshot(); to = next; m = 0; mv = 0; squashV += name === shapeName ? 0 : 2.4; }
    shapeName = name; dirty = true;
    const s = SHAPES[name]; lookT.h = s.h; lookT.el = s.el; lookT.zoom = s.zoom;
    if (instant || reduce) Object.assign(look, lookT);
  }
  function setGlaze(hex) { glaze = hex; morphTo(shapeName); }

  const cosT = new Float32Array(S + 1), sinT = new Float32Array(S + 1);
  for (let j = 0; j <= S; j++) { const a = (j / S) * Math.PI * 2; cosT[j] = Math.cos(a); sinT[j] = Math.sin(a); }

  function rebuild() {
    const mc = Math.min(1, Math.max(0, m));
    for (let i = 0; i < N * 2; i++) cur.pos[i] = from.pos[i] + (to.pos[i] - from.pos[i]) * m;
    for (let i = 0; i < N; i++) if (cur.pos[i * 2] < 0) cur.pos[i * 2] = 0;
    for (let i = 0; i < N * 3; i++) {
      cur.col[i] = from.col[i] + (to.col[i] - from.col[i]) * mc;
      cur.pbr[i] = from.pbr[i] + (to.pbr[i] - from.pbr[i]) * mc;
    }
    const P = aPos.array, Nn = aNor.array, C = aCol.array, B = aPbr.array, p = cur.pos;
    for (let i = 0; i < N; i++) {
      const i0 = Math.max(0, i - 1), i1 = Math.min(N - 1, i + 1);
      let nr = p[i1 * 2 + 1] - p[i0 * 2 + 1], ny = -(p[i1 * 2] - p[i0 * 2]);
      const l = Math.hypot(nr, ny) || 1; nr /= l; ny /= l;
      if (i === 0) { nr = 0; ny = -1; } else if (i === N - 1) { nr = 0; ny = 1; }
      const r = p[i * 2], y = p[i * 2 + 1];
      for (let j = 0; j <= S; j++) {
        const o = (i * (S + 1) + j) * 3;
        P[o] = r * cosT[j]; P[o + 1] = y; P[o + 2] = r * sinT[j];
        Nn[o] = nr * cosT[j]; Nn[o + 1] = ny; Nn[o + 2] = nr * sinT[j];
        C[o] = cur.col[i * 3]; C[o + 1] = cur.col[i * 3 + 1]; C[o + 2] = cur.col[i * 3 + 2];
        B[o] = cur.pbr[i * 3]; B[o + 1] = cur.pbr[i * 3 + 1]; B[o + 2] = cur.pbr[i * 3 + 2];
      }
    }
    aPos.needsUpdate = aNor.needsUpdate = aCol.needsUpdate = aPbr.needsUpdate = true;
  }

  // Układ kadru: przesunięcie bryły na ekranie i przybliżenie.
  const lay = { ox: 0, oy: 0, zoom: 1 }, layT = { ox: 0, oy: 0, zoom: 1 };
  function setLayout(o, instant) { Object.assign(layT, o); if (instant) Object.assign(lay, layT); }

  let W = 1, H = 1;
  function resize() {
    const r = canvas.getBoundingClientRect();
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    renderer.setSize(W, H, false);
  }

  // Wskaźnik: światło i kręcenie kołem.
  const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
  let rot = -0.6, vel = 0, dragging = false, lastX = 0, lastT = 0;
  const IDLE = reduce ? 0 : 0.32;
  const ray = new T.Raycaster(), v2 = new T.Vector2();
  const hit = (e) => {
    const r = canvas.getBoundingClientRect();
    v2.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(v2, cam);
    return ray.intersectObject(proxy, false).length > 0;
  };
  const interactive = (el) => el.closest && el.closest('a,button,input,label,[data-ui]');
  stage.addEventListener('pointermove', (e) => {
    const r = stage.getBoundingClientRect();
    ptr.tx = ((e.clientX - r.left) / r.width) * 2 - 1; ptr.ty = ((e.clientY - r.top) / r.height) * 2 - 1;
    if (dragging) {
      const now = performance.now(), dx = e.clientX - lastX, dt = Math.max(8, now - lastT);
      rot += dx * 0.0085; vel = (dx * 0.0085) / (dt / 1000); lastX = e.clientX; lastT = now;
    } else if (!touch && !interactive(e.target)) {
      stage.classList.toggle('can-grab', hit(e));
    }
  });
  stage.addEventListener('pointerdown', (e) => {
    if (interactive(e.target) || !hit(e)) return;
    dragging = true; lastX = e.clientX; lastT = performance.now(); vel = 0;
    stage.classList.add('grabbing');
    try { stage.setPointerCapture(e.pointerId); } catch (err) {}
    if (api.onGrab) api.onGrab();
  });
  const up = () => { dragging = false; stage.classList.remove('grabbing'); };
  stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up);

  let running = false, raf = 0, last = 0;
  const camT = new T.Vector3();
  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
    const k = 1 - Math.pow(0.001, dt); // wygładzanie niezależne od odświeżania
    ptr.x += (ptr.tx - ptr.x) * k * 0.7; ptr.y += (ptr.ty - ptr.y) * k * 0.7;

    if (!dragging) { vel += (IDLE - vel) * (1 - Math.pow(0.25, dt)); rot += vel * dt; }
    spin.rotation.y = rot;

    if (Math.abs(1 - m) > 0.0004 || Math.abs(mv) > 0.0004) {
      mv += ((1 - m) * 120 - mv * 11) * dt; m += mv * dt; dirty = true;
    } else if (m !== 1) { m = 1; mv = 0; dirty = true; }
    if (dirty) { rebuild(); dirty = false; }
    squashV += (-squash * 160 - squashV * 10) * dt; squash += squashV * dt;
    body.scale.set(1 + squash * 0.06, 1 - squash * 0.09, 1 + squash * 0.06);

    for (const key2 of ['h', 'el', 'zoom']) look[key2] += (lookT[key2] - look[key2]) * k * 0.55;
    for (const key2 of ['ox', 'oy', 'zoom']) lay[key2] += (layT[key2] - lay[key2]) * k * 0.6;

    const aspect = W / H;
    cam.aspect = aspect;
    const fit = aspect < 1.25 ? 1.25 / aspect : 1;
    const R = (10.2 * fit) / (look.zoom * lay.zoom);
    const el = look.el + ptr.y * -0.03, az = ptr.x * 0.05;
    const ty = WHEEL_H + look.h * 0.46;
    camT.set(Math.sin(az) * Math.cos(el) * R, ty + Math.sin(el) * R, Math.cos(az) * Math.cos(el) * R);
    cam.position.copy(camT); cam.lookAt(0, ty, 0);
    cam.setViewOffset(W, H, -lay.ox * W, -lay.oy * H, W, H);
    cam.updateProjectionMatrix();

    key.position.set(-2.6 + ptr.x * 4.2, 6.4, 3.4 + ptr.y * 2.4);
    renderer.render(scene, cam);
  }
  function start() { if (running) return; running = true; last = 0; raf = requestAnimationFrame(frame); }
  function stop() { running = false; cancelAnimationFrame(raf); }

  const api = { morphTo, setGlaze, setName, setLayout, resize, start, stop, onGrab: null, get shape() { return shapeName; }, kick(v) { vel += v; } };
  resize(); rebuild();
  return api;
}
