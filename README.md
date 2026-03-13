# Rideshare or Transit?

A quick, opinionated decision-making tool that helps you (Uri) figure out whether to take a rideshare or public transit.

Answer a few questions — cost, time, energy level, how much stuff you're carrying, how much you're dreading transit, and what you'd actually do with the saved time — and choose to ignore or accept the verdict.

## How it works

The app walks you through five screens:

1. **Cost & Time** — Slide to set rideshare vs. transit cost and travel time
2. **What matters most** — Pick your top priority (energy, money, time, or luggage)
3. **Vibe check** — How tired are you? How much are you carrying? Could transit actually be nice?
4. **Dread tax** — How much do you really not want to take transit?
5. **Regret test** — If you pay for the car and arrive early, what actually happens?

## How decisions are weighted

| Factor | Effect on score |
|---|---|
| Each minute transit is slower | +0.8 per minute toward rideshare |
| Transit is faster | -10 toward transit |
| Each extra dollar for rideshare | -1.2 per dollar toward transit |
| Luggage: light / moderate / heavy | 0 / +8 / +18 |
| Energy: fine / tired / exhausted | -5 / +6 / +16 |
| Transit might be nice: yes / doubtful / no | -12 / 0 / +8 |
| Dread: not bad / rather not / absolutely not | -5 / +15 / +40 |
| Regret: use it / decompress / phone / no idea | +10 / +5 / -10 / -8 |

Your top priority gets a 1.5x multiplier. Score > 5 = rideshare, < -5 = transit, in between = toss-up.
