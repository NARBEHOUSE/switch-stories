# Switch Stories (website copy)

Illustrated stories for switch users, published at **https://narbehouse.github.io/switch-stories/**.

- **Source of truth:** the game is built in Ben's PC Hub (the Electron app), folder
  `bennyshub/apps/games/NARBESWITCHSTORIES`. Copy changes from there to here, never the other way.
- **Website-only changes in this copy:** shared hub files load from the main site with absolute
  `/bennyshub/...` paths (scan manager, voice manager, platform, fonts, favicons, analytics), the
  standalone exit goes to `/bennyshub/index.html`, local font, analytics tag, favicons, `?v=` cache tags,
  and no `electron-bridge.js`. Keep these when re-copying from the PC app.
- **Hosting:** GitHub Pages from `main` (root), no custom domain, so the game shares the
  `narbehouse.github.io` origin with Benny's Hub (same saved settings, frame messaging works).
- **Tests:** `node --test tests/*.test.cjs`
- **Local preview:** run `npm start` in the main site repo (`NARBE LLC WEBSITE`); it serves this folder
  at http://127.0.0.1:4173/switch-stories/ next to the hub.
- Story credits and licences: see `CREDITS.md`.
