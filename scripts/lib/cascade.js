/**
 * Cascade logic for multi-model verification
 * Implements the consensus-based verification flow
 */

const { getCascadeClients } = require('./ai-clients');
const { serializeFeature } = require('./parser');

/**
 * Result types from verification
 */
const ResultType = {
    NEGATIVE: 'negative',      // No change detected
    POSITIVE: 'positive',      // Change detected
    ERROR: 'error',            // Query failed
    SKIPPED: 'skipped'         // Model skipped (same provider)
};

/**
 * Outcome types from cascade
 */
const CascadeOutcome = {
    NO_CHANGE: 'no_change',           // First model confirmed no change
    CONFIRMED: 'confirmed',            // 3+ models agree on change
    CONTRADICTION: 'contradiction',    // Models disagree
    INCONCLUSIVE: 'inconclusive',      // Cascade exhausted without consensus
    ERROR: 'error'                     // All models failed
};

// Material sections — changes here can affect our data. Non-material sections
// (regional phrasing, URL casing, recent-change commentary) should not alone
// trigger an issue.
const MATERIAL_SECTIONS = new Set(['pricing', 'platform', 'status', 'gating']);

// Section labels the verification prompt asks the models to answer in order.
// Index matches the numbered list in buildVerificationPrompt.
const PROMPT_SECTIONS = [
    { idx: 1, key: 'pricing',  label: 'Pricing tier availability' },
    { idx: 2, key: 'platform', label: 'Platform/surface availability' },
    { idx: 3, key: 'status',   label: 'Current status' },
    { idx: 4, key: 'gating',   label: 'Access gating' },
    { idx: 5, key: 'regional', label: 'Regional availability' },
    { idx: 6, key: 'url',      label: 'Official URL' },
    { idx: 7, key: 'recent',   label: 'Recent changes' }
];

// Phrases that indicate the model is abstaining rather than asserting a change.
const ABSTAIN_PHRASES = [
    'insufficient sources',
    'insufficient data',
    'insufficient information',
    'unable to verify',
    'unable to confirm',
    'could not find',
    "couldn't find",
    'cannot confirm',
    "can't confirm",
    'no direct info',
    'no direct information',
    'no specific mention',
    'no specific information',
    'no confirmation',
    'no information available',
    'no specific recent',
    'unconfirmed',
    'unknown (insufficient',
    'inferred',
    'not in search results',
    'not found in',
    'lack data',
    'lacks data',
    'no data on'
];

/**
 * Split a response into the seven numbered sections defined by the prompt.
 * Returns a map keyed by section `key` → section body text.
 */
function splitSections(response) {
    const sections = {};
    // Match "1. Pricing...", "### 1. Pricing...", "1) Pricing..." etc.
    // Start is the position of the header itself (we want the verdict words
    // that models usually put on the header line to be part of the body).
    const headerRegex = /(?:^|\n)[\s#*_>-]*(\d)[\.\)]\s+/g;
    const matches = [];
    let m;
    while ((m = headerRegex.exec(response)) !== null) {
        const idx = parseInt(m[1], 10);
        if (idx >= 1 && idx <= 7) {
            // Start = just after the leading whitespace/punctuation, so the
            // section body includes everything from "Pricing..." onward up
            // to the next header.
            const start = m.index + m[0].length - (m[0].match(/\d[\.\)]\s+$/)?.[0].length || 0);
            matches.push({ idx, start });
        }
    }
    for (let i = 0; i < matches.length; i++) {
        const { idx, start } = matches[i];
        const end = i + 1 < matches.length ? matches[i + 1].start : response.length;
        const section = PROMPT_SECTIONS.find(s => s.idx === idx);
        if (section) {
            // Last occurrence of an index wins — handles models that repeat
            // the numbered list (e.g. summary tables).
            sections[section.key] = response.slice(start, end);
        }
    }
    return sections;
}

/**
 * Classify a section body into one of: correct, incorrect, abstain, unknown.
 */
