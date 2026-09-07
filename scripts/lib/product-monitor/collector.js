'use strict';
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const core = require('../freshness-contract');
const { visibleText } = require('./text');
const { fetchPage } = require('./fetch');
const ROOT = path.resolve(__dirname, '../../..');
const VERSION = 'product-monitor-v1';
const canonical = v => Array.isArray(v) ? v.map(canonical) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map(k => [k, canonical(v[k])])) : v;
const hash = v => crypto.createHash('sha256').update(JSON.stringify(canonical(v))).digest('hex');
const compact = s => String(s).replace(/\s+/g, ' ').trim();
function validateProducts(products) {
    if (!Array.isArray(products) || products.length !== 2 || new Set(products.map(p => p.config.id)).size !== 2) throw new Error('T08 requires exactly two distinct products');
    const sourceIds = new Set();
    for (const { config } of products) {
        if (!Array.isArray(config.sources) || config.sources.length !== 3 || new Set(config.sources.map(s => s.kind)).size !== 3) throw new Error('Each product needs release_notes, pricing and support sources');
        for (const source of config.sources) {
            const url = new URL(source.url);
            if (!source.id || sourceIds.has(source.id)) throw new Error('Source IDs must be unique'); sourceIds.add(source.id);
            if (!['release_notes','pricing','support'].includes(source.kind) || url.protocol !== 'https:' || url.hostname !== source.expectedHost || url.port || url.username || url.password) throw new Error('Invalid official source definition');
            if (!Array.isArray(source.claims) || !source.claims.length || new Set(source.claims.map(c => c.field)).size !== source.claims.length) throw new Error('Each source needs distinct scoped fields');
            for (const claim of source.claims) if (!claim.field || !claim.target || claim.target.file !== `data/platforms/${config.id}.md` || !claim.baselineExcerpt || claim.baseline === undefined) throw new Error('Every field needs an explicit baseline and owning record');
        }
    }
}
function baselineMatches(definition) {
    const content = fs.readFileSync(path.join(ROOT, definition.target.file), 'utf8');
    let scoped = content;
    if (definition.target.feature) {
        scoped = content.split(/^## /m).find(section => section.startsWith(definition.target.feature + '\n')) || '';
    }
    return compact(scoped).includes(compact(definition.baselineExcerpt));
}
function render(report) {
    const lines = ['# Product source pilot', `Run: ${report.id}`, `Status: ${report.status}`, `Fetch attempts: ${report.requests}/6; paid provider calls: 0.`,
        'Proposals require human acceptance. No Checked/Verified date, entitlement or public record is changed.', '', '| Product | Source family | Coverage | Claims |', '|---|---|---|---|'];
    for (const source of report.sources) lines.push(`| ${source.product} | ${source.kind} | ${source.status} | ${source.provenClaims}/${source.expectedClaims} |`);
    lines.push('', '## Proposals');
    for (const item of report.proposals) lines.push(`- ${item.product}: ${item.field}: ${JSON.stringify(item.oldValue)} → ${JSON.stringify(item.newValue)}. [Official source](${item.sourceUrl}). Review target: ${item.target.file}, ${item.target.feature || item.target.section || 'product'}.`);
    lines.push('', '## Coverage exceptions');
    for (const source of report.sources) if (source.reason) lines.push(`- ${source.product}/${source.kind}: ${source.reason}`);
    return lines.join('\n') + '\n';
}
async function collect({ products, state = core.emptyState({ reviewPolicy: { owner:'Sam Rogers', capacityMinutesPerWeek:null, scope:'six-repo-portfolio' } }), now = new Date().toISOString(), fetcher = fetchPage, retainRaw = async () => {}, persist = async () => {}, checkBaseline = baselineMatches, maxRequests = 6 } = {}) {
    validateProducts(products);
    if (!Number.isSafeInteger(maxRequests) || maxRequests < 1 || maxRequests > 6) throw new Error('Source fetch budget must be 1..6');
    core.validateState(state, { now });
    const report = { id:`product-monitor-${crypto.randomUUID()}`, startedAt:now, status:'running', requests:0, maxRequests, paidProviderCalls:0, sources:[], proposals:[], reviewOwner:state.reviewPolicy.owner, scope:'Two products, three fixed source families each; explicit configured claims only.', configuration:products.map(p => p.config) };
    for (const product of products) for (const source of product.config.sources) {
        const id = `product-monitor:${source.id}`;
        core.registerSource(state, { id, owner:'ai-tool-watch', authoritativeUrl:source.url, sourceType:'official_primary', subjectIds:[product.config.id], cadenceDays:7, criticality:'standard', parserVersion:VERSION, contentValidation:'required', collectionMode:'automated' }, { now });
        const summary = { product:product.config.id, id, kind:source.kind, url:source.url, status:'running', expectedClaims:source.claims.length, provenClaims:0 };
        report.sources.push(summary);
        if (report.requests >= maxRequests) { summary.status='deferred'; summary.reason='Run fetch budget exhausted'; continue; }
        report.requests++; await persist(state, report);
        let response;
        try { response = await fetcher(source.url); }
        catch (error) {
            const receipt = { ...(error.receipt || { retrievedUrl:source.url, retrievedAt:now }), status:'failed', failureReason:error.message };
            await retainRaw(source, receipt);
            const { observation } = core.recordObservation(state, id, { retrievedAt:now, retrievalStatus:'error', assessmentKind:'primary_retrieval', coverageQualified:false, contentValidation:'invalid', failureReason:error.message, locator:source.url, evidenceLinks:[source.url] }, { now });
            Object.assign(summary, { status:'unavailable', reason:error.message, observationId:observation.id });
            await persist(state, report); continue;
        }
        await retainRaw(source, response);
        const inspected = core.inspectContent(response);
        if (response.rawContentHash) inspected.rawContentHash = response.rawContentHash;
        let parsed = { supported:false, claims:[], reason:inspected.failureReason };
        if (inspected.coverageQualified) try {
            const terminal = new URL(response.retrievedUrl || source.url); terminal.hostname = terminal.hostname.replace(/^www\./, '');
            if (terminal.hostname !== source.expectedHost || terminal.protocol !== 'https:' || terminal.port || terminal.username || terminal.password) throw new Error('Unexpected terminal official-source URL');
            parsed = product.parse(response.body, { source, url:terminal.href, now });
        } catch (error) { parsed = { supported:false, claims:[], reason:`Parser failure: ${error.message}` }; }
        const proven = [], missing = [], seen = new Set();
        const text = compact(visibleText(response.body));
        const counts = new Map();
        for (const c of Array.isArray(parsed.claims) ? parsed.claims : []) counts.set(c.field, (counts.get(c.field) || 0) + 1);
        for (const claim of parsed.supported && Array.isArray(parsed.claims) ? parsed.claims : []) {
            const definition = source.claims.find(c => c.field === claim.field);
            if (!definition || counts.get(claim.field) !== 1 || seen.has(claim.field) || claim.value === undefined || !claim.quote || !text.includes(compact(claim.quote))) { missing.push('Unsupported, duplicate or uncited claim'); continue; }
            seen.add(claim.field);
            if (!checkBaseline(definition)) { missing.push(`Baseline drift: ${claim.field}`); continue; }
            proven.push({ definition, claim });
        }
        const covered = inspected.coverageQualified && parsed.supported === true && !missing.length && proven.length === source.claims.length;
        const { observation } = core.recordObservation(state, id, { ...inspected, retrievedAt:now, retrievedUrl:response.retrievedUrl || source.url, assessmentKind:'primary_retrieval', parserVersion:VERSION,
            coverageQualified:covered, contentValidation:covered ? 'valid' : 'invalid', normalizedContentHash:hash(proven.map(p => ({ field:p.claim.field, value:p.claim.value }))),
            locator:source.url, evidenceLinks:[source.url], ...(covered ? {} : { failureReason:missing.join('; ') || parsed.reason || 'Configured claims are missing or ambiguous' }) }, { now });
        Object.assign(summary, { status:covered ? 'covered' : proven.length ? 'partial' : 'unavailable', provenClaims:proven.length, assessedClaims:proven.map(({ definition, claim }) => ({ field:claim.field, value:claim.value, baseline:definition.baseline, target:definition.target, quote:claim.quote, locator:claim.locator || null })), unprovenFields:source.claims.filter(d => !proven.some(p => p.claim.field === d.field)).map(d => d.field), observationId:observation.id, rawContentHash:observation.rawContentHash,
            ...(covered ? {} : { reason:missing.join('; ') || parsed.reason || 'Configured claims are missing or ambiguous' }) });
        for (const { definition, claim } of proven) if (hash(claim.value) !== hash(definition.baseline)) {
            const proposal = { product:product.config.id, field:claim.field, target:definition.target, oldValue:definition.baseline, newValue:claim.value, sourceUrl:source.url, quote:claim.quote, locator:claim.locator || null };
            const { finding } = core.upsertFinding(state, { subjectIds:[`${product.config.id}:${claim.field}`], claim:`Review official product field ${claim.field}`, oldValue:definition.baseline, newValue:{ value:claim.value, target:definition.target, quote:claim.quote, sourceUrl:source.url },
                evidence:{ sourceId:id, normalizedContentHash:hash({ field:claim.field, value:claim.value }), locator:source.url }, affectedRecords:[definition.target.file], reviewOwner:state.reviewPolicy.owner }, { now });
            report.proposals.push({ ...proposal, findingId:finding.id });
        }
        await persist(state, report);
    }
    report.reviewQueue = core.reviewQueueState(state, { now });
    report.status = report.sources.every(s => s.provenClaims === 0) ? 'failed' : report.sources.some(s => s.status !== 'covered') ? 'degraded' : report.proposals.length || report.reviewQueue.pending ? 'review_required' : 'healthy';
    await persist(state, report); return { state, report };
}
module.exports = { collect, validateProducts, baselineMatches, render, hash };
