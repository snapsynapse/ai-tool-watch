#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const parser = require('./lib/parser');
const cascade = require('./lib/cascade');
const reporter = require('./lib/reporter');
const updater = require('./lib/file-updater');
const { checkConsistency } = require('./lib/consistency');
const { buildRunHealth, healthExitCode, isAdequatelyChecked } = require('./lib/verification-health');

function validateOptions(options) {
    for (const key of ['maxFeatures', 'staleThreshold']) {
        if (!Number.isSafeInteger(options[key]) || options[key] <= 0) throw new Error(`${key} must be a positive integer`);
    }
    for (const key of ['platform', 'feature']) {
        if (options[key] !== null && (typeof options[key] !== 'string' || !options[key].trim() || options[key].length > 200 || /[\x00-\x1f]/.test(options[key]))) throw new Error(`Invalid ${key}`);
    }
    if (options.feature && !options.platform) throw new Error('--feature requires --platform');
}

function parseArgs(args = process.argv.slice(2)) {
    const options = { platform: null, feature: null, staleOnly: false, staleThreshold: 7,
        dryRun: false, verbose: false, maxFeatures: 100, help: false };
    function number(value, name) {
        if (!/^[0-9]+$/.test(value || '')) throw new Error(`${name} must be a positive decimal integer`);
        return Number(value);
    }
    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--platform': case '-p': options.platform = args[++i]; break;
            case '--feature': case '-f': options.feature = args[++i]; break;
            case '--stale-only': case '-s': options.staleOnly = true; break;
            case '--stale-threshold': options.staleThreshold = number(args[++i], '--stale-threshold'); break;
            case '--dry-run': case '-d': options.dryRun = true; break;
            case '--verbose': case '-v': options.verbose = true; break;
            case '--max': case '-m': options.maxFeatures = number(args[++i], '--max'); break;
            case '--help': case '-h': options.help = true; break;
            default: throw new Error(`Unknown argument: ${args[i]}`);
        }
    }
    validateOptions(options);
    return options;
}

function checkApiKeys() {
    // The cascade applies the same-vendor exclusion per feature. Missing clients
    // remain explicit error votes instead of being mistaken for negative evidence.
    const keys = ['GEMINI_API_KEY', 'PERPLEXITY_API_KEY', 'XAI_API_KEY', 'ANTHROPIC_API_KEY'];
    if (keys.filter(key => process.env[key]?.trim()).length < 2) throw new Error('At least two configured provider keys are required');
}

function key(item) { return `${item.platform._filepath}::${item.feature.name}`; }
function resultKey(result) { return `${result?.platform}\u0000${result?.feature}`; }
function itemResultKey(item) { return `${item.platform.name}\u0000${item.feature.name}`; }
function checkedTime(item) {
    const value = item.feature.checked;
    const time = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? Date.parse(`${value}T00:00:00Z`) : NaN;
    return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value && time <= Date.now() ? time : 0;
}

function votes(result) { return Array.isArray(result?.results) ? result.results : []; }

function pendingFinding(result, index) {
    return { index, platform: result.platform, feature: result.feature, status: 'pending_review',
        outcome: result.outcome, proposedChanges: result.proposedChanges || [],
        consistencyIssues: result.consistencyIssues || [], evidence: result.results || [] };
}