function classifySection(body) {
    if (!body) return 'unknown';
    const lower = body.toLowerCase();

    // Abstain check first — a model saying "insufficient sources" is not a
    // vote for "incorrect" even if the word "incorrect" appears elsewhere.
    if (ABSTAIN_PHRASES.some(p => lower.includes(p))) {
        return 'abstain';
    }

    // Explicit verdict keywords — require word boundaries to avoid matching
    // "incorrectly" or substrings inside unrelated words.
    const incorrect = /\b(incorrect|outdated|stale|inaccurate|mismatch(?:es|ed)?|does not match|doesn'?t match|has changed|no longer accurate)\b/i.test(body);
    const correct   = /\b(correct|accurate|matches?|still accurate|unchanged|no change(?:s)? detected|confirmed)\b/i.test(body);

    if (incorrect && !correct) return 'incorrect';
    if (correct && !incorrect) return 'correct';
    if (correct && incorrect) {
        // Both present — defer to whichever appears first (models usually
        // lead with the verdict).
        const iPos = body.search(/\bincorrect\b/i);
        const cPos = body.search(/\bcorrect\b/i);
        return iPos >= 0 && (cPos < 0 || iPos < cPos) ? 'incorrect' : 'correct';
    }
    return 'unknown';
}

/**
 * Parse AI response to determine if a MATERIAL change was detected.
 *
 * The old parser scanned the whole response for keyword indicators, which
 * produced a lot of false positives (any mention of "now available" or
 * "deprecated" in historical context flipped the verdict). This version
 * parses the numbered sections the prompt asks for, classifies each, and
 * only flags a change when a MATERIAL section is marked incorrect with a
 * concrete change description.
 *
 * @param {string} response
 * @param {Object} storedFeature
 * @returns {{hasChange: boolean, changes: Array<Object>, confidence: number, sectionVerdicts?: Object, isEmpty?: boolean, abstainCount?: number}}
 */
function parseResponse(response, storedFeature) {
    const responseLower = response.toLowerCase();

    // Detect empty or boilerplate responses that contain no actual analysis
    const BOILERPLATE_PREFIXES = [
        'okay, i will check', 'okay, i will verify',
        'okay, let me check', 'okay, let me verify',
        'i will check', 'i will verify',
        'let me check', 'let me verify',
        'sure, i will', 'sure, let me'
    ];
    const isBoilerplate = response.trim().length < 30 ||
        (BOILERPLATE_PREFIXES.some(p => responseLower.startsWith(p)) &&
         response.trim().length < 500);
    if (isBoilerplate) {
        return { hasChange: false, changes: [], confidence: 0, isEmpty: true };
    }

    // Per-section classification.
    const sections = splitSections(response);
    const sectionVerdicts = {};
    for (const s of PROMPT_SECTIONS) {
        sectionVerdicts[s.key] = classifySection(sections[s.key]);
    }

    const incorrectMaterial = PROMPT_SECTIONS
        .filter(s => MATERIAL_SECTIONS.has(s.key) && sectionVerdicts[s.key] === 'incorrect');

    const abstainCount = Object.values(sectionVerdicts).filter(v => v === 'abstain').length;

    // Extract concrete change details from incorrect material sections only.
    // A section marked "incorrect" without a concrete change description is
    // insufficient — the model has to tell us what actually changed.
    const changes = [];

    if (incorrectMaterial.some(s => s.key === 'pricing') || incorrectMaterial.some(s => s.key === 'gating')) {
        const availPatterns = [
            /(?:now|no longer) available (?:on|for) (free|plus|go|pro|max|team|enterprise|premium|supergrok)/gi,
            /(free|plus|go|pro|max|team|enterprise|premium|supergrok) (?:tier|plan|users?) (?:now )?(?:have|has|get|can) access/gi,
            /(free|plus|go|pro|max|team|enterprise|premium|supergrok) (?:tier|plan) (?:no longer|cannot|can't) access/gi
        ];
        for (const pattern of availPatterns) {
            let m;
            while ((m = pattern.exec(response)) !== null) {
                changes.push({ type: 'availability', detail: m[0], plan: m[1] });
            }
        }
    }

    if (incorrectMaterial.some(s => s.key === 'platform')) {
        const platformPatterns = [
            /(?:now|no longer) available on (windows|macos|linux|ios|android|web|api|terminal)/gi,
            /(windows|macos|linux|ios|android|web|api|terminal) (?:support|app|version) (?:added|removed|launched)/gi
        ];
        for (const pattern of platformPatterns) {
            let m;
            while ((m = pattern.exec(response)) !== null) {
                changes.push({ type: 'platform', detail: m[0], platform: m[1] });
            }
        }
    }

    if (incorrectMaterial.some(s => s.key === 'status')) {
        const statusPatterns = [
            /(?:moved to|now in|entered|exited) (ga|beta|preview|deprecated)/gi,
            /status (?:changed|moved|updated) (?:to|from) (ga|beta|preview|deprecated)/gi
        ];
        for (const pattern of statusPatterns) {
            let m;
            while ((m = pattern.exec(response)) !== null) {
                changes.push({ type: 'status', detail: m[0] });
            }
        }
    }

    // Deduplicate
    const uniqueChanges = [];
    const seen = new Set();
    for (const c of changes) {
        const key = `${c.type}:${c.detail.toLowerCase()}`;
        if (!seen.has(key)) { seen.add(key); uniqueChanges.push(c); }
    }

    // hasChange requires BOTH: (a) at least one material section marked
    // incorrect, AND (b) concrete change details extracted. Either alone
    // is insufficient — "incorrect" without specifics is noise; specifics
    // without a material verdict (e.g. in section 7 commentary) is history.
    const hasChange = incorrectMaterial.length > 0 && uniqueChanges.length > 0;

    const confidence = hasChange
        ? Math.min(0.9, 0.5 + (uniqueChanges.length * 0.1))
        : (abstainCount >= 3 ? 0.3 : 0.7);

    return {
        hasChange,
        changes: uniqueChanges,
        confidence,
        sectionVerdicts,
        abstainCount
    };
}

/**
 * Compare two parsed responses for contradiction.
 *
 * A single model flipping to hasChange=true is NOT a contradiction — it's one
 * vote against the default. True contradiction requires BOTH results to have
 * concrete change details AND for the details to disagree (e.g. one says
 * "now free" and the other says "still paid"). A lone positive vote should
 * flow through as INCONCLUSIVE and be resolved by cascade continuation.
 */
function detectContradiction(result1, result2) {
    // Both must have material change details for a contradiction to matter.
    // A "no change" result vs a "maybe changed" result is not a contradiction —
    // it's a weak signal that needs more votes.
    const r1HasDetails = result1.hasChange && (result1.changes || []).length > 0;
    const r2HasDetails = result2.hasChange && (result2.changes || []).length > 0;
    if (!r1HasDetails || !r2HasDetails) return false;

    // Both claim material change. Consider it a contradiction only if they
    // target overlapping change types with incompatible details.
    const types1 = new Set(result1.changes.map(c => c.type));
    const types2 = new Set(result2.changes.map(c => c.type));
    const overlap = [...types1].some(t => types2.has(t));
    if (!overlap) return false;

    // Same type, compare detail strings loosely.
    for (const type of types1) {
        if (!types2.has(type)) continue;
        const d1 = result1.changes.filter(c => c.type === type).map(c => c.detail.toLowerCase());
        const d2 = result2.changes.filter(c => c.type === type).map(c => c.detail.toLowerCase());
        const shareDetail = d1.some(x => d2.some(y => x === y || x.includes(y) || y.includes(x)));
        if (!shareDetail) return true;
    }
    return false;
}

/**
 * Run verification cascade for a single feature
 * @param {Object} platform - Platform object
 * @param {Object} feature - Feature object
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Cascade result
 */
async function runCascade(platform, feature, options = {}) {
    const {
        requiredConfirmations = 3,
        delayBetweenQueries = 1000,
        verbose = false
    } = options;

    const clients = getCascadeClients(platform.vendor);
    const storedData = serializeFeature(feature);

    const results = [];
    let confirmations = 0;
    let outcome = CascadeOutcome.INCONCLUSIVE;
    let proposedChanges = [];

    const log = verbose ? console.log : () => {};

    log(`\nBuilding cascade for ${platform.name} → ${feature.name}`);
    log(`Clients: [${clients.map(c => c.displayName).join(', ')}]`);
    log(`(Skipped: ${platform.vendor} provider model)`);

    for (const client of clients) {
        log(`\n[${results.length + 1}/${clients.length}] Querying ${client.displayName}...`);

        try {
            // Query the model
            const response = await client.verify(platform, feature);

            // Parse the response for changes
            const parsed = parseResponse(response.response, storedData);

            // Treat empty/boilerplate responses as errors — don't count them
            if (parsed.isEmpty) {
                log(`  Empty/boilerplate response (${response.response.length} chars). Treating as ERROR.`);
                results.push({
                    model: client.displayName,
                    modelName: client.name,
                    response: response.response,
                    type: ResultType.ERROR,
                    error: 'Empty or boilerplate response',
                    isEmpty: true
                });
                if (results.length < clients.length) {
                    await new Promise(resolve => setTimeout(resolve, delayBetweenQueries));
                }
                continue;
            }

            const result = {
                model: client.displayName,
                modelName: client.name,
                response: response.response,
                sources: response.sources,
                hasChange: parsed.hasChange,
                changes: parsed.changes,
                confidence: parsed.confidence,
                hasSearchEvidence: !!response.hasSearchEvidence,
                type: parsed.hasChange ? ResultType.POSITIVE : ResultType.NEGATIVE
            };

            results.push(result);

            log(`  Result: ${result.type.toUpperCase()}`);
            log(`  Search evidence: ${result.hasSearchEvidence ? 'YES' : 'NO ⚠'}`);
            log(`  Confidence: ${(parsed.confidence * 100).toFixed(0)}%`);
            if (parsed.hasChange) {
                log(`  Changes detected: ${parsed.changes.length}`);
            }

            // A "no change" vote only counts if the model actually searched
            // AND has reasonable confidence. Without search evidence, the model
            // is guessing from training data — that's not verification.
            const qualifiedNoChange = results.filter(r =>
                !r.hasChange &&
                r.type !== ResultType.ERROR &&
                r.hasSearchEvidence &&
                r.confidence >= 0.5
            ).length;

            // Count models that said "no change" without searching — these are failures
            const unsearchedNoChange = results.filter(r =>
                !r.hasChange &&
                r.type !== ResultType.ERROR &&
                !r.hasSearchEvidence
            );
            if (!parsed.hasChange && !response.hasSearchEvidence) {
                log(`  ⚠ ${client.displayName} said "no change" without search evidence — vote not counted`);
            }

            // Two QUALIFIED models agree on no change - stop cascade
            if (qualifiedNoChange >= 2 && !parsed.hasChange && response.hasSearchEvidence) {
                log(`\n✓ ${qualifiedNoChange} models confirm no change (with search evidence). Stopping cascade.`);
                outcome = CascadeOutcome.NO_CHANGE;
                break;
            }

            // Check for contradictions with previous non-error results
            const prevSubstantive = results.slice(0, -1).filter(r => r.type !== ResultType.ERROR && r.type !== ResultType.SKIPPED).pop();
            if (prevSubstantive) {
                if (detectContradiction(prevSubstantive, result)) {
                    log(`\n⚠ Contradiction detected between ${prevSubstantive.model} and ${result.model}`);
                    outcome = CascadeOutcome.CONTRADICTION;
                    break;
                }
            }

            // Count confirmations
            if (parsed.hasChange) {
                confirmations++;
                proposedChanges.push(...parsed.changes);

                if (confirmations >= requiredConfirmations) {
                    log(`\n✓ ${confirmations} models confirm change. Consensus reached.`);
                    outcome = CascadeOutcome.CONFIRMED;
                    break;
                }
            }

            // Delay between queries to avoid rate limits
            if (results.length < clients.length) {
                await new Promise(resolve => setTimeout(resolve, delayBetweenQueries));
            }

        } catch (error) {
            log(`  Error: ${error.message}`);
            results.push({
                model: client.displayName,
                modelName: client.name,
                type: ResultType.ERROR,
                error: error.message
            });
        }
    }

    // Minimum evidence threshold: require at least 2 substantive results
    // to create an issue. Otherwise downgrade INCONCLUSIVE to NO_CHANGE.
    const substantiveResults = results.filter(r =>
        r.type !== ResultType.ERROR && r.type !== ResultType.SKIPPED
    );
    if (substantiveResults.length < 2 && outcome === CascadeOutcome.INCONCLUSIVE) {
        log(`\n⚠ Only ${substantiveResults.length} substantive result(s). ` +
            `Downgrading INCONCLUSIVE to NO_CHANGE (insufficient evidence).`);
        outcome = CascadeOutcome.NO_CHANGE;
    }

    // Require 2/3 material agreement before surfacing an issue.
    // A single model flagging a change against N other "no change" votes is
    // noise, not signal — downgrade to NO_CHANGE so we don't spam issues.
    const positiveResults = substantiveResults.filter(r => r.hasChange && (r.changes || []).length > 0);
    const negativeResults = substantiveResults.filter(r => !r.hasChange);
    if (outcome === CascadeOutcome.INCONCLUSIVE &&
        positiveResults.length < 2 &&
        negativeResults.length >= positiveResults.length) {
        log(`\n⚠ Only ${positiveResults.length} model(s) flagged a material change against ` +
            `${negativeResults.length} no-change vote(s). Downgrading to NO_CHANGE.`);
        outcome = CascadeOutcome.NO_CHANGE;
    }

    // If we reached NO_CHANGE but no models had search evidence, escalate to
    // INCONCLUSIVE — we can't confirm "no change" without actually searching.
    if (outcome === CascadeOutcome.NO_CHANGE) {
        const searchedResults = substantiveResults.filter(r => r.hasSearchEvidence);
        if (searchedResults.length === 0 && substantiveResults.length > 0) {
            log(`\n⚠ NO models provided search evidence. ` +
                `Escalating NO_CHANGE to INCONCLUSIVE — verification was not web-grounded.`);
            outcome = CascadeOutcome.INCONCLUSIVE;
        }
    }

    // Check if all models errored
    if (results.every(r => r.type === ResultType.ERROR)) {
        outcome = CascadeOutcome.ERROR;
    }

    // Deduplicate proposed changes
    const uniqueChanges = [];
    const seen = new Set();
    for (const change of proposedChanges) {
        const key = `${change.type}:${change.detail}`;
        if (!seen.has(key)) {
            seen.add(key);
            uniqueChanges.push(change);
        }
    }

    return {
        platform: platform.name,
        feature: feature.name,
        vendor: platform.vendor,
        outcome,
        confirmations,
        requiredConfirmations,
        results,
        proposedChanges: uniqueChanges,
        storedData,
        timestamp: new Date().toISOString()
    };
}

/**
 * Run cascade verification for multiple features
 * @param {Array<{platform: Object, feature: Object}>} features - Features to verify
 * @param {Object} options - Configuration options
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Object>} { results: Array, providerHealth: Object }
 */
async function runBatchCascade(features, options = {}, onProgress = null) {
    const {
        maxFeatures = 100,
        delayBetweenFeatures = 2000
    } = options;

    const toVerify = features.slice(0, maxFeatures);
    const results = [];
    const providerHealth = {};

    for (let i = 0; i < toVerify.length; i++) {
        const { platform, feature } = toVerify[i];

        if (onProgress) {
            onProgress({
                current: i + 1,
                total: toVerify.length,
                platform: platform.name,
                feature: feature.name
            });
        }

        const result = await runCascade(platform, feature, options);
        results.push(result);

        // Track per-provider health from individual model results
        for (const modelResult of result.results) {
            const provider = modelResult.modelName || modelResult.model;
            if (!providerHealth[provider]) {
                providerHealth[provider] = { total: 0, errors: 0, skipped: 0, noSearchEvidence: 0, lastError: null };
            }
            providerHealth[provider].total++;
            if (modelResult.type === ResultType.ERROR) {
                providerHealth[provider].errors++;
                providerHealth[provider].lastError = modelResult.error;
            } else if (modelResult.type === ResultType.SKIPPED) {
                providerHealth[provider].skipped++;
            } else if (!modelResult.hasSearchEvidence) {
                providerHealth[provider].noSearchEvidence++;
            }
        }

        // Delay between features
        if (i < toVerify.length - 1) {
            await new Promise(resolve => setTimeout(resolve, delayBetweenFeatures));
        }
    }

    return { results, providerHealth };
}

/**
 * Summarize cascade results
 * @param {Array<Object>} results - Array of cascade results
 * @returns {Object} Summary statistics
 */
function summarizeResults(results) {
    const summary = {
        total: results.length,
        noChange: 0,
        confirmed: 0,
        contradiction: 0,
        inconclusive: 0,
        error: 0,
        byPlatform: {}
    };

    for (const result of results) {
        switch (result.outcome) {
            case CascadeOutcome.NO_CHANGE:
                summary.noChange++;
                break;
            case CascadeOutcome.CONFIRMED:
                summary.confirmed++;
                break;
            case CascadeOutcome.CONTRADICTION:
                summary.contradiction++;
                break;
            case CascadeOutcome.INCONCLUSIVE:
                summary.inconclusive++;
                break;
            case CascadeOutcome.ERROR:
                summary.error++;
                break;
        }

        if (!summary.byPlatform[result.platform]) {
            summary.byPlatform[result.platform] = {
                total: 0,
                noChange: 0,
                confirmed: 0,
                contradiction: 0,
                inconclusive: 0,
                error: 0
            };
        }

        summary.byPlatform[result.platform].total++;
        summary.byPlatform[result.platform][result.outcome]++;
    }

    return summary;
}

module.exports = {
    ResultType,
    CascadeOutcome,
    parseResponse,
    detectContradiction,
    runCascade,
    runBatchCascade,
    summarizeResults
};
