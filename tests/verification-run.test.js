'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { runVerification, parseArgs } = require('../scripts/verify-features');
const { healthExitCode } = require('../scripts/lib/verification-health');

const inventory = count => Array.from({ length: count }, (_, i) => ({
    platform: { name: `Platform ${i}`, _filepath: `/tmp/platform-${i}.md`, vendor: 'Vendor', pricing: [] },
    feature: { name: `Feature ${i}`, checked: `2026-01-${String(i + 1).padStart(2, '0')}`, verified: '2025-12-01' }
}));
const vote = (name, type = 'negative') => ({ model: name, modelName: name, type, hasChange: type === 'positive',
    response: type === 'negative' ? 'No change detected in the cited official documentation.' : 'The official release changes this feature.',
    confidence: 0.9, hasSearchEvidence: true, sources: ['https://example.org/official'],
    raw: { id: name, usage: { output_tokens: 12 } }, usageReceipt: { id: name, model: name, created: null, usage: { output_tokens: 12 } } });
const record = (item, outcome = 'no_change', votes = [vote('a'), vote('b')]) => ({
    platform: item.platform.name, feature: item.feature.name, outcome, results: votes,
    requiredConfirmations: 3, confirmations: votes.filter(v => v.type === 'positive').length,
    proposedChanges: outcome === 'confirmed' ? [{ type: 'status', detail: 'Candidate new status' }] : []
});
function scenario({ items = inventory(1), stale = items, options = {}, batch, issue, consistency } = {}) {
    const reportsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aitw-run-'));
    const stateFilename = path.join(reportsDir, 'state.json');
    const calls = { selected: [], checked: [], issues: [], keys: 0 };
    const deps = { reportsDir, getAllFeatures: () => items, findStaleFeatures: () => stale,
        checkApiKeys: () => { calls.keys++; },
        checkConsistency: consistency || (() => ({ hasErrors: false })),
        runBatchCascade: async (selected, config) => { calls.selected = selected; return batch ? batch(selected, config) : { results: selected.map(i => record(i)), providerHealth: {} }; },
        findExistingIssueDetails: async () => null,
        createGitHubIssue: async (...args) => { calls.issues.push(args); return issue ? issue(...args) : 'https://github.com/example/repo/issues/1'; },
        batchUpdateCheckedDates: entries => { calls.checked.push(entries); return { success: entries.length, failed: 0 }; },
        batchUpdateVerifiedDates: () => { throw new Error('Forbidden Verified update'); },
        stateFilename,
        batchAddChangelogEntries: () => { throw new Error('Forbidden changelog update'); },
        closeGitHubIssue: () => { throw new Error('Forbidden auto-close'); }
    };
    return { calls, reportsDir, stateFilename, run: () => runVerification({ ...parseArgs([]), ...options }, deps),
        read: filename => JSON.parse(fs.readFileSync(path.join(reportsDir, filename), 'utf8')),
        cleanup: () => fs.rmSync(reportsDir, { recursive: true, force: true }) };
}

test('healthy cited no-change updates Checked only and retains raw usage', async () => {
    const s = scenario(); try {
        const health = await s.run();
        assert.equal(health.status, 'healthy'); assert.equal(healthExitCode(health), 0);
        assert.equal(s.calls.checked.flat().length, 1); assert.equal(s.calls.issues.length, 0);
        assert.equal(s.read('results.json')[0].results[0].usageReceipt.usage.output_tokens, 12);
        assert.equal(s.read('pending-findings.json').length, 0);
        assert.match(fs.readFileSync(path.join(s.reportsDir, 'summary.txt'), 'utf8'), /not_configured/);
    } finally { s.cleanup(); }
});

test('fifty all-error features fail with no Checked refresh and remain visible', async () => {
    const s = scenario({ items: inventory(50), batch: selected => ({ results: selected.map(item => record(item, 'error', [
        { modelName: 'a', model: 'a', type: 'error', error: 'Provider retired' },
        { modelName: 'b', model: 'b', type: 'error', error: 'Unavailable' }
    ])), providerHealth: {} }) });
    try { const health = await s.run(); assert.equal(health.status, 'failed'); assert.equal(healthExitCode(health), 2);
        assert.equal(s.calls.checked.length, 0); assert.equal(s.read('pending-findings.json').length, 50);
        assert.ok(s.read('alert.json')); } finally { s.cleanup(); }
});

