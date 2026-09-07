#!/usr/bin/env node
'use strict';

// Publication gates must not depend on third-party live link availability.
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const root = path.join(__dirname, '..');
const tests = fs.readdirSync(path.join(root, 'tests'))
    .filter(name => name.endsWith('.test.js') && name !== 'smoke-live.test.js')
    .sort()
    .map(name => path.join(root, 'tests', name));
if (!tests.length) throw new Error('No offline tests found');
const result = spawnSync(process.execPath, ['--test', ...tests], { cwd: root, stdio: 'inherit' });
process.exitCode = result.status === null ? 1 : result.status;
