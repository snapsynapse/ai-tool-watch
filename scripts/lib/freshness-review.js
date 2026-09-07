'use strict';

// Adapter between the feature-verification collector and the portable
// freshness ledger. Model output is a lead for review, never a claimed direct
// retrieval of an official source.
const crypto = require('node:crypto');
const path = require('node:path');
const contract = require('./freshness-contract');

const STATE_PATH = path.join(__dirname, '..', '..', 'data', 'maintenance', 'state.json');
const PARSER_VERSION = 'aitw-verification-v1';

function reviewPolicy(env = process.env) {
    const value = env.FRESHNESS_REVIEW_MINUTES_PER_WEEK;
    if (value === undefined || value === null || value === '') return { owner: 'Sam Rogers', capacityMinutesPerWeek: null, scope: 'six-repo-portfolio' };
    const capacity = Number(value);
    if (!Number.isSafeInteger(capacity) || capacity < 0) throw new Error('Review capacity must be a non-negative whole number of minutes');
    return { owner: 'Sam Rogers', capacityMinutesPerWeek: capacity, scope: 'six-repo-portfolio' };
}
async function loadReviewState(filename, { env = process.env } = {}) {
    const state = await contract.loadState(filename);
    const policy = reviewPolicy(env);
    state.reviewPolicy.owner ||= policy.owner;
    if (policy.capacityMinutesPerWeek !== null) state.reviewPolicy.capacityMinutesPerWeek = policy.capacityMinutesPerWeek;
    return state;
}

function hash(value) { return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex'); }
function slug(value) { return String(value).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'unknown'; }
function subjectFor(result) { return `https://aitool.watch/#feature/${slug(result.platform)}-${slug(result.feature)}`; }
function signal(result) {
    return Boolean(result?.consistencyIssues?.length) || ['confirmed', 'contradiction', 'inconclusive', 'error'].includes(result?.outcome) ||
        (result?.outcome === 'no_change' && Array.isArray(result.results) && result.results.some(vote => vote?.type === 'positive'));
}
function normalizedResult(result) {
    return {
        outcome: result.outcome || 'malformed',
        proposedChanges: (result.proposedChanges || []).map(change => ({ type: change.type || null, detail: change.detail || null })).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))),
        consistencyIssues: (result.consistencyIssues || []).map(issue => ({ severity: issue.severity || null, field: issue.field || null, message: issue.message || null })).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))),
        votes: (result.results || []).map(vote => ({ model: vote.modelName || vote.model || vote.provider || 'unknown', type: vote.type || 'unknown',
            hasSearchEvidence: vote.hasSearchEvidence === true, sources: (vote.sources || []).map(source => typeof source === 'string' ? source : source?.url).filter(Boolean).sort(),
            response: typeof vote.response === 'string' ? vote.response.replace(/\s+/g, ' ').trim() : null
        })).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)))
    };
}
function sourceFor(result) {
    const subjectIds = [subjectFor(result)];
    return {
        id: contract.stableId('source', { owner: 'ai-tool-watch', subjectIds, parserVersion: PARSER_VERSION }), owner: 'AI Tool Watch',
        authoritativeUrl: 'https://aitool.watch/', sourceType: 'model_assessment', subjectIds, cadenceDays: 7,
        criticality: 'standard', parserVersion: PARSER_VERSION, contentValidation: 'none', coverageState: 'unknown'
    };
}
function issueTitle(result) {
    return `[${result.consistencyIssues?.length ? 'Data Inconsistency' : result.outcome === 'contradiction' ? 'Verification Conflict' : 'Unconfirmed Change'}] ${result.platform} - ${result.feature}`;
}
function findingForResult(state, result, { now = new Date() } = {}) {
    let next = state;
    const source = sourceFor(result);
    ({ state: next } = contract.registerSource(next, source, { now }));
    const normalized = normalizedResult(result);
    const normalizedContentHash = hash(normalized);
    const rawContentHash = hash({ platform: result.platform, feature: result.feature, normalized });
    let observation;
    ({ state: next, observation } = contract.recordObservation(next, source.id, {
        retrievedAt: new Date(now).toISOString(), retrievalStatus: 'succeeded', assessmentKind: 'machine_assessment', parserVersion: PARSER_VERSION,
        coverageQualified: false, rawContentHash, normalizedContentHash, contentValidation: 'invalid',
        evidenceLinks: normalized.votes.flatMap(vote => vote.sources)
    }, { now }));
    let finding;
    ({ state: next, finding } = contract.upsertFinding(next, {
        subjectIds: source.subjectIds, claim: `model-verification:${normalized.outcome}`, oldValue: null,
        newValue: { outcome: normalized.outcome, proposedChanges: normalized.proposedChanges, consistencyIssues: normalized.consistencyIssues },
        evidence: { sourceId: source.id, normalizedContentHash }, affectedRecords: source.subjectIds
    }, { now }));
    if (!finding.issueReceipt) finding.issueReceipt = { status: 'pending', url: null };
    return { state: next, finding, source, observation, normalized };
}
function ingestResults(state, results, { now = new Date() } = {}) {
    let next = state;
    const records = [];
    for (const result of results.filter(signal)) {
        const entry = findingForResult(next, result, { now });
        next = entry.state;
        records.push({ result, finding: entry.finding });
    }
    return { state: next, records };
}
function linkIssue(state, findingId, receipt, { now = new Date() } = {}) {
    return contract.attachIssueReceipt(state, findingId, receipt, { now });
}
function findingsForReport(state) { return Object.values(state.findings).sort((a, b) => a.firstSeenAt.localeCompare(b.firstSeenAt) || a.id.localeCompare(b.id)); }

module.exports = { STATE_PATH, signal, normalizedResult, sourceFor, issueTitle, findingForResult, ingestResults, linkIssue, findingsForReport,
    loadReviewState, reviewPolicy, saveReviewState: contract.saveState, emptyReviewState: contract.emptyState, reviewQueueState: contract.reviewQueueState };
