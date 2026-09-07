'use strict';

// Gemini's consumer pages are region- and account-sensitive.  This adapter
// deliberately observes only the current, explicit Mac desktop and price
// evidence below.  A missing statement is never interpreted as a withdrawal.

const { visibleText } = require('./text');

const CHAT_FILE = 'data/platforms/gemini.md';
const MAC_BASELINE_EXCERPT = '| macOS    | ✅ | Native Gemini for Mac app (macOS 15+), launched Apr 2026; gemini.google/mac |';
const PRO_PRICE_BASELINE_EXCERPT = '| Google AI Pro | $19.99/mo | Full Advanced features + 2TB storage |';

const macClaim = {
    field: 'chat.platforms.macOS.available',
    target: {
        file: CHAT_FILE,
        feature: 'Chat',
        section: 'Platforms',
        row: 'macOS',
        column: 'Available'
    },
    baseline: '✅',
    baselineExcerpt: MAC_BASELINE_EXCERPT
};

const proPriceClaim = {
    field: 'chat.pricing.google_ai_pro.usd_monthly',
    target: {
        file: CHAT_FILE,
        section: 'Pricing',
        row: 'Google AI Pro',
        column: 'Price'
    },
    baseline: '$19.99/mo',
    baselineExcerpt: PRO_PRICE_BASELINE_EXCERPT
};

const macMinimumVersionClaim = {
    field: 'chat.platforms.macOS.minimum_version',
    target: {
        file: CHAT_FILE,
        feature: 'Chat',
        section: 'Platforms',
        row: 'macOS',
        column: 'Notes'
    },
    baseline: 15,
    baselineExcerpt: MAC_BASELINE_EXCERPT
};

const macLaunchMonthClaim = {
    field: 'chat.platforms.macOS.launch_month',
    target: {
        file: CHAT_FILE,
        feature: 'Chat',
        section: 'Platforms',
        row: 'macOS',
        column: 'Notes'
    },
    baseline: '2026-04',
    baselineExcerpt: MAC_BASELINE_EXCERPT
};

const config = {
    id: 'gemini',
    label: 'Gemini',
    sources: [
        {
            id: 'release-notes',
            kind: 'release_notes',
            url: 'https://gemini.google/release-notes/?hl=en',
            expectedHost: 'gemini.google',
            claims: [macLaunchMonthClaim]
        },
        {
            id: 'pricing',
            kind: 'pricing',
            url: 'https://one.google.com/intl/en/about/google-ai-plans/',
            expectedHost: 'one.google.com',
            claims: [proPriceClaim]
        },
        {
            id: 'mac-support',
            kind: 'support',
            url: 'https://support.google.com/gemini/answer/17011627?hl=en',
            expectedHost: 'support.google.com',
            claims: [macClaim, macMinimumVersionClaim]
        }
    ]
};

function sourceId(source) {
    return typeof source === 'string' ? source : source && source.id;
}

function normalizedText(body) {
    return visibleText(String(body || '')).replace(/[\t \r]+/g, ' ').replace(/\n{2,}/g, '\n').trim();
}

function nearby(text, index, radius = 450) {
    return text.slice(Math.max(0, index - radius), Math.min(text.length, index + radius));
}

function macEvidence(text) {
    // This is a current support article, so require its explicit requirements
    // and installation instructions. A navigation/title mention alone does
    // not prove that the current app remains downloadable.
    const requirements = /What you need to use the Gemini app on Mac/i.exec(text);
    const desktop = /You can interact with Gemini[^.]{0,180}directly from your Mac desktop/i.exec(text);
    const download = /Download and install the Gemini app on Mac|Click Download for Mac/i.exec(text);
    const version = /macOS(?: versions?)?\s+(?:Sequoia\s*\()?([0-9]+)(?:\.0)?\)?\s*(?:and up|or later)|macOS\s+([0-9]+)\+?/i.exec(text);

    if (!requirements || !desktop || !download || !version) return null;
    const start = Math.min(requirements.index, desktop.index);
    const end = Math.max(version.index + version[0].length, download.index + download[0].length);
    return { passage: text.slice(start, end).trim(), minimumVersion: Number(version[1] || version[2]) };
}

function parseMacSupport(text) {
    const withdrawn = /Gemini app(?=[^.]{0,180}\bMac\b)[^.]{0,180}\b(?:no longer available|isn't available|is not available)\b|(?:no longer available|isn't available|is not available)[^.]{0,180}Gemini app(?=[^.]{0,180}\bMac\b)/i.exec(text);
    if (withdrawn) {
        const quote = nearby(text, withdrawn.index, 260);
        return {
            supported: true,
            claims: [{ field: macClaim.field, value: '❌', quote, locator: 'macos-withdrawal' }]
        };
    }
    const evidence = macEvidence(text);
    if (!evidence) {
        return {
            supported: false,
            claims: [],
            reason: 'no-qualified-current-macos-support-evidence'
        };
    }
    return {
        supported: true,
        claims: [
            { field: macClaim.field, value: '✅', quote: evidence.passage, locator: 'macos-current-availability' },
            { field: macMinimumVersionClaim.field, value: evidence.minimumVersion, quote: evidence.passage, locator: 'macos-minimum-version' }
        ]
    };
}

