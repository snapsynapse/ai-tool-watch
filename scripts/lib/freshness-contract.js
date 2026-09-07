'use strict';

// Portable, local-only evidence and review queue contract.  It deliberately
// performs no fetching, editorial mutation, notification, or provider calls.
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');

const FRESHNESS_VERSION = 1;
const UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const SHA256 = /^[a-f0-9]{64}$/;
const FINDING_STATES = new Set(['pending', 'accepted', 'rejected', 'deferred']);
const SOURCE_TYPES = new Set(['official_primary', 'official_secondary', 'model_assessment']);
const RETRIEVAL_STATUSES = new Set(['succeeded', 'blocked', 'empty', 'error']);
const ASSESSMENT_KINDS = new Set(['primary_retrieval', 'machine_assessment']);
const COLLECTION_MODES = new Set(['automated', 'manual', 'deferred', 'out_of_scope']);
const COVERAGE_STATES = new Set(['unknown', 'covered', 'degraded']);
const MAX_RESUME_AGE_MS = 24 * 60 * 60 * 1000;

function clone(value) { return JSON.parse(JSON.stringify(value)); }
function asNow(value) {
    const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
    if (!Number.isFinite(date.getTime())) throw new TypeError('now must be a valid date or timestamp');
    return date;
}
function utc(value, field) {
    if (typeof value !== 'string' || !UTC.test(value) || new Date(value).toISOString() !== value) {
        throw new TypeError(`${field} must be a canonical UTC timestamp`);
    }
    return value;
}
function nonEmpty(value, field) {
    if (typeof value !== 'string' || !value.trim()) throw new TypeError(`${field} must be a non-empty string`);
    return value.trim();
}
function noExtra(value, allowed, field) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError(`${field} must be an object`);
    const unknown = Object.keys(value).filter(key => !allowed.has(key));
    if (unknown.length) throw new TypeError(`${field} has unsupported field(s): ${unknown.join(', ')}`);
}
function sortedStrings(value, field) {
    if (!Array.isArray(value) || value.length === 0 || value.some(item => typeof item !== 'string' || !item.trim())) {
        throw new TypeError(`${field} must be a non-empty string array`);
    }
    return [...new Set(value.map(item => item.trim()))].sort((a, b) => a.localeCompare(b));
}
function sha(value, field) {
    if (typeof value !== 'string' || !SHA256.test(value)) throw new TypeError(`${field} must be a lowercase SHA-256 hash`);
    return value;
}
function canonical(value) {
    if (Array.isArray(value)) return value.map(canonical);
    if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]));
    return value;
}
function stableId(prefix, value) {
    return `${prefix}_${crypto.createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex')}`;
}
function validUrl(value, field) {
    const string = nonEmpty(value, field);
    let parsed;
    try { parsed = new URL(string); } catch { throw new TypeError(`${field} must be an https URL`); }
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password) throw new TypeError(`${field} must be an https URL`);
    return parsed.toString();
}
function nullableUrl(value, field) { return value === null ? null : validUrl(value, field); }
function positiveInteger(value, field, maximum = 3660) {
    if (!Number.isSafeInteger(value) || value <= 0 || value > maximum) throw new TypeError(`${field} must be a positive integer`);
    return value;
}

function createSource(input = {}) {
    noExtra(input, new Set(['id', 'owner', 'authoritativeUrl', 'sourceType', 'subjectIds', 'cadenceDays', 'criticality', 'parserVersion', 'contentValidation', 'collectionMode', 'coverageState', 'lastSuccessfulObservationAt', 'dueAt']), 'source');
    const source = {
        id: nonEmpty(input.id, 'source.id'),
        owner: nonEmpty(input.owner, 'source.owner'),
        authoritativeUrl: validUrl(input.authoritativeUrl, 'source.authoritativeUrl'),
        sourceType: nonEmpty(input.sourceType, 'source.sourceType'),
        subjectIds: sortedStrings(input.subjectIds, 'source.subjectIds'),
        cadenceDays: positiveInteger(input.cadenceDays, 'source.cadenceDays'),
        criticality: input.criticality === 'critical' ? 'critical' : input.criticality === 'standard' ? 'standard' : null,
        parserVersion: nonEmpty(input.parserVersion, 'source.parserVersion'),
        contentValidation: input.contentValidation === 'required' ? 'required' : input.contentValidation === 'none' ? 'none' : null,
        collectionMode: input.collectionMode || 'automated',
        coverageState: input.coverageState || 'unknown'
    };
    if (!SOURCE_TYPES.has(source.sourceType) || source.criticality === null || source.contentValidation === null || !COLLECTION_MODES.has(source.collectionMode) || !COVERAGE_STATES.has(source.coverageState)) throw new TypeError('source has an invalid enum value');
    if (input.lastSuccessfulObservationAt !== undefined) source.lastSuccessfulObservationAt = utc(input.lastSuccessfulObservationAt, 'source.lastSuccessfulObservationAt');
    if (input.dueAt !== undefined) source.dueAt = utc(input.dueAt, 'source.dueAt');
    if (source.lastSuccessfulObservationAt && source.dueAt && source.dueAt < source.lastSuccessfulObservationAt) throw new TypeError('source.dueAt cannot precede successful observation');
    return source;
}

