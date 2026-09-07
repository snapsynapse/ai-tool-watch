'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const core = require('../scripts/lib/freshness-contract');
const { collect } = require('../scripts/lib/product-monitor/collector');
const copilot = require('../scripts/lib/product-monitor/copilot');
const gemini = require('../scripts/lib/product-monitor/gemini');

const ROOT = path.resolve(__dirname, '..');
const EVALS = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/product-evidence-evals.json'), 'utf8'));
const NOW = '2026-09-07T12:00:00.000Z';
const CANONICAL_FILES = ['data/platforms/copilot.md', 'data/platforms/gemini.md'];

const sortedPairs = pairs => [...pairs].sort(([left], [right]) => left.localeCompare(right));

test('reviewed excerpt evals exercise the full collector with real Copilot and Gemini adapters', async t => {
  const canonicalBefore = Object.fromEntries(CANONICAL_FILES.map(file => [file, fs.readFileSync(path.join(ROOT, file), 'utf8')]));
  const products = [copilot, gemini];
  const sourceByUrl = new Map(products.flatMap(product => product.config.sources.map(source => [source.url, source])));

  for (const scenario of EVALS.cases) {
    await t.test(scenario.id, async () => {
      const bodies = { ...EVALS.baseBodies, ...scenario.overrides };
      const state = core.emptyState({ reviewPolicy: { owner: 'Sam Rogers', capacityMinutesPerWeek: null, scope: 'six-repo-portfolio' } });
      const { state: resultingState, report } = await collect({
        products,
        state,
        now: NOW,
        fetcher: async url => {
          const source = sourceByUrl.get(url);
          assert.ok(source, `unexpected source URL: ${url}`);
          assert.equal(typeof bodies[source.id], 'string', `missing excerpt for ${source.id}`);
          return {
            body: bodies[source.id],
            httpStatus: 200,
            contentType: 'text/html; charset=utf-8',
            retrievedUrl: url,
          };
        },
      });

      const accepted = sortedPairs(report.sources.flatMap(source => (source.assessedClaims || []).map(claim => [claim.field, claim.value])));
      const excluded = new Set(scenario.excludedFields);
      const expectedAccepted = sortedPairs(EVALS.acceptedBaseline.filter(([field]) => !excluded.has(field)));
      const unresolved = report.sources.flatMap(source => source.unprovenFields || []).sort();

      assert.equal(report.requests, 6);
      assert.equal(report.sources.length, 6);
      assert.deepEqual(accepted, expectedAccepted);
      assert.deepEqual(unresolved, [...scenario.unresolvedFields].sort());
      assert.equal(report.proposals.length, 0);
      assert.equal(Object.keys(resultingState.findings).length, 0);
      assert.ok(report.sources.every(source => source.id.startsWith('product-monitor-v2:')));

      const lifecycleSource = report.sources.find(source => source.id === 'product-monitor-v2:copilot-pricing');
      assert.ok(lifecycleSource.unprovenFields.includes('copilot.pricing.copilot_pro.lifecycle'));
      assert.match(lifecycleSource.reason, /unassessed.*copilot\.pricing\.copilot_pro\.lifecycle/i);
      assert.equal(resultingState.observations[lifecycleSource.observationId].coverageQualified, false);

      for (const file of CANONICAL_FILES) {
        assert.equal(fs.readFileSync(path.join(ROOT, file), 'utf8'), canonicalBefore[file]);
      }
    });
  }
});
