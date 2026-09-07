#!/usr/bin/env node

/**
 * validate-claims.js — cross-check talking-point prose against structured fields
 *
 * Scans every feature block in data/platforms/ (and data/watchlist/) and
 * flags talking points that contradict the availability table, Gating, or
 * Status fields beside them, plus time-bound wording ("temporary",
 * "promotional") older than its verification window.
 *
 * Structured-vs-structured drift is validate-ontology.js territory; this
 * script covers the prose those checks cannot see. See
 * scripts/lib/claims.js for the check catalog.
 *
 * Usage:
 *   node scripts/validate-claims.js             # report; exit 1 on errors
 *   node scripts/validate-claims.js --warnings  # exit 1 on warnings too
 *
 * Errors block CI and canonical publication preparation; warnings remain advisory.
 */

'use strict';

const { loadAllPlatforms } = require('./lib/parser');
const { checkFeatureClaims } = require('./lib/claims');

const strictWarnings = process.argv.includes('--warnings');

const findings = [];
let featureCount = 0;
let talkingPointCount = 0;

for (const platform of loadAllPlatforms()) {
    for (const feature of platform.features) {
        featureCount++;
        if (feature.talking_point) talkingPointCount++;
        for (const issue of checkFeatureClaims(feature, platform)) {
            findings.push({ platform: platform.name, feature: feature.name, ...issue });
        }
    }
}

const errors = findings.filter(f => f.severity === 'error');
const warnings = findings.filter(f => f.severity === 'warning');

console.log(JSON.stringify({
    features: featureCount,
    talking_points: talkingPointCount,
    errors: errors.length,
    warnings: warnings.length
}, null, 2));

for (const list of [errors, warnings]) {
    if (!list.length) continue;
    console.log(`\n${list === errors ? 'Errors' : 'Warnings'}:\n`);
    for (const f of list) {
        console.log(`- [${f.check}] ${f.platform} › ${f.feature}: ${f.message}`);
    }
}

if (errors.length || (strictWarnings && warnings.length)) {
    console.error('\nClaim validation failed.');
    process.exit(1);
}

console.log('\nClaim validation passed.');
