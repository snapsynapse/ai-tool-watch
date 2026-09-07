'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { config, parse } = require('../scripts/lib/product-monitor/copilot');

const source = id => config.sources.find(item => item.id === id);

test('Copilot adapter declares exactly the requested official source triplet', () => {
    assert.deepEqual(config.sources.map(item => item.kind), ['release_notes', 'pricing', 'support']);
    assert.deepEqual(config.sources.map(item => item.expectedHost), ['support.microsoft.com', 'microsoft.com', 'support.microsoft.com']);
    for (const item of config.sources) {
        for (const configuredClaim of item.claims) {
            assert.ok(configuredClaim.baseline);
            assert.ok(configuredClaim.baselineExcerpt);
            assert.equal(configuredClaim.target.file, 'data/platforms/copilot.md');
        }
    }
});

test('Copilot pricing finds a dated affirmative retirement statement', () => {
    const result = parse(`
        <main><h1>Microsoft Copilot</h1><p>Microsoft 365 Premium is US$19.99 per month.</p>
        <p>Copilot Pro is retired. It was removed from sale in October 2025 and support ended August 1, 2026.</p></main>
    `, { source: source('copilot-pricing') });

    assert.equal(result.supported, true);
    assert.deepEqual(result.claims.map(item => [item.field, item.value]), [
        ['copilot.pricing.microsoft_365_premium.price', '$19.99/mo'],
        ['copilot.pricing.copilot_pro.status', 'retired']
    ]);
    assert.match(result.claims[1].quote, /August 1, 2026/);
});

test('Copilot pricing returns a changed monthly USD price from the Premium block', () => {
    const result = parse('<main><h1>Microsoft Copilot</h1><p>Microsoft 365 Premium: US$24.99 per month.</p></main>', {
        source: source('copilot-pricing')
    });

    assert.equal(result.supported, true);
    assert.deepEqual(result.claims.map(item => [item.field, item.value]), [
        ['copilot.pricing.microsoft_365_premium.price', '$24.99/mo']
    ]);
});

test('Copilot pricing rejects an annual or neighbouring plan price', () => {
    const result = parse(`
        <main><h1>Microsoft Copilot</h1>
        <p>Microsoft 365 Premium costs US$199.99 per year.</p>
        <p>Microsoft 365 Family costs US$12.99 per month.</p></main>
    `, { source: source('copilot-pricing') });

    assert.equal(result.supported, false);
    assert.equal(result.claims.length, 0);
});

test('Copilot pricing rejects conflicting monthly prices within the Premium block', () => {
    const result = parse(`
        <main><h1>Microsoft Copilot</h1>
        <p>Microsoft 365 Premium costs US$19.99 per month, or US$24.99 per month after a promotion.</p></main>
    `, { source: source('copilot-pricing') });

    assert.equal(result.supported, false);
    assert.equal(result.claims.length, 0);
});

test('Copilot pricing rejects a monthly benefit amount that is not the Premium plan price', () => {
    const result = parse(`
        <main><h1>Microsoft Copilot</h1>
        <p>Microsoft 365 Premium includes a US$10 per month benefit for another Microsoft service.</p></main>
    `, { source: source('copilot-pricing') });

    assert.equal(result.supported, false);
    assert.equal(result.claims.length, 0);
});

test('Copilot pricing does not infer retirement from an undated or absent offer', () => {
    const result = parse('<main><h1>Microsoft Copilot</h1><p>Copilot Pro is no longer offered.</p></main>', {
        source: source('copilot-pricing')
    });

    assert.equal(result.supported, false);
    assert.equal(result.claims.length, 0);
    assert.match(result.reason, /dated support context/i);
});

