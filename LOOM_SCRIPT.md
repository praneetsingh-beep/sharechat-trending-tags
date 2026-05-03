# 2-Minute Loom Walkthrough Script

**Total target: 1:55–2:05.** Read fast — Loom auto-captions, viewers can pause.

**Setup before recording:**
- Open the Vercel URL in Chrome at iPhone-15-Pro mobile emulation (DevTools → Toggle device toolbar)
- Have the GitHub README open in a second tab, scrolled to the Mermaid diagram
- Have a stopwatch visible — practice once before the real take

---

## [0:00–0:15] HOOK — the insight

> "Hi, I'm Praneet. Here's the thing about trending tags for Bharat: the standard approach — pull from one source, rank by mention count — fails the moment Mumbai is flooding *and* India is playing Australia *and* it's Akshaya Tritiya, all on the same day. You need cross-source consensus, not just volume. That's what I built."

*[Show the homepage rail in mobile view — the colourful gradient cards rolling past]*

---

## [0:15–0:55] THE PRODUCT DEMO

> "This is the ShareChat feed. The trending rail sits at the top, where it would in the real app, above the mock posts."

*[Scroll the rail horizontally — show the gradient cards, the flame emojis, the heat scores]*

> "Each card is gradient-coded by category — orange for sports, fuchsia for entertainment, yellow for devotional. Hindi typography is the hero. The flame emojis tell you intensity at a glance."

*[Tap on the top trend — say #IndiaVsAustralia]*

> "Tap any card and you're in the detail view. Big Hindi headline. Heat score on a hundred-point scale. The number of independent sources that triangulated this trend — that's the trust signal."

*[Scroll down]*

> "AI summary in Hindi — that's the bonus. The lead news headline below it. And here — most apps don't show this — *how* this trend was assembled. Source count, velocity, recency, engagement. Transparent."

*[Scroll back to the rail, tap the refresh button]*

> "Refresh button hits the live pipeline — these tags reflect what's trending *right now*, not cached at build time."

---

## [0:55–1:45] THE WORKFLOW

*[Switch to GitHub README tab, scroll to the Mermaid diagram]*

> "Here's the pipeline. Four independent sources — Google Trends India, news headlines, Reddit India subs, and Wikipedia top-views. I deliberately skipped Twitter — the API costs $100/month now and Reddit plus News covers the same ground."

> "Signals fan in via `Promise.allSettled`, so one source rate-limiting doesn't kill the whole refresh."

> "Tag extractor mines capitalised noun-phrases from long news headlines and passes through Google Trends terms as-is. Then a Jaccard-similarity clusterer dedupes — so 'IND vs AUS' and 'India vs Australia' become one cluster."

> "The heat score is a weighted formula: 35% source-count, 25% velocity, 20% news-recency, 15% engagement, 5% India-specificity. The rationale is in the README — the big idea is that cross-source agreement is the strongest 'this is real' signal."

> "Top 15 ranked tags go through Claude Haiku in one batched call — it returns Hindi names, descriptions, categories, and a 2-3 sentence AI summary. About a cent per refresh, runs every 30 minutes via Vercel cron."

---

## [1:45–2:00] WHAT'S NEXT + CLOSE

> "With four more weeks I'd add: per-region personalisation — a Mumbai user should see Mumbai Rains higher than a Hyderabad user — a shadow-eval harness to grade the ranking against a held-out ground truth, and trending-audio detection so creators get music suggestions, not just text tags."

> "Code's on GitHub, README has the full write-up. Thanks for watching."

---

## Recording tips

- **Don't read** — internalise the script, then talk over the demo
- **Show, don't describe** — let the gradient cards and Hindi typography speak; you narrate the *reasoning*
- **Pause at the heat dial** — that's the prettiest single screen, let it breathe for 1 second
- **Speak at 1.1x natural speed** — Loom playback compensates and you'll fit in 2 min
- **Phone-frame view in dev tools** is non-negotiable — desktop layout will count against you per the rubric

## Pre-flight checklist

- [ ] Vercel URL loads without errors (verify the API endpoint returns ≥10 tags)
- [ ] Phone-frame Chrome device toolbar is on (iPhone 15 Pro / 393 × 852)
- [ ] README scrolled to the Mermaid diagram in second tab
- [ ] Mic test — speak the first 2 lines, play back, check audio levels
- [ ] Loom set to record screen + voice (no webcam — keeps focus on product)
