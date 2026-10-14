const test = require('node:test');
const assert = require('node:assert/strict');
const { ROOT, browserContext, runAsset } = require('./helpers');

const context = browserContext();
runAsset('assets/fo015-map.js', context);
const maps = context.window.KTMEX_TEMPLATE_MAPS;

test('template maps retain immutable SHA-256 identifiers without publishing private formats', () => {
  for (const map of Object.values(maps)) {
    assert.match(map.sha256,/^[a-f0-9]{64}$/);
    assert.ok(map.sourceFile.endsWith('.xlsx') || map.sourceFile.endsWith('.xls'));
  }
});

test('JRA map preserves 30 risk rows and ten chemical rows', () => {
  assert.equal(maps.JRA.risks.lastRow - maps.JRA.risks.firstRow + 1, 30);
  assert.equal(maps.JRA.chemicals.lastRow - maps.JRA.chemicals.firstRow + 1, 10);
  assert.equal(maps.JRA.revision,'00');
});

test('JSA map preserves ten task pairs', () => {
  assert.equal(maps.JSA.taskPairs,10);
  assert.equal(maps.JSA.lastRow - maps.JSA.firstRow + 1,20);
});

