'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { config, parse } = require('../scripts/lib/product-monitor/gemini');

const releaseNotes = `
    <nav>Gemini home Download unrelated product</nav>
    <main><h1>Release Notes</h1>
    <h2>2026.04.15</h2><h3>Meet your new desktop assistant: Gemini for Mac</h3>
    <p>We're introducing the Gemini app for Mac, a native desktop experience.
    The new desktop app is available to users on macOS versions 15 and up,
    globally, for free. Download the app directly at gemini.google/mac.</p></main>
    <footer>Legal navigation</footer>`;

const macSupport = `
    <header>Gemini Apps Help</header><main><h1>Use the Gemini app on Mac</h1>
    <p>You can interact with Gemini directly from your Mac desktop.</p>
    <h2>What you need to use the Gemini app on Mac</h2>
    <p>A Mac running macOS Sequoia (15.0) or later with Apple Silicon.</p>
    <h2>Download and install the Gemini app on Mac</h2>
    <p>Click Download for Mac to download the app installer.</p></main>`;

describe('Gemini product-monitor adapter', () => {
    it('uses only the three bounded, official source categories', () => {
        assert.deepEqual(config.sources.map(s => [s.kind, s.expectedHost]), [
            ['release_notes', 'gemini.google'],
            ['pricing', 'one.google.com'],
            ['support', 'support.google.com']
        ]);
        assert.equal(config.sources.length, 3);
    });

    it('keeps the current Chat baseline and exact excerpt with every configured claim', () => {
        for (const source of config.sources) {
            for (const claim of source.claims) {
                assert.equal(claim.target.file, 'data/platforms/gemini.md');
                if (claim.field.startsWith('chat.platforms.')) assert.equal(claim.target.feature, 'Chat');
                if (claim.field.startsWith('chat.pricing.')) assert.equal(claim.target.feature, undefined);
                assert.ok(claim.baseline);
                assert.ok(claim.baselineExcerpt.includes('|'));
            }
        }
    });

    it('tracks a dated native Mac launch entry as history, not current availability', () => {
        const result = parse(releaseNotes, { source: { id: 'release-notes' } });
        assert.equal(result.supported, true);
        assert.deepEqual(result.claims.map(c => [c.field, c.value, c.locator]), [
            ['chat.platforms.macOS.launch_month', '2026-04', 'historical-release-entry']
        ]);
        assert.match(result.claims[0].quote, /^2026\.04\.15/);
    });

    it('ignores a later Gemini Spark macOS feature entry when finding the native-app launch', () => {
        const body = `<main><h1>Release Notes</h1>
            <h2>2026.06.30</h2><h3>Hand off work to Gemini Spark, now available in the macOS app</h3>
            <p>Gemini Spark is coming to the Gemini app for macOS.</p>
            <h2>2026.04.15</h2><h3>Meet your new desktop assistant: Gemini for Mac</h3>
            <p>We're introducing the Gemini app for Mac, a native desktop experience.</p></main>`;
        const result = parse(body, { source: { id: 'release-notes' } });
        assert.equal(result.claims[0].value, '2026-04');
        assert.match(result.claims[0].quote, /Meet your new desktop assistant/i);
    });

    it('observes the support evidence only when it establishes a downloadable, qualified Mac app', () => {
        const result = parse(macSupport, { source: { id: 'mac-support' } });
        assert.equal(result.supported, true);
        assert.equal(result.claims[0].field, 'chat.platforms.macOS.available');
        assert.match(result.claims[0].quote, /Apple Silicon/i);
        assert.deepEqual(result.claims.map(c => [c.field, c.value]), [
            ['chat.platforms.macOS.available', '✅'],
            ['chat.platforms.macOS.minimum_version', 15]
        ]);
    });

    it('does not treat a recognisable release page without a dated Mac entry as a withdrawal', () => {
        const result = parse('<main><h1>Release Notes</h1><p>Gemini 3.6 Flash is available.</p></main>', { source: { id: 'release-notes' } });
        assert.deepEqual(result, {
            supported: false,
            claims: [],
            reason: 'no-dated-macos-launch-entry'
        });
    });

    it('rejects a Mac mention whose closest date is outside its release entry', () => {
        const body = '<main><h1>Release Notes</h1><p>2026.04.15</p><p>Unrelated entry.</p><p>' + 'filler '.repeat(100) + 'Gemini for Mac</p></main>';
        assert.equal(parse(body, { source: { id: 'release-notes' } }).supported, false);
    });

    it('accepts only a locale-, currency-, and billing-period-qualified plan price', () => {
        const body = '<main><h1>Google AI plans</h1><p>United States</p><h2>Google AI Pro</h2><p>US$19.99/month</p></main>';
        const result = parse(body, { source: { id: 'pricing' } });
        assert.equal(result.supported, true);
        assert.equal(result.claims[0].value, '$19.99/mo');
        assert.deepEqual(result.claims[0].locator, {
            plan: 'Google AI Pro', locale: 'United States', currency: 'USD', billingPeriod: 'month'
        });
    });

    it('extracts a changed monthly price from the named plan block', () => {
        const body = '<main>Google AI plans\nUnited States\nGoogle AI Pro\nUS$24.99 per month\nGoogle AI Ultra\nUS$249.99/month</main>';
        const result = parse(body, { source: { id: 'pricing' } });
        assert.equal(result.supported, true);
        assert.equal(result.claims[0].value, '$24.99/mo');
    });

    it('does not borrow a neighboring plan price', () => {
        const body = '<main>Google AI plans\nUnited States\nGoogle AI Pro\nExpanded Gemini access\nGoogle AI Ultra\nUS$249.99/month</main>';
        assert.deepEqual(parse(body, { source: { id: 'pricing' } }), {
            supported: false,
            claims: [],
            reason: 'no-qualified-usd-monthly-price'
        });
    });

    it('rejects an included-benefit value after the plan CTA', () => {
        const body = `<main>Google AI plans
            United States
            Google AI Pro
            /mo
            5 TB storage
            Get Pro
            Terms apply
            Get the Google Home Premium Standard plan at no cost ($10/mo value).</main>`;
        assert.deepEqual(parse(body, { source: { id: 'pricing' } }), {
            supported: false,
            claims: [],
            reason: 'no-qualified-usd-monthly-price'
        });
        const noBoundary = '<main>Google AI plans\nUnited States\nGoogle AI Pro\nGoogle Home Premium included at no cost ($10/mo value).</main>';
        assert.equal(parse(noBoundary, { source: { id: 'pricing' } }).supported, false);
    });

    it('rejects an annual or introductory price as a monthly plan price', () => {
        const annual = '<main>Google AI plans\nUnited States\nGoogle AI Pro\nUS$199.99/year</main>';
        const introductory = '<main>Google AI plans\nUnited States\nGoogle AI Pro\nUS$9.99/month for the first 3 months, then $19.99/month</main>';
        assert.equal(parse(annual, { source: { id: 'pricing' } }).supported, false);
        assert.equal(parse(introductory, { source: { id: 'pricing' } }).supported, false);
    });

    it('rejects an unqualified marketing amount on an otherwise valid pricing page', () => {
        const body = '<main><h1>Google AI plans</h1><p>United States</p><h2>Google AI Pro</h2><p>Save $19.99 today.</p></main>';
        assert.deepEqual(parse(body, { source: { id: 'pricing' } }), {
            supported: false,
            claims: [],
            reason: 'no-qualified-usd-monthly-price'
        });
    });

    it('rejects an unknown source rather than parsing it opportunistically', () => {
        const result = parse(releaseNotes, { source: { id: 'other' }, url: 'https://example.test/' });
        assert.equal(result.supported, false);
        assert.equal(result.claims.length, 0);
    });

    it('proposes a withdrawal only from explicit current support wording', () => {
        const body = '<main><h1>Use the Gemini app on Mac</h1><p>The Gemini app is no longer available on Mac.</p></main>';
        const result = parse(body, { source: { id: 'mac-support' } });
        assert.equal(result.supported, true);
        assert.deepEqual(result.claims.map(c => [c.field, c.value]), [
            ['chat.platforms.macOS.available', '❌']
        ]);
    });

    it('extracts a changed current macOS minimum version for Notes review', () => {
        const body = '<main><h1>Use the Gemini app on Mac</h1><p>You can interact with Gemini directly from your Mac desktop.</p><h2>What you need to use the Gemini app on Mac</h2><p>A Mac running macOS Sequoia (16.0) or later is required.</p><h2>Download and install the Gemini app on Mac</h2></main>';
        const result = parse(body, { source: { id: 'mac-support' } });
        assert.equal(result.supported, true);
        assert.deepEqual(result.claims.map(c => [c.field, c.value]), [
            ['chat.platforms.macOS.available', '✅'],
            ['chat.platforms.macOS.minimum_version', 16]
        ]);
    });
});
