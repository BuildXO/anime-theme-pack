const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const Module = require('node:module');
const { test } = require('node:test');

function loadConstants(appRoot) {
  const originalLoad = Module._load;
  Module._load = function (name, ...args) {
    if (name === 'vscode') return { env: { appRoot }, version: 'test' };
    return originalLoad.call(this, name, ...args);
  };
  try {
    delete require.cache[require.resolve('../out/constants')];
    return require('../out/constants');
  } finally {
    Module._load = originalLoad;
  }
}

for (const layout of ['Code.app/Contents/Resources/app', 'Code/version/resources/app', 'code/resources/app']) {
  test(`uses appRoot for ${layout}`, () => {
    const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'anime-path-'));
    try {
      const appRoot = path.join(temp, layout);
      const workbench = path.join(appRoot, 'out', 'vs', 'workbench');
      fs.mkdirSync(workbench, { recursive: true });
      const desktop = path.join(workbench, 'workbench.desktop.main.css');
      const web = path.join(workbench, 'workbench.web.main.css');
      fs.writeFileSync(desktop, 'desktop');
      fs.writeFileSync(web, 'web');
      let constants = loadConstants(appRoot);
      assert.equal(constants.editorCss, desktop);
      assert.equal(constants.editorCssCopy, `${desktop}.backup`);
      assert.equal(constants.productFile, path.join(appRoot, 'product.json'));
      assert.equal(constants.outDirectory, path.join(appRoot, 'out'));
      fs.unlinkSync(desktop);
      constants = loadConstants(appRoot);
      assert.equal(constants.editorCss, web);
      fs.unlinkSync(web);
      constants = loadConstants(appRoot);
      assert.equal(constants.editorCss, desktop);
      assert.equal(fs.existsSync(constants.editorCss), false);
    } finally {
      fs.rmSync(temp, { recursive: true, force: true });
    }
  });
}
