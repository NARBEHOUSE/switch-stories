# Cat and Dog Tea

- Author and illustrator: René Leisink.
- Publisher: The Asia Foundation – Let's Read.
- The supplied English edition identifies itself as a modified version of the original story, © The Asia Foundation, 2023.
- Source: the user-supplied `Cat-and-Dog-Tea_eng_LANDSCAPE_V12024.04.03T060142+0000.pdf`, from [Let's Read](https://www.letsreadasia.org/).
- Source license: [Creative Commons Attribution–NonCommercial 4.0 International](https://creativecommons.org/licenses/by-nc/4.0/), retained for this adaptation's book content and adapted artwork.
- Source PDF SHA-256: `406a9b8b8d6fa9fcd2cc6e468c8b92df1b36fdd34ed5ec36d2c1ef722eaa6cef`.

Switch-access adaptation by NARBE LLC. Created to expand access to stories for people who use switches and support a wider range of accessibility needs. The in-game title page retains the author, illustrator, publisher, source, license and notice of changes. No endorsement by the original contributors is implied.

The eight original reading lines are retained exactly, including the ellipses across pages 7 and 8. The title is retained, and the added “The End” page shows the friends celebrating before Elephant drinks from the tub. The publisher's credits page is represented by the title-page attribution rather than an additional reading page.

Illustrations were recreated from the supplied artwork using the built-in image_gen tool. The same tea-stall setting is extended into a panorama with quiet sky and pavement for different screen shapes. Scene compositions are rearranged around separate, registered character poses. The tub rests horizontally on the ground in this adaptation. Cat, Dog and Elephant keep their source identities. Characters and props retain their proportions as the available picture area changes.

Only one character acts at a time. On page 8, Dog finishes pouring and holds still before Elephant smiles and nods. On the ending page, all three begin in celebratory poses, then only Elephant moves to drink. The existing page controller supplies the action timing; no new input handler, setting or scanning behavior is introduced. Actions wait for the story text, and this book requires a fresh press after an action to turn the page or finish. The cover remains still.

| Page | Original words | Acting character and visible action | Simple High Contrast focus |
| --- | --- | --- | --- |
| 1 | A cup of tea? | Cat extends the little cup and saucer. | Cat with the cup and saucer. |
| 2 | No, not for me. | Elephant raises a hand to refuse. | Elephant and the raised hand. |
| 3 | A mug of tea? | Cat extends the larger striped mug. | Cat with the mug. |
| 4 | No, too small for me. | Elephant opens his eyes and makes a small thumb-and-finger pinch gesture. | Elephant and the small gap between his fingers. |
| 5 | A pot of tea? | Dog lifts the teapot to offer it. | Dog holding the teapot. |
| 6 | No, I am big. | Elephant opens his eyes and spreads both arms wide. | Elephant with both arms extended. |
| 7 | I want to drink... | Elephant points down into the empty bathtub with one finger. | Elephant and the empty bathtub. |
| 8 | ...a tub of tea! | Dog pours, then stops; Elephant opens his eyes, smiles and gives one nod while looking at the tub. | Dog, Elephant, teapot and tub; only one character acts at a time. |
| 9 | The End (added) | Cat, Dog and Elephant begin in happy raised-arm poses. Elephant dips his trunk into the tea, then curls it to his mouth to drink. | Elephant celebrates, then drinks from the tub. |

Both looks use the same registered poses and timeline. Simple High Contrast keeps only the characters and tea items needed for that page's action, and uses the existing black background, Regular/Large sizing and selectable outline colors. Image and after-action descriptions for both looks are in `../../IMAGE-DESCRIPTIONS.html`.

The Simple High Contrast title and Read Again screen both show Cat and Dog together, reusing their existing celebratory illustration. Elephant's ending-page celebration has white oval eyes around black pupils to match the other open-eye poses. The ending tub now matches its first appearance on page 7: an elongated white bath with white feet and a small gold handle, filled with tea. All three ending poses use this design in both looks and are aligned using the stationary tub. The original eye-correction source is retained in the generation manifest; the reviewed tub-edit prompt and output checksum are recorded in `ARTWORK.json`. The `--ending-only` option on the asset packer updates these three poses without rewriting the other artwork.

The final two sequences use an existing 4.2-second pose clock. Page 8 pours at 10%, returns the pot upright at 45%, smiles at 57%, nods down at 72%, and lifts the head at 87%. Page 9 dips the trunk at 20% and drinks at 62%. Original Dog pouring sprites are preserved byte-for-byte; the asset packer combines them with Elephant's registered poses so the same scene works in both views. All changes are story data, artwork and descriptions. `local-reference/cat-and-dog-tea/revision-before.json` records the unchanged pages and artwork from before these adjustments.

`ARTWORK.json` records exact prompts, generated-source checksums, packing dimensions and frame alignment. Individual transparent poses are lossless WebP at their authored resolution; the shared page-8 frames combine those poses on a 1170×880 canvas. Opaque scenery uses quality 90 WebP. Reusing the same clean sprites for both looks avoids duplicate image downloads. The source PDF remains at the supplied location; extracts and generation records are under `local-reference/cat-and-dog-tea/` at the project root, outside the shipping game. Rebuild only this book's assets with `tools/prepare-cat-and-dog-tea.cjs`.

The central shop and actors keep their proportions. Quiet outer sky, grass and pavement fill unusually wide or tall screens without stretching recognizable decorations. The existing illustration safe-area option reserves space for Pause and its hint. No shared renderer changes are needed.

Validation: `node tests/switchstories-cat-and-dog-tea.cjs` checks source wording, description coverage, one acting character, pose registration, asset sizes and hashes of the existing game files and descriptions. Run the visual and interaction checks through `node tools/run-electron-test.cjs tests/switchstories-cat-and-dog-tea-electron.cjs`; the wrapper isolates Windows native writes in a disposable temporary directory. That test covers all ten pages, both views, both text sizes, both high-contrast character sizes, eight viewport sizes from 320×568 to 3840×2160, fresh presses, both pause input modes and all outline choices. Its compact screenshots and report are saved under `tmp/cat-and-dog-tea-review/`. Viewport checks are desktop Electron checks, not physical-device testing.
