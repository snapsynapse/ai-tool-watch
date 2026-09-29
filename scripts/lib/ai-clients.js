/**
 * AI Client wrappers for the verification cascade
 * Each client queries its respective AI model for feature verification
 */

/**
 * Provider to model mapping for skip rules
 */
const PROVIDER_MODEL_MAP = {
    'Google': 'gemini',
    'Perplexity AI': 'perplexity',
    'xAI': 'grok',
    'Anthropic': 'claude'
};

/**
 * A successful HTTP response that could not be interpreted as a completion.
 * Keep the provider payload and receipt enumerable so cascade/report layers
 * can retain them when they classify the provider attempt as an error.
 */
class ProviderResponseError extends Error {
    constructor(provider, message, { raw = null, usageReceipt = null, status = 200 } = {}) {
        super(message);
        this.name = 'ProviderResponseError';
        this.provider = provider;
        this.status = status;
        this.raw = raw;
        this.usageReceipt = usageReceipt;
    }
}

/**
 * Return the provider usage fields without inventing values for fields that
 * the provider did not send. The receipt is intentionally a small, stable
 * record that can be retained independently from the provider response.
 *
 * @param {Object|null|undefined} data - Parsed provider response
 * @param {string} [usageField='usage'] - Provider field containing usage
 * @returns {{id: *, model: *, created: *, usage: *}}
 */
function createUsageReceipt(data, usageField = 'usage') {
    return {
        id: data?.id ?? null,
        model: data?.model ?? null,
        created: data?.created ?? null,
        usage: data?.[usageField] ?? null
    };
}

/**
 * Parse a successful JSON response and emit its usage receipt before any
 * provider-specific shape extraction. The logger receives one JSON line so
 * the default logger writes an immediately consumable stdout record while
 * tests and callers can inject a collector.
 *
 * @param {Response} response - Fetch response
 * @param {Function} logger - Receipt logger
 * @param {string} provider - Provider display name for parse errors
 * @param {string} [usageField='usage'] - Provider field containing usage
 * @returns {Promise<{data: Object, usageReceipt: Object}>}
 */
async function parseSuccessfulResponse(response, logger, provider, usageField = 'usage') {
    let data;
    try {
        data = await response.json();
    } catch (cause) {
        const error = new ProviderResponseError(provider, `${provider} API returned invalid JSON`, {
            raw: null,
            usageReceipt: createUsageReceipt(null)
        });
        error.cause = cause;
        throw error;
    }

    const usageReceipt = createUsageReceipt(data, usageField);
    logger(JSON.stringify(usageReceipt));

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw malformedResponseError(provider, data, usageReceipt);
    }

    return { data, usageReceipt };
}

/**
 * Diagnostic: when VERIFY_DEBUG_SHAPE is set, log the key structure of a
 * provider response (keys, array lengths, and https URLs only; no text).
 */
function logResponseShape(logger, provider, data) {
    if (!process.env.VERIFY_DEBUG_SHAPE || process.env.VERIFY_DEBUG_SHAPE === 'false') return;
    const urls = [];
    const walk = (value, depth) => {
        if (typeof value === 'string') {
            if (value.startsWith('https://') && urls.length < 8) urls.push(value.slice(0, 160));
            return 'str';
        }
        if (Array.isArray(value)) {
            return depth > 5 ? `arr(${value.length})` : [`arr(${value.length})`, ...value.slice(0, 2).map(v => walk(v, depth + 1))];
        }
        if (value && typeof value === 'object') {
            if (depth > 5) return 'obj';
            return Object.fromEntries(Object.keys(value).map(k => [k, walk(value[k], depth + 1)]));
        }
        return typeof value;
    };
    const shape = walk(data, 0);
    logger(`SHAPE ${provider} ${JSON.stringify({ shape, urls })}`);
}

/**
 * Preserve the parsed response and receipt when a successful response cannot
 * be interpreted as a provider completion.
 *
 * @param {string} provider - Provider display name
 * @param {Object} raw - Parsed provider response
 * @param {Object} usageReceipt - Parsed usage receipt
 * @returns {Error}
 */
function malformedResponseError(provider, raw, usageReceipt) {
    return new ProviderResponseError(
        provider,
        `${provider} API returned a malformed completion`,
        { raw, usageReceipt }
    );
}

/**
 * @param {Object} options - Optional injectable dependencies
 * @returns {{fetch: Function, logger: Function}}
 */
function resolveClientOptions(options = {}) {
    return {
        fetch: options.fetch || globalThis.fetch,
        logger: options.logger || (line => console.log(line))
    };
}

