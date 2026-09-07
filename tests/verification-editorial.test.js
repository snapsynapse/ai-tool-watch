/**
 * Regression coverage for verification editing and editorial/reporting
 * boundaries. GitHub CLI calls are mocked before loading reporter.js.
 *
 * Run: node --test tests/verification-editorial.test.js
 */

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const childProcess = require('node:child_process');

const { updateFeatureProperty } = require('../scripts/lib/file-updater');
const {
    generateMarkdownReport,
    createGitHubIssue
} = require('../scripts/lib/reporter');
const { CascadeOutcome } = require('../scripts/lib/cascade');

function featureTable(name, rows) {
    return [
        `## ${name}`,
        '',
        '| Property | Value |',
        '|----------|-------|',
        ...rows.map(([property, value]) => `| ${property} | ${value} |`),
        ''
    ].join('\n');
}

function summaryFor(result) {
    return {
        total: 1,
        noChange: result.outcome === CascadeOutcome.NO_CHANGE ? 1 : 0,
        confirmed: result.outcome === CascadeOutcome.CONFIRMED ? 1 : 0,
        contradiction: result.outcome === CascadeOutcome.CONTRADICTION ? 1 : 0,
        inconclusive: result.outcome === CascadeOutcome.INCONCLUSIVE ? 1 : 0,
        error: result.outcome === CascadeOutcome.ERROR ? 1 : 0,
        byPlatform: {
            [result.platform]: {
                total: 1,
                noChange: 0,
                confirmed: 0,
                contradiction: 0,
                inconclusive: 0,
                error: 0
            }
        }
    };
}

test('missing Checked on the selected feature does not update the next feature', () => {
    const content = featureTable('Target', [['Verified', '2026-01-01']]) +
        featureTable('Next Feature', [['Checked', '2026-01-02']]);

    assert.equal(updateFeatureProperty(content, 'Target', 'Checked', '2026-09-06'), null);
    assert.equal(content.includes('| Checked | 2026-09-02 |'), false);
    assert.match(content, /## Next Feature[\s\S]*\| Checked \| 2026-01-02 \|/);
});

test('duplicate feature headings fail closed without changing either section', () => {
    const content = featureTable('Duplicate', [['Checked', '2026-01-01']]) +
        featureTable('Duplicate', [['Checked', '2026-01-02']]);

    assert.equal(updateFeatureProperty(content, 'Duplicate', 'Checked', '2026-09-06'), null);
    assert.equal(content.match(/\| Checked \| 2026-09-06 \|/g), null);
    assert.equal((content.match(/\| Checked \|/g) || []).length, 2);
});

test('duplicate property rows fail closed and a valid selected table date updates only that row', () => {
    const duplicateProperty = featureTable('Duplicate Property', [
        ['Checked', '2026-01-01'],
        ['Checked', '2026-01-02']
    ]);
    assert.equal(updateFeatureProperty(duplicateProperty, 'Duplicate Property', 'Checked', '2026-09-06'), null);
    assert.equal(duplicateProperty.includes('| Checked | 2026-09-06 |'), false);

    const content = featureTable('Selected', [
        ['Checked', '2026-01-01'],
        ['Verified', '2026-01-02']
    ]) + featureTable('Other', [
        ['Checked', '2026-01-03'],
        ['Verified', '2026-01-04']
    ]);
    const updated = updateFeatureProperty(content, 'Selected', 'Checked', '2026-09-06');

    assert.ok(updated);
    assert.match(updated, /## Selected[\s\S]*\| Checked \| 2026-09-06 \|/);
    assert.match(updated, /## Selected[\s\S]*\| Verified \| 2026-01-02 \|/);
    assert.match(updated, /## Other[\s\S]*\| Checked \| 2026-01-03 \|/);
    assert.match(updated, /## Other[\s\S]*\| Verified \| 2026-01-04 \|/);
});

test('confirmed report wording stays pending review and does not claim verified current', () => {
    const result = {
        platform: 'Fixture Platform',
        feature: 'Fixture Feature',
        outcome: CascadeOutcome.CONFIRMED,
        confirmations: 3,
        requiredConfirmations: 3,
        proposedChanges: [{ type: 'status', detail: 'Moved to GA' }],
        results: []
    };
    const report = generateMarkdownReport([result], summaryFor(result));

    assert.match(report, /Model-consensus candidates \(pending review\)/);
    assert.doesNotMatch(report, /verified current/i);
    assert.match(report, /Change Proposals \(Pending Human Review\)/);
});

test('incomplete observations remain visible in generated reports', () => {
    const result = {
        platform: 'Fixture Platform',
        feature: 'Incomplete Feature',
        outcome: CascadeOutcome.INCONCLUSIVE,
        confirmations: 0,
        requiredConfirmations: 3,
        proposedChanges: [],
        results: [{ model: 'Gemini Flash', type: 'error', error: 'No usable evidence' }]
    };
    const report = generateMarkdownReport([result], summaryFor(result));

    assert.match(report, /## Incomplete Observations/);
    assert.match(report, /Fixture Platform - Incomplete Feature/);
    assert.match(report, /No usable evidence/);
});

function withMockedReporterExec(mock, callback) {
    const reporterPath = require.resolve('../scripts/lib/reporter');
    const original = childProcess.execFileSync;
    childProcess.execFileSync = mock;
    delete require.cache[reporterPath];
    try {
        return callback(require(reporterPath));
    } finally {
        delete require.cache[reporterPath];
        childProcess.execFileSync = original;
    }
}

test('createGitHubIssue passes title, body file, and labels as separate safe arguments', () => {
    const calls = [];
    const title = 'Review $(touch /tmp/should-not-run) "quoted"';
    const body = 'Body with `$(echo unsafe)` and "quotes"';
    const url = withMockedReporterExec((file, args, options) => {
        calls.push({ file, args, options });
        if (args[0] === 'issue' && args[1] === 'list') return '[]';
        if (args[0] === 'label' && args[1] === 'create') return '';
        if (args[0] === 'issue' && args[1] === 'create') {
            assert.equal(require('node:fs').readFileSync(args[5], 'utf8'), body);
            return 'https://github.com/example/repo/issues/7\n';
        }
        throw new Error(`unexpected gh call: ${args.join(' ')}`);
    }, reporter => reporter.createGitHubIssue(title, body, ['needs-review']));

    assert.equal(url, 'https://github.com/example/repo/issues/7');
    const create = calls.find(call => call.args[0] === 'issue' && call.args[1] === 'create');
    assert.ok(create);
    assert.equal(create.file, 'gh');
    assert.deepEqual(create.args.slice(0, 4), ['issue', 'create', '--title', title]);
    assert.equal(create.args[4], '--body-file');
    assert.match(create.args[5], /aitw-review-[^/]+\/body\.md$/);
    assert.deepEqual(create.args.slice(6), ['--label', 'needs-review']);
    assert.equal(create.options.shell, undefined);
});

test('createGitHubIssue does not create a duplicate when the lookup fails', () => {
    const calls = [];
    const result = withMockedReporterExec((file, args) => {
        calls.push({ file, args });
        if (args[0] === 'issue' && args[1] === 'list') throw new Error('lookup unavailable');
        throw new Error(`unexpected create after failed lookup: ${args.join(' ')}`);
    }, reporter => reporter.createGitHubIssue('Review fixture', 'Body', ['needs-review']));

    assert.equal(result, null);
    assert.equal(calls.length, 1);
    assert.deepEqual(calls[0].args.slice(0, 2), ['issue', 'list']);
});
