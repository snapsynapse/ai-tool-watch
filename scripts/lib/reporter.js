/**
 * Reporter module for generating verification reports, PRs, and issues
 */

const fs = require('fs');
const path = require('path');
const { execSync, execFileSync } = require('child_process');
const { CascadeOutcome } = require('./cascade');

const REPORTS_DIR = path.join(__dirname, '..', '..', '.verification-reports');

/**
 * Ensure reports directory exists
 */
function ensureReportsDir() {
    if (!fs.existsSync(REPORTS_DIR)) {
        fs.mkdirSync(REPORTS_DIR, { recursive: true });
    }
}

/**
 * Generate a markdown report from cascade results
 * @param {Array<Object>} results - Cascade results
 * @param {Object} summary - Summary statistics
 * @returns {string} Markdown report content
 */
function generateMarkdownReport(results, summary) {
    const timestamp = new Date().toISOString();
    const dateStr = timestamp.split('T')[0];

    let report = `# Verification Report - ${dateStr}\n\n`;
    report += `Generated: ${timestamp}\n\n`;

    // Summary section
    report += `## Summary\n\n`;
    report += `| Metric | Count |\n`;
    report += `|--------|-------|\n`;
    report += `| Total features checked | ${summary.total} |\n`;
    report += `| Adequate no-change observations | ${summary.noChange} |\n`;
    report += `| Model-consensus candidates (pending review) | ${summary.confirmed} |\n`;
    report += `| Contradictions (needs review) | ${summary.contradiction} |\n`;
    report += `| Inconclusive | ${summary.inconclusive} |\n`;
    report += `| Errors | ${summary.error} |\n\n`;

    // Platform breakdown
    report += `## By Platform\n\n`;
    for (const [platform, stats] of Object.entries(summary.byPlatform)) {
        report += `### ${platform}\n\n`;
        report += `- Checked: ${stats.total}\n`;
        report += `- No change: ${stats.noChange}\n`;
        report += `- Confirmed: ${stats.confirmed}\n`;
        report += `- Contradictions: ${stats.contradiction}\n`;
        report += `- Inconclusive: ${stats.inconclusive}\n`;
        report += `- Errors: ${stats.error}\n\n`;
    }

    // Confirmed changes
    const confirmed = results.filter(r => r.outcome === CascadeOutcome.CONFIRMED);
    if (confirmed.length > 0) {
        report += `## Change Proposals (Pending Human Review)\n\n`;
        for (const result of confirmed) {
            report += `### ${result.platform} - ${result.feature}\n\n`;
            report += `**Confirmations:** ${result.confirmations}/${result.requiredConfirmations}\n\n`;

            if (result.proposedChanges.length > 0) {
                report += `**Detected changes:**\n`;
                for (const change of result.proposedChanges) {
                    report += `- [${change.type}] ${change.detail}\n`;
                }
                report += `\n`;
            }

            report += `**Model responses:**\n\n`;
            for (const modelResult of result.results) {
                if (modelResult.type === 'error') continue;
                report += `<details>\n<summary>${modelResult.model}</summary>\n\n`;
                report += `${modelResult.response}\n\n`;
                if (modelResult.sources && modelResult.sources.length > 0) {
                    report += `Sources: ${modelResult.sources.join(', ')}\n\n`;
                }
                report += `</details>\n\n`;
            }
        }
    }

    // Contradictions
    const contradictions = results.filter(r => r.outcome === CascadeOutcome.CONTRADICTION);
    if (contradictions.length > 0) {
        report += `## Contradictions (Manual Review Required)\n\n`;
        for (const result of contradictions) {
            report += `### ${result.platform} - ${result.feature}\n\n`;
            report += `Models disagreed on whether changes occurred.\n\n`;

            report += `**Model responses:**\n\n`;
            for (const modelResult of result.results) {
                if (modelResult.type === 'error') continue;
                const changeStatus = modelResult.hasChange ? 'CHANGE' : 'NO CHANGE';
                report += `<details>\n<summary>${modelResult.model} - ${changeStatus}</summary>\n\n`;
                report += `${modelResult.response}\n\n`;
                report += `</details>\n\n`;
            }
        }
    }

    // Incomplete evidence remains visible even when it has no positive vote.
    const incomplete = results.filter(r => r.outcome === CascadeOutcome.INCONCLUSIVE);
    if (incomplete.length) {
        report += '## Incomplete Observations\n\n';
        for (const result of incomplete) {
            report += `### ${result.platform} - ${result.feature}\n\n`;
            report += 'Evidence was insufficient to establish the current state. This finding remains open.\n\n';
            for (const vote of result.results) report += `- ${vote.model || vote.modelName}: ${vote.type}; ${vote.error || vote.response || vote.reason || 'no evidence'}\n`;
            report += '\n';
        }
    }

    // Errors
    const errors = results.filter(r => r.outcome === CascadeOutcome.ERROR);
    if (errors.length > 0) {
        report += `## Errors\n\n`;
        for (const result of errors) {
            report += `### ${result.platform} - ${result.feature}\n\n`;
            for (const modelResult of result.results) {
                if (modelResult.type === 'error') {
                    report += `- ${modelResult.model}: ${modelResult.error}\n`;
                }
            }
            report += `\n`;
        }
    }

    return report;
}

