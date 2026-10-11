'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const FREEZE_DATE = '2026-10-11';

function readDoc(name) {
    return fs.readFileSync(path.join(ROOT, 'docs', name), 'utf8');
}

function readApi(name) {
    return JSON.parse(readDoc(path.join('api', 'v1', name)));
}

test('archived records stay out of the active API', () => {
    const products = readApi('products.json').products;
    assert.ok(products.every(product => product.product_kind !== 'runtime'), 'runtime products must not be active');
    const providerIds = readApi('providers.json').providers.map(provider => provider.id);
    for (const id of ['ollama', 'lm-studio', 'oobabooga', 'alibaba', 'deepseek', 'meta', 'mistral']) {
        assert.ok(!providerIds.includes(id), `${id} must be archived, not active`);
    }
});

test('archive.json and model-access.json serve the frozen records with their dates', () => {
    const archive = readApi('archive.json');
    assert.equal(archive.meta.frozen_on, FREEZE_DATE);
    assert.ok(archive.meta.reason.includes('1%'));
    assert.deepEqual(archive.meta.counts, { products: 3, model_access: 11, providers: 7 });

    const modelAccess = readApi('model-access.json');
    assert.equal(modelAccess.meta.frozen_on, FREEZE_DATE);
    assert.equal(modelAccess.model_access.length, 11);
    for (const record of [...archive.products, ...modelAccess.model_access]) {
        assert.equal(record.archived, true, `${record.id} must be flagged archived`);
        assert.equal(record.archived_on, FREEZE_DATE);
        assert.match(record.last_verified || '', /^\d{4}-\d{2}-\d{2}/, `${record.id} must keep its last-verified date`);
        assert.match(record.page, /^archive\.html#/);
    }
});

test('archive page states what was frozen, when, and why, with a row per record', () => {
    const html = readDoc('archive.html');
    assert.ok(html.includes(`Frozen on ${FREEZE_DATE}`));
    assert.ok(html.includes('roughly 1% or greater public market share'));
    const archive = readApi('archive.json');
    for (const record of [...archive.products, ...archive.model_access]) {
        const anchor = record.page.split('#')[1];
        assert.ok(html.includes(`<tr id="${anchor}">`), `archive page is missing row ${anchor}`);
    }
});

test('pre-freeze implementations.html permalinks redirect to the archive page', () => {
    const html = readDoc('implementations.html');
    const match = html.match(/var archived = (\[[^\]]*\]);/);
    assert.ok(match, 'implementations.html must carry the archived anchor redirect');
    const anchors = JSON.parse(match[1]);
    for (const anchor of ['runtime-ollama', 'runtime-lm-studio', 'alibaba-open-models-qwen-3-alibaba', 'meta-open-models-llama-4-meta']) {
        assert.ok(anchors.includes(anchor), `${anchor} must redirect`);
        assert.ok(!html.includes(`id="${anchor}"`), `${anchor} must no longer render as an active card`);
    }
});
