/**
 * Prose-claim cross-checking for talking points
 *
 * Every other drift check in this repo compares structured data against
 * structured data. This module checks the hand-written prose: it extracts
 * checkable claims (plan names, gating assertions, status words) from a
 * feature's talking point and compares them against the structured fields
 * in the same feature block — the availability table, Gating, Status, and
 * the platform's pricing table.
 *
 * It never tries to decide whether prose is *accurate* (undecidable); it
 * only flags prose that contradicts the structured ground truth sitting
 * directly beside it, plus time-bound wording ("temporary", "promotional")
 * that has outlived its verification date.
 *
 * Pattern adapted from obligation-first's staleClaims().
 */

'use strict';

// Plans that exist across the covered platforms. Used only as a fallback
// when a platform file lacks a pricing table; the platform's own pricing
// and availability rows are always the primary vocabulary.
const GLOBAL_PLAN_NAMES = [
    'Free', 'Go', 'Plus', 'Pro', 'Business', 'Enterprise',
    'AI Pro', 'AI Ultra', 'Max 5x', 'Max 20x', 'Workspace add-on'
];

// A sentence containing one of these is talking about a surface subset
// (e.g. "desktop voice is paid-only"), not the feature's overall gating,
// so feature-level gating checks skip it.
const SURFACE_QUALIFIER = /\b(desktop|macos|mac os|windows|linux|ios|android|mobile|web|api|extension|terminal|browser|chrome|app|apps)\b/i;

// "deprecated" is deliberately absent: in practice it always described a
// sub-component ("Manual thinking mode is deprecated", "the DALL-E 3 API is
// deprecated"), never the feature itself, so it only produced noise.
const STATUS_WORDS = /\b(research preview|public preview|preview|beta|experimental|generally available|GA)\b/gi;

// Bare "preview"/"beta"/"experimental" only counts as a status claim with a
// status-y lead ("in beta", "still preview") — otherwise it is a noun in
// phrases like "HTML preview" or "March 2026 beta rollout".
const STATUS_CONTEXT_LEAD = /\b(in|into|still|currently|remains?|entered|enters|is|are)\s+(?:an?\s+)?$/i;

// Wording that asserts a past or ended state rather than a current one.
const HISTORICAL_LEAD = /\b(was|were|had been|no longer|formerly|previously|graduated from|left|exited|out of|after being|used to be)\s+(?:in\s+|a\s+)?$/i;

function escapeRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function splitSentences(text) {
    return text
        .split(/(?<=[.;!?])\s+/)
        .map(s => s.trim())
        .filter(Boolean);
}

function normalizePlan(name) {
    return String(name || '').trim().toLowerCase();
}

/**
 * Plan vocabulary for one feature: the platform's pricing rows, the
 * feature's own availability rows, and the global fallback list.
 * Longest names first so "AI Pro" wins over "Pro".
 */
function planVocabulary(feature, platform) {
    const names = new Map();
    const add = name => {
        const trimmed = String(name || '').trim();
        if (trimmed && !/^[-—]+$/.test(trimmed)) names.set(normalizePlan(trimmed), trimmed);
    };
    (platform?.pricing || []).forEach(row => add(row.plan));
    (feature.availability || []).forEach(row => add(row.plan));
    GLOBAL_PLAN_NAMES.forEach(add);
    return [...names.values()].sort((a, b) => b.length - a.length);
}

function availabilityRow(feature, planName) {
    const wanted = normalizePlan(planName);
    return (feature.availability || []).find(row => normalizePlan(row.plan) === wanted) || null;
}

function availabilityMark(row) {
    const value = String(row?.available || '');
    if (value.includes('✅')) return 'yes';
    if (value.includes('❌')) return 'no';
    if (value.includes('⚠️')) return 'partial';
    return 'unknown';
}

/**
 * Find plan-availability claims in one sentence.
 * Only anchored patterns count — a bare plan-name mention is not a claim.
 * @returns {Array<{plan: string, polarity: 'positive'|'negative'}>}
 */