/**
 * Save report to file
 * @param {string} content - Report content
 * @param {string} suffix - Optional filename suffix
 * @returns {string} Path to saved report
 */
function saveReport(content, suffix = '') {
    ensureReportsDir();

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `verification-${timestamp}${suffix ? '-' + suffix : ''}.md`;
    const filepath = path.join(REPORTS_DIR, filename);

    fs.writeFileSync(filepath, content);
    return filepath;
}

/**
 * Generate PR body for confirmed changes
 * @param {Array<Object>} confirmedResults - Results with confirmed changes
 * @returns {string} PR body markdown
 */
function generatePRBody(confirmedResults) {
    let body = `## Summary\n\n`;
    body += `Automated verification detected the following changes:\n\n`;

    for (const result of confirmedResults) {
        body += `### ${result.platform} - ${result.feature}\n\n`;

        if (result.proposedChanges.length > 0) {
            for (const change of result.proposedChanges) {
                body += `- **${change.type}**: ${change.detail}\n`;
            }
        } else {
            body += `- Changes detected by ${result.confirmations} models\n`;
        }
        body += `\n`;
    }

    body += `## Verification Details\n\n`;
    body += `- Models consulted: Up to 4 (Gemini Flash, Perplexity, Grok, Claude)\n`;
    body += `- Required confirmations: 3\n`;
    body += `- Provider bias prevention: Same-provider models skipped\n\n`;

    body += `## Sources\n\n`;
    const allSources = new Set();
    for (const result of confirmedResults) {
        for (const modelResult of result.results) {
            if (modelResult.sources) {
                modelResult.sources.forEach(s => allSources.add(s));
            }
        }
    }

    if (allSources.size > 0) {
        for (const source of allSources) {
            body += `- ${source}\n`;
        }
    } else {
        body += `See model responses in verification report for cited sources.\n`;
    }

    body += `\n---\n`;
    body += `*This PR was automatically generated by the pricing verification system.*\n`;

    return body;
}

/**
 * Generate issue body for contradictions
 * @param {Object} result - Contradiction result
 * @returns {string} Issue body markdown
 */
function generateContradictionIssue(result) {
    let body = `## Verification Conflict\n\n`;
    body += `Automated verification found conflicting information about:\n\n`;
    body += `**Platform:** ${result.platform}\n`;
    body += `**Feature:** ${result.feature}\n\n`;

    // Include current stored data for context
    if (result.storedData) {
        body += `## Current Stored Data\n\n`;
        body += `<details>\n<summary>What our data file currently says</summary>\n\n`;
        body += `\`\`\`\n${result.storedData}\n\`\`\`\n\n`;
        body += `</details>\n\n`;
    }

    body += `## Model Responses\n\n`;

    for (const modelResult of result.results) {
        if (modelResult.type === 'error') continue;

        const status = modelResult.hasChange ? 'Detected change' : 'No change detected';
        body += `### ${modelResult.model}\n\n`;
        body += `**Result:** ${status}\n\n`;
        body += `<details>\n<summary>Full response</summary>\n\n`;
        body += `${modelResult.response}\n\n`;
        body += `</details>\n\n`;
    }

    body += `## Action Required\n\n`;
    body += `Please manually verify this feature's current status:\n\n`;
    body += `1. Check the official pricing page\n`;
    body += `2. Verify platform availability\n`;
    body += `3. Update the data file if needed\n`;
    body += `4. Close this issue with findings\n\n`;

    body += `---\n`;
    body += `*This issue was automatically generated by the pricing verification system.*\n`;

    return body;
}