test('one provider cannot refresh successful coverage', async () => {
    const s = scenario({ batch: selected => ({ results: selected.map(item => record(item, 'inconclusive', [vote('a')])), providerHealth: {} }) });
    try { const health = await s.run(); assert.equal(healthExitCode(health), 2); assert.equal(s.calls.checked.length, 0); } finally { s.cleanup(); }
});

test('model-confirmed change is a pending proposal, with review exit and no changelog or date write', async () => {
    const s = scenario({ batch: selected => ({ results: selected.map(item => record(item, 'confirmed', ['a','b','c'].map(name => vote(name, 'positive')))), providerHealth: {} }) });
    try { const health = await s.run(); assert.equal(health.status, 'review_required'); assert.equal(healthExitCode(health), 1);
        assert.equal(s.calls.checked.length, 0); assert.equal(s.calls.issues.length, 1);
        assert.equal(s.read('pending-findings.json')[0].status, 'pending');
        assert.equal(s.read('health.json').reviewIssues[0].status, 'accepted');
        assert.match(s.calls.issues[0][1], /Pending human source review/);
        assert.doesNotMatch(s.calls.issues[0][1], /\[Verified\]/);
    } finally { s.cleanup(); }
});

test('conflicting adequate evidence requires review without being an infrastructure failure', async () => {
    const s = scenario({ batch: selected => ({ results: selected.map(item => record(item, 'contradiction', [vote('a'), vote('b', 'positive')])), providerHealth: {} }) });
    try { const health = await s.run(); assert.equal(healthExitCode(health), 1); assert.equal(s.calls.issues.length, 1); assert.equal(s.calls.checked.length, 0); } finally { s.cleanup(); }
});

test('rejected review issue retains evidence and becomes operational failure', async () => {
    const s = scenario({ issue: () => null, batch: selected => ({ results: selected.map(item => record(item, 'confirmed', ['a','b','c'].map(n => vote(n,'positive')))), providerHealth: {} }) });
    try { const health = await s.run(); assert.equal(healthExitCode(health), 2); assert.equal(health.reviewIssueDelivery, 'failed');
        assert.equal(s.read('results.json')[0].results[0].raw.usage.output_tokens, 12); assert.equal(s.calls.checked.length, 0); } finally { s.cleanup(); }
});

test('partial batch failure preserves completed callback evidence and does not refresh Checked', async () => {
    const s = scenario({ items: inventory(2), batch: async (selected, opts) => { await opts.onResult(record(selected[0])); throw new Error('Later provider failed'); } });
    try { const health = await s.run(); assert.equal(healthExitCode(health), 2); assert.equal(s.read('results.json').length, 1); assert.equal(s.calls.checked.length, 0); } finally { s.cleanup(); }
});

test('an interrupted run resumes only its unfinished selected feature within the same UTC day', async () => {
    const items = inventory(2); let attempt = 0; const selected = [];
    const s = scenario({ items, batch: async (batch, options) => {
        selected.push(batch.map(item => item.feature.name));
        if (attempt++ === 0) { await options.onResult(record(batch[0])); throw new Error('interrupted after checkpoint'); }
        return { results: batch.map(item => record(item)), providerHealth: {} };
    }});
    try {
        assert.equal(healthExitCode(await s.run()), 2);
        assert.equal(healthExitCode(await s.run()), 0);
        assert.deepEqual(selected[1], [items[1].feature.name]);
        const state = JSON.parse(fs.readFileSync(s.stateFilename, 'utf8'));
        assert.equal(Object.values(state.runs)[0].status, 'completed');
    } finally { s.cleanup(); }
});

test('malformed returned batch is retained and cannot become idle or healthy', async () => {
    const s = scenario({ batch: () => ({ result: 'bad contract' }) });
    try { const health = await s.run(); assert.equal(healthExitCode(health), 2); assert.deepEqual(s.read('invalid-batch-result.json'), { result: 'bad contract' }); assert.equal(s.calls.checked.length, 0); } finally { s.cleanup(); }
});

