#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const REPORTS_DIR = path.join(__dirname, '..', '.verification-reports');
const REQUIRED_ENVELOPE = ['health.json', 'results.json', 'summary.txt', 'report.md', 'alert.json'];
const SUCCESSFUL_TERMINAL_STATUSES = new Set(['healthy', 'idle', 'review_required']);
const STEP_OUTCOMES = new Set(['success', 'failure', 'skipped', 'cancelled']);

function reportsDirFor(env) {
    return env.VERIFICATION_REPORTS_DIR || REPORTS_DIR;
}

function readJson(filename) {
    try {
        return { valid: true, value: JSON.parse(fs.readFileSync(filename, 'utf8')) };
    } catch (error) {
        return { valid: false, value: null, error: error.code === 'ENOENT' ? 'missing' : 'invalid_json' };
    }
}

function outcome(value) {
    return typeof value === 'string' && STEP_OUTCOMES.has(value) ? value : 'missing';
}

function finalStatus(input) {
    const reasons = [];
    const missingEnvelope = input.requiredEnvelope.filter(name => !input.envelopePresent[name]);
    if (missingEnvelope.length) {
        reasons.push(`verification_evidence_envelope_missing:${missingEnvelope.join(',')}`);
    }
    if (outcome(input.initializeOutcome) !== 'success') {
        reasons.push(`initialize_outcome:${outcome(input.initializeOutcome)}`);
    }
    for (const reason of input.envelopeErrors || []) reasons.push(reason);
    for (const [name, value] of Object.entries(input.downstreamOutcomes)) {
        if (!STEP_OUTCOMES.has(value || '')) reasons.push(`${name}_outcome:missing`);
        if (['failure', 'cancelled'].includes(outcome(value))) {
            reasons.push(`${name}_outcome:${outcome(value)}`);
        }
    }
    if (input.jobStatus === 'cancelled') {
        reasons.push('job_cancelled');
        return { terminalStatus: 'partial', reasons };
    }
    if (input.jobStatus && input.jobStatus !== 'success') {
        reasons.push(`job_status:${input.jobStatus}`);
    }
    if (reasons.length) return { terminalStatus: 'failed', reasons };

    const code = input.cliExitCode === undefined || input.cliExitCode === null ? '' : String(input.cliExitCode);
    const cliOutcome = outcome(input.cliOutcome);
    const healthStatus = input.cliHealthStatus || 'missing';
    if (code === '0' && ['healthy', 'idle'].includes(healthStatus)) {
        if (cliOutcome !== 'success') return { terminalStatus: 'failed', reasons: [`cli_outcome:${cliOutcome}`] };
        return { terminalStatus: healthStatus, reasons };
    }
    if (code === '1' && healthStatus === 'review_required') {
        if (cliOutcome !== 'failure') return { terminalStatus: 'failed', reasons: [`cli_outcome:${cliOutcome}`] };
        return { terminalStatus: 'review_required', reasons };
    }
    if (code === '2') {
        if (cliOutcome !== 'failure') reasons.push(`cli_outcome:${cliOutcome}`);
        if (reasons.length) return { terminalStatus: 'failed', reasons };
        return {
            terminalStatus: ['degraded', 'partial'].includes(healthStatus) ? healthStatus : 'failed',
            reasons: [`operational_cli_exit:2`, `cli_health:${healthStatus}`]
        };
    }
    return {
        terminalStatus: 'failed',
        reasons: [`unexpected_cli_exit:${code || 'missing'}`, `cli_health:${healthStatus}`]
    };
}

