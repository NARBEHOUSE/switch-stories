/** Little Fox. Source wording and attribution: CREDITS.md.
 * Shared switch input, settings and reading behavior are unchanged.
 * One action at a time, with the same poses in both display modes.
 */
(function () {
    'use strict';
    // BEGIN GENERATED FEET
    const feet = {
        "fox-show-low": 0.956597,
        "fox-show-high": 0.956597,
        "fox-home-rest": 0.963181,
        "fox-home-clasp": 0.963181,
        "fox-home-ears": 0.963181,
        "fox-bed-peek": 0.951362,
        "fox-bed-hide": 0.951362,
        "sand-mound": 0.93188,
        "sand-bulge": 0.93188,
        "turtle": 0.966292,
        "teacher-rest": 0.970964,
        "teacher-point": 0.970964,
        "fox-wonder-left": 0.971098,
        "bear-draw-rest": 0.95935,
        "bear-draw-stroke": 0.95935,
        "rabbit-draw-rest": 0.964235,
        "rabbit-draw-stroke": 0.964235,
        "crab": 0.940845,
        "fox-walk-rest": 0.952741,
        "fox-walk-a": 0.952741,
        "fox-walk-b": 0.952741,
        "fox-writing-rest": 0.952741,
        "fox-writing-a": 0.952741,
        "fox-writing-b": 0.952741,
        "bear-stride-0": 0.956897,
        "bear-stride-1": 0.956897,
        "bear-stride-2": 0.956897,
        "bear-stride-3": 0.956897,
        "rabbit-stride-0": 0.960754,
        "rabbit-stride-1": 0.960754,
        "rabbit-stride-2": 0.960754,
        "rabbit-stride-3": 0.960754,
        "clam-closed": 0.958814,
        "clam-open": 0.958814,
        "turtle-reveal-low": 0.943946,
        "turtle-reveal-up": 0.943946,
        "turtle-reveal-smile": 0.943946,
        "turtle-picture": 0.98135,
        "cover-pair": 0.95
    };
    // END GENERATED FEET
    const objects = {};
    Object.keys(feet).forEach(name => {
        const image = 'sprites/' + name + '.webp';
        objects[name] = { image, cviImage: image };
    });
    ['florida-beach', 'home-garden', 'home-bedroom'].forEach(name => {
        const image = 'backgrounds/' + name + '.webp';
        objects[name] = { image, cviImage: image };
    });
    function layer(object, x, height, extra) {
        return Object.assign({ object, x, height, bottom: 0.92, foot: feet[object], active: false, poses: [] }, extra);
    }
    function act(object, x, height, poses, extra) {
        return layer(object, x, height, Object.assign({ active: true,
            poses: typeof poses === 'string' ? [{ at: 0.28, object: poses }] : poses }, extra));
    }
    function page(text, layers, background = 'florida-beach', animated = true) {
        return Object.assign(Array.isArray(text) ? { textParts: text } : { text }, {
            action: animated ? 'breeze' : 'none', actionSound: 'none',
            illustration: { cover: true, panorama: background, extension: background,
                panoramaBounds: [0.18, 0.84, 0.94], colors: ['#a7d6f2', '#f4e4c6', '#f4e4c6'],
                focus: [0.01, 0.06, 0.99, 0.97], layers }
        });
    }
    const bear = () => layer('bear-draw-rest', 0.16, 0.57);
    const rabbit = () => layer('rabbit-draw-rest', 0.39, 0.72);
    const wonderingFox = () => layer('fox-wonder-left', 0.80, 0.57);
    const turtle = () => layer('turtle', 0.73, 0.44);
    const draw = (name, x, height, sequence) => {
        const frames = [name + '-draw-rest', name + '-draw-stroke', name + '-draw-rest', name + '-draw-stroke', name + '-draw-rest'];
        return act(frames[0], x, height, [0.15, 0.38, 0.60, 0.84].map((at, i) => ({ at, object: frames[i + 1] })), { sequence });
    };
    const run = (name, x, height, sequence, travel) => act(name + '-stride-0', x, height,
        Array.from({ length: 8 }, (_, i) => ({ at: (i + 1) / 9, object: name + '-stride-' + ((i + 1) % 4) })),
        { sequence, motion: 'walk', travel });
    function scene(p) {
        p.illustration.cviScene = true;
        p.illustration.cviBounds = [0.20, 0.24, 1.95, 0.96];
        return p;
    }
    function longer(p) { p.action = 'beachwalk'; return p; }
    function ending(p) {
        p.illustration.closeUp = { object: 'turtle-picture', layer: 1, start: 0.42, end: 0.88,
            x: 0.06, y: -0.39, height: 0.28 };
        return longer(p);
    }
    NSS.registerStory({
        folder: 'little-fox', title: 'Little Fox', availableOn: '2026-11-21',
        description: 'Little Fox is unsure what to draw on a class trip to the beach. What will catch his eye?',
        readingTag: 'Short passages', storyType: 'adapted', tags: ['Animals', 'Friendship'],
        requireFreshTurn: true, cviOutline: 'alpha', objects,
        credits: {
            text: 'Little Fox. Illustrations: Neurfah Sumeruwhai. Editor: Rapeephan Pattanavech. Contributors: John Viano and Peeriya Pongsarigun. Published by The Asia Foundation – Let’s Read. Supplied English adaptation © The Asia Foundation, 2025. Story presentation and artwork adapted for switch access by NARBE LLC. Created to expand access to stories for people who use switches and support a wider range of accessibility needs.',
            links: [
                { label: 'CC BY-NC 4.0', url: 'https://creativecommons.org/licenses/by-nc/4.0/' },
                { label: 'Let’s Read source', url: 'https://www.letsreadasia.org/' }
            ]
        },
        pages: [
            page('Little Fox', [layer('cover-pair', 0.5, 0.76)], 'florida-beach', false),
            page([
                'Little Fox was too shy to go near butterflies.',
                'Their fluttering wings would startle him!',
                'Even the soft flick-flick, flick-flick against the window made Little Fox shiver.'
            ], [act('fox-home-rest', 0.45, 0.76, 'fox-home-clasp')], 'home-garden'),
            page([
                'Little Fox didn’t like the sound of the windows opening or closing.',
                'Their creak-creak sound really scared him.'
            ], [act('fox-home-clasp', 0.43, 0.76, 'fox-home-ears')], 'home-bedroom'),
            page('So, he slept buried under the covers to hide from the scary sounds of the windows.',
                [act('fox-bed-peek', 0.46, 0.524, 'fox-bed-hide', { bottom: 0.94 })], 'home-bedroom'),
            longer(page([
                'One morning, Little Fox woke up feeling excited.',
                'His teacher was taking the whole class on a trip to the beach!',
                '“Find something to draw,” she instructed.'
            ], [layer('fox-wonder-left', 0.16, 0.52), draw('bear', 0.38, 0.52, [0.24, 0.60]),
                draw('rabbit', 0.59, 0.66, [0.64, 1]),
                act('teacher-rest', 0.83, 0.76, 'teacher-point', { sequence: [0, 0.20] })])),
            page([
                'Little Bear was busy drawing a crab. So was Little Rabbit!',
                'Little Fox stood swaying from foot to foot, wondering what to draw.'
            ], [bear(), rabbit(), wonderingFox(), act('crab', 0.60, 0.23, [], { motion: 'hop' })]),
            page([
                'Little Bear moved on to draw a clam. Little Rabbit decided to draw one too.',
                'Little Fox stood swaying from foot to foot, wondering what to draw.'
            ], [bear(), rabbit(), wonderingFox(), act('clam-closed', 0.60, 0.23, [
                { at: 0.16, object: 'clam-open' }, { at: 0.38, object: 'clam-closed' },
                { at: 0.60, object: 'clam-open' }, { at: 0.84, object: 'clam-closed' }
            ])]),
            page('Suddenly, a mound of sand started moving.', [
                layer('bear-draw-rest', 0.13, 0.52), layer('fox-wonder-left', 0.33, 0.52),
                layer('rabbit-draw-rest', 0.51, 0.66),
                act('sand-mound', 0.77, 0.40, [
                    { at: 0.25, object: 'sand-bulge' }, { at: 0.60, object: 'sand-mound' },
                    { at: 0.82, object: 'sand-bulge' }
                ], { motion: 'rumble' })]),
            longer(page([
                'Little Bear and Little Rabbit ran away, screaming “Monster!”',
                'But Little Fox was too stunned to run.'
            ], [layer('fox-wonder-left', 0.64, 0.52), layer('sand-bulge', 0.85, 0.31),
                run('bear', 0.23, 0.44, [0, 0.46], -0.10),
                run('rabbit', 0.45, 0.54, [0.52, 1], -0.17)])),
            page('A strange creature slowly lifted its head, revealing itself.', [
                layer('fox-wonder-left', 0.24, 0.61),
                act('turtle-reveal-low', 0.70, 0.55, [
                    { at: 0.28, object: 'turtle-reveal-up' }, { at: 0.65, object: 'turtle-reveal-smile' }
                ])]),
            scene(page([
                'Then, it jumped out of the sand!',
                'But Turtle did not scare Little Fox at all.'
            ], [layer('sand-mound', 0.73, 0.25, { bookOnly: true }), turtle(),
                act('fox-walk-rest', 0.24, 0.64, [
                    { at: 0.08, object: 'fox-walk-a' }, { at: 0.22, object: 'fox-walk-rest' },
                    { at: 0.34, object: 'fox-walk-b' }, { at: 0.47, object: 'fox-walk-rest' },
                    { at: 0.60, object: 'fox-walk-a' }, { at: 0.73, object: 'fox-walk-rest' },
                    { at: 0.84, object: 'fox-walk-b' }, { at: 0.96, object: 'fox-writing-rest' }
                ], { motion: 'walk', travel: 0.23 })])),
            scene(page('And now, Little Fox knew exactly what to draw.', [turtle(),
                act('fox-writing-rest', 0.47, 0.64, [
                    { at: 0.16, object: 'fox-writing-a' }, { at: 0.32, object: 'fox-writing-b' },
                    { at: 0.48, object: 'fox-writing-rest' }, { at: 0.64, object: 'fox-writing-a' },
                    { at: 0.82, object: 'fox-writing-b' }
                ])])),
            ending(page('The End', [turtle(), act('fox-show-low', 0.47, 0.64, 'fox-show-high')]))
        ]
    });
})();
