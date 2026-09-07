'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const repo = path.join(__dirname, '..');
const finalizer = require('../scripts/finalize-verification-workflow.js');
const workflow = fs.readFileSync(path.join(repo, '.github', 'workflows', 'verify-features.yml'), 'utf8');
const required = ['health.json', 'results.json', 'summary.txt', 'report.md', 'alert.json'];

function input(overrides = {}) {
    return {
        requiredEnvelope: required,
        envelopePresent: Object.fromEntries(required.map(name => [name, true])),
        initializeOutcome: 'success',
        jobStatus: 'success',
        cliExitCode: '0',
        cliOutcome: 'success',
        cliHealthStatus: 'healthy',
        downstreamOutcomes: {
            args: 'success', syncEvidence: 'skipped', validateOntology: 'skipped',
            validateStructuredData: 'skipped', build: 'skipped', commit: 'skipped', push: 'skipped'
        },
        ...overrides
    };
}

test('healthy and idle CLI evidence remain successful terminal states', () => {
    assert.equal(finalizer.finalStatus(input()).terminalStatus, 'healthy');
    assert.equal(finalizer.finalStatus(input({ cliHealthStatus: 'idle' })).terminalStatus, 'idle');
});

test('review-required exit is green only when the CLI health envelope agrees', () => {
    const result = finalizer.finalStatus(input({ cliExitCode: '1', cliOutcome: 'failure', cliHealthStatus: 'review_required' }));
    assert.equal(result.terminalStatus, 'review_required');
    assert.equal(finalizer.finalStatus(input({ cliExitCode: '1', cliHealthStatus: 'healthy' })).terminalStatus, 'failed');
});

test('operational CLI exit and downstream publication failures remain failures', () => {
    assert.equal(finalizer.finalStatus(input({ cliExitCode: '2', cliOutcome: 'failure', cliHealthStatus: 'degraded' })).terminalStatus, 'degraded');
    assert.equal(finalizer.finalStatus(input({ downstreamOutcomes: { args: 'success', syncEvidence: 'success', validateOntology: 'success', validateStructuredData: 'failure', build: 'skipped', commit: 'skipped', push: 'skipped' } })).terminalStatus, 'failed');
    assert.equal(finalizer.finalStatus(input({ downstreamOutcomes: { args: 'success', syncEvidence: 'success', validateOntology: 'success', validateStructuredData: 'success', build: 'success', commit: 'success', push: 'failure' } })).terminalStatus, 'failed');
});

test('a missing runner evidence envelope cannot be mistaken for health', () => {
    const present = Object.fromEntries(required.map(name => [name, true]));
    present['alert.json'] = false;
    const result = finalizer.finalStatus(input({ envelopePresent: present }));
    assert.equal(result.terminalStatus, 'failed');
    assert.match(result.reasons.join(' '), /verification_evidence_envelope_missing:alert\.json/);
});

test('malformed required evidence cannot be accepted from a healthy CLI claim', () => {
    const result = finalizer.finalStatus(input({ envelopeErrors: ['results_contract_invalid'] }));
    assert.equal(result.terminalStatus, 'failed');
    assert.match(result.reasons.join(' '), /results_contract_invalid/);
});

test('finalizer reads the evidence files and rejects corrupt results JSON', () => {
    const reportsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aitw-workflow-health-'));
    try {
        fs.writeFileSync(path.join(reportsDir, 'health.json'), JSON.stringify({
            status: 'healthy', finishedAt: '2026-09-06T00:00:00.000Z',
            counts: { selected: 1, attempted: 1, adequate: 1 }
        }));
        fs.writeFileSync(path.join(reportsDir, 'results.json'), '{broken');
        fs.writeFileSync(path.join(reportsDir, 'summary.txt'), 'fixture\n');
        fs.writeFileSync(path.join(reportsDir, 'report.md'), '# fixture\n');
        fs.writeFileSync(path.join(reportsDir, 'alert.json'), 'null\n');
        const payload = finalizer.finalize({
            VERIFICATION_REPORTS_DIR: reportsDir,
            JOB_STATUS: 'success',
            CLI_EXIT_CODE: '0',
            CLI_OUTCOME: 'success',
            INITIALIZE_OUTCOME: 'success',
            ARGS_OUTCOME: 'success',
            SYNC_EVIDENCE_OUTCOME: 'skipped',
            VALIDATE_ONTOLOGY_OUTCOME: 'skipped',
            VALIDATE_STRUCTURED_DATA_OUTCOME: 'skipped',
            BUILD_OUTCOME: 'skipped',
            COMMIT_OUTCOME: 'skipped',
            PUSH_OUTCOME: 'skipped'
        });
        assert.equal(payload.terminalStatus, 'failed');
        assert.ok(payload.evidence.envelopeErrors.includes('results_contract_invalid'));
        assert.equal(JSON.parse(fs.readFileSync(path.join(reportsDir, 'workflow-health.json'), 'utf8')).terminalStatus, 'failed');
    } finally {
        fs.rmSync(reportsDir, { recursive: true, force: true });
    }
});

