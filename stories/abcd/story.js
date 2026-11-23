/** Story-local alphabet presentation. Shared reading and switch state own progress. */
NSS.ABCD = (function () {
    'use strict';
    const clamp = (n, a = 0, b = 1) => Math.max(a, Math.min(b, n));
    const ease = n => { const t = clamp(n); return t * t * (3 - 2 * t); };
    const sequence = (q, frames) => frames[Math.min(frames.length - 1, Math.floor(q * frames.length))];
    const cycles = (q, count) => q <= 0 || q >= 1 ? 0 : Math.sin(q * Math.PI * 2 * count);

    // Coordinates describe the complete action, not the currently visible pose.
    // This prevents the picture from resizing as arms, lids and legs move.
    function parts(key, progress) {
        const q = clamp((progress - 0.07) / 0.86), u = ease(q);
        const result = [];
        const add = (object, x, y, width, height, rotation = 0) => result.push({ object, x, y, width, height, rotation });
        let x = 500, y = 520, width = 730, height = 730, frame = 0, rot = 0;
        const nod = [0, 1, 2, 2, 1, 0];
        switch (key) {
        case 'apple': {
            add('apple-1', 640, 180, 630, 220);
            const drop = q < 0.52 ? Math.pow(q / 0.52, 2) : 1;
            const bounce = q > 0.52 && q < 0.78 ? 75 * Math.sin((q - 0.52) / 0.26 * Math.PI) : 0;
            add('apple-0', 500, 350 + 335 * drop - bounce, 410, 410);
            return result;
        }
        case 'ball': {
            const bounce = q < 0.50 ? Math.sin(q / 0.50 * Math.PI) * 300 : Math.sin((q - 0.50) / 0.50 * Math.PI) * 155;
            add('ball-0', 500, 680 - Math.max(0, bounce), 390, 390);
            return result;
        }
        case 'cat': frame = sequence(q, [0,1,2,3,0,1,2,3,0]); break;
        case 'dog': frame = sequence(q, [0,1,0,2,0,1,0,2,0,1,0,2,0]); break;
        case 'egg': width = 470; height = 630; y = 570; rot = cycles(q, 3) * 0.13 * Math.sin(Math.PI * q); break;
        case 'fish': frame = sequence(q, [0,1,0,2,0,1,0,2,0]); x = 360 + 270 * u; width = 600; height = 440; break;
        case 'goat': case 'zebra':
            // Grass roots share the animals' planted hoof baseline; the muzzle reaches into the blades.
            add('kite-1', 780, 788, 170, 100);
            frame = sequence(q, nod); width = 810; height = 650; y = 535; break;
        case 'pig': frame = sequence(q, nod); width = 810; height = 650; y = 535; break;
        case 'hat': rot = cycles(q, 1) * 0.20; width = 730; height = 510; y = 610; break;
        case 'insect': frame = sequence(q, [0,1,2,3,0,1,2,3,0]); x = 360 + 230 * u; width = 620; height = 500; break;
        case 'jellyfish': frame = sequence(q, [0,1,2,3,0,1,2,3,0]); y = 620 - 170 * u; width = 560; height = 620; break;
        case 'kite': rot = cycles(q, 2) * 0.13; width = 570; height = 700; y = 465; break;
        case 'leaf': x = 450 + 65 * cycles(q, 1); y = 330 + 350 * u; rot = cycles(q, 1.5) * 0.25; width = 480; height = 390; break;
        case 'moon': case 'sun':
            add(key + '-0', 500, 650 - 360 * u, key === 'sun' ? 410 : 370, key === 'sun' ? 410 : 370);
            add('moon-1', 500, 770, 900, 300);
            return result;
        case 'nest': frame = sequence(q, [0,1,2,3,2,3]); width = 800; height = 650; y = 570; break;
        case 'octopus': frame = sequence(q, [0,1,3,1,0,1,3,1,0]); width = 820; height = 720; break;
        case 'queen': frame = sequence(q, [0,1,0,2,0,1,0,2,0]); width = 650; height = 820; y = 500; break;
        case 'rabbit': {
            const t = q < 0.5 ? q * 2 : (q - 0.5) * 2;
            frame = sequence(t, [0,1,2,2,3,0]);
            if (q === 1) frame = 0;
            x = 350 + 260 * u; y = 650 - Math.sin(Math.PI * clamp((t - 0.15) / 0.65)) * 185;
            width = 600; height = 480; break;
        }
        case 'turtle': frame = sequence(q, [0,1,2,2,1]); width = 840; height = 600; y = 570; break;
        case 'umbrella': frame = sequence(q, [0,1,2,3,3]); width = 820; height = 820; y = 500; break;
        case 'van': {
            const travel = 220 * u, cx = 390 + travel;
            add('van-0', cx, 485, 700, 470);
            add('van-1', cx - 187, 660, 150, 150, travel / 75);
            add('van-1', cx + 155, 660, 150, 150, travel / 75);
            return result;
        }
        case 'worm': frame = sequence(q, [0,1,2,3,0,1,2,3,0]); x = 380 + 220 * u; width = 690; height = 450; y = 590; break;
        case 'box': frame = sequence(q, [0,1,2,3,3]); width = 800; height = 780; y = 530; break;
        case 'yo-yo': {
            add('yo-yo-1', 480, 165, 300, 210);
            const travel = Math.pow(Math.sin(Math.PI * q * 2), 2) * 390;
            add('yo-yo-0', 580, 365 + travel, 270, 270);
            return result;
        }
        }
        add(key + '-' + frame, x, y, width, height, rot);
        return result;
    }

    function geometry(w, pictureH, st, cvi) {
        const right = st.pictureW || w, pad = Math.max(8, Math.min(24, right * .035));
        const controls = (st.controls || []).filter(r => r.left < right && r.right > pad);
        const top = controls.length ? Math.max(pad, ...controls.map(r => r.bottom + pad)) : pad;
        const available = { x: pad, y: top, w: Math.max(1, right - 2 * pad), h: Math.max(1, pictureH - top - pad) };
        const wide = available.w > available.h * 1.32 && available.w > 560;
        // Center the letter-and-picture pair as a group instead of placing the
        // letters at the far edge of a wide screen. Keep a separate motion area.
        const gap = Math.max(12, Math.min(32, available.w * .03));
        const labelW = Math.min(available.w * .31, available.h * .64);
        const artW = Math.min(available.h, available.w - labelW - gap);
        const groupX = available.x + (available.w - labelW - gap - artW) / 2;
        const labelH = Math.min(available.h * .25, 180);
        const artH = Math.min(available.w, Math.max(1, available.h - labelH - gap));
        const groupY = available.y + (available.h - labelH - gap - artH) / 2;
        const label = wide
            ? { x: groupX, y: available.y, w: labelW, h: available.h }
            : { x: available.x, y: groupY, w: available.w, h: labelH };
        const art = wide
            ? { x: groupX + labelW + gap, y: available.y, w: artW, h: available.h }
            : { x: available.x, y: groupY + labelH + gap, w: available.w, h: artH };
        const factor = cvi && !NSS.Settings.is('characterSize', 'large') ? .84 : 1;
        const unit = Math.min(art.w, art.h) * factor;
        const world = { x: art.x + (art.w - unit) / 2, y: art.y + (art.h - unit) / 2, scale: unit / 1000 };
        return { available, label, art, world, wide };
    }

    function draw(ctx, imageFor, w, pictureH, page, st) {
        const info = page.alphabet, cvi = NSS.Settings.cvi(), progress = clamp(Number(st.p) || 0);
        const g = geometry(w, pictureH, st, cvi), ink = cvi ? '#ffffff' : '#192744';
        ctx.save();
        ctx.fillStyle = cvi ? '#000000' : page.bg; ctx.fillRect(0, 0, w, st.h || pictureH);
        ctx.beginPath(); ctx.rect(0, 0, w, pictureH); ctx.clip();
        const text = (value, x, y, size, color, maxWidth) => {
            ctx.font = '700 ' + size + 'px "Trebuchet MS", Arial, sans-serif';
            ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(value, x, y, maxWidth);
        };
        const drawSprite = (item, world) => {
            const pic = page.story.objects[item.object], img = pic && imageFor(pic);
            if (!img) return;
            const k = Math.min(item.width / img.width, item.height / img.height) * world.scale;
            ctx.save(); ctx.translate(world.x + item.x * world.scale, world.y + item.y * world.scale);
            if (item.rotation) ctx.rotate(item.rotation);
            ctx.drawImage(img, -img.width * k / 2, -img.height * k / 2, img.width * k, img.height * k);
            ctx.restore();
        };
        if (info.type !== 'letter') {
            const area = g.available, size = Math.min(area.h * .30, area.w * .18);
            text(info.type === 'cover' ? 'Aa  Bb  Cc' : 'A to Z', area.x + area.w / 2, area.y + area.h * .20, size, ink, area.w * .94);
            const unit = Math.min(area.w, area.h * 1.5), world = { x: area.x + (area.w - unit) / 2, y: area.y + area.h * .31, scale: unit / 1000 };
            const items = info.type === 'cover'
                ? [{object:'apple-0',x:180,y:260,width:260,height:340},{object:'ball-0',x:490,y:290,width:270,height:270},{object:'cat-0',x:810,y:245,width:300,height:390}]
                : [{object:'apple-0',x:270,y:265,width:350,height:400},{object:'zebra-0',x:720,y:265,width:460,height:430}];
            items.forEach(item => drawSprite(item, world));
            ctx.restore(); return { s: 1 };
        }
        const label = g.label, cx = label.x + label.w / 2;
        const letterSize = Math.min(g.wide ? label.h * .34 : label.h * .62, label.w * (g.wide ? .56 : .43), 210);
        const letterY = g.wide ? label.y + label.h * .40 : label.y + label.h * .36;
        text(info.letter + info.letter.toLowerCase(), cx, letterY, letterSize, ink, label.w * .94);
        const wordSize = Math.min(g.wide ? label.h * .105 : label.h * .27, label.w / Math.max(4, info.word.length * .63), 62);
        const wordY = g.wide ? label.y + label.h * .64 : label.y + label.h * .86;
        ctx.font = '700 ' + wordSize + 'px "Trebuchet MS", Arial, sans-serif';
        const before = info.word.slice(0, info.word.toLowerCase().indexOf(info.letter.toLowerCase()));
        const index = info.word.toLowerCase().indexOf(info.letter.toLowerCase());
        const wordWidth = ctx.measureText(info.word).width;
        text(info.word, cx, wordY, wordSize, ink, label.w * .94);
        // The marked letter is identifiable without relying on its color.
        const left = cx - wordWidth / 2 + ctx.measureText(before).width;
        const letterWidth = ctx.measureText(info.word[index]).width;
        ctx.strokeStyle = ink; ctx.lineWidth = Math.max(2, wordSize * .055); ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(left, wordY + wordSize * .55); ctx.lineTo(left + letterWidth, wordY + wordSize * .55); ctx.stroke();
        const items = parts(info.word, progress);
        if (info.word === 'kite' || info.word === 'yo-yo') {
            const world = g.world; ctx.save(); ctx.translate(world.x, world.y); ctx.scale(world.scale, world.scale);
            ctx.strokeStyle = cvi ? '#ffffff' : '#33445b'; ctx.lineWidth = 7; ctx.lineCap = 'round';
            ctx.beginPath();
            if (info.word === 'yo-yo') { ctx.moveTo(580,130); ctx.lineTo(580,items[1].y); }
            else {
                // Follow the cross at the center of the diamond as the kite tilts.
                const angle = items[0].rotation, dx = -55, dy = -112;
                ctx.moveTo(500 + dx * Math.cos(angle) - dy * Math.sin(angle), 465 + dx * Math.sin(angle) + dy * Math.cos(angle));
                ctx.quadraticCurveTo(480,740,580,890);
            }
            ctx.stroke(); ctx.restore();
        }
        items.forEach(item => drawSprite(item, g.world));
        ctx.restore();
        return { s: g.world.scale };
    }
    return { draw, parts, geometry };
})();

