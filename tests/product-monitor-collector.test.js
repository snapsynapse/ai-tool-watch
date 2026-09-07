'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const core = require('../scripts/lib/freshness-contract');
const { collect, validateProducts } = require('../scripts/lib/product-monitor/collector');
const { fetchPage } = require('../scripts/lib/product-monitor/fetch');
const { parseArgs, run: runCli } = require('../scripts/observe-product-sources');

const NOW = '2026-09-06T12:00:00.000Z';
const KINDS = ['release_notes', 'pricing', 'support'];
const FIELDS = { release_notes: 'desktop.surface', pricing: 'plan.pro.price', support: 'region.us.availability' };
const BASELINES = { release_notes: 'available', pricing: '$20/mo', support: 'available' };

function state() {
  return core.emptyState({ reviewPolicy: { owner: 'Sam Rogers', capacityMinutesPerWeek: null, scope: 'six-repo-portfolio' } });
}

function products({ values = {}, duplicate = false, invalid = new Set() } = {}) {
  return ['alpha', 'beta'].map(id => ({
    config: {
      id,
      sources: KINDS.map(kind => ({
        id: `${id}-${kind}`,
        kind,
        url: `https://${id}.example.test/${kind}`,
        expectedHost: `${id}.example.test`,
        claims: [{
          field: FIELDS[kind],
          target: { file: `data/platforms/${id}.md`, feature: kind },
          baseline: BASELINES[kind],
          baselineExcerpt: `Baseline ${kind}`,
        }],
      })),
    },
    parse(_body, { source }) {
      const definition = source.claims[0];
      const claim = {
        field: definition.field,
        value: values[source.id] ?? definition.baseline,
        quote: invalid.has(source.id) ? 'Missing evidence quote' : `Evidence ${source.id}`,
        locator: { source: source.id, section: 'main' },
      };
      return { supported: true, claims: duplicate && source.id === 'alpha-pricing' ? [claim, { ...claim, value: '$99/mo' }] : [claim] };
    },
  }));
}

function response(url) {
  const source = new URL(url).hostname.split('.')[0] + '-' + new URL(url).pathname.slice(1);
  return {
    body: `<nav>Evidence ${source} cosmetic navigation</nav><main><h1>Official publication</h1><p>Evidence ${source}</p></main><footer>Evidence ${source} footer</footer>`,
    httpStatus: 200,
    contentType: 'text/html; charset=utf-8',
    retrievedUrl: url,
  };
}

async function run(options = {}) {
  const captured = [];
  const output = await collect({
    products: products(options),
    state: options.state || state(),
    now: NOW,
    fetcher: async url => {
      if (options.outage === url) {
        const error = new Error('official source unavailable');
        error.receipt = { retrievedUrl: url, retrievedAt: NOW, httpStatus: 503, bytesReceived: 0, status: 'failed' };
        throw error;
      }
      const fetched = response(url);
      if (options.bodyByUrl?.[url] !== undefined) fetched.body = options.bodyByUrl[url];
      return fetched;
    },
    retainRaw: async (_source, receipt) => captured.push(receipt),
    persist: options.persist || (async () => {}),
    checkBaseline: options.checkBaseline || (() => true),
    maxRequests: options.maxRequests ?? 6,
  });
  return { ...output, captured };
}

test('proposes precisely cited plan, surface, regional, and withdrawal changes from fixed official claims', async () => {
  const values = {
    'alpha-release_notes': 'withdrawn',
    'alpha-pricing': '$25/mo',
    'alpha-support': 'unavailable',
    'beta-release_notes': 'withdrawn',
    'beta-pricing': '$30/mo',
    'beta-support': 'unavailable',
  };
  const { report } = await run({ values });
  assert.equal(report.status, 'review_required');
  assert.equal(report.proposals.length, 6);
  assert.deepEqual(new Set(report.proposals.map(item => item.field)), new Set(Object.values(FIELDS)));
  for (const proposal of report.proposals) {
    assert.match(proposal.quote, /^Evidence (alpha|beta)-(release_notes|pricing|support)$/);
    assert.equal(proposal.target.file, `data/platforms/${proposal.product}.md`);
    assert.equal(proposal.sourceUrl, `https://${proposal.product}.example.test/${proposal.target.feature}`);
  }
});

test('ignores cosmetic markup but fails closed on conflicting repeated field claims', async () => {
  const { report } = await run({ values: { 'alpha-pricing': '$25/mo' }, duplicate: true });
  const alphaPricing = report.sources.find(source => source.product === 'alpha' && source.kind === 'pricing');
  assert.equal(report.status, 'degraded');
  assert.equal(alphaPricing.status, 'unavailable');
  assert.match(alphaPricing.reason, /duplicate/);
  assert.equal(report.proposals.filter(item => item.product === 'alpha' && item.field === 'plan.pro.price').length, 0);
});

test('records an official outage as unavailable coverage with a failure receipt and no proposal', async () => {
  const outage = 'https://alpha.example.test/support';
  const { report, captured, state: resultingState } = await run({ outage });
  const source = report.sources.find(item => item.url === outage);
  assert.equal(report.status, 'degraded');
  assert.equal(source.status, 'unavailable');
  assert.match(source.reason, /unavailable/);
  assert.equal(captured.find(item => item.status === 'failed').httpStatus, 503);
  const observation = resultingState.observations[source.observationId];
  assert.equal(observation.coverageQualified, false);
  assert.equal(report.proposals.some(item => item.sourceUrl === outage), false);
});