/**
 * Generate issue body for inconclusive results
 * @param {Object} result - Inconclusive result
 * @returns {string} Issue body markdown
 */
function generateInconclusiveIssue(result) {
    let body = `## Unconfirmed Change\n\n`;
    body += result.outcome === CascadeOutcome.CONFIRMED
        ? 'Models agree on a proposed change. Human source review and acceptance are still required.\n\n'
        : 'Automated checks found a potential change with incomplete or conflicting evidence.\n\n';
    body += `**Platform:** ${result.platform}\n`;
    body += `**Feature:** ${result.feature}\n`;
    body += `**Confirmations:** ${result.confirmations}/${result.requiredConfirmations}\n\n`;

    // Include current stored data for context
    if (result.storedData) {
        body += `## Current Stored Data\n\n`;
        body += `<details>\n<summary>What our data file currently says</summary>\n\n`;
        body += `\`\`\`\n${result.storedData}\n\`\`\`\n\n`;
        body += `</details>\n\n`;
    }

    if (result.proposedChanges.length > 0) {
        body += `## Potential Changes\n\n`;
        for (const change of result.proposedChanges) {
            body += `- [${change.type}] ${change.detail}\n`;
        }
        body += `\n`;
    }

    body += `## Model Responses\n\n`;

    for (const modelResult of result.results) {
        if (modelResult.type === 'error') continue;

        body += `### ${modelResult.model}\n\n`;
        body += `<details>\n<summary>Response</summary>\n\n`;
        body += `${modelResult.response}\n\n`;
        body += `</details>\n\n`;
    }

    body += `## Action Required\n\n`;
    body += `Please manually verify if this feature has changed.\n\n`;

    body += `---\n`;
    body += `*This issue was automatically generated by the pricing verification system.*\n`;

    return body;
}

/**
 * Generate issue body for data consistency errors
 * @param {Object} result - { platform, feature, issues: Array<{field, message, severity}> }
 * @returns {string} Issue body markdown
 */
function generateConsistencyIssue(result) {
    let body = `## Data Inconsistency\n\n`;
    body += `Automated consistency check found contradictions in the data file:\n\n`;
    body += `**Platform:** ${result.platform}\n`;
    body += `**Feature:** ${result.feature}\n\n`;

    body += `## Issues Found\n\n`;
    for (const issue of result.issues) {
        const icon = issue.severity === 'error' ? '🔴' : '🟡';
        body += `${icon} **${issue.field}** (${issue.severity}): ${issue.message}\n`;
    }
    body += `\n`;

    body += `## Action Required\n\n`;
    body += `These are contradictions within the data file itself — one of the conflicting fields is wrong.\n\n`;
    body += `1. Determine which field is correct (research if needed)\n`;
    body += `2. Update the data file to resolve the contradiction\n`;
    body += `3. Close this issue with findings\n\n`;

    body += `---\n`;
    body += `*This issue was automatically generated by the consistency checker.*\n`;

    return body;
}

/**
 * Label colors for auto-created labels
 */
const LABEL_COLORS = {
    'verification-conflict': 'd73a4a',
    'verification-inconclusive': 'fbca04',
    'needs-review': 'fbca04',
    'broken-links': 'd73a4a',
    'verification-needed': '0e8a16',
    'data-inconsistency': 'e11d48',
    'unconfirmed-signals': 'bfdadc',
    'pipeline-canary': '5319e7'
};

/**
 * Find an open issue with an exact title match, returning its full record.
 * @param {string} title - Issue title to search for
 * @returns {Object|null} {number, title, url, updatedAt} or null if not found
 */
function findExistingIssueDetails(title) {
    const result = execFileSync('gh', ['issue', 'list', '--state', 'open', '--search', title,
        '--json', 'number,title,url,updatedAt', '--limit', '100'], { encoding: 'utf-8' });
    const issues = JSON.parse(result);
    if (!Array.isArray(issues)) throw new Error('Invalid GitHub issue lookup result');
    return issues.find(issue => issue.title === title) || null;
}