/**
 * Build the verification prompt for a feature
 * @param {Object} platform - Platform object
 * @param {Object} feature - Feature object
 * @param {string} [claim] - A specific change claimed by another model, to confirm or refute
 * @returns {string} The prompt to send to AI models
 */
function buildVerificationPrompt(platform, feature, claim) {
    const { serializeFeature } = require('./parser');
    const planList = platform.pricing.map(p => p.plan).join(', ');
    const featureUrl = feature.url ? `\n   Current stored URL: ${feature.url}` : '';
    const regional = feature.regional ? `\n   Current stored regional info: "${feature.regional}"` : '';
    const storedData = serializeFeature(feature);

    return `We track ${platform.name}'s "${feature.name}" feature in our reference database.
Here is what we currently have stored:

${storedData}

Please verify whether this data is still accurate by checking:

1. Pricing tier availability:
   - Which subscription plans have access? (Plans for ${platform.name}: ${planList})
   - What are the usage limits per tier (if any)?
   - Does this match our stored availability data above?

2. Platform/surface availability:
   - Is it available on: Windows, macOS, Linux, iOS, Android, web, terminal, API?
   - Does this match our stored platforms data above?

3. Current status:
   - Is it GA (generally available), Beta, Preview, or Deprecated?
   - Does this match our stored status "${feature.status}" above?

4. Access gating:
   - Is it free, paid-only, invite-only, or org-only?
   - Does this match our stored gating "${feature.gating}" above?

5. Regional availability:
   - Is this feature available globally or restricted to certain regions?
   - Any country-specific limitations?${regional}

6. Official URL:
   - What is the official product/feature page URL?
   - Is it still active and accessible?${featureUrl}

7. Recent changes:
   - Any announcements or changes in the last 30 days?

For each section, explicitly state whether our stored data is CORRECT or INCORRECT.
If incorrect, describe exactly what changed. If everything matches, say "no change detected."
Cite official sources where possible.${claim ? `

IMPORTANT — a claimed change needs adjudication:
Another research model checking this same feature reported the following change:
"${claim}"
Search specifically for evidence that CONFIRMS or REFUTES this claim, and state
your verdict on it explicitly with sources. If the claim is real, reflect it in
the relevant numbered section above as INCORRECT stored data.` : ''}`;
}

/**
 * Build X/Twitter-specific prompt for Grok
 * @param {Object} platform - Platform object
 * @param {Object} feature - Feature object
 * @param {string} [claim] - A specific change claimed by another model, to confirm or refute
 * @returns {string} The prompt for Grok X/Twitter search
 */
function buildGrokPrompt(platform, feature, claim) {
    // Map platform names to their official X/Twitter accounts
    const twitterAccounts = {
        'ChatGPT': '@OpenAI',
        'Claude': '@AnthropicAI',
        'Gemini': '@GoogleAI, @Google',
        'Copilot': '@Microsoft, @MicrosoftCopilot',
        'Perplexity': '@perplexity_ai',
        'Grok': '@xai, @gaboratory'
    };

    const accounts = twitterAccounts[platform.name] || `official ${platform.vendor} accounts`;

    const { serializeFeature } = require('./parser');
    const storedData = serializeFeature(feature);

    return `We track ${platform.name}'s "${feature.name}" feature. Here is our current stored data:

${storedData}

Search the web for ${platform.vendor}'s official pricing, help-center, and documentation pages about the "${feature.name}" feature, and search X for recent posts from ${accounts}. Cite the official pages you used.

Look for:
1. Any announcements about pricing changes, new tier availability, or plan restrictions
2. Platform availability updates (desktop apps, mobile apps, web, API)
3. Feature status changes (beta, GA, deprecated)
4. Regional availability announcements (new country rollouts, restrictions)
5. Any changes in the last 30-60 days

Focus on official announcements and verified account posts.
State whether our stored data above is still accurate or if something has changed.
Summarize what you find about current availability and any recent changes.${claim ? `

IMPORTANT — a claimed change needs adjudication:
Another research model checking this same feature reported the following change:
"${claim}"
Search specifically for posts that CONFIRM or REFUTE this claim, and state your
verdict on it explicitly.` : ''}`;
}

/**
 * Gemini Flash client using Google AI Studio API
 */
class GeminiClient {
    constructor(apiKey, options = {}) {
        this.apiKey = apiKey || process.env.GEMINI_API_KEY;
        this.name = 'gemini';
        this.displayName = 'Gemini Flash';
        this.provider = 'Google';
        ({ fetch: this.fetch, logger: this.logger } = resolveClientOptions(options));
    }

