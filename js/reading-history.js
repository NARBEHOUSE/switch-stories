/** Reading sessions on this browser only; no account or network requests. */
window.NSS = window.NSS || {};
NSS.ReadingHistory = (function () {
    'use strict';

    const KEY = 'nss-reading-history-v1';
    const RECENT_KEY = 'nss-last-read-v1';

    function decode(raw) {
        const result = new Map();
        try {
            const data = JSON.parse(raw);
            if (!data || typeof data !== 'object' || Array.isArray(data)) return result;
            Object.entries(data).forEach(([id, count]) => {
                if (/^[a-z0-9][a-z0-9-]*$/.test(id) && Number.isSafeInteger(count) && count > 0) result.set(id, count);
            });
        } catch (e) { /* A missing or damaged record starts with an empty history. */ }
        return result;
    }

    let counts = new Map();
    let recent = new Map();
    try { counts = decode(localStorage.getItem(KEY)); } catch (e) { /* Keep session counts if storage is unavailable. */ }
    try { recent = decode(localStorage.getItem(RECENT_KEY)); } catch (e) { /* Keep session dates if storage is unavailable. */ }

    function count(id) { return counts.get(id) || 0; }
    function lastRead(id) { return recent.get(id) || 0; }

    // Count opening a story and choosing Read Again, not page turns or Start Over.
    function record(id) {
        if (typeof id !== 'string' || !/^[a-z0-9][a-z0-9-]*$/.test(id)) return;
        counts.set(id, Math.min(Number.MAX_SAFE_INTEGER, count(id) + 1));
        recent.set(id, Date.now());
        try { localStorage.setItem(KEY, JSON.stringify(Object.fromEntries(counts))); } catch (e) { /* Reading still works without persistent storage. */ }
        try { localStorage.setItem(RECENT_KEY, JSON.stringify(Object.fromEntries(recent))); } catch (e) { /* Reading still works without persistent storage. */ }
    }

    window.addEventListener('storage', function (event) {
        if (event.key === KEY || event.key === null) counts = decode(event.newValue);
        if (event.key === RECENT_KEY || event.key === null) recent = decode(event.newValue);
    });

    return { count, lastRead, record };
})();
