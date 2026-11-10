// Verifies the extension icon stays under the VS Code Marketplace limit (1024 KB).
// vsce does not enforce this, so packaging can succeed while the Marketplace upload fails.
const fs = require('fs');
const path = require('path');

const LIMIT = 1024 * 1024; // 1024 KB, the Marketplace's stated maximum

function checkIcon(pkgPath, limit = LIMIT) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  if (!pkg.icon) {
    return { ok: true, skipped: true };
  }
  const iconPath = path.join(path.dirname(pkgPath), pkg.icon);
  if (!fs.existsSync(iconPath)) {
    return { ok: false, reason: `icon file not found: ${pkg.icon}` };
  }
  const size = fs.statSync(iconPath).size;
  if (size > limit) {
    return { ok: false, size, reason: `${pkg.icon} is ${size} bytes, over the ${limit}-byte Marketplace limit` };
  }
  return { ok: true, size };
}

if (require.main === module) {
  const result = checkIcon(path.join(__dirname, '..', 'package.json'));
  if (result.skipped) {
    console.log('check-icon: no "icon" set in package.json, nothing to verify');
  } else if (!result.ok) {
    console.error('check-icon: ' + result.reason);
    process.exit(1);
  } else {
    console.log(`check-icon: ${JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8')).icon} is ${result.size} bytes (limit ${LIMIT})`);
  }
}

module.exports = { checkIcon, LIMIT };