/**
 * Check if an open issue with the same title already exists
 * @param {string} title - Issue title to search for
 * @returns {string|null} Existing issue URL if found, null otherwise
 */
function findExistingIssue(title) {
    const match = findExistingIssueDetails(title);
    return match ? match.url : null;
}

/**
 * Close a GitHub issue with an explanatory comment.
 * @param {string|number} issueRef - Issue number or URL
 * @param {string} comment - Closing comment body
 * @returns {boolean} True if the issue was closed
 */
function closeGitHubIssue(issueRef, comment) {
    try {
        const os = require('os');
        const tmpFile = path.join(os.tmpdir(), `gh-issue-close-${Date.now()}.md`);
        fs.writeFileSync(tmpFile, comment, 'utf-8');
        try {
            execSync(`gh issue comment "${issueRef}" --body-file "${tmpFile}"`, { encoding: 'utf-8' });
            execSync(`gh issue close "${issueRef}"`, { encoding: 'utf-8' });
            return true;
        } finally {
            try { fs.unlinkSync(tmpFile); } catch (e) { /* ignore */ }
        }
    } catch (error) {
        console.error('Failed to close GitHub issue:', error.message);
        return false;
    }
}

/**
 * Create a GitHub issue using gh CLI
 * Skips creation if an open issue with the same title already exists
 * @param {string} title - Issue title
 * @param {string} body - Issue body
 * @param {Array<string>} labels - Issue labels
 * @returns {string|null} Issue URL (new or existing) or null if failed
 */
function createGitHubIssue(title, body, labels = []) {
    let directory;
    try {
        // A failed lookup must not open duplicates or imply successful delivery.
        const existingUrl = findExistingIssue(title);
        if (existingUrl) return existingUrl;
        for (const label of labels) {
            try { execFileSync('gh', ['label', 'create', label, '--color', LABEL_COLORS[label] || 'ededed'], { stdio: 'pipe' }); }
            catch { /* Existing labels are resolved by the subsequent create. */ }
        }
        directory = fs.mkdtempSync(path.join(require('os').tmpdir(), 'aitw-review-'));
        const bodyFile = path.join(directory, 'body.md');
        fs.writeFileSync(bodyFile, body, { mode: 0o600 });
        const args = ['issue', 'create', '--title', title, '--body-file', bodyFile];
        for (const label of labels) args.push('--label', label);
        return execFileSync('gh', args, { encoding: 'utf-8' }).trim();
    } catch {
        console.error('Failed to create or locate GitHub review issue');
        return null;
    } finally {
        if (directory) fs.rmSync(directory, { recursive: true, force: true });
    }
}

/**
 * Add a comment to an existing GitHub issue using gh CLI
 * @param {string} issueRef - Issue number or URL
 * @param {string} body - Comment body
 * @returns {boolean} True if the comment was posted
 */
function commentOnGitHubIssue(issueRef, body) {
    try {
        const os = require('os');
        const tmpFile = path.join(os.tmpdir(), `gh-issue-comment-${Date.now()}.md`);
        fs.writeFileSync(tmpFile, body, 'utf-8');
        try {
            execSync(`gh issue comment "${issueRef}" --body-file "${tmpFile}"`, { encoding: 'utf-8' });
            return true;
        } finally {
            try { fs.unlinkSync(tmpFile); } catch (e) { /* ignore */ }
        }
    } catch (error) {
        console.error('Failed to comment on GitHub issue:', error.message);
        return false;
    }
}

/**
 * Generate the body/comment for the unconfirmed-signals digest.
 * These are positive change votes that lost the cascade consensus vote —
 * not strong enough for their own issue, but worth a human eyeball.
 * @param {Array<Object>} signalResults - Cascade results with discardedPositives
 * @returns {string} Markdown body
 */
