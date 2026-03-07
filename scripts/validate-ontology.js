#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DIRS = {
    capabilities: path.join(ROOT, 'data', 'capabilities'),
    providers: path.join(ROOT, 'data', 'providers'),
    products: path.join(ROOT, 'data', 'products'),
    modelAccess: path.join(ROOT, 'data', 'model-access'),
    platforms: path.join(ROOT, 'data', 'platforms'),
    implementationsFile: path.join(ROOT, 'data', 'implementations', 'index.yml')
};

function parseFrontmatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return { frontmatter: {}, body: content };

    const frontmatter = {};
    match[1].split('\n').forEach(line => {
        const [key, ...rest] = line.split(':');
        if (!key || rest.length === 0) return;
        frontmatter[key.trim()] = rest.join(':').trim();
    });

    return {
        frontmatter,
        body: content.slice(match[0].length).trim()
    };
}

function parseBulletSection(body, heading) {
    const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = body.match(new RegExp(`## ${escaped}\\n\\n([\\s\\S]*?)(?=\\n## |$)`));
    if (!match) return [];
    return match[1]
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('- '))
        .map(line => line.slice(2).trim());
}

function listMarkdownFiles(dir, { includeReadme = false } = {}) {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir)
        .filter(file => file.endsWith('.md'))
        .filter(file => includeReadme || file !== 'README.md')
        .sort();
}

function loadIdRecords(dir, opts = {}) {
    return listMarkdownFiles(dir, opts).map(file => {
        const fullPath = path.join(dir, file);
        const content = fs.readFileSync(fullPath, 'utf8');
        const { frontmatter, body } = parseFrontmatter(content);
        return {
            file,
            path: fullPath,
            id: frontmatter.id || '',
            frontmatter,
            body
        };
    });
}

function loadPlatformRecords(dir) {
    return listMarkdownFiles(dir).map(file => {
        const fullPath = path.join(dir, file);
        const content = fs.readFileSync(fullPath, 'utf8');
        const { frontmatter } = parseFrontmatter(content);
        return {
            file,
            path: fullPath,
            source_file: path.relative(ROOT, fullPath).replace(/\\/g, '/'),
            frontmatter
        };
    });
}

function parseImplementationIndex(filepath) {
    const lines = fs.readFileSync(filepath, 'utf8').split('\n');
    const entries = [];
    let current = null;
    let arrayKey = null;
    let blockKey = null;

    const pushCurrent = () => {
        if (current) entries.push(current);
    };

    for (const rawLine of lines) {
        const line = rawLine.replace(/\r$/, '');

        if (blockKey) {
            if (line.startsWith('    ')) {
                current[blockKey] += `${current[blockKey] ? '\n' : ''}${line.slice(4)}`;
                continue;
            }
            if (line === '') {
                current[blockKey] += '\n';
                continue;
            }
            blockKey = null;
        }

        if (line.startsWith('- id: ')) {
            pushCurrent();
            current = { id: line.slice(6).trim() };
            arrayKey = null;
            continue;
        }

        if (!current) continue;

        const blockMatch = line.match(/^  ([a-z_]+): \|$/);
        if (blockMatch) {
            blockKey = blockMatch[1];
            current[blockKey] = '';
            arrayKey = null;
            continue;
        }

        const emptyArrayMatch = line.match(/^  ([a-z_]+): \[\]$/);
        if (emptyArrayMatch) {
            current[emptyArrayMatch[1]] = [];
            arrayKey = null;
            continue;
        }

        const arrayMatch = line.match(/^  ([a-z_]+):$/);
        if (arrayMatch) {
            current[arrayMatch[1]] = [];
            arrayKey = arrayMatch[1];
            continue;
        }

        if (arrayKey && line.startsWith('    - ')) {
            current[arrayKey].push(line.slice(6).trim());
            continue;
        }

        const scalarMatch = line.match(/^  ([a-z_]+):\s*(.*)$/);
        if (scalarMatch) {
            current[scalarMatch[1]] = scalarMatch[2].trim();
            arrayKey = null;
        }
    }

    pushCurrent();
    return entries;
}

function headingExists(sourceFile, heading) {
    const fullPath = path.join(ROOT, sourceFile);
    if (!fs.existsSync(fullPath)) return false;
    const content = fs.readFileSync(fullPath, 'utf8');
    return content.includes(`\n## ${heading}\n`);
}

function fail(errors, message) {
    errors.push(message);
}