test('valid idle does not require keys; invalid empty inventory fails', async () => {
    for (const [config, expected] of [[{ stale: [], options: { staleOnly: true } }, 'idle'], [{ items: [] }, 'failed']]) {
        const s = scenario(config); try { assert.equal((await s.run()).status, expected); assert.equal(s.calls.keys, 0); } finally { s.cleanup(); }
    }
});

test('dry run retains proposals but calls no editorial or issue mutations', async () => {
    const s = scenario({ options: { dryRun: true }, batch: selected => ({ results: selected.map(item => record(item, 'confirmed', ['a','b','c'].map(n => vote(n,'positive')))), providerHealth: {} }) });
    try { assert.equal(healthExitCode(await s.run()), 1); assert.equal(s.calls.issues.length, 0); assert.equal(s.calls.checked.length, 0); assert.equal(s.read('pending-findings.json').length, 1); } finally { s.cleanup(); }
});

test('a restarted run reuses the persisted accepted receipt without another issue mutation', async () => {
    const s = scenario({ batch: selected => ({ results: selected.map(item => record(item, 'confirmed', ['a','b','c'].map(n => vote(n, 'positive')))), providerHealth: {} }) });
    try {
        assert.equal(healthExitCode(await s.run()), 1);
        assert.equal(healthExitCode(await s.run()), 1);
        assert.equal(s.calls.issues.length, 1);
        assert.equal(s.read('pending-findings.json')[0].issueReceipt.status, 'accepted');
    } finally { s.cleanup(); }
});

test('oldest-first selection remains intact and reports unselected backlog', async () => {
    const items = inventory(3); items[2].feature.checked = '2025-01-01';
    const s = scenario({ items, options: { maxFeatures: 1 } });
    try { const health = await s.run(); assert.equal(s.calls.selected[0].feature.name, items[2].feature.name); assert.equal(health.counts.selected, 1);
        assert.match(fs.readFileSync(path.join(s.reportsDir, 'summary.txt'), 'utf8'), /unselected backlog: 2/); } finally { s.cleanup(); }
});

test('consistency-blocked selected features remain in the coverage denominator', async () => {
    const s = scenario({ consistency: () => ({ hasErrors: true, issues: [{ severity: 'error', message: 'Mismatch' }] }) });
    try { assert.equal(healthExitCode(await s.run()), 2); assert.equal(s.calls.keys, 0); assert.equal(s.read('pending-findings.json')[0].status, 'pending'); assert.equal(s.calls.checked.length, 0); } finally { s.cleanup(); }
});

test('argument validation rejects invalid scopes and truncated or zero numeric values', () => {
    for (const args of [['--unknown'], ['--max','0'], ['--max','2junk'], ['--max','1e2'], ['--platform'], ['--feature','x'], ['--stale-threshold','0']]) assert.throws(() => parseArgs(args));
    assert.equal(parseArgs(['--max','5']).maxFeatures, 5);
});


test('a truncated returned batch cannot erase previously retained callback evidence', async () => {
    const s = scenario({ items: inventory(2), batch: async (selected, config) => {
        await config.onResult(record(selected[0])); return { results: [], providerHealth: {} };
    }});
    try { assert.equal(healthExitCode(await s.run()), 2); assert.equal(s.read('results.json').length, 1);
        assert.deepEqual(s.read('invalid-batch-result.json').results, []); assert.equal(s.calls.checked.length, 0);
    } finally { s.cleanup(); }
});

test('a returned batch cannot rewrite a completed callback receipt', async () => {
    const s = scenario({ batch: async (selected, config) => {
        await config.onResult(record(selected[0])); return { results: [record(selected[0], 'error', [])], providerHealth: {} };
    }});
    try { assert.equal(healthExitCode(await s.run()), 2); assert.equal(s.read('results.json')[0].outcome, 'no_change');
        assert.equal(s.read('invalid-batch-result.json').results[0].outcome, 'error'); assert.equal(s.calls.checked.length, 0);
    } finally { s.cleanup(); }
});

test('malformed object-valued votes produce retained failure evidence', async () => {
    const s = scenario({ batch: selected => ({ results: [{ ...record(selected[0]), results: { bad: 'container' } }], providerHealth: {} }) });
    try { assert.equal(healthExitCode(await s.run()), 2); assert.deepEqual(s.read('results.json')[0].results, { bad: 'container' }); assert.equal(s.calls.checked.length, 0); }
    finally { s.cleanup(); }
});
