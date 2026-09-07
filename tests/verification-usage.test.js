/**
 * Provider response usage retention tests.
 *
 * Run: node --test tests/verification-usage.test.js
 */

'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const {
    GeminiClient,
    PerplexityClient,
    GrokClient,
    ClaudeClient,
    ProviderResponseError
} = require('../scripts/lib/ai-clients');

const platform = {
    name: 'Fixture Platform',
    vendor: 'Fixture Vendor',
    pricing: [{ plan: 'Free' }]
};

const feature = {
    name: 'Fixture feature',
    category: 'test',
    status: 'GA',
    gating: 'free',
    availability: [],
    platforms: []
};

function jsonResponse(body, status = 200) {
    return {
        ok: status >= 200 && status < 300,
        status,
        async json() {
            return body;
        },
        async text() {
            return JSON.stringify(body);
        }
    };
}

function fixtureFetch(body, status = 200) {
    return async () => jsonResponse(body, status);
}

function testOptions(body, logs, status = 200) {
    return {
        fetch: fixtureFetch(body, status),
        logger: line => logs.push(line)
    };
}

describe('provider usage receipts', () => {
    it('retains and logs a Perplexity receipt before extracting completion data', async () => {
        const logs = [];
        const raw = {
            id: 'pplx-request-1',
            model: 'sonar-pro',
            created: 1760000000,
            usage: { prompt_tokens: 12, completion_tokens: 34, total_tokens: 46 },
            citations: ['https://example.com/source'],
            choices: [{ message: { content: '1. Pricing: CORRECT.' } }]
        };

        const result = await new PerplexityClient('fixture-key', testOptions(raw, logs))
            .verify(platform, feature);

        assert.strictEqual(result.raw, raw);
        assert.deepStrictEqual(result.usageReceipt, {
            id: 'pplx-request-1',
            model: 'sonar-pro',
            created: 1760000000,
            usage: raw.usage
        });
        assert.deepStrictEqual(logs, [JSON.stringify(result.usageReceipt)]);
    });

    it('retains raw response and usage receipt when Perplexity completion shape is malformed', async () => {
        const logs = [];
        const raw = {
            id: 'pplx-malformed-1',
            model: 'sonar-pro',
            created: 1760000001,
            usage: { prompt_tokens: 3, completion_tokens: 0, total_tokens: 3 },
            choices: []
        };

        await assert.rejects(
            () => new PerplexityClient('fixture-key', testOptions(raw, logs)).verify(platform, feature),
            error => {
                assert.ok(error instanceof ProviderResponseError);
                assert.match(error.message, /malformed completion/);
                assert.strictEqual(error.raw, raw);
                assert.deepStrictEqual(error.usageReceipt, {
                    id: raw.id,
                    model: raw.model,
                    created: raw.created,
                    usage: raw.usage
                });
                return true;
            }
        );
        assert.deepStrictEqual(logs, [JSON.stringify({
            id: raw.id,
            model: raw.model,
            created: raw.created,
            usage: raw.usage
        })]);
    });

    it('maps Gemini usageMetadata and leaves missing receipt fields null', async () => {
        const logs = [];
        const raw = {
            usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 20 },
            candidates: [{ content: { parts: [{ text: '1. Pricing: CORRECT.' }] } }]
        };

        const result = await new GeminiClient('fixture-key', testOptions(raw, logs))
            .verify(platform, feature);

        assert.deepStrictEqual(result.usageReceipt, {
            id: null,
            model: null,
            created: null,
            usage: raw.usageMetadata
        });
        assert.deepStrictEqual(JSON.parse(logs[0]), result.usageReceipt);
    });

    it('retains xAI usage without fabricating missing fields', async () => {
        const logs = [];
        const raw = {
            id: 'xai-request-1',
            model: 'grok-4-1-fast-non-reasoning',
            created: 1760000002,
            usage: { prompt_tokens: 8, completion_tokens: 13, total_tokens: 21 },
            choices: [{ message: { content: '1. Pricing: CORRECT.' } }]
        };

        const result = await new GrokClient('fixture-key', testOptions(raw, logs))
            .verify(platform, feature);

        assert.deepStrictEqual(result.usageReceipt, {
            id: raw.id,
            model: raw.model,
            created: raw.created,
            usage: raw.usage
        });
    });

    it('retains Anthropic usage without fabricating zero values', async () => {
        const logs = [];
        const raw = {
            id: 'msg_fixture_1',
            model: 'claude-haiku-4-5',
            usage: { input_tokens: 5, output_tokens: 7 },
            content: [{ type: 'text', text: '1. Pricing: CORRECT.' }]
        };

        const result = await new ClaudeClient('fixture-key', testOptions(raw, logs))
            .verify(platform, feature);

        assert.deepStrictEqual(result.usageReceipt, {
            id: raw.id,
            model: raw.model,
            created: null,
            usage: raw.usage
        });
        assert.equal(result.usageReceipt.created, null);
        assert.notEqual(result.usageReceipt.usage, 0);
    });
});
