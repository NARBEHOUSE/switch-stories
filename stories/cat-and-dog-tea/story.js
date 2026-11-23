/** Cat and Dog Tea. Source wording and credits: CREDITS.md.
 * Data only: uses the existing layered-illustration renderer and page flow.
 * Only one character acts at a time; page 8 sequences Dog before Elephant.
 */
(function () {
    'use strict';
    const objects = {};
    const feet = {
        'cat-cup-rest': 0.967866, 'cat-cup-offer': 0.967866,
        'cat-mug-rest': 0.968072, 'cat-mug-offer': 0.968072,
        'dog-pot-rest': 0.971231, 'dog-pot-offer': 0.971231,
        'elephant-rest': 0.970379, 'elephant-refuse': 0.970379,
        'elephant-wide-rest': 0.971297, 'elephant-wide': 0.971297,
        'elephant-tub-rest': 0.968474, 'elephant-tub-point': 0.968474,
        'elephant-small-rest': 0.971623, 'elephant-small': 0.971623,
        'elephant-tea-cheer': 0.964286, 'elephant-tea-dip': 0.964286, 'elephant-tea-sip': 0.964286,
        'cat-dog-cheer': 0.976614,
        'tea-sharing-rest': 0.943182, 'tea-sharing-pour': 0.943182,
        'tea-sharing-smile': 0.943182, 'tea-sharing-nod': 0.943182,
        'tea-cart': 0.963873, 'cover-group': 0.971264
    };
    Object.keys(feet).forEach(name => {
        const image = 'sprites/' + name + '.webp';
        objects[name] = { image, cviImage: image };
    });
    // The title and Read Again screen share the same simple Cat-and-Dog illustration.
    objects['cover-group'].cviImage = 'sprites/cat-dog-cheer.webp';
    objects.stall = { image: 'backgrounds/tea-stall.webp', cviImage: 'backgrounds/tea-stall.webp' };
    objects.extension = { image: 'backgrounds/tea-extension.webp', cviImage: 'backgrounds/tea-extension.webp' };

    function layer(object, x, height, extra) {
        return Object.assign({ object, x, height, bottom: 0.91, foot: feet[object],
            active: false, poses: [] }, extra);
    }
    function act(object, x, height, after, extra) {
        return layer(object, x, height, Object.assign({ active: true,
            poses: [{ at: 0.18, object: after }] }, extra));
    }
    function page(text, layers, animated = true, focus = [0.03, 0.07, 0.99, 0.97], action = 'breeze') {
        return {
            text,
            // Existing pose clocks: 3.2 seconds, or 4.2 for the two final sequences.
            action: animated ? action : 'none', actionSound: 'none',
            illustration: {
                // Existing safe-area flag reserves the Pause control band at every aspect ratio.
                cover: true,
                panorama: 'stall', panoramaBounds: [0.2, 0.8, 0.92],
                extension: 'extension', colors: ['#c9e8f9', '#efe0d2', '#f1b6ae'],
                focus, layers
            }
        };
    }
    // Keep the cart behind the actors, so an offered cup or pot is never hidden.
    const cart = () => layer('tea-cart', 0.39, 0.31, { bottom: 0.87 });
    const cat = object => layer(object || 'cat-cup-rest', 0.23, 0.60);
    const dog = () => layer('dog-pot-rest', 0.49, 0.63);
    const elephant = () => layer('elephant-rest', 0.81, 0.80);
    const teaScene = () => page('...a tub of tea!', [
        layer('cat-cup-rest', 0.20, 0.46, { bottom: 0.78 }),
        // Same registered scene in both views. Dog stops before Elephant responds.
        layer('tea-sharing-rest', 1095 / 1800, 0.88, { active: true, poses: [
            { at: 0.10, object: 'tea-sharing-pour' },
            { at: 0.45, object: 'tea-sharing-rest' },
            { at: 0.57, object: 'tea-sharing-smile' },
            { at: 0.72, object: 'tea-sharing-nod' },
            { at: 0.87, object: 'tea-sharing-smile' }
        ] })
    ], true, undefined, 'beachwalk');
    const endingScene = () => page('The End', [
        layer('cat-dog-cheer', 0.22, 0.55),
        layer('elephant-tea-cheer', 0.67, 0.78, { active: true, poses: [
            { at: 0.20, object: 'elephant-tea-dip' },
            { at: 0.62, object: 'elephant-tea-sip' }
        ] })
    ], true, undefined, 'beachwalk');

    NSS.registerStory({
        folder: 'cat-and-dog-tea',
        title: 'Cat and Dog Tea',
        availableOn: '2026-11-21',
        description: 'Cat and Dog have tea to share. What size drink will their big visitor choose?',
        readingTag: 'Repetition', storyType: 'adapted', tags: ['Animals', 'Friendship'],
        requireFreshTurn: true,
        cviOutline: 'alpha',
        objects,
        credits: {
            text: 'Cat and Dog Tea. Author and illustrator: René Leisink. Published by The Asia Foundation – Let’s Read. Supplied English edition © The Asia Foundation, 2023, a modified version of the original story. Adapted for switch access by NARBE LLC: original story wording retained; illustrations extended; switch animations added. Created to expand access to stories for people who use switches and support a wider range of accessibility needs.',
            links: [
                { label: 'CC BY-NC 4.0', url: 'https://creativecommons.org/licenses/by-nc/4.0/' },
                { label: 'Let’s Read source', url: 'https://www.letsreadasia.org/' }
            ]
        },
        pages: [
            page('Cat and Dog Tea', [layer('cover-group', 0.5, 0.84)], false),
            page('A cup of tea?', [cart(), dog(), elephant(), act('cat-cup-rest', 0.23, 0.60, 'cat-cup-offer')]),
            page('No, not for me.', [cart(), cat('cat-cup-offer'), dog(), act('elephant-rest', 0.81, 0.80, 'elephant-refuse')]),
            page('A mug of tea?', [cart(), dog(), elephant(), act('cat-mug-rest', 0.23, 0.60, 'cat-mug-offer')]),
            page('No, too small for me.', [cart(), cat('cat-mug-offer'), dog(), act('elephant-small-rest', 0.81, 0.80, 'elephant-small')]),
            page('A pot of tea?', [cart(), cat('cat-mug-rest'), elephant(), act('dog-pot-rest', 0.49, 0.63, 'dog-pot-offer')]),
            page('No, I am big.', [cart(), layer('cat-mug-rest', 0.16, 0.48), layer('dog-pot-rest', 0.37, 0.50),
                act('elephant-wide-rest', 0.73, 0.78, 'elephant-wide')]),
            page('I want to drink...', [act('elephant-tub-rest', 0.5, 0.84, 'elephant-tub-point')], true, [0.19, 0.07, 0.81, 0.97]),
            teaScene(),
            endingScene()
        ]
    });
})();