test('rejects invalid or ambiguous claim evidence without creating a finding', async () => {
  const { report, state: resultingState } = await run({ values: { 'alpha-pricing': '$25/mo' }, invalid: new Set(['alpha-pricing']) });
  const source = report.sources.find(item => item.product === 'alpha' && item.kind === 'pricing');
  assert.equal(source.status, 'unavailable');
  assert.equal(source.provenClaims, 0);
  assert.equal(report.proposals.some(item => item.product === 'alpha' && item.field === 'plan.pro.price'), false);
  assert.equal(Object.values(resultingState.findings).some(item => item.subjectIds.includes('alpha:plan.pro.price')), false);
});

test('does not treat hidden, template, aria-hidden, or inline-hidden claim text as source evidence', async () => {
  const url = 'https://alpha.example.test/pricing';
  const hiddenOnly = `<main><p>Current plan information.</p></main>
    <div hidden>Evidence alpha-pricing</div><template>Evidence alpha-pricing</template>
    <p aria-hidden="true">Evidence alpha-pricing</p><span style="display: none">Evidence alpha-pricing</span>`;
  const { report } = await run({ values: { 'alpha-pricing': '$25/mo' }, bodyByUrl: { [url]: hiddenOnly } });
  const source = report.sources.find(item => item.url === url);
  assert.equal(source.status, 'unavailable');
  assert.equal(report.proposals.some(item => item.sourceUrl === url), false);
});

test('retains one pending finding across repeat evidence and refuses a baseline-drifted source', async () => {
  const values = { 'alpha-pricing': '$25/mo' };
  const first = await run({ values });
  const second = await run({ values, state: first.state });
  const pending = Object.values(second.state.findings).filter(item => item.subjectIds.includes('alpha:plan.pro.price'));
  assert.equal(pending.length, 1);
  assert.equal(pending[0].status, 'pending');

  const drifted = await run({ values, checkBaseline: definition => definition.field !== 'plan.pro.price' });
  const source = drifted.report.sources.find(item => item.product === 'alpha' && item.kind === 'pricing');
  assert.equal(source.status, 'unavailable');
  assert.match(source.reason, /Baseline drift/);
  assert.equal(drifted.report.proposals.some(item => item.product === 'alpha' && item.field === 'plan.pro.price'), false);
});

test('enforces two-product source and fetch-budget guards, and propagates persistence failure', async () => {
  assert.throws(() => validateProducts([products()[0]]), /exactly two distinct products/);
  const malformed = products();
  malformed[0].config.sources.pop();
  assert.throws(() => validateProducts(malformed), /needs release_notes, pricing and support/);
  const wrongTarget = products();
  wrongTarget[0].config.sources[0].claims[0].target.file = 'data/platforms/beta.md';
  assert.throws(() => validateProducts(wrongTarget), /explicit baseline and owning record/);
  await assert.rejects(collect({ products: products(), state: state(), now: NOW, maxRequests: 7 }), /budget must be 1\.\.6/);
  await assert.rejects(run({ persist: async () => { throw new Error('evidence persistence failed'); } }), /evidence persistence failed/);
});

test('rejects unsafe redirects and preserves bounded-byte failure receipts without a synthetic body', async () => {
  await assert.rejects(fetchPage('https://official.example.test/bounds', { timeoutMs: 0 }), /fetch bounds/);
  await assert.rejects(fetchPage('https://official.example.test/bounds', { maxBytes: 0 }), /fetch bounds/);
  await assert.rejects(fetchPage('https://official.example.test/start', {
    fetchImpl: async () => new Response('', { status: 302, headers: { location: 'https://other.example.test/redirect' } }),
  }), /Unexpected official-source redirect/);
  await assert.rejects(fetchPage('https://official.example.test/large', {
    maxBytes: 3,
    fetchImpl: async () => new Response('abcdef', { status: 200 }),
  }), error => {
    assert.match(error.message, /size bound/);
    assert.equal(error.receipt.status, 'failed');
    assert.equal(error.receipt.bytesReceived, 6);
    assert.equal(Object.hasOwn(error.receipt, 'rawBody'), false);
    return true;
  });
});

test('CLI requires live authorization and writes a terminal receipt for a state-load failure', async () => {
  assert.throws(() => parseArgs([]), /Pass --live/);
  assert.throws(() => parseArgs(['--live', '--state']), /Missing state path/);
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'aitoolwatch-product-monitor-cli-'));
  const reports = path.join(root, 'reports');
  const stateFile = path.join(root, 'state.json');
  try {
    await assert.rejects(runCli({ live: false, state: stateFile, reports }), /Live authorization is required/);
    await fs.writeFile(stateFile, '{not-json\n');
    await assert.rejects(runCli({ live: true, state: stateFile, reports }));
    const receipt = JSON.parse(await fs.readFile(path.join(reports, 'failure.json'), 'utf8'));
    assert.equal(receipt.status, 'failed');
    assert.equal(typeof receipt.message, 'string');
    assert.match(receipt.failedAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});
