// Profile brył obrotowych. Każda bryła to lista odcinków [materiał, punkty (r, y)],
// prowadzona od osi na dole do osi na górze. Wszystkie bryły są próbkowane do tej samej
// liczby punktów, więc można je płynnie przenikać.
import { Color } from 'three';

const PI = Math.PI;
const arc = (cx, cy, rx, ry, a0, a1, n) =>
  Array.from({ length: n + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / n;
    return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry];
  });
const bez = (p0, c, p1, n) =>
  Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n, u = 1 - t;
    return [u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0], u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1]];
  });

export const N = 240; // punktów profilu

// materiał: [kolor hex | null = kolor wybrany przez gościa, metal, szorstkość, lakier]
const MATS = {
  glaze: [null, 0, 0.14, 1],
  paper: ['#f1eee6', 0, 0.22, 1],
  rec: ['#ff3d1f', 0, 0.28, 1],
  chrome: ['#f3f3f1', 1, 0.1, 0],
  clay: ['#e4e0d6', 0, 0.8, 0],
};

export const SHAPES = {
  bryla: {
    label: 'Bryła', h: 1.04, el: 0.16, zoom: 1,
    segs: [['clay', arc(0, 0.52, 0.62, 0.52, -PI / 2, PI / 2, 48)]],
  },
  flakon: {
    label: 'Flakon', h: 1.63, el: 0.15, zoom: 1,
    segs: [
      ['glaze', [[0, 0], [0.47, 0], ...arc(0.47, 0.05, 0.05, 0.05, -PI / 2, 0, 6), [0.52, 1.0], ...arc(0.44, 1.0, 0.08, 0.08, 0, PI / 2, 10), [0.2, 1.08]]],
      ['rec', [[0.172, 1.085], [0.172, 1.15]]],
      ['chrome', [[0.245, 1.15], [0.245, 1.6], ...arc(0.215, 1.6, 0.03, 0.03, 0, PI / 2, 5), [0, 1.63]]],
    ],
  },
  miska: {
    label: 'Miska', h: 0.7, el: 0.44, zoom: 1.02,
    segs: [
      ['glaze', [[0, 0], [0.4, 0], [0.43, 0.03], ...bez([0.43, 0.03], [0.98, 0.06], [1.0, 0.66], 28)]],
      ['rec', [[1.0, 0.66], [1.0, 0.69], [0.965, 0.7], [0.955, 0.67]]],
      ['paper', bez([0.955, 0.67], [0.92, 0.11], [0, 0.1], 32)],
    ],
  },
  dzwonek: {
    label: 'Dzwonek', h: 0.89, el: 0.27, zoom: 1.08,
    segs: [
      ['glaze', [[0, 0], [0.8, 0], [0.83, 0.03], [0.83, 0.09], [0.79, 0.13], [0.7, 0.13]]],
      ['chrome', arc(0, 0.13, 0.7, 0.56, 0, (PI / 2) * 0.93, 34)],
      ['chrome', [[0.06, 0.69], [0.06, 0.8]]],
      ['rec', [[0.14, 0.8], [0.14, 0.86], ...arc(0.11, 0.86, 0.03, 0.03, 0, PI / 2, 4), [0, 0.89]]],
    ],
  },
};

const tmp = new Color();

// Zwraca { pos: [r,y]*N, col: [r,g,b]*N, pbr: [metal, szorstkość, lakier]*N }
export function sample(name, glazeHex) {
  const shape = SHAPES[name];
  const pts = [];
  for (const [mat, list] of shape.segs) for (const p of list) pts.push([p[0], p[1], mat]);
  const len = [0];
  for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const total = len[len.length - 1];
  const pos = new Float32Array(N * 2), col = new Float32Array(N * 3), pbr = new Float32Array(N * 3);
  let k = 0;
  for (let i = 0; i < N; i++) {
    const d = (i / (N - 1)) * total;
    while (k < pts.length - 2 && len[k + 1] < d) k++;
    const span = len[k + 1] - len[k] || 1;
    const t = Math.min(1, Math.max(0, (d - len[k]) / span));
    pos[i * 2] = pts[k][0] + (pts[k + 1][0] - pts[k][0]) * t;
    pos[i * 2 + 1] = pts[k][1] + (pts[k + 1][1] - pts[k][1]) * t;
    const m = MATS[t < 0.5 ? pts[k][2] : pts[k + 1][2]];
    tmp.set(m[0] || glazeHex);
    col[i * 3] = tmp.r; col[i * 3 + 1] = tmp.g; col[i * 3 + 2] = tmp.b;
    pbr[i * 3] = m[1]; pbr[i * 3 + 1] = m[2]; pbr[i * 3 + 2] = m[3];
  }
  return { pos, col, pbr };
}