function validate() {
    const errors = [];
    const capabilities = loadIdRecords(DIRS.capabilities);
    const providers = loadIdRecords(DIRS.providers);
    const products = loadIdRecords(DIRS.products);
    const modelAccess = loadIdRecords(DIRS.modelAccess);
    const platforms = loadPlatformRecords(DIRS.platforms);
    const implementations = parseImplementationIndex(DIRS.implementationsFile);

    const capabilityIds = new Set(capabilities.map(record => record.id));
    const providerIds = new Set(providers.map(record => record.id));
    const productIds = new Set(products.map(record => record.id));
    const implementationIds = new Set();
    const platformMetaBySource = new Map(platforms.map(record => [record.source_file, record.frontmatter]));

    capabilities.forEach(record => {
        if (record.id !== record.file.replace(/\.md$/, '')) {
            fail(errors, `Capability filename/id mismatch: ${record.file} -> ${record.id}`);
        }
    });

    providers.forEach(record => {
        if (record.id !== record.file.replace(/\.md$/, '')) {
            fail(errors, `Provider filename/id mismatch: ${record.file} -> ${record.id}`);
        }

        const productsList = parseBulletSection(record.body, 'Products');
        productsList.forEach(productId => {
            if (!productIds.has(productId)) {
                fail(errors, `Provider ${record.id} references missing product: ${productId}`);
            }
        });
    });

    products.forEach(record => {
        if (record.id !== record.file.replace(/\.md$/, '')) {
            fail(errors, `Product filename/id mismatch: ${record.file} -> ${record.id}`);
        }

        if (!providerIds.has(record.frontmatter.provider)) {
            fail(errors, `Product ${record.id} references missing provider: ${record.frontmatter.provider}`);
        }

        if (record.frontmatter.record_source && !fs.existsSync(path.join(ROOT, record.frontmatter.record_source))) {
            fail(errors, `Product ${record.id} has missing record_source: ${record.frontmatter.record_source}`);
        }

        if (record.frontmatter.record_source && platformMetaBySource.get(record.frontmatter.record_source)?.build_visibility === 'archive') {
            fail(errors, `Product ${record.id} points to archived record_source: ${record.frontmatter.record_source}`);
        }

        if (record.frontmatter.source_heading && record.frontmatter.record_source && !headingExists(record.frontmatter.record_source, record.frontmatter.source_heading)) {
            fail(errors, `Product ${record.id} missing source heading: ${record.frontmatter.source_heading}`);
        }
    });

    modelAccess.forEach(record => {
        if (record.file === 'README.md') return;
        if (record.id !== record.file.replace(/\.md$/, '')) {
            fail(errors, `Model access filename/id mismatch: ${record.file} -> ${record.id}`);
        }

        if (!providerIds.has(record.frontmatter.provider)) {
            fail(errors, `Model access ${record.id} references missing provider: ${record.frontmatter.provider}`);
        }

        if (record.frontmatter.record_source && !fs.existsSync(path.join(ROOT, record.frontmatter.record_source))) {
            fail(errors, `Model access ${record.id} has missing record_source: ${record.frontmatter.record_source}`);
        }

        if (record.frontmatter.record_source && platformMetaBySource.get(record.frontmatter.record_source)?.build_visibility === 'archive') {
            fail(errors, `Model access ${record.id} points to archived record_source: ${record.frontmatter.record_source}`);
        }

        if (record.frontmatter.source_heading && record.frontmatter.record_source && !headingExists(record.frontmatter.record_source, record.frontmatter.source_heading)) {
            fail(errors, `Model access ${record.id} missing source heading: ${record.frontmatter.source_heading}`);
        }

        const related = parseBulletSection(record.body, 'Related Capabilities');
        related.forEach(capabilityId => {
            if (!capabilityIds.has(capabilityId)) {
                fail(errors, `Model access ${record.id} references missing capability: ${capabilityId}`);
            }
        });
    });

    implementations.forEach(entry => {
        if (implementationIds.has(entry.id)) {
            fail(errors, `Duplicate implementation id: ${entry.id}`);
        }
        implementationIds.add(entry.id);

        if (!productIds.has(entry.product)) {
            fail(errors, `Implementation ${entry.id} references missing product: ${entry.product}`);
        }

        if (!providerIds.has(entry.provider)) {
            fail(errors, `Implementation ${entry.id} references missing provider: ${entry.provider}`);
        }

        (entry.capabilities || []).forEach(capabilityId => {
            if (!capabilityIds.has(capabilityId)) {
                fail(errors, `Implementation ${entry.id} references missing capability: ${capabilityId}`);
            }
        });

        if (entry.source_file && !fs.existsSync(path.join(ROOT, entry.source_file))) {
            fail(errors, `Implementation ${entry.id} has missing source_file: ${entry.source_file}`);
        }

        if (entry.source_file && platformMetaBySource.get(entry.source_file)?.build_visibility === 'archive') {
            fail(errors, `Implementation ${entry.id} points to archived source_file: ${entry.source_file}`);
        }

        if (entry.source_file && entry.source_heading && !headingExists(entry.source_file, entry.source_heading)) {
            fail(errors, `Implementation ${entry.id} missing source heading: ${entry.source_heading}`);
        }
    });

    return {
        errors,
        summary: {
            capabilities: capabilities.length,
            providers: providers.length,
            products: products.length,
            model_access_records: modelAccess.filter(record => record.file !== 'README.md').length,
            implementations: implementations.length
        }
    };
}

const result = validate();
console.log(JSON.stringify(result.summary, null, 2));

if (result.errors.length) {
    console.error('\nOntology validation failed:\n');
    result.errors.forEach(error => console.error(`- ${error}`));
    process.exit(1);
}

console.log('\nOntology validation passed.');
