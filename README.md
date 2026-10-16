# llm-cost-comparison

> Got a $2.63 API bill with a 97.9% cache hit rate, so obviously I built an entire tool about it instead of just... paying.

## The meme

Nobody:
Absolutely nobody:
My coding session: re-reads your entire codebase from cache 6,379,136 times and bills you $0.30/M for the privilege

---

🚫 Reading model pricing docs at 2am
😎 Dragging a slider until "Alpha — 10.2× the tokens of Beta"

---

🧠 Reading the pricing page
🧠✨ Estimating what a session costs
🧠✨🌟 Simulating "what if my cache hit drops to 50%"
🧠✨🌟🌌 Subscriptions: pay $10, get $30 credits, watch Beta overtake Alpha mid-drag

---

Fresh input: $3/M. Cache read: $0.30/M.
My trust issues, but as a billing model.

## What it actually does (sober version)

- **Session cost tab** — paste input / output / cache-read prices ($ per 1M tokens), shape a session with sliders (total tokens, input:output ratio, cache hit %), watch the damage update live. Lower the cache hit and watch every freed token crawl back into the input bill, exactly like in real life.
- **Compare providers tab** — two providers side by side, your monthly payment, subscription credit multipliers (pay $10 → $30 credits = 3×), same session shape — and a verdict: who gives you more tokens, and how many times more.

Everything persists to `localStorage`. Reloading is safe. Your spreadsheet of regrets is saved.

## Usage

Open `index.html` in a browser. That's it — no build step, no dependencies, no npm install, no trauma.

## Tests

```bash
node verify.mjs
```

The math is pure and verified: sliders are path-independent, cache-hit drops push tokens into input (never output), and the comparison logic flips exactly when it should.