function buildInput(env = process.env) {
    const reportsDir = reportsDirFor(env);
    const envelopePresent = Object.fromEntries(
        REQUIRED_ENVELOPE.map(name => [name, fs.existsSync(path.join(reportsDir, name))])
    );
    const healthDocument = readJson(path.join(reportsDir, 'health.json'));
    const resultsDocument = readJson(path.join(reportsDir, 'results.json'));
    const alertDocument = readJson(path.join(reportsDir, 'alert.json'));
    const envelopeErrors = [];
    if (!healthDocument.valid || !healthDocument.value || typeof healthDocument.value !== 'object' || Array.isArray(healthDocument.value)) {
        envelopeErrors.push('health_contract_invalid');
    } else {
        const health = healthDocument.value;
        if (typeof health.status !== 'string' || !health.status) envelopeErrors.push('health_status_invalid');
        if (typeof health.finishedAt !== 'string' || !Number.isFinite(Date.parse(health.finishedAt))) envelopeErrors.push('health_not_finished');
        if (!health.counts || typeof health.counts !== 'object' || Array.isArray(health.counts) ||
            !['selected', 'attempted', 'adequate'].every(name => Number.isInteger(health.counts[name]) && health.counts[name] >= 0)) {
            envelopeErrors.push('health_counts_invalid');
        }
    }
    if (!resultsDocument.valid || !Array.isArray(resultsDocument.value)) envelopeErrors.push('results_contract_invalid');
    if (resultsDocument.valid && Array.isArray(resultsDocument.value) && healthDocument.value?.counts &&
        (healthDocument.value.counts.attempted !== resultsDocument.value.length ||
            healthDocument.value.counts.adequate > healthDocument.value.counts.selected ||
            healthDocument.value.counts.adequate > healthDocument.value.counts.attempted)) {
        envelopeErrors.push('health_results_counts_mismatch');
    }
    if (!alertDocument.valid) envelopeErrors.push('alert_contract_invalid');
    return {
        reportsDir,
        requiredEnvelope: REQUIRED_ENVELOPE,
        envelopePresent,
        envelopeErrors,
        initializeOutcome: env.INITIALIZE_OUTCOME,
        jobStatus: env.JOB_STATUS || 'unknown',
        cliExitCode: env.CLI_EXIT_CODE,
        cliOutcome: env.CLI_OUTCOME,
        cliHealthStatus: typeof healthDocument.value?.status === 'string' ? healthDocument.value.status : 'missing',
        downstreamOutcomes: {
            args: env.ARGS_OUTCOME,
            stateCommit: env.STATE_COMMIT_OUTCOME,
            statePush: env.STATE_PUSH_OUTCOME,
            syncEvidence: env.SYNC_EVIDENCE_OUTCOME,
            validateOntology: env.VALIDATE_ONTOLOGY_OUTCOME,
            validateStructuredData: env.VALIDATE_STRUCTURED_DATA_OUTCOME,
            build: env.BUILD_OUTCOME,
            commit: env.COMMIT_OUTCOME,
            push: env.PUSH_OUTCOME
        }
    };
}

function finalize(env = process.env) {
    const input = buildInput(env);
    const result = finalStatus(input);
    fs.mkdirSync(input.reportsDir, { recursive: true });
    const payload = {
        terminalStatus: result.terminalStatus,
        finishedAt: new Date().toISOString(),
        run: { id: env.RUN_ID || 'local', url: env.RUN_URL || null },
        jobStatus: input.jobStatus,
        cli: {
            exitCode: input.cliExitCode === undefined || input.cliExitCode === null ? null : input.cliExitCode,
            outcome: outcome(input.cliOutcome),
            healthStatus: input.cliHealthStatus
        },
        steps: {
            initialize: outcome(input.initializeOutcome),
            args: outcome(input.downstreamOutcomes.args),
            stateCommit: outcome(input.downstreamOutcomes.stateCommit),
            statePush: outcome(input.downstreamOutcomes.statePush),
            syncEvidence: outcome(input.downstreamOutcomes.syncEvidence),
            validateOntology: outcome(input.downstreamOutcomes.validateOntology),
            validateStructuredData: outcome(input.downstreamOutcomes.validateStructuredData),
            build: outcome(input.downstreamOutcomes.build),
            commit: outcome(input.downstreamOutcomes.commit),
            push: outcome(input.downstreamOutcomes.push)
        },
        evidence: {
            requiredEnvelope: input.requiredEnvelope,
            envelopePresent: input.envelopePresent,
            envelopeErrors: input.envelopeErrors,
            rawEvidencePreserved: true
        },
        notification: {
            directNotification: 'not_configured',
            humanReceipt: 'unconfirmed',
            missingRunMonitor: 'not_configured'
        },
        reasons: result.reasons
    };
    const target = path.join(input.reportsDir, 'workflow-health.json');
    const temporary = `${target}.tmp`;
    fs.writeFileSync(temporary, JSON.stringify(payload, null, 2) + '\n');
    fs.renameSync(temporary, target);
    return payload;
}

function check() {
    const document = readJson(path.join(reportsDirFor(process.env), 'workflow-health.json'));
    if (!document.valid || !SUCCESSFUL_TERMINAL_STATUSES.has(document.value?.terminalStatus)) {
        process.exitCode = 1;
        return;
    }
    process.exitCode = 0;
}

if (require.main === module) {
    if (process.argv.includes('--check')) check();
    else finalize();
}

module.exports = { REQUIRED_ENVELOPE, SUCCESSFUL_TERMINAL_STATUSES, finalStatus, finalize };