function generateSignalsDigestBody(signalResults) {
    const timestamp = new Date().toISOString().split('T')[0];

    let body = `## Unconfirmed signals — run of ${timestamp}\n\n`;
    body += `The verification cascade recorded ${signalResults.reduce((n, r) => n + r.discardedPositives.length, 0)} `;
    body += `positive change vote(s) that were outvoted by no-change consensus. `;
    body += `They are listed here instead of being dropped silently.\n\n`;
    body += `| Platform | Feature | Model | Confidence | Searched | Claimed change |\n`;
    body += `|---|---|---|---|---|---|\n`;

    for (const result of signalResults) {
        for (const p of result.discardedPositives) {
            const changes = p.changes.map(c => `${c.type}: ${c.detail}`).join('; ').replace(/\|/g, '\\|');
            body += `| ${result.platform} | ${result.feature} | ${p.model} | ${(p.confidence * 100).toFixed(0)}% | ${p.hasSearchEvidence ? '✅' : '❌'} | ${changes} |\n`;
        }
    }

    body += `\nIf a signal recurs across runs, it is probably real — verify manually or run:\n`;
    body += `\`node scripts/verify-features.js --platform <platform> --feature "<feature>"\`\n`;
    body += `\n_Generated by verify-features workflow_\n`;

    return body;
}

/**
 * Generate the closing comment for a signals digest that has gone quiet.
 * @param {number} quietDays - Days since the digest last received a signal
 * @param {number} thresholdDays - Configured quiet-period threshold
 * @returns {string} Markdown comment body
 */
function generateSignalsDigestCloseComment(quietDays, thresholdDays) {
    let body = `**Auto-closed — signals went quiet.**\n\n`;
    body += `No new unconfirmed signals have been appended to this digest in ${quietDays} day(s) `;
    body += `(threshold: ${thresholdDays}). Signals that stop recurring are noise, not findings — `;
    body += `a real change would keep resurfacing as the cascade rotates back over these features.\n\n`;
    body += `Nothing here was acted on as a data change. If a signal listed above still looks real, `;
    body += `verify it directly:\n\n`;
    body += `\`node scripts/verify-features.js --platform <platform> --feature "<feature>"\`\n\n`;
    body += `The next run that records an outvoted positive vote will open a fresh digest.\n\n`;
    body += `_Auto-closed by verify-features workflow_\n`;

    return body;
}

/**
 * Create a GitHub PR using gh CLI
 * @param {string} branch - Branch name
 * @param {string} title - PR title
 * @param {string} body - PR body
 * @returns {string|null} PR URL or null if failed
 */
function createGitHubPR(branch, title, body) {
    try {
        const cmd = `gh pr create --head "${branch}" --title "${title}" --body "${body.replace(/"/g, '\\"')}"`;

        const result = execSync(cmd, { encoding: 'utf-8' });
        return result.trim();
    } catch (error) {
        console.error('Failed to create GitHub PR:', error.message);
        return null;
    }
}

/**
 * Generate staleness report
 * @param {Array<Object>} staleFeatures - Array of stale features
 * @returns {string} Markdown report
 */
function generateStalenessReport(staleFeatures) {
    const timestamp = new Date().toISOString();

    let report = `# Staleness Report - ${timestamp.split('T')[0]}\n\n`;
    report += `Found ${staleFeatures.length} features that haven't been checked in over 7 days.\n\n`;

    // Group by platform
    const byPlatform = {};
    for (const { platform, feature, daysSinceChecked } of staleFeatures) {
        if (!byPlatform[platform.name]) {
            byPlatform[platform.name] = [];
        }
        byPlatform[platform.name].push({ feature, daysSinceChecked });
    }

    for (const [platformName, features] of Object.entries(byPlatform)) {
        report += `## ${platformName}\n\n`;
        report += `| Feature | Days Since Checked | Last Checked |\n`;
        report += `|---------|-------------------|---------------|\n`;

        for (const { feature, daysSinceChecked } of features) {
            const lastChecked = feature.checked || 'Never';
            const days = daysSinceChecked === Infinity ? 'Never' : daysSinceChecked;
            report += `| ${feature.name} | ${days} | ${lastChecked} |\n`;
        }
        report += `\n`;
    }

    return report;
}

/**
 * Print results to console
 * @param {Array<Object>} results - Cascade results
 * @param {Object} summary - Summary statistics
 */
