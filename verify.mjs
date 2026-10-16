import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const m = html.match(/\/\/ MATH-BEGIN([\s\S]*?)\/\/ MATH-END/);
assert.ok(m, 'math block found');
const api = new Function(
  m[1] + '; return { total, cacheHitOf, ratioOf, applyTotal, applyRatio, applyCacheHit, costOf, shares, blendedPrice, tokensFor, fromShape, RATIO_MIN, RATIO_MAX };'
)();

const near = (a, b, eps = 1e-6) => assert.ok(Math.abs(a - b) <= eps * Math.max(1, Math.abs(b)), `${a} ~ ${b}`);

// 1. Defaults reproduce the user's example session.
const s0 = { fresh: 136074, out: 20595, cache: 6379136 };
assert.equal(api.total(s0), 6535805);
near(api.cacheHitOf(s0), 6379136 / 6515210);
near(api.ratioOf(s0), 136074 / 20595);
near(api.costOf(s0, { in: 3, out: 15, cache: 0.3 }), 2.6308878);

// 2. Idempotence: re-deriving state from its own derived sliders is a no-op.
near(api.applyRatio(s0, api.ratioOf(s0)).out, s0.out, 1e-9);
deepNear(api.applyRatio(s0, api.ratioOf(s0)), s0);
deepNear(api.applyCacheHit(s0, api.cacheHitOf(s0)), s0);

function deepNear(a, b) {
  for (const k of Object.keys(b)) near(a[k], b[k], 1e-9);
}

// 3. Coupling: cache hit 97.91% -> 50%. Output fixed, freed tokens go to input,
//    ratio recalculates (6.61 -> ~158).
const s1 = api.applyCacheHit(s0, 0.5);
assert.equal(s1.out, s0.out);
near(s1.fresh, 3257605);
near(s1.cache, 3257605);
near(api.ratioOf(s1), 158.1746);

// 4. Path independence: every slider move undone returns the exact state.
deepNear(api.applyCacheHit(s1, api.cacheHitOf(s0)), s0);
const s2 = api.applyRatio(s0, 3);
deepNear(api.applyRatio(s2, api.ratioOf(s0)), s0);
deepNear(api.applyTotal(s0, api.total(s0) * 2), { fresh: 272148, out: 41190, cache: 12758272 });
deepNear(api.applyTotal(api.applyTotal(s0, api.total(s0) * 7), api.total(s0)), s0);

// 5. Sum invariant across a grid of slider positions.
const base = { fresh: 1e6, out: 1e6, cache: 1e6 };
for (const r of [0.01, 1, 6.607, 158, 1000]) {
  const sr = api.applyRatio(base, r);
  near(api.total(sr), 3e6, 1e-9);
  near(api.cacheHitOf(sr), 0.5, 1e-9);
  for (const h of [0, 0.25, 0.5, 0.9791144, 1]) {
    const sh = api.applyCacheHit(sr, h);
    near(api.total(sh), 3e6, 1e-9);
    near(sh.out, sr.out, 1e-9);
    near(api.cacheHitOf(sh), h, 1e-9);
    for (const k of [0.1, 1, 3.7]) {
      near(api.total(api.applyTotal(sh, 3e6 * k)), 3e6 * k, 1e-9);
    }
  }
}

// 6. Compare-tab math: shares sum to 1 and tie exactly into tab-1's cost model.
const P = { in: 3, out: 15, cache: 0.3 };
for (const r of [0.01, 1, 6.607, 158, 1000]) {
  for (const h of [0, 0.5, 0.9791144, 1]) {
    const w = api.shares(r, h);
    near(w.fresh + w.out + w.cache, 1, 1e-9);
    const s = api.applyRatio(api.applyCacheHit(base, h), r);
    near(api.blendedPrice(w, P), api.costOf(s, P) / api.total(s) * 1e6, 1e-9);
    near(api.tokensFor(10, api.blendedPrice(w, P)), 10 * api.total(s) / api.costOf(s, P), 1e-9);
  }
}

// Example session shape: blended price == cost per million tokens; budget buys B/cost(S) sessions.
const w0 = api.shares(api.ratioOf(s0), api.cacheHitOf(s0));
near(api.blendedPrice(w0, P), api.costOf(s0, P) / api.total(s0) * 1e6, 1e-9);
near(api.tokensFor(10, api.blendedPrice(w0, P)), 10 * api.total(s0) / api.costOf(s0, P), 1e-9);

// Winner flips with shape: cheap-input provider wins input-heavy, cheap-output wins output-heavy.
const PA = { in: 1, out: 10, cache: 1 }, PB = { in: 2, out: 1, cache: 2 };
const tokA = r => api.tokensFor(100, api.blendedPrice(api.shares(r, 0.5), PA));
const tokB = r => api.tokensFor(100, api.blendedPrice(api.shares(r, 0.5), PB));
assert.ok(tokA(1000) > tokB(1000), 'input-heavy: cheap input wins');
assert.ok(tokB(0.01) > tokA(0.01), 'output-heavy: cheap output wins');

// Zero prices -> unlimited tokens.
assert.equal(api.tokensFor(10, api.blendedPrice(api.shares(1, 0.5), { in: 0, out: 0, cache: 0 })), Infinity);

// 7. fromShape: builds a session from (total, ratio, cache hit); inverts the shape getters.
const sDef = api.fromShape(10e6, 7.5, 0.985);
near(api.total(sDef), 10e6, 1e-9);
near(api.ratioOf(sDef), 7.5, 1e-9);
near(api.cacheHitOf(sDef), 0.985, 1e-9);
deepNear(api.fromShape(api.total(s0), api.ratioOf(s0), api.cacheHitOf(s0)), s0);

console.log('all math checks passed');