    async verify(platform, feature, context = {}) {
        if (!this.apiKey) {
            throw new Error('GEMINI_API_KEY not configured');
        }

        const prompt = buildVerificationPrompt(platform, feature, context.claim);

        const maxRetries = 3;
        let lastError;
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            const response = await this.fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{ text: prompt }]
                        }],
                        generationConfig: {
                            temperature: 0.1,
                            maxOutputTokens: 2048
                        },
                        // Enable search grounding for web results
                        tools: [{
                            google_search: {}
                        }]
                    })
                }
            );

            if (response.status === 429 && attempt < maxRetries - 1) {
                const delay = (attempt + 1) * 5000; // 5s, 10s backoff
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }

            if (!response.ok) {
                lastError = await response.text();
                if (response.status !== 429) {
                    throw new Error(`Gemini API error: ${response.status} - ${lastError}`);
                }
                continue;
            }

            const { data, usageReceipt } = await parseSuccessfulResponse(
                response,
                this.logger,
                this.displayName,
                'usageMetadata'
            );
            logResponseShape(this.logger, this.displayName, data);
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

            if (typeof text !== 'string' || !text) {
                throw malformedResponseError(this.displayName, data, usageReceipt);
            }

            // Grounding chunks carry the retrieved page URLs; webSearchQueries
            // are only the query strings and are not sources.
            const grounding = data.candidates?.[0]?.groundingMetadata || {};
            const sources = (grounding.groundingChunks || [])
                .map(chunk => chunk?.web?.uri)
                .filter(uri => typeof uri === 'string' && uri.length > 0);
            const searchQueries = grounding.webSearchQueries || [];
            const hasSearchEvidence = sources.length > 0;

            return {
                model: this.displayName,
                response: text,
                sources,
                searchQueries,
                hasSearchEvidence,
                raw: data,
                usageReceipt
            };
        }
        throw new Error(`Gemini API error: 429 - rate limited after ${maxRetries} retries`);
    }
}

/**
 * Perplexity client using Sonar API
 */
class PerplexityClient {
    constructor(apiKey, options = {}) {
        this.apiKey = apiKey || process.env.PERPLEXITY_API_KEY;
        this.name = 'perplexity';
        this.displayName = 'Perplexity';
        this.provider = 'Perplexity AI';
        ({ fetch: this.fetch, logger: this.logger } = resolveClientOptions(options));
    }

    async verify(platform, feature, context = {}) {
        if (!this.apiKey) {
            throw new Error('PERPLEXITY_API_KEY not configured');
        }

        const prompt = buildVerificationPrompt(platform, feature, context.claim);

        const response = await this.fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'sonar-pro',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a research assistant verifying AI product feature availability. Provide accurate, factual information with citations.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.1,
                max_tokens: 2048
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Perplexity API error: ${response.status} - ${error}`);
        }

        const { data, usageReceipt } = await parseSuccessfulResponse(
            response,
            this.logger,
            this.displayName
        );
        const text = data.choices?.[0]?.message?.content || '';

        if (typeof text !== 'string' || !text) {
            throw malformedResponseError(this.displayName, data, usageReceipt);
        }
        const citations = data.citations || [];
        const hasSearchEvidence = citations.length > 0;

        return {
            model: this.displayName,
            response: text,
            sources: citations,
            hasSearchEvidence,
            raw: data,
            usageReceipt
        };
    }
}

/**
 * Grok client using xAI API (X/Twitter search)
 */
class GrokClient {
    constructor(apiKey, options = {}) {
        this.apiKey = apiKey || process.env.XAI_API_KEY;
        this.name = 'grok';
        this.displayName = 'Grok (X/Twitter)';
        this.provider = 'xAI';
        ({ fetch: this.fetch, logger: this.logger } = resolveClientOptions(options));
    }

    async verify(platform, feature, context = {}) {
        if (!this.apiKey) {
            throw new Error('XAI_API_KEY not configured');
        }

        // Use X/Twitter-specific prompt for Grok
        const prompt = buildGrokPrompt(platform, feature, context.claim);

        // Responses API with server-side web and X search; chat completions
        // does not search and returns no citations.
        const response = await this.fetch('https://api.x.ai/v1/responses', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'grok-4.3',
                input: [
                    {
                        role: 'system',
                        content: 'You are Grok, verifying AI product feature availability. Search official vendor pages and official X accounts. Report what you find factually and cite sources.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                tools: [{ type: 'web_search' }, { type: 'x_search' }],
                temperature: 0.1,
                max_output_tokens: 2048
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Grok API error: ${response.status} - ${error}`);
        }

        const { data, usageReceipt } = await parseSuccessfulResponse(
            response,
            this.logger,
            this.displayName
        );
        logResponseShape(this.logger, this.displayName, data);
        const messageParts = (Array.isArray(data.output) ? data.output : [])
            .filter(item => item?.type === 'message')
            .flatMap(item => Array.isArray(item.content) ? item.content : []);
        const text = (Array.isArray(data.output) ? data.output : [])
            .filter(item => item?.type === 'message')
            .flatMap(item => Array.isArray(item.content) ? item.content : [])
            .filter(part => part?.type === 'output_text' && typeof part.text === 'string')
            .map(part => part.text)
            .join('\n');

        if (typeof text !== 'string' || !text) {
            throw malformedResponseError(this.displayName, data, usageReceipt);
        }

        const annotationUrls = messageParts
            .flatMap(part => Array.isArray(part?.annotations) ? part.annotations : [])
            .map(annotation => annotation?.url);
        const sources = [...new Set([...(Array.isArray(data.citations) ? data.citations : []), ...annotationUrls]
            .map(citation => typeof citation === 'string' ? citation : citation?.url)
            .filter(url => typeof url === 'string' && url.length > 0))];
        const hasSearchEvidence = sources.length > 0;

        return {
            model: this.displayName,
            response: text,
            sources,
            hasSearchEvidence,
            raw: data,
            usageReceipt
        };
    }
}

