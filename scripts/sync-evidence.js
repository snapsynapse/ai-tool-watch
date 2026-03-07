#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DIRS = {
    platforms: path.join(ROOT, 'data', 'platforms'),
    products: path.join(ROOT, 'data', 'products'),
    modelAccess: path.join(ROOT, 'data', 'model-access'),
    implementationsFile: path.join(ROOT, 'data', 'implementations', 'index.yml'),
    evidenceFile: path.join(ROOT, 'data', 'evidence', 'index.json')
};

function parseFrontmatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return { frontmatter: {}, body: content };

    const frontmatter = {};
    const lines = match[1].split('\n');

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const keyMatch = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
        if (!keyMatch) continue;

        const key = keyMatch[1].trim();
        const rawValue = keyMatch[2];

        if (rawValue) {
            frontmatter[key] = rawValue.trim();
            continue;
        }

        const items = [];
        let j = i + 1;
        while (j < lines.length) {
            const itemMatch = lines[j].match(/^\s*-\s+(.*)$/);
            if (itemMatch) {
                items.push(itemMatch[1].trim());
                j++;
                continue;
            }
            if (lines[j].trim() === '') {
                j++;
                continue;
            }
            break;
        }

        frontmatter[key] = items.length ? items : '';
        i = j - 1;
    }

    return {
        frontmatter,
        body: content.slice(match[0].length).trim()
    };
}

function parseTable(tableText) {
    const lines = tableText.trim().split('\n').filter(Boolean);
    if (lines.length < 2) return [];

    const headers = lines[0].split('|').map(h => h.trim()).filter(Boolean);
    const rows = [];
    for (let i = 2; i < lines.length; i++) {
        const cells = lines[i].split('|').map(c => c.trim()).filter(Boolean);
        const row = {};
        headers.forEach((header, idx) => {
            row[header.toLowerCase().replace(/\s+/g, '_')] = cells[idx] || '';
        });
        rows.push(row);
    }
    return rows;
}

function parseFeature(section) {
    const trimmed = section.trim();
    const lines = trimmed.split('\n');
    const nameMatch = lines[0].match(/^## (.+)/);
    if (!nameMatch) return null;

    const feature = {
        name: nameMatch[1],
        launched: '',
        verified: '',
        checked: '',
        sources: [],
        changelog: []
    };

    const propTableMatch = trimmed.match(/\| Property \| Value \|[\s\S]*?\n\n/);
    if (propTableMatch) {
        const props = parseTable(propTableMatch[0]);
        props.forEach(row => {
            if (row.property === 'Launched') feature.launched = row.value;
            if (row.property === 'Verified') feature.verified = row.value;
            if (row.property === 'Checked') feature.checked = row.value;
        });
    }

    const sourcesMatch = trimmed.match(/### Sources\n\n([\s\S]*?)(?=\n###|\n---|\n## |$)/);
    if (sourcesMatch) {
        const sourceLines = sourcesMatch[1].match(/\[([^\]]+)\]\(([^)]+)\)/g) || [];
        feature.sources = sourceLines.map(line => {
            const match = line.match(/\[([^\]]+)\]\(([^)]+)\)/);
            return match ? { title: match[1], url: match[2] } : null;
        }).filter(Boolean);
    }

    const changelogMatch = trimmed.match(/### Changelog\n\n([\s\S]*?)(?=\n---|\n## |$)/);
    if (changelogMatch) {
        feature.changelog = parseTable(changelogMatch[1]).map(row => ({
            date: row.date || '',
            change: row.change || ''
        }));
    }

    return feature;
}

function parsePlatform(filepath) {
    const content = fs.readFileSync(filepath, 'utf8');
    const { frontmatter, body } = parseFrontmatter(content);
    const featureSections = body.split(/\n---\n/).slice(1);
    return {
        ...frontmatter,
        source_file: path.relative(ROOT, filepath).replace(/\\/g, '/'),
        features: featureSections.map(parseFeature).filter(Boolean)
    };
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

function buildSourceLookup() {
    const files = listMarkdownFiles(DIRS.platforms);
    const platforms = files.map(file => parsePlatform(path.join(DIRS.platforms, file)));
    const lookup = new Map();

    platforms.forEach(platform => {
        platform.features.forEach(feature => {
            lookup.set(`${platform.source_file}::${feature.name}`, { platform, feature });
        });
    });

    return lookup;
}

function buildEvidenceRecords() {
    const featureLookup = buildSourceLookup();
    const implementations = parseImplementationIndex(DIRS.implementationsFile);
    const products = loadIdRecords(DIRS.products);
    const modelAccess = loadIdRecords(DIRS.modelAccess);
    const records = [];

    implementations.forEach(entry => {
        const source = featureLookup.get(`${entry.source_file}::${entry.source_heading}`);
        if (!source) return;
        records.push({
            id: `implementation-${entry.id}`,
            entity_type: 'implementation',
            entity_id: entry.id,
            source_file: entry.source_file,
            source_heading: entry.source_heading,
            launched: source.feature.launched || '',
            verified: source.feature.verified || '',
            checked: source.feature.checked || '',
            sources: source.feature.sources || [],
            changelog: source.feature.changelog || [],
            notes: ''
        });
    });

    products.forEach(record => {
        const lookupKey = record.frontmatter.record_source && record.frontmatter.source_heading
            ? `${record.frontmatter.record_source}::${record.frontmatter.source_heading}`
            : null;
        const source = lookupKey ? featureLookup.get(lookupKey) : null;
        const pricingSource = record.frontmatter.pricing_page
            ? [{ title: `${record.frontmatter.name || record.id} pricing`, url: record.frontmatter.pricing_page }]
            : [];

        records.push({
            id: `product-${record.id}`,
            entity_type: 'product',
            entity_id: record.id,
            source_file: record.frontmatter.record_source || '',
            source_heading: record.frontmatter.source_heading || '',
            launched: source?.feature?.launched || '',
            verified: source?.feature?.verified || record.frontmatter.last_verified || '',
            checked: source?.feature?.checked || record.frontmatter.last_verified || '',
            sources: source?.feature?.sources || pricingSource,
            changelog: source?.feature?.changelog || [],
            notes: source ? '' : 'Seeded from product metadata during ontology migration.'
        });
    });

    modelAccess.forEach(record => {
        if (record.file === 'README.md') return;
        const source = featureLookup.get(`${record.frontmatter.record_source}::${record.frontmatter.source_heading}`);
        if (!source) return;
        records.push({
            id: `model-access-${record.id}`,
            entity_type: 'model_access',
            entity_id: record.id,
            source_file: record.frontmatter.record_source,
            source_heading: record.frontmatter.source_heading,
            launched: source.feature.launched || '',
            verified: source.feature.verified || record.frontmatter.last_verified || '',
            checked: source.feature.checked || record.frontmatter.last_verified || '',
            sources: source.feature.sources || [],
            changelog: source.feature.changelog || [],
            notes: ''
        });
    });

    return records.sort((a, b) => {
        const typeDelta = a.entity_type.localeCompare(b.entity_type);
        if (typeDelta !== 0) return typeDelta;
        return a.entity_id.localeCompare(b.entity_id);
    });
}

function main() {
    const records = buildEvidenceRecords();
    const outputDir = path.dirname(DIRS.evidenceFile);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(DIRS.evidenceFile, `${JSON.stringify(records, null, 2)}\n`);
    console.log(`Synced ${records.length} evidence records to ${DIRS.evidenceFile}`);
}

main();
