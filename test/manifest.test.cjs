const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const manifest = require('../package.json');

test('extension entry point and contributed themes exist', () => {
  assert.ok(fs.existsSync(path.join(__dirname, '..', manifest.main)));
  assert.ok(manifest.publisher);
  assert.ok(manifest.engines.vscode);
  for (const theme of manifest.contributes.themes) {
    const file = path.join(__dirname, '..', theme.path);
    assert.ok(fs.existsSync(file), theme.path);
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    assert.ok(data.colors && data.tokenColors, theme.path);
  }
});