function normalizeContent(body, contentType = '') {
    if (typeof body !== 'string') throw new TypeError('body must be a string');
    const isHtml = /(?:^|\/)html(?:;|$)/i.test(contentType) || /<\s*html\b/i.test(body);
    let content = body.normalize('NFKC');
    if (isHtml) content = content.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ');
    // Retrieval/generated clocks are operational metadata, not a legal/content change.
    content = content.replace(/\b(?:last\s+(?:updated|checked)|retrieved|generated\s+at|timestamp)\s*[:=-]\s*\d{4}-\d{2}-\d{2}(?:[T ][^\s<]+)?/gi, ' ');
    return content.replace(/\s+/g, ' ').trim();
}
function inspectContent({ body, httpStatus, contentType = '' } = {}) {
    if (!Number.isInteger(httpStatus) || httpStatus < 100 || httpStatus > 599) throw new TypeError('httpStatus must be an HTTP status integer');
    if (typeof body !== 'string') throw new TypeError('body must be a string');
    const normalized = normalizeContent(body, contentType);
    const lower = normalized.toLowerCase();
    const rawContentHash = crypto.createHash('sha256').update(body).digest('hex');
    const normalizedContentHash = normalized ? crypto.createHash('sha256').update(normalized).digest('hex') : undefined;
    if (httpStatus < 200 || httpStatus >= 300) return { retrievalStatus: 'error', contentValidation: 'invalid', coverageQualified: false, failureReason: `http_${httpStatus}`, rawContentHash, normalizedContentHash, excerpt: normalized.slice(0, 280) || undefined };
    if (!normalized) return { retrievalStatus: 'empty', contentValidation: 'invalid', coverageQualified: false, failureReason: 'empty_content', rawContentHash, excerpt: undefined };
    const loginWall = /^(?:sign[ -]?in|log[ -]?in)(?:\s|$)/.test(lower) || /(?:please|must|required to)\s+(?:sign[ -]?in|log[ -]?in)\b/.test(lower) || /<input\b[^>]*\btype\s*=\s*["']?password\b/i.test(body);
    if (loginWall || /(?:captcha|recaptcha|hcaptcha|verify you are human|attention required|access denied|enable javascript and cookies)/.test(lower)) return { retrievalStatus: 'blocked', contentValidation: 'invalid', coverageQualified: false, failureReason: 'blocked_html', rawContentHash, normalizedContentHash, excerpt: normalized.slice(0, 280) };
    return { retrievalStatus: 'succeeded', contentValidation: 'valid', coverageQualified: true, rawContentHash, normalizedContentHash, excerpt: normalized.slice(0, 280) };
}
function observeContent(source, { body, httpStatus, contentType, ...input } = {}) {
    const inspected = inspectContent({ body, httpStatus, contentType });
    return createObservation(source, { ...input, ...inspected, assessmentKind: 'primary_retrieval' });
}

function createObservation(sourceInput, input = {}) {
    noExtra(input, new Set(['id', 'sourceId', 'retrievedAt', 'retrievalStatus', 'assessmentKind', 'parserVersion', 'coverageQualified', 'evidenceLinks', 'rawContentHash', 'normalizedContentHash', 'excerpt', 'locator', 'failureReason', 'retrievedUrl', 'contentValidation', 'officialSourceFetched']), 'observation');
    const source = createSource(sourceInput);
    const observation = {
        sourceId: source.id,
        retrievedAt: utc(input.retrievedAt, 'observation.retrievedAt'),
        retrievalStatus: nonEmpty(input.retrievalStatus, 'observation.retrievalStatus'),
        assessmentKind: nonEmpty(input.assessmentKind, 'observation.assessmentKind'),
        parserVersion: nonEmpty(input.parserVersion || source.parserVersion, 'observation.parserVersion'),
        coverageQualified: input.coverageQualified === true,
        evidenceLinks: input.evidenceLinks === undefined ? [] : (() => {
            if (!Array.isArray(input.evidenceLinks) || input.evidenceLinks.some(item => typeof item !== 'string' || !item.trim())) throw new TypeError('observation.evidenceLinks must be a string array');
            return [...new Set(input.evidenceLinks.map(item => item.trim()))].sort((a, b) => a.localeCompare(b));
        })()
    };
    if (!RETRIEVAL_STATUSES.has(observation.retrievalStatus) || !ASSESSMENT_KINDS.has(observation.assessmentKind)) throw new TypeError('observation has an invalid enum value');
    if (input.rawContentHash !== undefined) observation.rawContentHash = sha(input.rawContentHash, 'observation.rawContentHash');
    if (input.normalizedContentHash !== undefined) observation.normalizedContentHash = sha(input.normalizedContentHash, 'observation.normalizedContentHash');
    if (input.excerpt !== undefined) observation.excerpt = nonEmpty(input.excerpt, 'observation.excerpt');
    if (input.locator !== undefined) observation.locator = nonEmpty(input.locator, 'observation.locator');
    if (input.failureReason !== undefined) observation.failureReason = nonEmpty(input.failureReason, 'observation.failureReason');
    if (input.retrievedUrl !== undefined) observation.retrievedUrl = validUrl(input.retrievedUrl, 'observation.retrievedUrl');
    const primarySuccess = observation.assessmentKind === 'primary_retrieval' && observation.retrievalStatus === 'succeeded' &&
        input.contentValidation === 'valid' && Boolean(observation.rawContentHash) && Boolean(observation.normalizedContentHash);
    observation.contentValidation = primarySuccess ? 'valid' : input.contentValidation || 'invalid';
    if (observation.coverageQualified && !primarySuccess) {
        throw new TypeError('blocked, empty, errored, or invalid content cannot be coverage-qualified');
    }
    if (observation.assessmentKind === 'machine_assessment' && input.officialSourceFetched === true) {
        throw new TypeError('a model assessment cannot claim an official source fetch');
    }
    if (observation.assessmentKind === 'primary_retrieval' && source.sourceType === 'model_assessment') {
        throw new TypeError('a model-assessment source cannot record a primary retrieval');
    }
    observation.id = stableId('obs', { sourceId: observation.sourceId, assessmentKind: observation.assessmentKind,
        retrievalStatus: observation.retrievalStatus, rawContentHash: observation.rawContentHash || null,
        normalizedContentHash: observation.normalizedContentHash || null, locator: observation.locator || null });
    return observation;
}

function emptyState({ reviewPolicy = {} } = {}) {
    return { version: FRESHNESS_VERSION, revision: 0, reviewPolicy: { owner: reviewPolicy.owner || null, capacityMinutesPerWeek: reviewPolicy.capacityMinutesPerWeek ?? null, scope: reviewPolicy.scope || 'six-repo-portfolio' }, sources: {}, observations: {}, findings: {}, runs: {} };
}
function validateReviewPolicy(reviewPolicy) {
    noExtra(reviewPolicy, new Set(['owner', 'capacityMinutesPerWeek', 'scope']), 'state.reviewPolicy');
    if (!reviewPolicy || typeof reviewPolicy !== 'object' || Array.isArray(reviewPolicy) || (reviewPolicy.owner !== null && reviewPolicy.owner !== undefined && (typeof reviewPolicy.owner !== 'string' || !reviewPolicy.owner.trim())) || (reviewPolicy.capacityMinutesPerWeek !== null && reviewPolicy.capacityMinutesPerWeek !== undefined && (!Number.isSafeInteger(reviewPolicy.capacityMinutesPerWeek) || reviewPolicy.capacityMinutesPerWeek < 0)) || reviewPolicy.scope !== 'six-repo-portfolio') throw new TypeError('state.reviewPolicy must provide nullable owner, nullable capacityMinutesPerWeek, and six-repo-portfolio scope');
    return { owner: reviewPolicy.owner || null, capacityMinutesPerWeek: reviewPolicy.capacityMinutesPerWeek ?? null, scope: reviewPolicy.scope };
}
function validateCheckpointResult(result, field) {
    if (!result || typeof result !== 'object' || Array.isArray(result)) throw new TypeError(`${field} must be a non-null object`);
    const validJson = value => value === null || typeof value === 'string' || typeof value === 'boolean' ||
        (typeof value === 'number' && Number.isFinite(value)) || (Array.isArray(value) && value.every(validJson)) ||
        (value && typeof value === 'object' && !Array.isArray(value) && Object.values(value).every(validJson));
    if (!validJson(result)) throw new TypeError(`${field} must be JSON-serializable`);
    return clone(result);
}
function validateRunBudgetSnapshot(budget, field) {
    noExtra(budget, new Set(['maxRequests', 'spendCeiling', 'currency', 'reservedSpend', 'measuredSpend', 'unknownCostAttempts', 'requests', 'circuits', 'maxFailuresPerCircuit']), field);
    positiveInteger(budget.maxRequests, `${field}.maxRequests`, 1000000);
    if (!Number.isFinite(budget.spendCeiling) || budget.spendCeiling < 0 || !Number.isFinite(budget.reservedSpend) || budget.reservedSpend < 0 || !Number.isFinite(budget.measuredSpend) || budget.measuredSpend < 0 || !Number.isSafeInteger(budget.unknownCostAttempts) || budget.unknownCostAttempts < 0 || !Number.isSafeInteger(budget.requests) || budget.requests < 0 || budget.requests > budget.maxRequests || budget.reservedSpend > budget.spendCeiling) throw new TypeError(`${field} has invalid accounting values`);
    nonEmpty(budget.currency, `${field}.currency`);
    positiveInteger(budget.maxFailuresPerCircuit, `${field}.maxFailuresPerCircuit`, 1000);
    if (!budget.circuits || typeof budget.circuits !== 'object' || Array.isArray(budget.circuits)) throw new TypeError(`${field}.circuits must be an object`);
    for (const [key, circuit] of Object.entries(budget.circuits)) {
        nonEmpty(key, `${field}.circuits key`);
        noExtra(circuit, new Set(['failures', 'status']), `${field}.circuits.${key}`);
        if (!Number.isSafeInteger(circuit.failures) || circuit.failures < 0 || !['closed', 'open'].includes(circuit.status)) throw new TypeError(`${field}.circuits.${key} is invalid`);
    }
    return clone(budget);
}
function validateRun(run, id, { now = new Date() } = {}) {
    noExtra(run, new Set(['id', 'selectionKeys', 'inputFingerprint', 'status', 'startedAt', 'finishedAt', 'results', 'budget']), `run ${id}`);
    if (run.id !== id) throw new TypeError(`run key and id differ: ${id}`);
    const selectionKeys = sortedStrings(run.selectionKeys, `run ${id}.selectionKeys`);
    if (selectionKeys.length !== run.selectionKeys.length || selectionKeys.some((key, index) => key !== run.selectionKeys[index])) throw new TypeError(`run ${id}.selectionKeys must be unique and sorted`);
    sha(run.inputFingerprint, `run ${id}.inputFingerprint`);
    if (run.status !== 'incomplete' && run.status !== 'completed') throw new TypeError(`run ${id}.status must be incomplete or completed`);
    utc(run.startedAt, `run ${id}.startedAt`);
    if (Date.parse(run.startedAt) > asNow(now).getTime()) throw new TypeError(`run ${id}.startedAt cannot be in the future`);
    if (!run.results || typeof run.results !== 'object' || Array.isArray(run.results)) throw new TypeError(`run ${id}.results must be an object`);
    if (run.budget !== undefined) validateRunBudgetSnapshot(run.budget, `run ${id}.budget`);
    for (const [key, result] of Object.entries(run.results)) {
        if (!selectionKeys.includes(key)) throw new TypeError(`run ${id} has a result outside its selection: ${key}`);
        validateCheckpointResult(result, `run ${id}.results.${key}`);
    }
    if (run.status === 'completed') {
        utc(run.finishedAt, `run ${id}.finishedAt`);
        if (Date.parse(run.finishedAt) < Date.parse(run.startedAt) || Date.parse(run.finishedAt) > asNow(now).getTime()) throw new TypeError(`run ${id}.finishedAt is invalid`);
        if (Object.keys(run.results).length !== selectionKeys.length) throw new TypeError(`completed run ${id} is missing selected results`);
    } else if (run.finishedAt !== undefined) throw new TypeError(`incomplete run ${id} cannot have finishedAt`);
    return clone(run);
}
function validateState(state, { now = new Date() } = {}) {
    const current = asNow(now);
    noExtra(state, new Set(['version', 'revision', 'reviewPolicy', 'sources', 'observations', 'findings', 'runs']), 'state');
    if (!state || typeof state !== 'object' || Array.isArray(state) || state.version !== FRESHNESS_VERSION || !Number.isSafeInteger(state.revision) || state.revision < 0) throw new TypeError('invalid freshness state version or revision');
    validateReviewPolicy(state.reviewPolicy);
    for (const field of ['sources', 'observations', 'findings', 'runs']) if (!state[field] || typeof state[field] !== 'object' || Array.isArray(state[field])) throw new TypeError(`state.${field} must be an object`);
    for (const [id, source] of Object.entries(state.sources)) if (createSource(source).id !== id) throw new TypeError(`invalid source ${id}`);
    for (const [id, observation] of Object.entries(state.observations)) {
        const source = state.sources[observation.sourceId];
        if (!source || createObservation(source, observation).id !== id) throw new TypeError(`invalid observation ${id}`);
    }
    for (const [id, run] of Object.entries(state.runs)) validateRun(run, id, { now: current });
    for (const [id, finding] of Object.entries(state.findings)) {
        noExtra(finding, new Set(['id', 'subjectIds', 'claim', 'evidence', 'oldValue', 'newValue', 'affectedRecords', 'reviewOwner', 'reviewDueAt', 'status', 'firstSeenAt', 'reviewReason', 'reviewedBy', 'reviewedAt', 'issueReceipt']), `finding ${id}`);
        if (!finding || finding.id !== id || !FINDING_STATES.has(finding.status) || !Array.isArray(finding.subjectIds) || !finding.subjectIds.length || typeof finding.claim !== 'string' || !finding.claim || !finding.firstSeenAt || utc(finding.firstSeenAt, `finding ${id}.firstSeenAt`) !== finding.firstSeenAt || Date.parse(finding.firstSeenAt) > current.getTime()) throw new TypeError(`invalid finding ${id}`);
        const evidence = findingEvidence(finding);
        if (finding.id !== stableId('finding', { subjectIds: sortedStrings(finding.subjectIds, `finding ${id}.subjectIds`), claim: finding.claim, evidence })) throw new TypeError(`invalid stable finding ID ${id}`);
        if (finding.reviewDueAt !== undefined) utc(finding.reviewDueAt, `finding ${id}.reviewDueAt`);
        if (finding.status !== 'pending' && (!finding.reviewedAt || !finding.reviewedBy || !finding.reviewReason)) throw new TypeError(`reviewed finding ${id} lacks human decision fields`);
        if (finding.issueReceipt !== undefined) {
            const receipt = finding.issueReceipt;
            noExtra(receipt, new Set(['status', 'url', 'attemptedAt', 'linkedAt', 'createdAt', 'error']), `finding ${id}.issueReceipt`);
            if (!receipt || typeof receipt !== 'object' || !['pending', 'accepted', 'failed'].includes(receipt.status)) throw new TypeError(`invalid issue receipt for ${id}`);
            nullableUrl(receipt.url, `finding ${id}.issueReceipt.url`);
            if (receipt.attemptedAt !== undefined) utc(receipt.attemptedAt, `finding ${id}.issueReceipt.attemptedAt`);
            if (receipt.linkedAt !== undefined) utc(receipt.linkedAt, `finding ${id}.issueReceipt.linkedAt`);
            if (receipt.createdAt !== undefined) utc(receipt.createdAt, `finding ${id}.issueReceipt.createdAt`);
            if (receipt.error !== undefined) nonEmpty(receipt.error, `finding ${id}.issueReceipt.error`);
            if (receipt.status === 'accepted' && (!receipt.url || !receipt.linkedAt)) throw new TypeError(`accepted issue receipt for ${id} needs URL and linkedAt`);
            if (receipt.status === 'failed' && !receipt.error) throw new TypeError(`failed issue receipt for ${id} needs error`);
        }
    }
    return clone(state);
}
function matchingIncompleteRuns(state, selectionKeys, inputFingerprint, now, maxResumeAgeMs) {
    return Object.values(state.runs).filter(run => run.status === 'incomplete' && run.inputFingerprint === inputFingerprint &&
        run.selectionKeys.length === selectionKeys.length && run.selectionKeys.every((key, index) => key === selectionKeys[index]) &&
        Date.parse(run.startedAt) >= now.getTime() - maxResumeAgeMs)
        .sort((a, b) => a.startedAt.localeCompare(b.startedAt) || a.id.localeCompare(b.id));
}
function beginRun(state, input = {}, { now = new Date(), maxResumeAgeMs = MAX_RESUME_AGE_MS } = {}) {
    const current = asNow(now);
    validateState(state, { now: current });
    if (!Number.isSafeInteger(maxResumeAgeMs) || maxResumeAgeMs < 1 || maxResumeAgeMs > MAX_RESUME_AGE_MS) throw new TypeError('maxResumeAgeMs must be a positive integer up to 24 hours');
    noExtra(input, new Set(['id', 'selectionKeys', 'inputFingerprint', 'budget']), 'run');
    const id = nonEmpty(input.id, 'run.id');
    const selectionKeys = sortedStrings(input.selectionKeys, 'run.selectionKeys');
    const inputFingerprint = sha(input.inputFingerprint, 'run.inputFingerprint');
    const existing = state.runs[id];
    if (existing) {
        if (existing.inputFingerprint !== inputFingerprint || JSON.stringify(existing.selectionKeys) !== JSON.stringify(selectionKeys)) throw new TypeError(`run ID ${id} has a different selection or input fingerprint`);
        return { state, run: existing, created: false, resumed: existing.status === 'incomplete' };
    }
    const resumed = matchingIncompleteRuns(state, selectionKeys, inputFingerprint, current, maxResumeAgeMs)[0];
    if (resumed) return { state, run: resumed, created: false, resumed: true };
    const run = { id, selectionKeys, inputFingerprint, status: 'incomplete', startedAt: current.toISOString(), results: {} };
    if (input.budget !== undefined) run.budget = validateRunBudgetSnapshot(input.budget, 'run.budget');
    state.runs[id] = run;
    return { state, run, created: true, resumed: false };
}
function checkpointRunBudget(state, runId, budget, { now = new Date() } = {}) {
    const current = asNow(now);
    validateState(state, { now: current });
    const run = state.runs[nonEmpty(runId, 'runId')];
    if (!run) throw new TypeError(`unknown run ${runId}`);
    if (run.status !== 'incomplete') throw new TypeError(`cannot checkpoint budget for completed run ${runId}`);
    run.budget = validateRunBudgetSnapshot(budget, 'budget');
    return { state, run, budget: run.budget };
}
function checkpointResult(state, runId, key, result, { now = new Date() } = {}) {
    const current = asNow(now);
    validateState(state, { now: current });
    const run = state.runs[nonEmpty(runId, 'runId')];
    if (!run) throw new TypeError(`unknown run ${runId}`);
    if (run.status !== 'incomplete') throw new TypeError(`cannot checkpoint completed run ${runId}`);
    const selectedKey = nonEmpty(key, 'key');
    if (!run.selectionKeys.includes(selectedKey)) throw new TypeError(`result key is not selected by run ${runId}: ${selectedKey}`);
    const checkpoint = validateCheckpointResult(result, 'result');
    if (run.results[selectedKey] !== undefined) {
        if (JSON.stringify(canonical(run.results[selectedKey])) !== JSON.stringify(canonical(checkpoint))) throw new TypeError(`conflicting checkpoint for ${runId}:${selectedKey}`);
        return { state, run, result: run.results[selectedKey], created: false };
    }
    run.results[selectedKey] = checkpoint;
    return { state, run, result: checkpoint, created: true };
}
function finishRun(state, runId, { now = new Date() } = {}) {
    const current = asNow(now);
    validateState(state, { now: current });
    const run = state.runs[nonEmpty(runId, 'runId')];
    if (!run) throw new TypeError(`unknown run ${runId}`);
    if (run.status === 'completed') return { state, run, completed: false };
    const missing = run.selectionKeys.filter(key => run.results[key] === undefined);
    if (missing.length) throw new TypeError(`cannot finish run ${runId}; missing results for ${missing.join(', ')}`);
    run.status = 'completed';
    run.finishedAt = current.toISOString();
    return { state, run, completed: true };
}
function registerSource(state, input, { now = new Date() } = {}) {
    validateState(state, { now }); const next = state;
    const source = createSource(input);
    const existing = next.sources[source.id];
    const staticSource = value => { const { lastSuccessfulObservationAt, dueAt, coverageState, ...definition } = value; return definition; };
    if (existing && JSON.stringify(staticSource(existing)) !== JSON.stringify(staticSource(source))) throw new TypeError(`source ${source.id} already exists with different definition`);
    if (!existing) next.sources[source.id] = source;
    return { state: next, source, created: !existing };
}
function recordObservation(state, sourceId, input, { now = new Date() } = {}) {
    const current = asNow(now);
    validateState(state, { now: current }); const next = state;
    const source = next.sources[nonEmpty(sourceId, 'sourceId')];
    if (!source) throw new TypeError(`unknown source ${sourceId}`);
    const observation = createObservation(source, input);
    if (Date.parse(observation.retrievedAt) > current.getTime()) throw new TypeError('observation.retrievedAt cannot be in the future');
    const existing = next.observations[observation.id];
    if (!existing) next.observations[observation.id] = observation;
    // Only a qualified direct retrieval of a non-model source is evidence of a successful source observation.
    if (observation.coverageQualified && observation.assessmentKind === 'primary_retrieval' && source.sourceType !== 'model_assessment') {
        if (!source.lastSuccessfulObservationAt || Date.parse(observation.retrievedAt) >= Date.parse(source.lastSuccessfulObservationAt)) {
            source.lastSuccessfulObservationAt = observation.retrievedAt;
            source.dueAt = new Date(Date.parse(observation.retrievedAt) + source.cadenceDays * 86400000).toISOString();
            source.coverageState = 'covered';
        }
    } else if (observation.retrievalStatus !== 'succeeded' || observation.contentValidation !== 'valid') source.coverageState = 'degraded';
    return { state: next, observation: next.observations[observation.id], created: !existing };
}
function findingEvidence(input) {
    const evidence = input.evidence && typeof input.evidence === 'object' && !Array.isArray(input.evidence) ? input.evidence : null;
    if (!evidence) throw new TypeError('finding.evidence must be an object');
    noExtra(evidence, new Set(['sourceId', 'normalizedContentHash', 'locator']), 'finding.evidence');
    const normalizedContentHash = sha(evidence.normalizedContentHash, 'finding.evidence.normalizedContentHash');
    return canonical({ sourceId: nonEmpty(evidence.sourceId, 'finding.evidence.sourceId'), normalizedContentHash, locator: evidence.locator ? nonEmpty(evidence.locator, 'finding.evidence.locator') : null });
}
function upsertFinding(state, input = {}, { now = new Date() } = {}) {
    const current = asNow(now);
    validateState(state, { now: current }); const next = state;
    noExtra(input, new Set(['subjectIds', 'claim', 'oldValue', 'newValue', 'evidence', 'affectedRecords', 'reviewOwner', 'reviewDueAt', 'observedAt']), 'finding');
    const subjectIds = sortedStrings(input.subjectIds, 'finding.subjectIds');
    const claim = nonEmpty(input.claim, 'finding.claim');
    const evidence = findingEvidence(input);
    if (!next.sources[evidence.sourceId]) throw new TypeError(`finding refers to unknown source ${evidence.sourceId}`);
    const id = stableId('finding', { subjectIds, claim, evidence });
    const prior = next.findings[id];
    if (prior) return { state: next, finding: prior, created: false };
    const reviewDueAt = input.reviewDueAt === undefined ? undefined : utc(input.reviewDueAt, 'finding.reviewDueAt');
    const finding = { id, subjectIds, claim, evidence, oldValue: input.oldValue ?? null, newValue: input.newValue ?? null,
        affectedRecords: input.affectedRecords === undefined ? subjectIds : sortedStrings(input.affectedRecords, 'finding.affectedRecords'),
        reviewOwner: input.reviewOwner || next.reviewPolicy.owner || null, reviewDueAt, status: 'pending', firstSeenAt: current.toISOString() };
    next.findings[id] = finding;
    return { state: next, finding, created: true };
}
function applyReviewDecision(state, findingId, decision = {}, { now = new Date() } = {}) {
    const current = asNow(now);
    validateState(state, { now: current }); const next = state;
    const finding = next.findings[nonEmpty(findingId, 'findingId')];
    if (!finding) throw new TypeError(`unknown finding ${findingId}`);
    noExtra(decision, new Set(['actorType', 'status', 'actor', 'reason']), 'decision');
    if (decision.actorType !== 'human') throw new TypeError('only a human review decision may change a finding');
    if (!FINDING_STATES.has(decision.status) || decision.status === 'pending') throw new TypeError('decision.status must be accepted, rejected, or deferred');
    finding.status = decision.status;
    finding.reviewReason = nonEmpty(decision.reason, 'decision.reason');
    finding.reviewedBy = nonEmpty(decision.actor, 'decision.actor');
    finding.reviewedAt = current.toISOString();
    return { state: next, finding };
}
function attachIssueReceipt(state, findingId, receipt = {}, { now = new Date() } = {}) {
    const current = asNow(now);
    validateState(state, { now: current });
    const finding = state.findings[nonEmpty(findingId, 'findingId')];
    if (!finding) throw new TypeError(`unknown finding ${findingId}`);
    noExtra(receipt, new Set(['status', 'url', 'attemptedAt', 'linkedAt', 'createdAt', 'error']), 'issueReceipt');
    if (!['pending', 'accepted', 'failed'].includes(receipt.status)) throw new TypeError('issueReceipt.status must be pending, accepted, or failed');
    const nextReceipt = { status: receipt.status, url: nullableUrl(receipt.url ?? null, 'issueReceipt.url') };
    if (receipt.attemptedAt !== undefined) nextReceipt.attemptedAt = utc(receipt.attemptedAt, 'issueReceipt.attemptedAt');
    if (receipt.linkedAt !== undefined) nextReceipt.linkedAt = utc(receipt.linkedAt, 'issueReceipt.linkedAt');
    if (receipt.createdAt !== undefined) nextReceipt.createdAt = utc(receipt.createdAt, 'issueReceipt.createdAt');
    if (receipt.error !== undefined) nextReceipt.error = nonEmpty(receipt.error, 'issueReceipt.error');
    if (nextReceipt.status === 'accepted' && (!nextReceipt.url || !nextReceipt.linkedAt)) throw new TypeError('accepted issue receipt needs URL and linkedAt');
    if (nextReceipt.status === 'failed' && !nextReceipt.error) throw new TypeError('failed issue receipt needs error');
    finding.issueReceipt = nextReceipt;
    // A pre-existing issue can establish the original queue age during migration.
    if (nextReceipt.createdAt && Date.parse(nextReceipt.createdAt) < Date.parse(finding.firstSeenAt)) finding.firstSeenAt = nextReceipt.createdAt;
    return { state, finding };
}
function reviewQueueState(state, { now = new Date() } = {}) {
    const next = validateState(state, { now });
    const pending = Object.values(next.findings).filter(finding => finding.status === 'pending');
    const policy = next.reviewPolicy;
    return { status: pending.length && (!policy.owner || policy.capacityMinutesPerWeek === null || policy.capacityMinutesPerWeek < 1) ? 'degraded' : 'ready', pending: pending.length, owner: policy.owner, capacityMinutesPerWeek: policy.capacityMinutesPerWeek, scope: policy.scope };
}
function selectDue(state, { now = new Date(), limit = 50 } = {}) {
    const current = asNow(now);
    const next = validateState(state, { now: current });
    if (!Number.isSafeInteger(limit) || limit < 1 || limit > 10000) throw new TypeError('limit must be a positive integer up to 10000');
    return Object.values(next.sources).filter(source => !source.dueAt || Date.parse(source.dueAt) <= current.getTime()).sort((a, b) => {
        const aDue = a.dueAt || '1970-01-01T00:00:00.000Z'; const bDue = b.dueAt || '1970-01-01T00:00:00.000Z';
        return aDue.localeCompare(bDue) || a.id.localeCompare(b.id);
    }).slice(0, limit).map(clone);
}
function createRunBudget({ maxRequests = 200, spendCeiling, currency = 'USD', maxFailuresPerCircuit = 1 } = {}) {
    positiveInteger(maxRequests, 'maxRequests', 1000000);
    if (!Number.isFinite(spendCeiling) || spendCeiling < 0) throw new TypeError('spendCeiling must be a finite non-negative number');
    positiveInteger(maxFailuresPerCircuit, 'maxFailuresPerCircuit', 1000);
    return { maxRequests, spendCeiling, currency: nonEmpty(currency, 'currency'), reservedSpend: 0, measuredSpend: 0, unknownCostAttempts: 0, requests: 0, circuits: {}, maxFailuresPerCircuit };
}
function reserveSpend(budget, { upperBound, paid = true } = {}) {
    const next = clone(budget);
    if (!next || !Number.isFinite(next.spendCeiling)) throw new TypeError('invalid run budget');
    if (paid && (!Number.isFinite(upperBound) || upperBound < 0)) throw new TypeError('paid work requires a finite upperBound cost');
    const reserve = paid ? upperBound : 0;
    if (next.requests >= next.maxRequests) throw new TypeError('request budget exhausted');
    if (next.reservedSpend + reserve > next.spendCeiling) throw new TypeError('spend ceiling exhausted');
    next.requests++; next.reservedSpend += reserve;
    return next;
}
function recordAttempt(budget, { circuitKey, succeeded, measuredCost, costKnown = measuredCost !== undefined } = {}) {
    const next = clone(budget);
    const key = nonEmpty(circuitKey, 'circuitKey');
    if (!next || !Number.isFinite(next.spendCeiling) || !Number.isSafeInteger(next.requests)) throw new TypeError('invalid run budget');
    if (costKnown) {
        if (!Number.isFinite(measuredCost) || measuredCost < 0) throw new TypeError('measuredCost must be a finite non-negative number when known');
        next.measuredSpend += measuredCost;
    } else next.unknownCostAttempts++;
    const circuit = next.circuits[key] || { failures: 0, status: 'closed' };
    if (succeeded === true) { circuit.failures = 0; circuit.status = 'closed'; }
    else { circuit.failures++; if (circuit.failures >= next.maxFailuresPerCircuit) circuit.status = 'open'; }
    next.circuits[key] = circuit;
    return next;
}
async function loadState(filename, { now = new Date() } = {}) {
    if (typeof filename !== 'string' || !filename) throw new TypeError('filename must be a non-empty path');
    try { return validateState(JSON.parse(await fs.readFile(filename, 'utf8')), { now }); }
    catch (error) { if (error && error.code === 'ENOENT') return emptyState(); if (error instanceof SyntaxError) throw new TypeError(`invalid freshness state JSON: ${filename}`); throw error; }
}
async function saveState(filename, state, { now = new Date(), expectedRevision = state?.revision } = {}) {
    if (typeof filename !== 'string' || !filename) throw new TypeError('filename must be a non-empty path');
    const current = asNow(now); const snapshot = validateState(state, { now: current });
    if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0) throw new TypeError('expectedRevision must be a non-negative integer');
    const directory = path.dirname(filename); const lock = `${filename}.lock`;
    await fs.mkdir(directory, { recursive: true });
    let handle;
    try {
        try { handle = await fs.open(lock, 'wx', 0o600); } catch (error) { if (error.code === 'EEXIST') throw new Error(`freshness state lock already held: ${filename}`); throw error; }
        const stored = await loadState(filename, { now: current });
        if (stored.revision !== expectedRevision) throw new Error(`freshness state revision conflict: expected ${expectedRevision}, found ${stored.revision}`);
        snapshot.revision = stored.revision + 1;
        const temporary = path.join(directory, `.${path.basename(filename)}.${process.pid}.${crypto.randomUUID()}.tmp`);
        try { await fs.writeFile(temporary, `${JSON.stringify(snapshot, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 }); await fs.rename(temporary, filename); }
        catch (error) { await fs.rm(temporary, { force: true }).catch(() => {}); throw error; }
        state.revision = snapshot.revision;
        return snapshot;
    } finally { if (handle) { await handle.close().catch(() => {}); await fs.rm(lock, { force: true }).catch(() => {}); } }
}

module.exports = { FRESHNESS_VERSION, MAX_RESUME_AGE_MS, emptyState, stableId, createSource, createObservation, normalizeContent, inspectContent, observeContent, validateState, beginRun, checkpointResult, checkpointRunBudget, finishRun, registerSource, recordObservation, upsertFinding, applyReviewDecision, attachIssueReceipt, reviewQueueState, selectDue, createRunBudget, reserveSpend, recordAttempt, loadState, saveState };
