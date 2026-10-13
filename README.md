# German Stock Market Analysis Engine

Static HTML reports that classify every stock in the German market into one **market state**, with a score, a confidence level and the reasons behind it. Generated on a schedule, published as plain HTML — no server, no build step, open in a browser or host anywhere.

**Coverage:** DAX · MDAX · SDAX (plus experimental PDAX, CDAX) — ~176 stocks, one report per trading day.

## Start here

| Page | What it is |
|---|---|
| [`index.html`](index.html) | **Read this first.** Explains the terminology and how the layers combine into a state. |
| [`stage_report.html`](stage_report.html) | Today's state report — stage distribution per index, clickable through to stock details. |
| [`stageReport/index.html`](stageReport/index.html) | Archive — pick two dates to compare, or replay any archived day. |

## How the classification works

Five independent analysts read the same stock. Three of them decide the state; two only adjust the score or the confidence.

| Layer | Question | Role |
|---|---|---|
| Weekly trend | What is the long-term structure? | **decides the state** |
| Daily trend | What is price doing right now? | **decides the state** |
| Energy | Is movement stored up or just released? | **decides the state** |
| Cycle position | Where are we inside the current swing? | adjusts confidence |
| Performance | Is it beating its sector and the index? | nudges the score |

Readings are combined into one of seven states:

`BREAKOUT` · `CONTINUATION` — both trends up, with and without a fresh energy build-up
`PAUSE` · `PULLBACK` — long-term trend intact, daily trend sideways or correcting
`COUNTERTREND` · `REVERSAL` — weekly trend down, daily bouncing or confirming
`TRANSITION` — the combination fits nothing else

The **score** ranks a setup against others in the same state — it never overrides the state. The **confidence** reflects how reliable the underlying readings are.

## Repository layout

```
index.html                     Explainer — terminology and method
stage_report.html              Today's state report (matrix per index)
stage_report_<index>_<state>.html   Stock lists per index and state
overview_scan_<index>.html     Full scan for one index
stageReport/                   Archive
  index.html                   Date comparison and calendar
  history.js                   Per-day data (window.STAGE_HISTORY)
  stage_report_YYYY-MM-DD.*    Frozen report per day
```

## Updating the published report

The HTML is generated elsewhere and copied into this repository:

```powershell
git -C C:\report add -A
git -C C:\report commit -m "Update stage report to YYYY-MM-DD"
```

`/E` copies everything without deleting, so the `.git` directory is never touched. Files that vanish from the source (e.g. a state that no longer exists) are removed by `git add -A` staging them as deletions.

## Scope and disclaimer

These reports are **decision-support tooling, not investment advice** — no predictions, no buy/sell instructions. Weigh your own horizon, valuation, fundamentals and risk exposure before acting. Past readings do not indicate future results.
