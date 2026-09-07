'use strict';

const { visibleText } = require('./text');

const source = (id, kind, url, expectedHost, claims) => ({ id, kind, url, expectedHost, claims });

const config = {
    id: 'copilot',
    label: 'Microsoft Copilot',
    sources: [
        source('copilot-changes', 'release_notes', 'https://support.microsoft.com/en-us/microsoft-365-copilot/learning/changes-microsoft-copilot-app', 'support.microsoft.com', [
            {
                field: 'copilot.chat.free.availability',
                target: { file: 'data/platforms/copilot.md', feature: 'Chat', section: 'Availability', row: 'Free', column: 'Available' },
                baseline: '✅',
                baselineExcerpt: '| Free | ✅ | Standard | No sign-in for basic chat; sign in for history, longer conversations, image creation, voice |'
            }
        ]),
        source('copilot-pricing', 'pricing', 'https://microsoft.com/en-us/microsoft-copilot', 'microsoft.com', [
            {
                field: 'copilot.pricing.microsoft_365_premium.price',
                target: { file: 'data/platforms/copilot.md', section: 'Pricing', row: 'Microsoft 365 Premium', column: 'Price' },
                baseline: '$19.99/mo',
                baselineExcerpt: '| Microsoft 365 Premium | $19.99/mo | Top consumer tier; replaced Copilot Pro. Adds Analyst and Researcher agents and extended limits |'
            },
            {
                field: 'copilot.pricing.copilot_pro.status',
                target: { file: 'data/platforms/copilot.md', section: 'Pricing', row: 'Copilot Pro', column: 'status' },
                baseline: 'retired',
                baselineExcerpt: 'Copilot Pro is retired. Microsoft stopped selling it in October 2025 and support for remaining subscribers ended 2026-08-01; its consumer features moved to Microsoft 365 Premium.'
            }
        ]),
        source('copilot-entitlements', 'support', 'https://support.microsoft.com/en-us/microsoft-365-copilot/what-s-the-difference-between-microsoft-copilot-free-and-copilot-in-microsoft-365', 'support.microsoft.com', [
            {
                field: 'copilot.chat.free.availability',
                target: { file: 'data/platforms/copilot.md', feature: 'Chat', section: 'Availability', row: 'Free', column: 'Available' },
                baseline: '✅',
                baselineExcerpt: '| Free | ✅ | Standard | No sign-in for basic chat; sign in for history, longer conversations, image creation, voice |'
            },
            {
                field: 'copilot.vision.gating',
                target: { file: 'data/platforms/copilot.md', feature: 'Copilot Vision', section: 'Property', row: 'Gating', column: 'Value' },
                baseline: 'paid',
                baselineExcerpt: '| Gating | paid |'
            },
            {
                field: 'copilot.vision.region',
                target: { file: 'data/platforms/copilot.md', feature: 'Copilot Vision', section: 'Regional', row: null, column: 'text' },
                baseline: { scope: 'all-supported-regions', rollout: 'variable' },
                baselineExcerpt: 'Available in all supported Copilot regions and languages. Availability can vary during rollout.'
            }
        ])
    ]
};

const quoteMatching = (text, expression, radius = 280) => {
    const match = expression.exec(text);
    if (!match) return null;
    // Preserve enough surrounding text to retain dates such as 2026-08-01.
    // Sentence splitting is unsafe here because the date's decimal-like punctuation
    // can truncate the affirmative retirement evidence.
    return text.slice(Math.max(0, match.index - radius), Math.min(text.length, match.index + match[0].length + radius)).trim();
};

const claim = (field, value, quote, locator) => ({ field, value, quote, ...(locator ? { locator } : {}) });

