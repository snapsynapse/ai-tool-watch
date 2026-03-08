#!/usr/bin/env node

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const PATTERNS = [
    { id: 'private-key', regex: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
    { id: 'github-pat', regex: /github_pat_[A-Za-z0-9_]{20,}/ },
    { id: 'github-classic', regex: /ghp_[A-Za-z0-9]{20,}/ },
    { id: 'openai-key', regex: /\bsk-[A-Za-z0-9]{20,}\b/ },
    { id: 'aws-access-key', regex: /\bAKIA[0-9A-Z]{16}\b/ },
    { id: 'google-api-key', regex: /\bAIza[0-9A-Za-z\-_]{20,}\b/ },
    { id: 'slack-token', regex: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/ }
];

const CURRENT_GREP_PATTERN = PATTERNS.map(item => item.regex.source).join('|');

const CURRENT_GLOB_EXCLUDES = [
    '!docs/**',
    '!skills/*/dist/**',
    '!node_modules/**',
    '!*.jpg',
    '!*.png',
    '!*.svg',
    '!.git/**'
];

const BENIGN_LINE_PATTERNS = [
    /your-key/i,
    /process\.env\.[A-Z0-9_]+/,
    /\${{\s*secrets\.[A-Z0-9_]+\s*}}/,
    /GEMINI_API_KEY|PERPLEXITY_API_KEY|XAI_API_KEY|ANTHROPIC_API_KEY|GITHUB_TOKEN|FTP_HOST|FTP_USER|FTP_PASS/,
    /github-token\.txt/,
    /Authorization:\s+Bearer\s+\$TOKEN/,
    /Authorization:\s+Bearer\s+\$\(jq -r/,
    /refresh the github token/i,
    /token needs to be refreshed/i,
    /requires api keys/i,
    /check for required secrets/i,
    /Generate a new token:/i
];

function parseArgs(argv) {
    return {
        currentOnly: argv.includes('--current-only'),
        historyOnly: argv.includes('--history-only'),
        verbose: argv.includes('--verbose')
    };
}

function run(command, args, options = {}) {
    return execFileSync(command, args, {
        cwd: ROOT,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
        ...options
    });
}

function classifyMatch(text) {
    for (const pattern of PATTERNS) {
        if (pattern.regex.test(text)) return pattern.id;
    }
    return 'unknown';
}

function isBenign(line) {
    return BENIGN_LINE_PATTERNS.some(pattern => pattern.test(line));
}

function scanCurrentTree() {
    let output = '';
    try {
        output = run('rg', ['-n', '-I', '--hidden', ...CURRENT_GLOB_EXCLUDES.flatMap(p => ['--glob', p]), '-e', CURRENT_GREP_PATTERN, '.']);
    } catch (error) {
        output = error.stdout || '';
        if (!output && error.status !== 1) throw error;
    }

    return output
        .split('\n')
        .filter(Boolean)
        .filter(line => !isBenign(line))
        .map(line => ({
            scope: 'current',
            location: line.split(':').slice(0, 2).join(':'),
            type: classifyMatch(line),
            line
        }));
}

function scanHistory() {
    const revisions = run('git', ['rev-list', '--all']).trim().split('\n').filter(Boolean);
    const findings = [];
    const seen = new Set();

    for (const rev of revisions) {
        let output = '';
        try {
            output = run('git', ['grep', '-nI', '-E', '-e', CURRENT_GREP_PATTERN, rev]);
        } catch (error) {
            output = error.stdout || '';
            if (!output && error.status !== 1) throw error;
        }

        output.split('\n')
            .filter(Boolean)
            .filter(line => !isBenign(line))
            .forEach(line => {
                if (seen.has(line)) return;
                seen.add(line);
                const [commit, file, lineNo] = line.split(':', 3);
                findings.push({
                    scope: 'history',
                    location: `${commit}:${file}:${lineNo}`,
                    type: classifyMatch(line),
                    line
                });
            });
    }

    return findings;
}

function main() {
    const args = parseArgs(process.argv.slice(2));
    const findings = [];

    if (!args.historyOnly) findings.push(...scanCurrentTree());
    if (!args.currentOnly) findings.push(...scanHistory());

    if (!findings.length) {
        console.log('Secret scan passed: no committed secrets detected in the checked scope.');
        process.exit(0);
    }

    console.error(`Secret scan failed: found ${findings.length} potential secret match(es).`);
    findings.forEach(finding => {
        console.error(`- [${finding.scope}] ${finding.type} ${finding.location}`);
        if (args.verbose) console.error(`  ${finding.line}`);
    });
    process.exit(1);
}

main();
