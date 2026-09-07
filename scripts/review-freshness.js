#!/usr/bin/env node
'use strict';

// Human review metadata only. This command never edits reference records or sends notices.
const path = require('node:path');
const core = require('./lib/freshness-contract');

function parseArgs(args) {
    const options = { state: path.join(__dirname, '..', 'data', 'maintenance', 'state.json') };
    const allowed = new Set(['state', 'finding', 'status', 'actor', 'reason']);
    for (let index = 0; index < args.length; index += 2) {
        const key = args[index].replace(/^--/, '');
        if (!args[index].startsWith('--') || !allowed.has(key) || !args[index + 1] || args[index + 1].startsWith('--')) throw new Error('Expected --state path, or --finding id --status accepted|rejected|deferred --actor name --reason text');
        if (key !== 'state' && options[key] !== undefined) throw new Error(`Duplicate option: ${key}`);
        options[key] = args[index + 1];
    }
    if (['finding', 'status', 'actor', 'reason'].some(key => options[key] !== undefined) && !['finding', 'status', 'actor', 'reason'].every(key => options[key])) throw new Error('A review decision requires finding, status, actor and reason');
    return options;
}
async function run(args, { write = value => process.stdout.write(value + '\n') } = {}) {
    const options = parseArgs(args);
    const state = await core.loadState(options.state);
    if (options.finding) {
        core.applyReviewDecision(state, options.finding, { actorType: 'human', status: options.status, actor: options.actor, reason: options.reason });
        await core.saveState(options.state, state);
    }
    write(JSON.stringify({ reviewQueue: core.reviewQueueState(state), findings: Object.values(state.findings).sort((a, b) => a.firstSeenAt.localeCompare(b.firstSeenAt) || a.id.localeCompare(b.id)) }, null, 2));
}
if (require.main === module) run(process.argv.slice(2)).catch(error => { console.error(error.message); process.exitCode = 2; });
module.exports = { parseArgs, run };