test('zero is a valid CLI exit code, but a missing or invalid actual CLI outcome is not green', () => {
    assert.equal(finalizer.finalStatus(input({ cliExitCode: 0, cliOutcome: 'success' })).terminalStatus, 'healthy');
    assert.equal(finalizer.finalStatus(input({ cliExitCode: '0', cliOutcome: undefined })).terminalStatus, 'failed');
    assert.equal(finalizer.finalStatus(input({ cliExitCode: '0', cliOutcome: 'unexpected' })).terminalStatus, 'failed');
});

test('workflow preserves schedule, uses safe array argv, and uploads evidence before final failure enforcement', () => {
    assert.match(workflow, /cron: '0 1 \* \* 2,5'/);
    assert.match(workflow, /args=\(--verbose\)/);
    assert.match(workflow, /node scripts\/verify-features\.js "\$\{args\[@\]\}"/);
    assert.match(workflow, /name: Sync derived evidence[\s\S]*node scripts\/sync-evidence\.js/);
    assert.ok(workflow.indexOf('name: Sync derived evidence') < workflow.indexOf('name: Validate ontology'));
    assert.ok(workflow.indexOf('name: Validate ontology') < workflow.indexOf('name: Generate published data'));
    assert.ok(workflow.indexOf('name: Generate published data') < workflow.indexOf('name: Validate structured data'));
    assert.match(workflow, /concurrency:\n\s+group: verify-features-\$\{\{ github\.ref \}\}\n\s+cancel-in-progress: false/);
    assert.match(workflow, /git add data\/platforms\/ data\/watchlist\/ data\/evidence\/index\.json docs\//);
    const runBlocks = [...workflow.matchAll(/run: \|\n([\s\S]*?)(?=\n\s*- name:|\n\s*#|$)/g)].map(match => match[1]);
    assert.ok(runBlocks.every(block => !/\$\{\{\s*inputs\./.test(block)), 'dispatch inputs must enter shell through env only');
    assert.doesNotMatch(workflow, /auto_resolve|claude-code-action|Silence canary|pipeline-canary/);
    assert.match(workflow, /missing-run monitor: not_configured/);
    assert.match(workflow, /if: always\(\)\n\s*uses: actions\/upload-artifact@v4/);
    assert.ok(workflow.indexOf('name: Upload verification report') < workflow.indexOf('name: Enforce terminal verification status'));
});

test('state retention runs after failed verification, stages only state, and reaches finalization', () => {
    const stateCommit = workflow.match(/- name: Commit durable review state[\s\S]*?(?=\n\s*- name: Push durable review state)/);
    const statePush = workflow.match(/- name: Push durable review state[\s\S]*?(?=\n\s*# Exit code)/);
    assert.ok(stateCommit, 'missing durable state commit step');
    assert.ok(statePush, 'missing durable state push step');
    assert.ok(workflow.indexOf('name: Run feature verification') < workflow.indexOf('name: Commit durable review state'));
    assert.ok(workflow.indexOf('name: Push durable review state') < workflow.indexOf('name: Sync derived evidence'));
    assert.match(stateCommit[0], /if: always\(\) && steps\.args\.outcome == 'success' && steps\.args\.outputs\.dry_run == 'false'/);
    assert.match(stateCommit[0], /if \[ ! -f "\$state_file" \]/);
    assert.match(stateCommit[0], /validateState/);
    assert.match(stateCommit[0], /git add -- "\$state_file"/);
    assert.match(stateCommit[0], /Refusing to commit anything except \$state_file/);
    assert.doesNotMatch(stateCommit[0], /git add data\/platforms\/ data\/watchlist/);
    assert.match(statePush[0], /if: always\(\) && steps\.state_commit\.outputs\.committed == 'true'/);
    assert.match(statePush[0], /git push/);
    assert.match(workflow, /STATE_COMMIT_OUTCOME: \$\{\{ steps\.state_commit\.outcome \}\}/);
    assert.match(workflow, /STATE_PUSH_OUTCOME: \$\{\{ steps\.state_push\.outcome \}\}/);
    for (const variable of ['FRESHNESS_MAX_SPEND_USD', 'FRESHNESS_MAX_PROVIDER_CALL_USD', 'FRESHNESS_REVIEW_MINUTES_PER_WEEK']) {
        assert.match(workflow, new RegExp(`${variable}: \\$\\{\\{ vars\\.${variable} \\}\\}`));
    }
    const downstreamOutcomes = { ...input().downstreamOutcomes, stateCommit: 'success', statePush: 'failure' };
    const result = finalizer.finalStatus(input({ downstreamOutcomes }));
    assert.equal(result.terminalStatus, 'failed');
    assert.match(result.reasons.join(' '), /statePush_outcome:failure/);
});
