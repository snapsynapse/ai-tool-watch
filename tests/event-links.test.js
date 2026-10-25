'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const docs = path.join(__dirname, '..', 'docs');
const featureHtml = fs.readFileSync(path.join(docs, 'implementations.html'), 'utf8');
const featureIds = new Set([...featureHtml.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));

function assertFeatureTarget(link) {
    const url = new URL(link, 'https://aitool.watch/');
    assert.equal(url.pathname, '/implementations.html');
    assert.ok(featureIds.has(decodeURIComponent(url.hash.slice(1))), `Missing feature target: ${link}`);
}

test('every timeline event links to an existing rendered feature', () => {
    const html = fs.readFileSync(path.join(docs, 'timeline.html'), 'utf8');
    const links = [...html.matchAll(/href="([^"]+)"[^>]*class="timeline-event-link"/g)].map(match => match[1]);
    assert.ok(links.length > 0, 'Timeline events are missing');
    for (const link of links) assertFeatureTarget(link);
});

test('every RSS item links to an existing rendered feature', () => {
    const rss = fs.readFileSync(path.join(docs, 'index.xml'), 'utf8');
    const items = [...rss.matchAll(/<item>([\s\S]*?)<\/item>/g)];
    assert.ok(items.length > 0, 'RSS items are missing');
    for (const [, item] of items) {
        const link = item.match(/<link>([^<]+)<\/link>/)?.[1];
        assert.ok(link, 'RSS item link is missing');
        assertFeatureTarget(link);
        // Keep existing feed identities while treating their dated suffixes as
        // opaque identifiers, rather than advertising them as working URLs.
        const guid = item.match(/<guid isPermaLink="false">([^<]+)<\/guid>/)?.[1];
        assert.ok(guid, 'RSS identifier must be explicitly opaque');
        assert.match(guid, /^https:\/\/aitool\.watch\/implementations\.html#impl-.+\?d=\d{4}-\d{2}-\d{2}$/);
    }
});