/**
 * Claude client using Anthropic API with web search
 */
class ClaudeClient {
    constructor(apiKey, options = {}) {
        this.apiKey = apiKey || process.env.ANTHROPIC_API_KEY;
        this.name = 'claude';
        this.displayName = 'Claude';
        this.provider = 'Anthropic';
        ({ fetch: this.fetch, logger: this.logger } = resolveClientOptions(options));
    }

    async verify(platform, feature, context = {}) {
        if (!this.apiKey) {
            throw new Error('ANTHROPIC_API_KEY not configured');
        }

        const prompt = buildVerificationPrompt(platform, feature, context.claim);

        const response = await this.fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': this.apiKey,
                'anthropic-version': '2023-06-01',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'claude-haiku-4-5',
                max_tokens: 2048,
                tools: [{
                    type: 'web_search_20250305',
                    name: 'web_search'
                }],
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ]
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Claude API error: ${response.status} - ${error}`);
        }

        const { data, usageReceipt } = await parseSuccessfulResponse(
            response,
            this.logger,
            this.displayName
        );

        // Extract text from content blocks
        let text = '';
        const sources = [];
        let hasSearchEvidence = false;

        for (const block of data.content || []) {
            if (block.type === 'text') {
                text += block.text;
                // Server-side web search citations ride on text blocks
                if (Array.isArray(block.citations)) {
                    sources.push(...block.citations);
                }
            }
            // The web_search_20250305 server tool emits server_tool_use
            // and web_search_tool_result blocks; either proves a search ran.
            if (block.type === 'server_tool_use' && block.name === 'web_search') {
                hasSearchEvidence = true;
            }
            if (block.type === 'web_search_tool_result') {
                hasSearchEvidence = true;
            }
        }

        if (typeof text !== 'string' || !text) {
            throw malformedResponseError(this.displayName, data, usageReceipt);
        }

        return {
            model: this.displayName,
            response: text,
            sources,
            hasSearchEvidence,
            raw: data,
            usageReceipt
        };
    }
}

/**
 * Get all available AI clients
 * @returns {Array<Object>} Array of client instances
 */
function getAllClients() {
    return [
        new GeminiClient(),
        new PerplexityClient(),
        new GrokClient(),
        new ClaudeClient()
    ];
}

/**
 * Get clients for cascade, excluding same-provider
 * @param {string} vendorName - The vendor name to skip
 * @returns {Array<Object>} Filtered array of client instances
 */
function getCascadeClients(vendorName) {
    const clients = getAllClients();
    const skipModel = PROVIDER_MODEL_MAP[vendorName];

    if (!skipModel) {
        return clients;
    }

    return clients.filter(client => client.name !== skipModel);
}

module.exports = {
    GeminiClient,
    PerplexityClient,
    GrokClient,
    ClaudeClient,
    getAllClients,
    getCascadeClients,
    buildVerificationPrompt,
    buildGrokPrompt,
    PROVIDER_MODEL_MAP,
    createUsageReceipt,
    ProviderResponseError
};
