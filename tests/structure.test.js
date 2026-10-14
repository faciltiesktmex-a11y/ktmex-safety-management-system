const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { ROOT } = require('./helpers');

const pages=['index.html','jsa.html','jra.html','dc3.html','contractors.html','catalogs.html'];
const assets=['portal.css','api-config.js','common.js','catalog.js','criteria.js','fo015-map.js','xlsx-fill.js','jra.js','dc3.js','contractors.js','catalogs.js'];

test('all pages and referenced local assets exist', () => {
  for(const page of pages){const html=fs.readFileSync(path.join(ROOT,page),'utf8');assert.match(html,/KTMEX/);for(const match of html.matchAll(/(?:src|href)="(assets\/[^"]+)"/g))assert.ok(fs.existsSync(path.join(ROOT,match[1])),`${page}: ${match[1]}`);}
  for(const asset of assets)assert.ok(fs.existsSync(path.join(ROOT,'assets',asset)),asset);
});

test('all browser JavaScript parses', () => {
  for(const asset of assets.filter(x=>x.endsWith('.js'))){const source=fs.readFileSync(path.join(ROOT,'assets',asset),'utf8');assert.doesNotThrow(()=>new vm.Script(source,{filename:asset}));}
});

test('public configuration contains no credentials and keeps safe pilot defaults', () => {
  const source=fs.readFileSync(path.join(ROOT,'assets','api-config.js'),'utf8');
  assert.doesNotMatch(source,/(password|contrase(?:n|ñ)a)\s*[:=]\s*['"][^'"]+/i);
  assert.doesNotMatch(source,/1[A-Za-z0-9_-]{30,}/);
  assert.match(source,/requireAuth:\s*false/);
  assert.match(source,/enableDc3Upload:\s*false/);
});

test('every primary page links to DC3', () => {
  for(const page of pages){const html=fs.readFileSync(path.join(ROOT,page),'utf8');assert.match(html,/href="dc3\.html"/,page);}
});

