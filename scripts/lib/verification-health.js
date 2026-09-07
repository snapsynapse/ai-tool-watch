'use strict';

// Evidence coverage is a machine-readable run property. It never advances a
// verification date and it never substitutes for review of a change candidate.
const OUTCOMES = new Set(['no_change', 'confirmed', 'contradiction', 'inconclusive', 'error']);
const VOTE_TYPES = new Set(['negative', 'positive', 'error', 'skipped']);

function nonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
}

function providerName(vote) {
    return nonEmptyString(vote?.modelName) ? vote.modelName :
        nonEmptyString(vote?.model) ? vote.model :
            nonEmptyString(vote?.provider) ? vote.provider : 'unknown';
}

function hasHttpsSource(vote) {
    return Array.isArray(vote?.sources) && vote.sources.some(source => {
        const url = typeof source === 'string' ? source : source?.url;
        if (!nonEmptyString(url)) return false;
        try {
            return new URL(url).protocol === 'https:';
        } catch {
            return false;
        }
    });
}

function isQualified(vote, type) {
    return vote?.type === type &&
        nonEmptyString(vote.response) &&
        Number.isFinite(vote.confidence) &&
        vote.confidence >= 0.5 &&
        vote.hasSearchEvidence === true &&
        hasHttpsSource(vote);
}

function qualifiedProviders(votes, type) {
    return new Set(votes
        .filter(vote => isQualified(vote, type))
        .map(providerName)
        .filter(name => name !== 'unknown'));
}

function isAdequatelyChecked(result) {
    if (!result || typeof result !== 'object' || !Array.isArray(result.results)) return false;
    const votes = result.results;
    const qualifiedNegative = qualifiedProviders(votes, 'negative');
    const qualifiedPositive = qualifiedProviders(votes, 'positive');
    const hasPositive = votes.some(vote => vote?.type === 'positive');
    const hasNegative = votes.some(vote => vote?.type === 'negative');
    const requiredConfirmations = Math.max(2, Number.isInteger(result.requiredConfirmations) &&
        result.requiredConfirmations > 0 ? result.requiredConfirmations : 3);

    if (result.outcome === 'no_change') return qualifiedNegative.size >= 2 && !hasPositive;
    if (result.outcome === 'confirmed') return qualifiedPositive.size >= requiredConfirmations && !hasNegative;
    if (result.outcome === 'contradiction') {
        const opposingProviders = new Set([...qualifiedPositive, ...qualifiedNegative]);
        return qualifiedPositive.size >= 1 && qualifiedNegative.size >= 1 && opposingProviders.size >= 2;
    }
    return false;
}

function providerSummary(results) {
    const providers = Object.create(null);
    let attempts = 0;
    let failures = 0;
    for (const result of results) {
        const votes = Array.isArray(result?.results) ? result.results : [];
        for (const vote of votes) {
            if (!vote || typeof vote !== 'object') continue;
            const name = providerName(vote);
            const entry = providers[name] ||= { attempts: 0, failures: 0, skipped: 0 };
            if (vote.type === 'skipped') {
                entry.skipped++;
                continue;
            }
            entry.attempts++;
            attempts++;
            if (vote.type === 'error') {
                entry.failures++;
                failures++;
            }
        }
    }
    return { attempts, failures, providers };
}

function featureReference(result, index) {
    return {
        index,
        platform: nonEmptyString(result?.platform) ? result.platform : null,
        feature: nonEmptyString(result?.feature) ? result.feature : null,
        outcome: result?.outcome || 'malformed'
    };
}

function buildAlert(status, input, counts, reasons) {
    if (status !== 'failed' && status !== 'degraded') return null;
    const failed = status === 'failed';
    return {
        type: failed ? 'verification_run_failed' : 'verification_run_degraded',
        severity: failed ? 'critical' : 'warning',
        repository: 'ai-tool-watch',
        impact: failed ? 'Verification run has no adequate coverage or an invalid run contract.' :
            'Verification run completed with incomplete coverage or provider failures.',
        counts,
        action: failed ? 'Inspect the run evidence and run contract before retrying affected features.' :
            'Review incomplete features and provider failures before treating coverage as current.',
        evidence: {
            runId: input.runId ?? null,
            startedAt: input.startedAt ?? null,
            finishedAt: input.finishedAt ?? null,
            fatalError: input.fatalError ?? null,
            reasons
        },
        notification: { status: 'not_configured' }
    };
}