// Tests inject every transport and mutation. No provider call occurs at import.
async function runVerification(options, dependencies = {}) {
    const deps = { ...parser, ...cascade, ...reporter, ...updater, checkConsistency, checkApiKeys,
        reportsDir: reporter.REPORTS_DIR, ...dependencies };
    const runId = process.env.GITHUB_RUN_ID || `local-${crypto.randomUUID()}`;
    const startedAt = new Date().toISOString();
    let inventoryCount = 0, dueCount = 0;
    let selected = [], results = [], providerHealth = {};
    let rawBatchResult = null, selectionValid = false;
    let fatalError = options.inputError || null;
    const reviewIssues = [];

    function persist(finished = false) {
        const health = buildRunHealth({ runId, startedAt, finishedAt: finished ? new Date().toISOString() : null,
            inventoryCount, dueCount, selectedCount: selected.length, results, selectionValid, fatalError });
        health.assessedStatus = health.status;
        health.scope = { platform: options.platform, feature: options.feature, staleOnly: options.staleOnly, dryRun: options.dryRun };
        health.reviewIssues = reviewIssues;
        health.reviewIssueDelivery = reviewIssues.some(issue => issue.status === 'failed') ? 'failed'
            : reviewIssues.some(issue => issue.status === 'pending') ? 'pending'
            : reviewIssues.length ? 'accepted' : 'not_attempted';
        health.providerHealth = providerHealth;
        const findings = results.filter(result => result && (result.outcome !== 'no_change' || votes(result).some(vote => vote?.type === 'positive')))
            .map((result) => pendingFinding(result, results.indexOf(result)));
        health.pendingReviewCount = findings.length;
        if (!finished) { health.status = 'running'; health.alert = null; }
        const summary = `Status: ${health.status}\nRun: ${runId}\n` +
            `Coverage: ${health.counts.adequate}/${selected.length} selected features adequately observed\n` +
            `Due: ${dueCount}; unselected backlog: ${Math.max(0, dueCount - selected.length)}\n` +
            `Pending review: ${findings.length}\nReview issue delivery: ${health.reviewIssueDelivery}\n` +
            `Email notification: not_configured; human receipt: unconfirmed\n` + (fatalError ? `Failure: ${fatalError}\n` : '');
        fs.mkdirSync(deps.reportsDir, { recursive: true });
        function write(name, value) {
            const filename = path.join(deps.reportsDir, name);
            fs.writeFileSync(`${filename}.tmp`, value + '\n');
            fs.renameSync(`${filename}.tmp`, filename);
        }
        // Machine evidence precedes report formatting and all editorial writes.
        for (const [name, value] of Object.entries({ 'health.json': health, 'results.json': results,
            'pending-findings.json': findings, 'invalid-batch-result.json': rawBatchResult, 'alert.json': health.alert ?? null })) write(name, JSON.stringify(value, null, 2));
        write('summary.txt', summary);
        const valid = results.filter(result => result && Array.isArray(result.results) && Array.isArray(result.proposedChanges));
        write('report.md', '# Feature verification health\n\n' + summary + '\n' + deps.generateMarkdownReport(valid, deps.summarizeResults(valid)));
        return health;
    }

    persist();
    try {
        if (fatalError) throw new Error(fatalError);
        validateOptions(options);
        const inventory = deps.getAllFeatures();
        inventoryCount = inventory.length;
        if (!inventoryCount) throw new Error('Invalid empty inventory');
        const known = new Set(inventory.map(key));
        if (known.size !== inventory.length || new Set(inventory.map(itemResultKey)).size !== inventory.length) throw new Error('Invalid duplicate inventory');
        const inScope = inventory.filter(item => (!options.platform || item.platform.name.toLowerCase() === options.platform.toLowerCase() || path.basename(item.platform._filepath, '.md') === options.platform.toLowerCase())
            && (!options.feature || item.feature.name.toLowerCase() === options.feature.toLowerCase()));
        if (!inScope.length) throw new Error('No matching platform or feature');
        const scopeKeys = new Set(inScope.map(key));
        let due = options.staleOnly ? deps.findStaleFeatures(options.staleThreshold) : inScope;
        if (due.some(item => !known.has(key(item)))) throw new Error('Invalid due item');
        due = due.filter(item => scopeKeys.has(key(item)));
        if (new Set(due.map(key)).size !== due.length) throw new Error('Duplicate due item');
        dueCount = due.length;
        // Keep the existing oldest-Checked-first policy, including scoped runs.
        selected = [...due].sort((a, b) => checkedTime(a) - checkedTime(b) || key(a).localeCompare(key(b))).slice(0, options.maxFeatures);
        selectionValid = true;
        persist();
        const runnable = [];
        for (const item of selected) {
            const consistency = deps.checkConsistency(item.feature);
            if (consistency.hasErrors) results.push({ platform: item.platform.name, feature: item.feature.name,
                outcome: 'inconclusive', results: [], proposedChanges: [], consistencyIssues: consistency.issues });
            else runnable.push(item);
        }
        const order = new Map(selected.map((item, index) => [itemResultKey(item), index]));
        const sortResults = () => results.sort((a, b) => order.get(resultKey(a)) - order.get(resultKey(b)));
        sortResults(); persist();
        if (runnable.length) {
            deps.checkApiKeys();
            const completedKeys = new Set();
            const batch = await deps.runBatchCascade(runnable, { maxFeatures: options.maxFeatures,
                verbose: options.verbose, delayBetweenFeatures: 2000, delayBetweenQueries: 1000, requiredConfirmations: 3,
                onResult: result => {
                    results.push(result);
                    const resultId = resultKey(result);
                    if (!runnable.some(item => itemResultKey(item) === resultId) || completedKeys.has(resultId)) throw new Error('Invalid callback result identity');
                    completedKeys.add(resultId); sortResults(); persist();
                }
            }, progress => { if (options.verbose) console.log(`[${progress.current}/${progress.total}] ${progress.platform}: ${progress.feature}`); });
            rawBatchResult = batch;
            if (!batch || !Array.isArray(batch.results)) throw new Error('Invalid batch result');
            if (batch.results.some((result, index) => !runnable[index] || resultKey(result) !== itemResultKey(runnable[index]))) throw new Error('Invalid batch result identity or ordering');
            // A returned batch cannot erase, replace or contradict a receipt
            // already persisted by the completed-result callback.
            for (const result of batch.results) {
                const received = results.find(prior => resultKey(prior) === resultKey(result));
                if (received && JSON.stringify(received) !== JSON.stringify(result)) throw new Error('Batch result conflicts with retained callback evidence');
                if (!received) results.push(result);
            }
            sortResults();
            if (batch.results.length !== runnable.length) throw new Error('Incomplete batch result');
            providerHealth = batch.providerHealth || {};
            rawBatchResult = null;
            sortResults();
        }
        const health = persist();
        if (!options.dryRun) {
            for (const result of results) {
                const hasSignal = result.consistencyIssues || result.outcome === 'confirmed' || result.outcome === 'contradiction' || votes(result).some(vote => vote?.type === 'positive');
                if (!hasSignal) continue;
                const receipt = { platform: result.platform, feature: result.feature, status: 'pending', url: null };
                reviewIssues.push(receipt); persist();
                try {
                    const title = `[${result.consistencyIssues ? 'Data Inconsistency' : result.outcome === 'contradiction' ? 'Verification Conflict' : 'Unconfirmed Change'}] ${result.platform} - ${result.feature}`;
                    const body = 'Pending human source review. Model agreement does not accept a change or verify current data.\n\n' +
                        (result.consistencyIssues ? deps.generateConsistencyIssue({ platform: result.platform, feature: result.feature, issues: result.consistencyIssues })
                            : result.outcome === 'contradiction' ? deps.generateContradictionIssue(result) : deps.generateInconclusiveIssue(result));
                    const url = await deps.createGitHubIssue(title, body, ['needs-review', result.consistencyIssues ? 'data-inconsistency' : result.outcome === 'contradiction' ? 'verification-conflict' : 'verification-inconclusive']);
                    if (!url) throw new Error('No GitHub issue receipt returned');
                    receipt.status = 'accepted'; receipt.url = url;
                } catch (error) { receipt.status = 'failed'; receipt.error = error.message; throw new Error(`Review issue delivery failed: ${error.message}`); }
            }
            // A change candidate is never an editorial acceptance. Inadequate
            // coverage cannot refresh the schedule through Checked dates.
            if (['healthy', 'review_required'].includes(health.assessedStatus)) {
                const targets = results.filter(result => result.outcome === 'no_change' && isAdequatelyChecked(result)).map(result => {
                    const item = selected[order.get(resultKey(result))];
                    return { filepath: item.platform._filepath, featureName: item.feature.name };
                });
                if (targets.length) {
                    const updated = deps.batchUpdateCheckedDates(targets);
                    if (updated.failed || updated.success !== targets.length) throw new Error('Checked date update failed');
                }
            }
        }
    } catch (error) { fatalError = error.message; }
    const health = persist(true);
    console.log(fs.readFileSync(path.join(deps.reportsDir, 'summary.txt'), 'utf8'));
    return health;
}

async function main() {
    let options;
    try { options = parseArgs(); }
    catch (error) { options = { ...parseArgs([]), dryRun: true, inputError: error.message }; }
    if (options.help) {
        console.log('Usage: node scripts/verify-features.js [--platform name] [--feature name] [--stale-only] [--stale-threshold days] [--max n] [--dry-run] [--verbose]');
        console.log('Dry run still queries paid providers; it suppresses issue and data writes. Exit 0: healthy/idle; 1: review required; 2: failed/degraded.');
        return;
    }
    process.exitCode = healthExitCode(await runVerification(options));
}
if (require.main === module) main().catch(error => { console.error('Unable to retain verification evidence:', error.message); process.exitCode = 2; });
module.exports = { parseArgs, runVerification, checkApiKeys, checkedTime, main };