function printResults(results, summary) {
    console.log('\n' + '='.repeat(60));
    console.log('VERIFICATION RESULTS');
    console.log('='.repeat(60));

    console.log(`\nTotal features checked: ${summary.total}`);
    console.log(`  ✓ Adequate no-change observations: ${summary.noChange}`);
    console.log(`  ✓ Confirmed changes: ${summary.confirmed}`);
    console.log(`  ⚠ Contradictions: ${summary.contradiction}`);
    console.log(`  ? Inconclusive: ${summary.inconclusive}`);
    console.log(`  ✗ Errors: ${summary.error}`);
    console.log(`  ⚡ Positive votes discarded (outvoted): ${summary.positivesDiscarded || 0}`);

    // List discarded positive signals — these features were resolved as
    // "no change" but at least one model claimed otherwise.
    const withDiscarded = results.filter(r => (r.discardedPositives || []).length > 0);
    if (withDiscarded.length > 0) {
        console.log('\n' + '-'.repeat(40));
        console.log('DISCARDED SIGNALS (rolled into digest):');
        for (const result of withDiscarded) {
            for (const p of result.discardedPositives) {
                console.log(`  • ${result.platform} → ${result.feature} (${p.model}): ${p.changes.map(c => c.detail).join('; ')}`);
            }
        }
    }

    // List confirmed changes
    const confirmed = results.filter(r => r.outcome === CascadeOutcome.CONFIRMED);
    if (confirmed.length > 0) {
        console.log('\n' + '-'.repeat(40));
        console.log('CHANGE PROPOSALS (PENDING REVIEW):');
        for (const result of confirmed) {
            console.log(`  • ${result.platform} → ${result.feature}`);
            for (const change of result.proposedChanges) {
                console.log(`    - [${change.type}] ${change.detail}`);
            }
        }
    }

    // List contradictions
    const contradictions = results.filter(r => r.outcome === CascadeOutcome.CONTRADICTION);
    if (contradictions.length > 0) {
        console.log('\n' + '-'.repeat(40));
        console.log('CONTRADICTIONS (manual review needed):');
        for (const result of contradictions) {
            console.log(`  • ${result.platform} → ${result.feature}`);
        }
    }

    console.log('\n' + '='.repeat(60));
}

/**
 * Generate a cascade health issue body for degraded providers
 * @param {Object} providerHealth - Per-provider health stats
 * @param {number} totalFeatures - Total features checked
 * @returns {string} Issue body markdown
 */
function generateCascadeHealthIssue(providerHealth, totalFeatures) {
    const timestamp = new Date().toISOString().split('T')[0];

    let body = `## Cascade health report — ${timestamp}\n\n`;
    body += `Checked ${totalFeatures} features. One or more providers have error rates above 80%.\n\n`;
    body += `| Provider | Queries | Errors | Error Rate | No Search Evidence | Last Error |\n`;
    body += `|---|---|---|---|---|---|\n`;

    for (const [name, stats] of Object.entries(providerHealth)) {
        const queriesUsed = stats.total - stats.skipped;
        const errorRate = queriesUsed > 0 ? ((stats.errors / queriesUsed) * 100).toFixed(0) : 'N/A';
        const noSearch = stats.noSearchEvidence || 0;
        const noSearchRate = queriesUsed > 0 ? ((noSearch / queriesUsed) * 100).toFixed(0) : '0';
        const isDegraded = queriesUsed > 0 && ((stats.errors / queriesUsed) > 0.5 || (noSearch / queriesUsed) > 0.5);
        const status = isDegraded ? '**' : '';
        const lastErr = stats.lastError ? stats.lastError.substring(0, 80) : '—';
        body += `| ${status}${name}${status} | ${queriesUsed} | ${stats.errors} | ${errorRate}% | ${noSearch} (${noSearchRate}%) | ${lastErr} |\n`;
    }

    body += `\nProviders in **bold** are degraded (>50% error rate or >50% queries without search evidence).\n`;
    body += `\nCheck API keys, billing, and model IDs for failing providers.\n`;
    body += `\n_Generated by verify-features workflow_\n`;

    return body;
}

module.exports = {
    ensureReportsDir,
    generateMarkdownReport,
    saveReport,
    generatePRBody,
    generateContradictionIssue,
    generateInconclusiveIssue,
    generateConsistencyIssue,
    findExistingIssue,
    findExistingIssueDetails,
    createGitHubIssue,
    commentOnGitHubIssue,
    closeGitHubIssue,
    generateSignalsDigestBody,
    generateSignalsDigestCloseComment,
    createGitHubPR,
    generateStalenessReport,
    generateCascadeHealthIssue,
    printResults,
    REPORTS_DIR
};
