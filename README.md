[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Hoppererin/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Hoppererin/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

# Leonida Platinum — GTA VI Trophy Guide & Tracker

An offline guide and tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI (1 Platinum, 2 Gold, 6 Silver, 46 Bronze — 28 hidden on PlayStation until earned, all single-player, no online trophies).

## What it is

A static web app under `app/` — no build step, no network requests at runtime. Open `app/index.html` in desktop Chrome with the network off and it works from its own files.

- **Tracker** — a checklist of every trophy with its official name, description and grade, saved in the browser (localStorage), with export to a file and import back.
- **Filters** — by kind (story, missable, collectibles, activities, online, platinum), by earned/remaining, and by search.
- **Spoiler setting** — hides the names and descriptions of story trophies until they are earned.
- **Roadmap to the Platinum** — nine stages built from the official trophy descriptions: story first, then side characters, exploration, races, robberies, money and the 100% cleanup.
- **Missables** — the one trophy the guides flag as possibly missable (Positive Mental Attitude), plus why the rest cannot be missed.
- **A cited guide for every trophy** — each guide is written in this entry's own words, names its sources beside it, and says plainly where no guide has confirmed a method yet instead of inventing one.

## Data sources

- Official trophy names, descriptions and grades: [Exophase — GTA VI trophies](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/) and [PSNProfiles — GTA VI trophies](https://psnprofiles.com/trophies/43531-grand-theft-auto-vi), which agree on every name, description and grade.
- Methods and roadmap: [Of Zen and Computing](https://www.ofzenandcomputing.com/gta-6-trophy-list-trophies-achievements/), [Playday.one](https://playday.one/2026/11/18/gta-6-trophy-achievement-list/), [CryptoGames](https://cryptogames.gg/gta-6-trophies-achievements-full-list/) (GTABase and PowerPyx), [U7BUY](https://www.u7buy.com/blog/gta-6-trophies/), [Output Lag](https://outputlag.com/guides/gta-6-trophy-list/) and [EGamers](https://egamers.io/gta-6-trophy-list-all-55-trophies-and-achievements-plus-the-hardest-ones/). Every trophy's guide cites its own sources in `app/data/trophies.json` and in the app.

## Layout

- `app/index.html` — the page; `app/app.js` — the tracker; `app/style.css` — the look; `app/data/trophies.json` — all 55 trophies with official data, guides, steps and sources.
- `main.ts` — the entry program: copies `app/` and `screenshots/` to `/output` (or `$MAKEFUN_OUTPUT_DIR`) and writes `/output/dossier.json` with `vendor/makefun-frontend.ts` (`buildDossier`).
- `screenshots/` — four captures of the running app.
- `vendor/makefun-frontend.ts` — the kit's dossier library, vendored unchanged.

## Run it

```sh
python3 -m http.server 8080 --directory app
# open http://localhost:8080 in desktop Chrome
```

Or hand it in:

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Note

An unofficial fan guide. Not affiliated with, endorsed by or connected to Rockstar Games or PlayStation. No Rockstar logo, official artwork, box art or game screenshot is used anywhere in this app.

---

Entered on [make.fun](https://make.fun/r/dhj53q2r) — GTA 6 trophy guide bounty.
