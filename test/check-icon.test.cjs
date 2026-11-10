const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { checkIcon, LIMIT } = require('../scripts/check-icon.js');

function fixture(iconBytes) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'icon-test-'));
  fs.writeFileSync(path.join(dir, 'icon.png'), Buffer.alloc(iconBytes));
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ icon: 'icon.png' }));
  return path.join(dir, 'package.json');
}

test('accepts an icon under the Marketplace limit', () => {
  const r = checkIcon(fixture(63 * 1024));
  assert.equal(r.ok, true);
  assert.equal(r.size, 63 * 1024);
});

test('rejects an icon over the Marketplace limit', () => {
  const r = checkIcon(fixture(LIMIT + 1));
  assert.equal(r.ok, false);
  assert.match(r.reason, /over the/);
});

test('fails when the icon file is missing', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'icon-test-'));
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ icon: 'missing.png' }));
  const r = checkIcon(path.join(dir, 'package.json'));
  assert.equal(r.ok, false);
  assert.match(r.reason, /not found/);
});

test('the repository icon passes the check', () => {
  const r = checkIcon(path.join(__dirname, '..', 'package.json'));
  assert.equal(r.ok, true, r.reason);
});