function releaseLaunchEvidence(text) {
    // Do not confuse later Gemini Spark or macOS feature entries with the
    // initial native-app launch. The official launch card has this title.
    const mac = /Meet your new desktop assistant:\s*Gemini for Mac/i.exec(text);
    if (!mac) return null;

    const datePattern = /(?:^|\n)\s*(20\d{2})[.-](\d{2})[.-](\d{2})\s*(?=\n|$)/g;
    let previous = null;
    for (let match; (match = datePattern.exec(text));) {
        if (match.index >= mac.index) break;
        previous = match;
    }
    // A date elsewhere in a release archive is not enough. The date must be
    // the immediately preceding release-entry heading for this Mac launch.
    if (!previous || mac.index - (previous.index + previous[0].length) > 360) return null;

    const nextDate = new RegExp(datePattern.source, 'g');
    nextDate.lastIndex = mac.index + mac[0].length;
    const following = nextDate.exec(text);
    const end = following ? following.index : Math.min(text.length, mac.index + 900);
    return {
        month: `${previous[1]}-${previous[2]}`,
        quote: text.slice(previous.index, end).trim()
    };
}

function planBlock(text, planName) {
    const startExpression = new RegExp(`(?:^|\\n)\\s*${planName.replace(/ /g, '\\s+')}\\b`, 'i');
    const start = startExpression.exec(text);
    if (!start) return null;
    const beginning = start.index;
    const remaining = text.slice(beginning + start[0].length);
    const next = /(?:^|\n)\s*Google AI (?:Plus|Pro|Ultra)\b/im.exec(remaining);
    return text.slice(beginning, next ? beginning + start[0].length + next.index : text.length);
}

function planHeadlinePriceArea(text, planName) {
    const block = planBlock(text, planName);
    if (!block) return null;
    // The plan headline is the only place that establishes subscription cost.
    // Once a CTA or benefits heading starts, amounts can be credits, included
    // benefits, values, or add-ons rather than the plan's recurring price.
    const boundary = /(?:^|\n)\s*(?:Get Pro|Terms apply|Boost productivity|Unleash creativity|Study smarter|Code faster|And more|View plan benefits|Hide plan benefits)\b/im.exec(block);
    return boundary ? block.slice(0, boundary.index) : block.slice(0, 420);
}

function parsePrice(text) {
    // The URL pins the English page, but pricing is still selected by region.
    // Demand an explicit United States locale, USD marker, and monthly period
    // in the same plan passage.  This rejects annual savings and other
    // marketing amounts that do not establish the recurring plan price.
    const passage = planHeadlinePriceArea(text, 'Google AI Pro');
    if (!passage) return { supported: false, claims: [], reason: 'no-google-ai-pro-price-evidence' };
    const locale = /United States/i.test(text);
    const price = /(?:US\$|USD\s*|\$\s*)([0-9]+(?:[.,][0-9]{2})?)\s*(?:\/\s*(?:mo(?:nth)?\b)|per\s+month|monthly)/i.exec(passage);
    const introductory = /(?:introductory|intro offer|first\s+\d+\s+months?|for\s+the\s+first\s+\d+\s+months?|then\s+\$)/i.test(passage);
    const amountContext = price && passage.slice(Math.max(0, price.index - 120), Math.min(passage.length, price.index + price[0].length + 160));
    const benefitAmount = amountContext && /(?:at no cost|included|value|credit|benefit|add-on|add on|bundled|Google Home|Google Health|YouTube)/i.test(amountContext);

    // A headline price follows the plan title directly. Keeping this window
    // tight prevents lower-page benefit values from becoming subscription
    // prices when a page variant omits an explicit CTA boundary.
    if (!locale || !price || price.index > 180 || introductory || benefitAmount) {
        return { supported: false, claims: [], reason: 'no-qualified-usd-monthly-price' };
    }
    const amount = Number(price[1].replace(',', '.'));
    if (!Number.isFinite(amount)) return { supported: false, claims: [], reason: 'invalid-usd-monthly-price' };
    const normalizedPrice = `$${amount.toFixed(2)}/mo`;
    return {
        supported: true,
        claims: [{
            field: proPriceClaim.field,
            value: normalizedPrice,
            quote: passage,
            locator: { plan: 'Google AI Pro', locale: 'United States', currency: 'USD', billingPeriod: 'month' }
        }]
    };
}

function parse(body, { source, url } = {}) {
    const text = normalizedText(body);
    const id = sourceId(source);
    if (!text) return { supported: false, claims: [], reason: 'empty-body' };

    if (id === 'release-notes') {
        if (!/Release Notes|Gemini Apps.? release/i.test(text)) return { supported: false, claims: [], reason: 'unrecognizable-release-notes-page' };
        // This is intentionally launch-history evidence. It does not assert
        // that the app remains available now; current state comes from support.
        const launch = releaseLaunchEvidence(text);
        return launch
            ? { supported: true, claims: [{ field: macLaunchMonthClaim.field, value: launch.month, quote: launch.quote, locator: 'historical-release-entry' }] }
            : { supported: false, claims: [], reason: 'no-dated-macos-launch-entry' };
    }
    if (id === 'pricing') {
        if (!/Google AI (?:plans?|Plus|Pro|Ultra)/i.test(text)) return { supported: false, claims: [], reason: 'unrecognizable-pricing-page' };
        return parsePrice(text);
    }
    if (id === 'mac-support') {
        if (!/Gemini app (?:on|for) Mac|Use the Gemini app on Mac/i.test(text)) return { supported: false, claims: [], reason: 'unrecognizable-mac-support-page' };
        return parseMacSupport(text);
    }
    return { supported: false, claims: [], reason: `unknown-source:${id || new URL(url || 'https://invalid.example').hostname}` };
}

module.exports = { config, parse };
