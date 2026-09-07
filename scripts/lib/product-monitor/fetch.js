'use strict';
const crypto = require('node:crypto');
async function fetchPage(url, { fetchImpl = fetch, timeoutMs = 30000, maxBytes = 5000000 } = {}) {
    if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 30000 || !Number.isSafeInteger(maxBytes) || maxBytes < 1 || maxBytes > 5000000) throw new Error('Official fetch bounds require positive integers within 30 seconds and 5 MB');
    const initial = new URL(url);
    if (initial.protocol !== 'https:' || initial.username || initial.password || initial.port) throw new Error('Unexpected official-source URL');
    const allowedHost = initial.hostname.replace(/^www\./, '');
    const controller = new AbortController(), timer = setTimeout(() => controller.abort(), timeoutMs);
    let current = url, httpStatus = null, bytesReceived = 0;
    try {
        for (let hop = 0; hop <= 3; hop++) {
            const response = await fetchImpl(current, { redirect: 'manual', signal: controller.signal,
                headers: { Accept:'text/html,application/xhtml+xml', 'User-Agent':'AIToolWatch-monitor/1.0 (+https://aitool.watch/)' } });
            httpStatus = response.status;
            if ([301,302,303,307,308].includes(httpStatus)) {
                const location = response.headers.get('location'); await response.body?.cancel();
                if (!location) throw new Error('Official redirect missing location');
                const target = new URL(location, current);
                if (target.protocol !== 'https:' || target.hostname.replace(/^www\./, '') !== allowedHost || target.username || target.password || target.port) throw new Error('Unexpected official-source redirect');
                current = target.href; continue;
            }
            const chunks = []; bytesReceived = 0;
            if (response.body) for await (const chunk of response.body) {
                bytesReceived += chunk.length;
                if (bytesReceived > maxBytes) { controller.abort(); throw new Error('Official-source response exceeds size bound'); }
                chunks.push(Buffer.from(chunk));
            }
            const rawBody = Buffer.concat(chunks);
            return { body: rawBody.toString('utf8'), rawBody, httpStatus, contentType: response.headers.get('content-type') || '',
                retrievedUrl: current, retrievedAt: new Date().toISOString(), bytesReceived,
                rawContentHash: crypto.createHash('sha256').update(rawBody).digest('hex') };
        }
        throw new Error('Official-source redirect bound exceeded');
    } catch (error) {
        error.receipt = { retrievedUrl: current, retrievedAt: new Date().toISOString(), httpStatus, bytesReceived, status:'failed', failureReason:error.message };
        throw error;
    } finally { clearTimeout(timer); }
}
module.exports = { fetchPage };
