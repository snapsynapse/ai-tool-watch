'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const packageMetadata = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const registryMetadata = JSON.parse(fs.readFileSync(path.join(ROOT, 'server.json'), 'utf8'));

test('npm metadata exposes the zero-dependency MCP server and only its runtime surface', () => {
    assert.equal(packageMetadata.name, 'ai-tool-watch');
    assert.equal(packageMetadata.mcpName, 'io.github.snapsynapse/ai-tool-watch');
    assert.equal(packageMetadata.bin['ai-tool-watch'], 'scripts/mcp-server.js');
    assert.equal(packageMetadata.main, 'scripts/mcp-server.js');
    assert.equal(packageMetadata.engines.node, '>=20');
    assert.equal(packageMetadata.dependencies, undefined);
    assert.deepEqual(packageMetadata.files, [
        'scripts/mcp-server.js',
        'docs/api/v1/*.json',
        'docs/agents.json',
        'mcp.json',
        'README.md',
        'LICENSE',
        'INTENT.md'
    ]);
});

test('registry metadata matches the npm package candidate and needs no credentials', () => {
    assert.equal(registryMetadata.name, packageMetadata.mcpName);
    assert.equal(registryMetadata.version, packageMetadata.version);
    assert.ok(registryMetadata.description.length <= 100);
    assert.equal(registryMetadata.repository.id, '1138645470');
    assert.equal(registryMetadata.packages.length, 1);

    const npmPackage = registryMetadata.packages[0];
    assert.equal(npmPackage.registryType, 'npm');
    assert.equal(npmPackage.identifier, packageMetadata.name);
    assert.equal(npmPackage.version, packageMetadata.version);
    assert.deepEqual(npmPackage.transport, { type: 'stdio' });
    assert.equal(npmPackage.environmentVariables, undefined);
});

test('runtime and package versions stay aligned', () => {
    const source = fs.readFileSync(path.join(ROOT, 'scripts', 'mcp-server.js'), 'utf8');
    const escapedVersion = packageMetadata.version.replaceAll('.', '\\.');
    assert.match(source, new RegExp(`SERVER_INFO = \\{ name: 'ai-tool-watch', version: '${escapedVersion}' \\}`));
});
