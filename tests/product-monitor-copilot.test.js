'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { config, parse } = require('../scripts/lib/product-monitor/copilot');

const source = id => config.sources.find(item => item.id === id);

test('Copilot adapter declares exactly the requested official source triplet', () => {
    assert.deepEqual(config.sources.map(item => item.kind), ['release_notes', 'pricing', 'support']);
    assert.deepEqual(config.sources.map(item => item.expectedHost), ['support.microsoft.com', 'microsoft.com', 'support.microsoft.com']);
    assert.deepEqual(config.sources.map(item => item.url), [
        'https://support.microsoft.com/en-us/microsoft-365-copilot/learning/changes-microsoft-copilot-app',
        'https://microsoft.com/en-us/microsoft-365-copilot/pricing/individuals',
        'https://support.microsoft.com/en-us/microsoft-copilot/using-copilot-vision-with-microsoft-copilot'
    ]);
    assert.deepEqual(source('copilot-entitlements').claims.map(item => item.field), [
        'copilot.vision.gating',
        'copilot.vision.region'
    ]);
    for (const item of config.sources) {
        for (const configuredClaim of item.claims) {
            assert.ok(configuredClaim.baseline);
            assert.ok(configuredClaim.baselineExcerpt);
            assert.equal(configuredClaim.target.file, 'data/platforms/copilot.md');
        }
    }
});

test('Copilot pricing does not convert a dated retirement assertion into a lifecycle claim', () => {
    const result = parse(`
        <main><h1>Microsoft Copilot</h1><p>Microsoft 365 Premium is US$19.99 per month.</p>
        <p>Copilot Pro is retired. It was removed from sale in October 2025 and support ended August 1, 2026.</p></main>
    `, { source: source('copilot-pricing') });

    assert.equal(result.supported, true);
    assert.deepEqual(result.claims.map(item => [item.field, item.value]), [
        ['copilot.pricing.microsoft_365_premium.price', '$19.99/mo']
    ]);
    assert.equal(result.claims.some(item => item.field === 'copilot.pricing.copilot_pro.lifecycle'), false);
});

test('Copilot pricing keeps closed new sales separate from continuing subscriptions and unknown support end', () => {
    const lifecycle = source('copilot-pricing').claims.find(item => item.field === 'copilot.pricing.copilot_pro.lifecycle');
    assert.deepEqual(lifecycle.baseline, {
        new_sales: 'closed',
        existing_subscriptions: 'continue',
        support_end: { value: null, evidence: 'unproven' }
    });
    assert.equal(lifecycle.assessment, 'unassessed');

    const result = parse(`
        <main><h1>Microsoft 365 consumer plans</h1>
        <p>Copilot Pro stopped accepting new customers in October 2025.</p>
        <p>Existing Copilot Pro subscribers can continue their subscriptions. No support-end date has been announced.</p></main>
    `, { source: source('copilot-pricing') });

    assert.equal(result.supported, false);
    assert.equal(result.claims.length, 0);
    assert.match(result.reason, /ceased new sales.*does not establish.*support-end/i);
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

test('Copilot pricing does not treat an inactive hidden monthly tab as visible price evidence', () => {
    const result = parse(`
        <main><h1>Microsoft 365 plans for individuals</h1>
        <div role="tabpanel"><h2>Microsoft 365 Premium</h2><p>$199.99/year</p></div>
        <div role="tabpanel" hidden><h2>Microsoft 365 Premium</h2><p>$19.99/month</p></div>
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

test('Copilot pricing does not infer lifecycle from an undated or absent offer', () => {
    const result = parse('<main><h1>Microsoft Copilot</h1><p>Copilot Pro is no longer offered.</p></main>', {
        source: source('copilot-pricing')
    });

    assert.equal(result.supported, false);
    assert.equal(result.claims.length, 0);
    assert.match(result.reason, /lifecycle is unassessed/i);
});

test('Copilot pricing leaves negated and future retirement wording unassessed', () => {
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

test('Copilot Vision support ignores cosmetic navigation and extracts explicit gating', () => {
    const result = parse(`
        <nav>Microsoft Copilot Microsoft 365 Pricing Sign in</nav>
        <main><h1>Using Copilot Vision with Microsoft Copilot</h1>
        <p>Microsoft Copilot is free for chat after you sign in and keeps your conversation history.</p>
        <p>Copilot Vision requires a Microsoft 365 Personal, Family, or Premium subscription.</p></main>
    `, { source: source('copilot-entitlements') });

    assert.equal(result.supported, true);
    assert.deepEqual(result.claims.map(item => [item.field, item.value]), [
        ['copilot.vision.gating', 'paid']
    ]);
});

test('Copilot Vision support recognizes the retained must-subscribe wording', () => {
    const result = parse(`
        <main><h1>Using Copilot Vision with Microsoft Copilot</h1>
        <p>Copilot Vision availability might vary during rollout. Vision is available in all supported regions and languages and can be accessed from Windows, Edge, and the Copilot mobile app on iOS and Android. You must subscribe to Microsoft 365 Personal, Family, or Premium to access Copilot Vision.</p>
    `, { source: source('copilot-entitlements') });

    assert.equal(result.supported, true);
    assert.deepEqual(result.claims.map(item => [item.field, item.value]), [
        ['copilot.vision.gating', 'paid'],
        ['copilot.vision.region', { scope: 'all-supported-regions', rollout: 'variable' }]
    ]);
});

test('Copilot Vision source does not duplicate free-chat evidence', () => {
    const result = parse(`
        <main><h1>Using Copilot Vision with Microsoft Copilot</h1>
        <p>Microsoft Copilot (free) - This version of Copilot is available free of cost and is ideal for general questions and answers.</p></main>
    `, { source: source('copilot-entitlements') });

    assert.equal(result.supported, false);
    assert.equal(result.claims.length, 0);
    assert.match(result.reason, /no configured gating or regional claim/i);
});

test('Copilot support reads an explicit Vision subscription negation as free', () => {
    const result = parse(`
        <main><h1>Using Copilot Vision with Microsoft Copilot</h1>
        <p>Copilot Vision does not require a Microsoft 365 subscription.</p></main>
    `, { source: source('copilot-entitlements') });

    assert.equal(result.supported, true);
    assert.deepEqual(result.claims.map(item => [item.field, item.value]), [
        ['copilot.vision.gating', 'free']
    ]);
});

test('Copilot support normalizes equivalent and narrowed Vision regional statements', () => {
    const equivalent = parse(`
        <main><h1>Using Copilot Vision with Microsoft Copilot</h1>
        <p>Copilot Vision is available in all supported regions and languages. Availability may vary during rollout.</p></main>
    `, { source: source('copilot-entitlements') });
    const narrowed = parse(`
        <main><h1>Using Copilot Vision with Microsoft Copilot</h1>
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