function parse(body, { source: sourceConfig, url, now = new Date().toISOString() } = {}) {
    const text = visibleText(body);
    const sourceId = sourceConfig && sourceConfig.id;

    if (!text || !sourceId) {
        return { supported: false, claims: [], reason: 'Missing visible page text or source configuration.' };
    }

    if (sourceId === 'copilot-changes') {
        const recognizesPage = /(?:changes|updates) to (?:the )?(?:microsoft )?copilot(?: app)?|microsoft copilot/i.test(text);
        if (!recognizesPage) {
            return { supported: false, claims: [], reason: 'Page does not identify a Microsoft Copilot changes surface.' };
        }

        const free = quoteMatching(text, /(?:chat with copilot|copilot).{0,140}(?:for free|free).{0,140}(?:capacity|limit|chat)|(?:for free|free).{0,140}(?:chat with copilot|copilot)/i);
        if (free && !/(?:not free|isn't free|is not free|no longer free)/i.test(free)) {
            return { supported: true, claims: [claim('copilot.chat.free.availability', '✅', free, 'free-chat')] };
        }
        return { supported: false, claims: [], reason: 'Recognized Microsoft Copilot changes page, but no explicit free-chat statement was found.' };
    }

    if (sourceId === 'copilot-pricing') {
        const recognizesPage = /(?:microsoft copilot|microsoft 365)/i.test(text);
        if (!recognizesPage) {
            return { supported: false, claims: [], reason: 'Page does not identify Microsoft Copilot or Microsoft 365.' };
        }

        const claims = [];
        const premium = /microsoft\s*365\s*premium\b/i.exec(text);
        if (premium) {
            const nextPlan = /\b(?:microsoft\s*365\s*(?:personal|family|copilot)|copilot\s*pro)\b/ig;
            nextPlan.lastIndex = premium.index + premium[0].length;
            const followingPlan = nextPlan.exec(text);
            const block = text.slice(premium.index, followingPlan ? followingPlan.index : premium.index + 360);
            const locale = /united states|u\.s\.|\bus\b/i.test(text);
            const prices = [];
            const statedMonthlyValues = [];
            const amounts = /(?:US\$|USD\s*|\$\s*)(\d+(?:[.,]\d{2})?)/ig;
            let amount;
            while ((amount = amounts.exec(block))) {
                const betweenPlanAndAmount = block.slice(premium[0].length, amount.index).trim().replace(/\s+/g, ' ');
                const afterAmount = block.slice(amount.index + amount[0].length, amount.index + amount[0].length + 80);
                const isUsd = /^(?:US\$|USD)/i.test(amount[0]) || locale;
                const isMonthly = /(?:\/\s*(?:mo(?:nth)?|month)\b|per\s+month|monthly)/i.test(afterAmount);
                const isPlanHeadline = /^(?:(?:is|costs|from|for|price|monthly|plan|starts at)\s*)?[:\-–—]?$/i.test(betweenPlanAndAmount);
                const isBenefitOrPromotion = /(?:benefit|credit|trial|introductory|discount|save|off|bonus)/i.test(`${betweenPlanAndAmount} ${afterAmount}`);
                const value = `$${amount[1].replace(',', '.')}/mo`;
                if (isUsd && isMonthly && !/(?:benefit|credit)/i.test(`${betweenPlanAndAmount} ${afterAmount}`)) {
                    statedMonthlyValues.push(value);
                }
                if (isUsd && isMonthly && isPlanHeadline && !isBenefitOrPromotion) {
                    prices.push(value);
                }
            }
            if (new Set(prices).size === 1 && new Set(statedMonthlyValues).size === 1) {
                claims.push(claim('copilot.pricing.microsoft_365_premium.price', prices[0], block.trim(), 'microsoft-365-premium'));
            }
        }

        // Retirement is supported only by an affirmative, dated statement. A missing
        // Copilot Pro offer can reflect a different page variant, region, or navigation.
        const retirement = quoteMatching(text, /copilot pro.{0,180}(?:retired|no longer (?:available|offered|sold)|support (?:has )?ended|ended support|discontinued).{0,180}(?:20\d{2}|january|february|march|april|may|june|july|august|september|october|november|december)/i, 420);
        const currentYear = new Date(now).getUTCFullYear();
        const citedYears = retirement ? [...retirement.matchAll(/\b(20\d{2})\b/g)].map(match => Number(match[1])) : [];
        const negatedOrFuture = retirement && (
            /copilot pro.{0,120}(?:is not|isn't|not|never).{0,80}(?:retired|no longer|ended|discontinued)/i.test(retirement) ||
            /copilot pro.{0,120}(?:will|planned|plan|scheduled|expected).{0,80}(?:retire|retired|end|discontinu)/i.test(retirement) ||
            citedYears.some(year => Number.isFinite(currentYear) && year > currentYear)
        );
        if (retirement && !negatedOrFuture) {
            claims.push(claim('copilot.pricing.copilot_pro.status', 'retired', retirement, 'copilot-pro-retirement'));
        }

        if (!claims.length && /copilot pro/i.test(text) && /(?:retired|no longer|ended|discontinued)/i.test(text)) {
            return { supported: false, claims: [], reason: 'Copilot Pro retirement wording lacks a dated support context.' };
        }
        return claims.length
            ? { supported: true, claims }
            : { supported: false, claims: [], reason: 'Recognized Microsoft pricing page, but no configured plan claim was stated.' };
    }

    if (sourceId === 'copilot-entitlements') {
        const recognizesPage = /(?:microsoft copilot free|copilot in microsoft 365|microsoft copilot)/i.test(text);
        if (!recognizesPage) {
            return { supported: false, claims: [], reason: 'Page does not identify the Microsoft Copilot entitlement guidance.' };
        }

        const claims = [];
        const free = quoteMatching(text, /(?:microsoft copilot\s*\(free\).{0,180}available free of cost|microsoft copilot is available at no cost|(?:free (?:version of )?(?:microsoft )?copilot|microsoft copilot (?:is )?free).{0,160}(?:chat|sign in|history|conversation))/i);
        if (free) {
            claims.push(claim('copilot.chat.free.availability', '✅', free, 'free-chat'));
        }
        const vision = quoteMatching(text, /(?:copilot vision).{0,220}(?:subscription|required|microsoft 365|personal|family|premium)/i);
        if (vision && /(?:does not require|doesn't require|is not required|isn't required|no subscription required)/i.test(vision)) {
            claims.push(claim('copilot.vision.gating', 'free', vision, 'vision-subscription'));
        } else if (vision && /(?:requires|required|microsoft 365 (?:personal|family|premium) subscription)/i.test(vision)) {
            claims.push(claim('copilot.vision.gating', 'paid', vision, 'vision-subscription'));
        }
        const region = quoteMatching(text, /(?:copilot vision).{0,260}(?:available.{0,120}(?:region|language|country|united states|\bUS\b)|(?:region|language|country).{0,120}available)/i);
        if (region && /all supported.{0,80}(?:regions?|languages?)/i.test(region) && /(?:vary|rollout)/i.test(region)) {
            claims.push(claim('copilot.vision.region', { scope: 'all-supported-regions', rollout: 'variable' }, region, 'vision-regional-availability'));
        } else if (region && /(?:only|limited).{0,60}(?:united states|\bUS\b)/i.test(region)) {
            claims.push(claim('copilot.vision.region', { scope: 'us-only', rollout: 'variable' }, region, 'vision-regional-availability'));
        }
        return claims.length
            ? { supported: true, claims }
            : { supported: false, claims: [], reason: 'Recognized entitlement guidance, but no configured plan, Vision, or regional claim was stated.' };
    }

    return { supported: false, claims: [], reason: `Unsupported Copilot source: ${sourceId}.` };
}

module.exports = { config, parse };