(function(){
  const story=NSS.registerStory({
  "folder": "abcd",
  "title": "Alphabet Book",
  "availableOn": "2026-11-23",
  "description": "Explore A to Z with familiar pictures. Press your switch to make each one move!",
  "storyType": "adapted",
  "tags": [
    "Alphabet",
    "Learning"
  ],
  "requireFreshTurn": true,
  "cviOutline": "alpha",
  "objects": {
    "ball-0": {
      "image": "sprites/ball-0.webp",
      "cviImage": "sprites/ball-0.webp"
    },
    "cat-0": {
      "image": "sprites/cat-0.webp",
      "cviImage": "sprites/cat-0.webp"
    },
    "cat-1": {
      "image": "sprites/cat-1.webp",
      "cviImage": "sprites/cat-1.webp"
    },
    "cat-2": {
      "image": "sprites/cat-2.webp",
      "cviImage": "sprites/cat-2.webp"
    },
    "cat-3": {
      "image": "sprites/cat-3.webp",
      "cviImage": "sprites/cat-3.webp"
    },
    "apple-0": {
      "image": "sprites/apple-0.webp",
      "cviImage": "sprites/apple-0.webp"
    },
    "apple-1": {
      "image": "sprites/apple-1.webp",
      "cviImage": "sprites/apple-1.webp"
    },
    "dog-0": {
      "image": "sprites/dog-0.webp",
      "cviImage": "sprites/dog-0.webp"
    },
    "dog-1": {
      "image": "sprites/dog-1.webp",
      "cviImage": "sprites/dog-1.webp"
    },
    "dog-2": {
      "image": "sprites/dog-2.webp",
      "cviImage": "sprites/dog-2.webp"
    },
    "egg-0": {
      "image": "sprites/egg-0.webp",
      "cviImage": "sprites/egg-0.webp"
    },
    "fish-0": {
      "image": "sprites/fish-0.webp",
      "cviImage": "sprites/fish-0.webp"
    },
    "fish-1": {
      "image": "sprites/fish-1.webp",
      "cviImage": "sprites/fish-1.webp"
    },
    "fish-2": {
      "image": "sprites/fish-2.webp",
      "cviImage": "sprites/fish-2.webp"
    },
    "goat-0": {
      "image": "sprites/goat-0.webp",
      "cviImage": "sprites/goat-0.webp"
    },
    "goat-1": {
      "image": "sprites/goat-1.webp",
      "cviImage": "sprites/goat-1.webp"
    },
    "goat-2": {
      "image": "sprites/goat-2.webp",
      "cviImage": "sprites/goat-2.webp"
    },
    "hat-0": {
      "image": "sprites/hat-0.webp",
      "cviImage": "sprites/hat-0.webp"
    },
    "insect-0": {
      "image": "sprites/insect-0.webp",
      "cviImage": "sprites/insect-0.webp"
    },
    "insect-1": {
      "image": "sprites/insect-1.webp",
      "cviImage": "sprites/insect-1.webp"
    },
    "insect-2": {
      "image": "sprites/insect-2.webp",
      "cviImage": "sprites/insect-2.webp"
    },
    "insect-3": {
      "image": "sprites/insect-3.webp",
      "cviImage": "sprites/insect-3.webp"
    },
    "jellyfish-0": {
      "image": "sprites/jellyfish-0.webp",
      "cviImage": "sprites/jellyfish-0.webp"
    },
    "jellyfish-1": {
      "image": "sprites/jellyfish-1.webp",
      "cviImage": "sprites/jellyfish-1.webp"
    },
    "jellyfish-2": {
      "image": "sprites/jellyfish-2.webp",
      "cviImage": "sprites/jellyfish-2.webp"
    },
    "jellyfish-3": {
      "image": "sprites/jellyfish-3.webp",
      "cviImage": "sprites/jellyfish-3.webp"
    },
    "kite-0": {
      "image": "sprites/kite-0.webp",
      "cviImage": "sprites/kite-0.webp"
    },
    "kite-1": {
      "image": "sprites/kite-1.webp",
      "cviImage": "sprites/kite-1.webp"
    },
    "leaf-0": {
      "image": "sprites/leaf-0.webp",
      "cviImage": "sprites/leaf-0.webp"
    },
    "moon-0": {
      "image": "sprites/moon-0.webp",
      "cviImage": "sprites/moon-0.webp"
    },
    "moon-1": {
      "image": "sprites/moon-1.webp",
      "cviImage": "sprites/moon-1.webp"
    },
    "nest-0": {
      "image": "sprites/nest-0.webp",
      "cviImage": "sprites/nest-0.webp"
    },
    "nest-1": {
      "image": "sprites/nest-1.webp",
      "cviImage": "sprites/nest-1.webp"
    },
    "nest-2": {
      "image": "sprites/nest-2.webp",
      "cviImage": "sprites/nest-2.webp"
    },
    "nest-3": {
      "image": "sprites/nest-3.webp",
      "cviImage": "sprites/nest-3.webp"
    },
    "octopus-0": {
      "image": "sprites/octopus-0.webp",
      "cviImage": "sprites/octopus-0.webp"
    },
    "octopus-1": {
      "image": "sprites/octopus-1.webp",
      "cviImage": "sprites/octopus-1.webp"
    },
    "octopus-3": {
      "image": "sprites/octopus-3.webp",
      "cviImage": "sprites/octopus-3.webp"
    },
    "pig-0": {
      "image": "sprites/pig-0.webp",
      "cviImage": "sprites/pig-0.webp"
    },
    "pig-1": {
      "image": "sprites/pig-1.webp",
      "cviImage": "sprites/pig-1.webp"
    },
    "pig-2": {
      "image": "sprites/pig-2.webp",
      "cviImage": "sprites/pig-2.webp"
    },
    "queen-0": {
      "image": "sprites/queen-0.webp",
      "cviImage": "sprites/queen-0.webp"
    },
    "queen-1": {
      "image": "sprites/queen-1.webp",
      "cviImage": "sprites/queen-1.webp"
    },
    "queen-2": {
      "image": "sprites/queen-2.webp",
      "cviImage": "sprites/queen-2.webp"
    },
    "rabbit-0": {
      "image": "sprites/rabbit-0.webp",
      "cviImage": "sprites/rabbit-0.webp"
    },
    "rabbit-1": {
      "image": "sprites/rabbit-1.webp",
      "cviImage": "sprites/rabbit-1.webp"
    },
    "rabbit-2": {
      "image": "sprites/rabbit-2.webp",
      "cviImage": "sprites/rabbit-2.webp"
    },
    "rabbit-3": {
      "image": "sprites/rabbit-3.webp",
      "cviImage": "sprites/rabbit-3.webp"
    },
    "sun-0": {
      "image": "sprites/sun-0.webp",
      "cviImage": "sprites/sun-0.webp"
    },
    "turtle-0": {
      "image": "sprites/turtle-0.webp",
      "cviImage": "sprites/turtle-0.webp"
    },
    "turtle-1": {
      "image": "sprites/turtle-1.webp",
      "cviImage": "sprites/turtle-1.webp"
    },
    "turtle-2": {
      "image": "sprites/turtle-2.webp",
      "cviImage": "sprites/turtle-2.webp"
    },
    "umbrella-0": {
      "image": "sprites/umbrella-0.webp",
      "cviImage": "sprites/umbrella-0.webp"
    },
    "umbrella-1": {
      "image": "sprites/umbrella-1.webp",
      "cviImage": "sprites/umbrella-1.webp"
    },
    "umbrella-2": {
      "image": "sprites/umbrella-2.webp",
      "cviImage": "sprites/umbrella-2.webp"
    },
    "umbrella-3": {
      "image": "sprites/umbrella-3.webp",
      "cviImage": "sprites/umbrella-3.webp"
    },
    "van-0": {
      "image": "sprites/van-0.webp",
      "cviImage": "sprites/van-0.webp"
    },
    "van-1": {
      "image": "sprites/van-1.webp",
      "cviImage": "sprites/van-1.webp"
    },
    "worm-0": {
      "image": "sprites/worm-0.webp",
      "cviImage": "sprites/worm-0.webp"
    },
    "worm-1": {
      "image": "sprites/worm-1.webp",
      "cviImage": "sprites/worm-1.webp"
    },
    "worm-2": {
      "image": "sprites/worm-2.webp",
      "cviImage": "sprites/worm-2.webp"
    },
    "worm-3": {
      "image": "sprites/worm-3.webp",
      "cviImage": "sprites/worm-3.webp"
    },
    "box-0": {
      "image": "sprites/box-0.webp",
      "cviImage": "sprites/box-0.webp"
    },
    "box-1": {
      "image": "sprites/box-1.webp",
      "cviImage": "sprites/box-1.webp"
    },
    "box-2": {
      "image": "sprites/box-2.webp",
      "cviImage": "sprites/box-2.webp"
    },
    "box-3": {
      "image": "sprites/box-3.webp",
      "cviImage": "sprites/box-3.webp"
    },
    "yo-yo-0": {
      "image": "sprites/yo-yo-0.webp",
      "cviImage": "sprites/yo-yo-0.webp"
    },
    "yo-yo-1": {
      "image": "sprites/yo-yo-1.webp",
      "cviImage": "sprites/yo-yo-1.webp"
    },
    "zebra-0": {
      "image": "sprites/zebra-0.webp",
      "cviImage": "sprites/zebra-0.webp"
    },
    "zebra-1": {
      "image": "sprites/zebra-1.webp",
      "cviImage": "sprites/zebra-1.webp"
    },
    "zebra-2": {
      "image": "sprites/zebra-2.webp",
      "cviImage": "sprites/zebra-2.webp"
    }
  },
  "credits": {
    "text": "Based on ABCD-A Nature Alphabet Book, written and illustrated by Adrija Ghosh. Published by Pratham Books, © Pratham Books. Earlier adaptation © The Asia Foundation, 2021 (Let’s Read). Text and artwork adapted and switch animations added by NARBE LLC for a wider range of accessibility needs.",
    "links": [
      {
        "label": "CC BY 4.0",
        "url": "https://creativecommons.org/licenses/by/4.0/"
      },
      {
        "label": "Let’s Read source",
        "url": "https://www.letsreadasia.org/"
      }
    ]
  },
  "pages": [
    {
      "text": "Alphabet Book",
      "action": "none",
      "bg": "#f5dfbd"
    },
    {
      "text": "A is for apple.",
      "action": "breeze",
      "actionSound": "none",
      "bg": "#f5dfbd"
    },
    {
      "text": "B is for ball.",
      "action": "breeze",
      "actionSound": "none",
      "bg": "#9ad9e0"
    },
    {
      "text": "C is for cat.",
      "action": "breeze",
      "actionSound": "none",
      "bg": "#eac4de"
    },
    {
      "text": "D is for dog.",
      "action": "breeze",
      "actionSound": "none",
      "bg": "#b7dfce"
    },
    {
      "text": "E is for egg.",
      "action": "breeze",
      "actionSound": "none",
      "bg": "#d8c8eb"
    },
    {
      "text": "F is for fish.",
      "action": "breeze",
      "actionSound": "none",
      "bg": "#96d8e5"
    },
    {
      "text": "G is for goat.",
      "action": "breeze",
      "actionSound": "none",
      "bg": "#f7d99d"
    },
    {
      "text": "H is for hat.",
      "action": "breeze",
      "actionSound": "none",
      "bg": "#b5d6e8"
    },
    {
      "text": "I is for insect.",
      "action": "breeze",
      "actionSound": "none",
      "bg": "#f5dfbd"
    },
    {
      "text": "J is for jellyfish.",
      "action": "breeze",
      "actionSound": "none",
      "bg": "#9ad9e0"
    },
    {
      "text": "K is for kite.",
      "action": "breeze",
      "actionSound": "none",
      "bg": "#eac4de"
    },
    {
      "text": "L is for leaf.",
      "action": "breeze",
      "actionSound": "none",
      "bg": "#b7dfce"
    },
    {
      "text": "M is for moon.",
      "action": "breeze",
      "actionSound": "none",
      "bg": "#d8c8eb"
    },
    {
      "text": "N is for nest.",
      "action": "breeze",
      "actionSound": "none",
      "bg": "#96d8e5"
    },
    {
      "text": "O is for octopus.",
      "action": "breeze",
      "actionSound": "none",
      "bg": "#f7d99d"
    },
    {
      "text": "P is for pig.",
      "action": "breeze",
      "actionSound": "none",
      "bg": "#b5d6e8"
    },
    {
      "text": "Q is for queen.",
      "action": "breeze",
      "actionSound": "none",
      "bg": "#f5dfbd"
    },
    {
      "text": "R is for rabbit.",
      "action": "breeze",
      "actionSound": "none",
      "bg": "#9ad9e0"
    },
    {
      "text": "S is for sun.",
      "action": "breeze",
      "actionSound": "none",
      "bg": "#eac4de"
    },
    {
      "text": "T is for turtle.",
      "action": "breeze",
      "actionSound": "none",
      "bg": "#b7dfce"
    },
    {
      "text": "U is for umbrella.",
      "action": "breeze",
      "actionSound": "none",
      "bg": "#d8c8eb"
    },
    {
      "text": "V is for van.",
      "action": "breeze",
      "actionSound": "none",
      "bg": "#96d8e5"
    },
    {
      "text": "W is for worm.",
      "action": "breeze",
      "actionSound": "none",
      "bg": "#f7d99d"
    },
    {
      "text": "This is X. Box ends with X.",
      "speechSequence": {
        "parts": [
          "This is X.",
          "Box ends with X."
        ],
        "pauseMs": 1000
      },
      "action": "breeze",
      "actionSound": "none",
      "bg": "#b5d6e8"
    },
    {
      "text": "Y is for a yo-yo.",
      "action": "breeze",
      "actionSound": "none",
      "bg": "#f5dfbd"
    },
    {
      "text": "Z is for zebra.",
      "action": "breeze",
      "actionSound": "none",
      "bg": "#9ad9e0"
    },
    {
      "text": "The End",
      "action": "none",
      "bg": "#b7dfce"
    }
  ]
});
  const alphabet=[{"type":"cover"},{"type":"letter","letter":"A","word":"apple"},{"type":"letter","letter":"B","word":"ball"},{"type":"letter","letter":"C","word":"cat"},{"type":"letter","letter":"D","word":"dog"},{"type":"letter","letter":"E","word":"egg"},{"type":"letter","letter":"F","word":"fish"},{"type":"letter","letter":"G","word":"goat"},{"type":"letter","letter":"H","word":"hat"},{"type":"letter","letter":"I","word":"insect"},{"type":"letter","letter":"J","word":"jellyfish"},{"type":"letter","letter":"K","word":"kite"},{"type":"letter","letter":"L","word":"leaf"},{"type":"letter","letter":"M","word":"moon"},{"type":"letter","letter":"N","word":"nest"},{"type":"letter","letter":"O","word":"octopus"},{"type":"letter","letter":"P","word":"pig"},{"type":"letter","letter":"Q","word":"queen"},{"type":"letter","letter":"R","word":"rabbit"},{"type":"letter","letter":"S","word":"sun"},{"type":"letter","letter":"T","word":"turtle"},{"type":"letter","letter":"U","word":"umbrella"},{"type":"letter","letter":"V","word":"van"},{"type":"letter","letter":"W","word":"worm"},{"type":"letter","letter":"X","word":"box"},{"type":"letter","letter":"Y","word":"yo-yo"},{"type":"letter","letter":"Z","word":"zebra"},{"type":"end"}];
  story.pages.forEach((page,i)=>Object.defineProperty(page,"alphabet",{value:Object.freeze(alphabet[i]),enumerable:true}));
})();