function findPlanClaims(sentence, planNames) {
    const claims = [];
    for (const plan of planNames) {
        const p = escapeRegex(plan);
        const positive = [
            `available\\s+(?:on|to|for|in|with)\\s+(?:the\\s+)?(?:\\*\\*)?${p}\\b`,
            // "X users get/have ..." is only a claim about THIS feature when
            // the object refers back to it ("get it", "have access") — "Free
            // users get standard Gemini only" is a claim about something else.
            `\\b(?:\\*\\*)?${p}(?:\\*\\*)?(?:\\s*\\([^)]*\\))?\\s+(?:users?|subscribers?|accounts?)\\s+(?:get|gets|have|has|receive)s?\\s+(?:it|this|them|access|full)\\b`,
            `\\brequires?\\s+(?:an?\\s+)?(?:the\\s+)?(?:\\*\\*)?${p}\\b`,
            `\\bexclusive\\s+to\\s+(?:\\*\\*)?${p}\\b`,
            `\\bincluded\\s+(?:with|in|on)\\s+(?:\\*\\*)?${p}\\b`,
            `\\b(?:\\*\\*)?${p}(?:\\*\\*)?[- ]only\\b`,
            `\\bstarting\\s+(?:at|with|from)\\s+(?:\\*\\*)?${p}\\b`,
            `\\b(?:\\*\\*)?${p}(?:\\*\\*)?\\s+and\\s+(?:above|higher|up)\\b`
        ];
        for (const pattern of positive) {
            const re = new RegExp(pattern, 'i');
            const match = re.exec(sentence);
            if (!match) continue;
            const lead = sentence.slice(Math.max(0, match.index - 16), match.index);
            const negated = /\b(not|no|never|isn'?t|aren'?t|without|except)\s*$/i.test(lead);
            claims.push({ plan, polarity: negated ? 'negative' : 'positive' });
            break;
        }
    }
    // "AI Pro" matched means a bare-"Pro" claim on the same span is an
    // artifact of substring overlap; drop shorter plans contained in a
    // longer matched plan when both were found.
    const matched = claims.map(c => c.plan);
    return claims.filter(c => !matched.some(other =>
        other !== c.plan && new RegExp(`\\b${escapeRegex(c.plan)}\\b`, 'i').test(other)));
}

// "free users get/have …" is deliberately absent — its object is usually a
// different product ("Free users get standard Gemini only"), which made it
// the main false-positive source on the first run.
const UNIVERSAL_CLAIM = /\b(available\s+(?:on|to|for)\s+(?:every|all)\s+(?:plans?|tiers?)|(?:on|across|for)\s+all\s+(?:plans|tiers)|every\s+plan|including\s+free|even\s+(?:on|for)\s+free|free\s+for\s+all\s+users|available\s+to\s+everyone)\b/i;

const PAID_ONLY_CLAIM = /\b(paid[- ]only|paid\s+plans?\s+only|requires?\s+a\s+paid\s+(?:plan|subscription|tier)|no\s+free\s+(?:tier|access)|not\s+available\s+(?:on|to|for)\s+free)\b/i;

const TIME_BOUND_CLAIM = /\b(temporar(?:y|ily)|promotional|promotion|limited[- ]time|for\s+a\s+limited\s+time)\b/i;

function daysBetween(fromDate, toDate) {
    const from = new Date(fromDate);
    if (Number.isNaN(from.getTime())) return null;
    return Math.floor((toDate - from) / (1000 * 60 * 60 * 24));
}

/**
 * Cross-check one feature's talking point against its structured fields.
 * @param {Object} feature - Parsed feature (parser.js parseFeature shape)
 * @param {Object} platform - Parsed platform (for the pricing table)
 * @param {Date} [now] - Injectable clock for the time-bound check
 * @returns {Array<{check: string, severity: 'error'|'warning', message: string}>}
 */