function buildRunHealth({
    runId,
    startedAt,
    finishedAt,
    inventoryCount,
    selectedCount,
    dueCount = selectedCount,
    results,
    selectionValid = true,
    fatalError = null
} = {}) {
    const validInventory = Number.isInteger(inventoryCount) && inventoryCount > 0;
    const validSelection = selectionValid === true && Number.isInteger(selectedCount) && selectedCount >= 0 &&
        Number.isInteger(dueCount) && dueCount >= selectedCount && dueCount <= inventoryCount &&
        selectedCount <= inventoryCount;
    const resultList = Array.isArray(results) ? results : [];
    const malformedResults = resultList.filter(result => !result || typeof result !== 'object' ||
        !Array.isArray(result.results) || !OUTCOMES.has(result.outcome) ||
        result.results.some(vote => !vote || !VOTE_TYPES.has(vote.type))).length;
    const adequate = resultList.filter(isAdequatelyChecked).length;
    const recordErrors = resultList.filter(result => result?.outcome === 'error').length;
    const providers = providerSummary(resultList);
    const missingResults = Math.max(0, (selectedCount || 0) - resultList.length);
    const incompleteResults = validSelection && resultList.length < selectedCount;
    const excessResults = validSelection && resultList.length > selectedCount;
    const invalid = !validInventory || !validSelection || !Array.isArray(results);
    const reasons = [];
    if (!validInventory) reasons.push('invalid_inventory');
    if (!validSelection) reasons.push('invalid_selection');
    if (!Array.isArray(results)) reasons.push('invalid_results');
    if (fatalError) reasons.push('fatal_error');
    if (incompleteResults) reasons.push('incomplete_results');
    if (excessResults) reasons.push('excess_results');
    if (malformedResults) reasons.push('malformed_results');

    const reviewCandidates = resultList
        .map(featureReference)
        .filter(reference => ['confirmed', 'contradiction', 'inconclusive'].includes(reference.outcome));
    let status;
    if (invalid || fatalError || malformedResults > 0 || excessResults ||
        (selectedCount > 0 && (resultList.length === 0 || adequate === 0))) {
        status = 'failed';
    } else if (validInventory && selectedCount === 0) {
        status = 'idle';
    } else if (incompleteResults || adequate < selectedCount || providers.failures > 0) {
        status = 'degraded';
    } else if (reviewCandidates.length > 0) {
        status = 'review_required';
    } else {
        status = 'healthy';
    }

    const counts = {
        inventory: Number.isInteger(inventoryCount) ? inventoryCount : null,
        due: Number.isInteger(dueCount) ? dueCount : null,
        selected: Number.isInteger(selectedCount) ? selectedCount : null,
        attempted: resultList.length,
        adequate,
        inadequate: Math.max(0, (selectedCount || 0) - adequate),
        missingResults,
        malformedResults,
        recordErrors,
        providerAttempts: providers.attempts,
        providerFailures: providers.failures
    };
    const alert = buildAlert(status, { runId, startedAt, finishedAt, fatalError }, counts, reasons);
    return {
        status,
        runId: runId ?? null,
        startedAt: startedAt ?? null,
        finishedAt: finishedAt ?? null,
        counts,
        providers: providers.providers,
        selection: { valid: validSelection, backlog: Math.max(0, (dueCount || 0) - (selectedCount || 0)) },
        reviewRequired: { count: reviewCandidates.length, candidates: reviewCandidates },
        notification: { status: 'not_configured' },
        reasons,
        alert,
        criticalAlert: status === 'failed' ? alert : null
    };
}

function healthExitCode(health) {
    if (health?.status === 'healthy' || health?.status === 'idle') return 0;
    return health?.status === 'review_required' ? 1 : 2;
}

module.exports = { buildRunHealth, healthExitCode, isAdequatelyChecked };