test('Copilot pricing rejects negated and future retirement wording', () => {
    const negated = parse('<main><h1>Microsoft Copilot</h1><p>Copilot Pro is not retired and continues through October 2027.</p></main>', {
        source: source('copilot-pricing'), now: '2026-09-06T00:00:00Z'
    });
    const future = parse('<main><h1>Microsoft Copilot</h1><p>Copilot Pro will be retired in October 2027.</p></main>', {
        source: source('copilot-pricing'), now: '2026-09-06T00:00:00Z'
    });

    assert.equal(negated.supported, false);
    assert.equal(future.supported, false);
    assert.equal(negated.claims.length, 0);
    assert.equal(future.claims.length, 0);
});

test('Copilot support ignores cosmetic navigation and extracts explicit entitlement changes', () => {
    const result = parse(`
        <nav>Microsoft Copilot Microsoft 365 Pricing Sign in</nav>
        <main><h1>Microsoft Copilot free vs Copilot in Microsoft 365</h1>
        <p>Microsoft Copilot is free for chat after you sign in and keeps your conversation history.</p>
        <p>Copilot Vision requires a Microsoft 365 Personal, Family, or Premium subscription.</p></main>
    `, { source: source('copilot-entitlements') });

    assert.equal(result.supported, true);
    assert.deepEqual(result.claims.map(item => [item.field, item.value]), [
        ['copilot.chat.free.availability', '✅'],
        ['copilot.vision.gating', 'paid']
    ]);
});

test('Copilot support recognizes Microsoft’s explicit free-of-cost wording', () => {
    const result = parse(`
        <main><h1>What's the difference between Microsoft Copilot (free) and Copilot in Microsoft 365</h1>
        <p>Microsoft Copilot (free) - This version of Copilot is available free of cost and is ideal for general questions and answers.</p></main>
    `, { source: source('copilot-entitlements') });

    assert.equal(result.supported, true);
    assert.deepEqual(result.claims.map(item => [item.field, item.value]), [
        ['copilot.chat.free.availability', '✅']
    ]);
});

test('Copilot support reads an explicit Vision subscription negation as free', () => {
    const result = parse(`
        <main><h1>Microsoft Copilot free vs Copilot in Microsoft 365</h1>
        <p>Copilot Vision does not require a Microsoft 365 subscription.</p></main>
    `, { source: source('copilot-entitlements') });

    assert.equal(result.supported, true);
    assert.deepEqual(result.claims.map(item => [item.field, item.value]), [
        ['copilot.vision.gating', 'free']
    ]);
});

test('Copilot support normalizes equivalent and narrowed Vision regional statements', () => {
    const equivalent = parse(`
        <main><h1>Microsoft Copilot free vs Copilot in Microsoft 365</h1>
        <p>Copilot Vision is available in all supported regions and languages. Availability may vary during rollout.</p></main>
    `, { source: source('copilot-entitlements') });
    const narrowed = parse(`
        <main><h1>Microsoft Copilot free vs Copilot in Microsoft 365</h1>
        <p>Copilot Vision is available only in the United States during this rollout.</p></main>
    `, { source: source('copilot-entitlements') });

    assert.deepEqual(equivalent.claims[0].value, { scope: 'all-supported-regions', rollout: 'variable' });
    assert.deepEqual(narrowed.claims[0].value, { scope: 'us-only', rollout: 'variable' });
});

test('Copilot changes recognizes the current free-chat statement without inferring desktop support', () => {
    const result = parse(`
        <main><h1>Updates to Copilot</h1>
        <p>You can continue to chat with Copilot, create images, upload files and more for free, subject to available capacity and limits.</p></main>
    `, { source: source('copilot-changes') });

    assert.equal(result.supported, true);
    assert.deepEqual(result.claims.map(item => [item.field, item.value]), [
        ['copilot.chat.free.availability', '✅']
    ]);
});

test('Copilot changes marks unsupported when a recognized page contains no configured free-chat evidence', () => {
    const result = parse('<main><h1>Changes to the Microsoft Copilot app</h1><p>Updated navigation colors.</p></main>', {
        source: source('copilot-changes')
    });

    assert.equal(result.supported, false);
    assert.equal(result.claims.length, 0);
    assert.match(result.reason, /no explicit free-chat statement/i);
});