function checkFeatureClaims(feature, platform, now = new Date()) {
    const issues = [];
    const prose = feature.talking_point || '';
    if (!prose) return issues;

    const sentences = splitSentences(prose);
    const vocabulary = planVocabulary(feature, platform);
    const freeRow = availabilityRow(feature, 'Free');
    const freeMark = availabilityMark(freeRow);

    for (const sentence of sentences) {
        const surfaceScoped = SURFACE_QUALIFIER.test(sentence);

        // 1. Universal-availability claims vs the Free row. A Free row of ⚠️
        //    is compatible with "including free (with limits)" — and with
        //    Gating "paid" per consistency.js Rule 2 — so only ❌ (or a
        //    missing row on a paid-gated feature) contradicts the prose.
        if (UNIVERSAL_CLAIM.test(sentence) && !/\bnot\s+(?:available|including)/i.test(sentence)) {
            if (freeMark === 'no') {
                issues.push({
                    check: 'universal-claim',
                    severity: 'error',
                    message: `Talking point claims availability including free ("${sentence.slice(0, 80)}…") but the Free row is ❌`
                });
            } else if (!freeRow && feature.gating === 'paid') {
                issues.push({
                    check: 'universal-claim',
                    severity: 'error',
                    message: `Talking point claims availability including free but Gating is "paid" and the availability table has no Free row`
                });
            }
        }

        // 2. Paid-only claims vs Free row (feature-level sentences only —
        //    "desktop voice is paid-only" describes a surface, not the feature)
        if (PAID_ONLY_CLAIM.test(sentence) && !surfaceScoped && freeMark === 'yes') {
            issues.push({
                check: 'paid-only-claim',
                severity: 'error',
                message: `Talking point calls the feature paid-only ("${sentence.slice(0, 80)}…") but the Free row is ✅`
            });
        }

        // 3. Named-plan availability claims vs that plan's availability row
        for (const { plan, polarity } of findPlanClaims(sentence, vocabulary)) {
            const row = availabilityRow(feature, plan);
            if (!row) {
                issues.push({
                    check: 'plan-unknown',
                    severity: 'error',
                    message: `Talking point makes a claim about plan "${plan}" but the availability table has no ${plan} row`
                });
                continue;
            }
            const mark = availabilityMark(row);
            if (polarity === 'positive' && mark === 'no') {
                issues.push({
                    check: 'plan-availability',
                    severity: 'error',
                    message: `Talking point claims ${plan} has access ("${sentence.slice(0, 80)}…") but the ${plan} row is ❌`
                });
            }
            if (polarity === 'negative' && mark === 'yes') {
                issues.push({
                    check: 'plan-availability',
                    severity: 'error',
                    message: `Talking point denies ${plan} access ("${sentence.slice(0, 80)}…") but the ${plan} row is ✅`
                });
            }
        }
    }

    // 4. Status words vs the Status field (whole prose, historical wording excluded)
    STATUS_WORDS.lastIndex = 0;
    let statusMatch;
    while ((statusMatch = STATUS_WORDS.exec(prose)) !== null) {
        const word = statusMatch[1].toLowerCase();
        const lead = prose.slice(Math.max(0, statusMatch.index - 30), statusMatch.index);
        if (HISTORICAL_LEAD.test(lead)) continue;
        // "GA" only counts uppercase — lowercase "ga" is a word fragment.
        if (word === 'ga' && statusMatch[1] !== 'GA') continue;
        const bareWord = ['preview', 'beta', 'experimental'].includes(word);
        if (bareWord && !STATUS_CONTEXT_LEAD.test(lead)) continue;
        const status = (feature.status || '').toLowerCase();
        const claimsPrerelease = ['research preview', 'public preview', 'preview', 'beta', 'experimental'].includes(word);
        const claimsGa = word === 'generally available' || word === 'ga';
        if (claimsPrerelease && status === 'ga') {
            issues.push({
                check: 'status-mismatch',
                severity: 'warning',
                message: `Talking point says "${statusMatch[1]}" but Status is "ga"`
            });
        }
        if (claimsGa && status && status !== 'ga') {
            issues.push({
                check: 'status-mismatch',
                severity: 'warning',
                message: `Talking point says "${statusMatch[1]}" but Status is "${feature.status}"`
            });
        }
    }

    // 5. Time-bound wording that outlived its verification date. This is the
    //    Codex failure mode: "temporary promotional access" standing five
    //    months after the promotion became the norm. A fresh Verified date
    //    means a human recently vouched for the wording; past 60 days it
    //    needs another look.
    const timeBound = TIME_BOUND_CLAIM.exec(prose);
    if (timeBound) {
        const age = daysBetween(feature.verified, now);
        if (age === null || age > 60) {
            issues.push({
                check: 'time-bound-claim',
                severity: 'warning',
                message: `Talking point contains time-bound wording ("${timeBound[1]}") and Verified is ${age === null ? 'unparseable' : `${age} days old`} — re-verify or reword`
            });
        }
    }

    return issues;
}

module.exports = {
    checkFeatureClaims,
    findPlanClaims,
    planVocabulary,
    splitSentences,
    GLOBAL_PLAN_NAMES
};
