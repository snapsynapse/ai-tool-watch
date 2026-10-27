'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { parseResponse, runCascade } = require('../scripts/lib/cascade');
const { isAdequatelyChecked, healthExitCode } = require('../scripts/lib/verification-health');
const { runVerification, parseArgs } = require('../scripts/verify-features');
const fixture = require('./fixtures/deepsearch-40452547297.json');

const clients = () => fixture.answers.map(answer => ({
    name: answer.modelName,
    displayName: answer.model,
    verify: async () => answer
}));
const replay = () => runCascade(fixture.platform, fixture.feature, {
    clients: clients(), delayBetweenQueries: 0
});

for (const answer of fixture.answers) {
    test(`${answer.modelName}: retained warnings cannot become no-change evidence`, () => {
        assert.equal(crypto.createHash('sha256').update(answer.response).digest('hex'), answer.responseSha256);
        const parsed = parseResponse(answer.response);
        assert.equal(parsed.hasChange, false, 'no supported structured change was extracted');
        assert.equal(parsed.isNoChange, false, 'missing extraction is not confirmation');
    });
}

test('retained answers remain inconclusive and cannot pass the Checked-date gate', async () => {
    const result = await replay();
    assert.equal(result.outcome, 'inconclusive');
    assert.equal(isAdequatelyChecked(result), false);
    assert.ok(result.results.every(vote => vote.type === 'abstain'));
    for (const [index, vote] of result.results.entries()) {
        assert.equal(vote.response, fixture.answers[index].response);
        assert.deepEqual(vote.sources, fixture.answers[index].sources);
        assert.deepEqual(vote.usageReceipt, fixture.answers[index].usageReceipt);
        assert.ok(vote.sectionVerdicts);
    }
});

test('real verification runner queues retained warnings without refreshing dates', async () => {
    const reportsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aitw-retained-'));
    const stateFilename = path.join(reportsDir, 'state.json');
    const result = await replay();
    const item = { platform: { ...fixture.platform, _filepath: '/tmp/retained-grok.md' }, feature: fixture.feature };
    let issueCalls = 0;
    try {
        const health = await runVerification({ ...parseArgs([]), maxFeatures: 1 }, {
            reportsDir, stateFilename,
            getAllFeatures: () => [item], checkApiKeys: () => {},
            checkConsistency: () => ({ hasErrors: false }),
            runBatchCascade: async () => ({ results: [result], providerHealth: {} }),
            findExistingIssueDetails: async () => null,
            createGitHubIssue: async () => { issueCalls++; return 'https://github.com/example/repo/issues/1'; },
            batchUpdateCheckedDates: () => assert.fail('Checked must not advance'),
            batchUpdateVerifiedDates: () => assert.fail('Verified must not advance'),
            batchAddChangelogEntries: () => assert.fail('Changelog must not change')
        });
        assert.equal(healthExitCode(health), 2, 'inadequate evidence fails closed');
        assert.equal(health.counts.adequate, 0);
        assert.equal(health.counts.malformedResults, 0);
        assert.equal(health.counts.providerFailures, 0, 'abstention is not a transport failure');
        assert.equal(health.reviewRequired.count, 1);
        assert.equal(health.pendingReviewCount, 1);
        assert.equal(issueCalls, 1, 'review delivery is mocked; no GitHub request occurs');
        const findings = JSON.parse(fs.readFileSync(path.join(reportsDir, 'pending-findings.json')));
        assert.equal(findings.length, 1);
        assert.equal(findings[0].status, 'pending');
        const retained = JSON.parse(fs.readFileSync(path.join(reportsDir, 'results.json')));
        assert.deepEqual(retained[0].results[1].usageReceipt, fixture.answers[1].usageReceipt);
    } finally {
        fs.rmSync(reportsDir, { recursive: true, force: true });
    }
});
