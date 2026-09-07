#!/usr/bin/env node
'use strict';

// Validates that a reviewed source change reaches every supported reader from
// one generated docs tree. This is intentionally independent of the builder:
// it checks the human HTML, public API, and the MCP server's actual input.

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = process.env.AI_TOOL_WATCH_ROOT || path.join(__dirname, '..');
const DOCS = path.join(ROOT, 'docs');

function readJson(file) {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function resolveFixture() {
    const implementations = readJson(path.join(DOCS, 'api', 'v1', 'implementations.json')).implementations || [];
    const fixtureId = process.env.AI_TOOL_WATCH_PUBLICATION_FIXTURE || implementations[0]?.id;
    const fixture = implementations.find(item => item.id === fixtureId);
    if (!fixture) throw new Error(`Publication fixture ${fixtureId || '(none)'} is not in the generated implementations API`);
    return fixture;
}

function validatePublication() {
    const fixture = resolveFixture();
    const evidence = readJson(path.join(DOCS, 'api', 'v1', 'evidence.json')).evidence
        .find(item => item.id === fixture.evidence_id);
    if (!evidence) throw new Error(`API evidence is missing fixture ${fixture.evidence_id}`);
    const source = fs.readFileSync(path.join(ROOT, fixture.source_file), 'utf8');
    const requiredEvidenceUrl = evidence.sources[0]?.url;
    for (const value of [fixture.name, fixture.verified, fixture.plans[0]?.notes, requiredEvidenceUrl]) {
        if (!value || !source.includes(value)) throw new Error(`Source does not derive reviewed fixture value for ${fixture.id}`);
    }

    const html = fs.readFileSync(path.join(DOCS, 'implementations.html'), 'utf8');
    for (const value of [fixture.name, fixture.verified, fixture.plans[0]?.notes, requiredEvidenceUrl]) {
        if (!value || !html.includes(value)) throw new Error(`Human implementation view is missing reviewed fixture value for ${fixture.id}`);
    }

    const data = readJson(path.join(DOCS, 'assets', 'data.json'));
    const human = (data.implementations || []).find(item => item.id === fixture.id);
    if (!human || human.verified !== fixture.verified || human.gating !== fixture.gating || !human.plans.includes(fixture.plans[0]?.plan)) throw new Error(`Human data export disagrees with reviewed fixture ${fixture.id}`);

    const mcp = spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'mcp-server.js')], {
        input: `${JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2026-07-28', capabilities: {}, clientInfo: { name: 'publication-validator', version: '1' } } })}\n${JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: 'get_evidence', arguments: { implementation_id: fixture.id } } })}\n${JSON.stringify({ jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'get_product', arguments: { id: fixture.product } } })}\n`,
        encoding: 'utf8',
        env: { ...process.env, AI_TOOL_WATCH_DATA_DIR: path.join(DOCS, 'api', 'v1') }
    });
    if (mcp.status !== 0) throw new Error(`MCP fixture query failed: ${mcp.stderr.trim()}`);
    const responses = mcp.stdout.trim().split('\n').map(line => JSON.parse(line));
    const response = responses.find(item => item.id === 2)?.result;
    if (!response || response.isError) throw new Error(`MCP evidence query failed for ${fixture.id}`);
    const mcpEvidence = JSON.parse(response.content?.[0]?.text || '{}').data;
    if (!mcpEvidence || mcpEvidence.id !== evidence.id || mcpEvidence.verified !== fixture.verified || mcpEvidence.sources?.[0]?.url !== requiredEvidenceUrl) {
        throw new Error(`MCP evidence disagrees with reviewed fixture ${fixture.id}`);
    }

    const productResult = responses.find(item => item.id === 3)?.result;
    if (!productResult || productResult.isError) throw new Error(`MCP product query failed for ${fixture.product}`);
    const product = JSON.parse(productResult.content?.[0]?.text || '{}').data;
    const mcpImplementation = product?.implementation_details?.find(item => item.id === fixture.id);
    if (!mcpImplementation || mcpImplementation.gating !== fixture.gating ||
        mcpImplementation.verified !== fixture.verified ||
        JSON.stringify(mcpImplementation.plans) !== JSON.stringify(fixture.plans)) {
        throw new Error(`MCP feature values disagree with reviewed fixture ${fixture.id}`);
    }

    console.log(`Publication fixture ${fixture.id} is coherent in human HTML, API, and MCP input.`);
    return fixture;
}

if (require.main === module) {
    try { validatePublication(); } catch (error) { console.error(`Publication validation failed: ${error.message}`); process.exitCode = 1; }
}

module.exports = { validatePublication };
