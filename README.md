# llm-cost-comparison

A small calculator for what an LLM API session costs, including cache pricing and subscription credits, plus a side-by-side comparison of two providers. The whole app is one `index.html` file: no build step, no dependencies, no network calls.

Live copy: [glaicer.github.io/llm-cost-comparison](https://glaicer.github.io/llm-cost-comparison/)

## Why it exists

A coding session of mine billed 6.5M tokens for $2.63: 97.9% of the input side was cache reads, at $0.30 per 1M tokens against $3.00 for fresh input (output was $15.00). Fine bill, interesting math. The follow-up questions were harder to answer from a pricing page: what does that session cost at a 50% cache hit, and which provider gives more tokens per dollar once a subscription turns $10 into $30 of credits? This page answers both with sliders.

## Session cost tab

Enter the provider's prices: input, output, and cache read, in $ per 1M tokens. Then shape the session with three sliders, each with a field for exact values: total tokens (10K to 100M, log scale), input:output ratio, and cache hit rate. The total updates while you drag, with a breakdown of what each bucket costs.

Each drag preserves what you are not touching. Dragging total tokens scales the whole session. Dragging the ratio keeps the total and the cache hit, and reshapes input against output. Dragging the cache hit keeps output fixed and moves the freed cache tokens into fresh input, which is why the cost climbs quickly when the rate drops.

## Compare providers tab

Two providers side by side, each with its own three prices. Set a monthly budget (presets from $1 to $100) and, where a provider has a subscription, a credit multiplier: paying $10 and receiving $30 in credits is 3×. Both providers are priced on the same session shape, and the tab shows how many tokens the budget buys from each, the blended $ per 1M, and a verdict naming the winner and its factor.

Everything you enter on either tab is saved to localStorage and restored on the next visit.
