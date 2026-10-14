const test = require('node:test');
const assert = require('node:assert/strict');
const { browserContext, runAsset } = require('./helpers');

const context = browserContext();
runAsset('assets/catalog.js', context);
runAsset('assets/criteria.js', context);
const criteria = context.window.KTMEX_CRITERIA;
const adapted = criteria.adaptCatalog(context.window.KTMEX_CATALOG);

test('JSA criteria reproduces the official 1-20 matrix categories', () => {
  const expected = new Map([[1,'E'],[2,'E'],[3,'E'],[4,'D'],[5,'C'],[6,'C'],[8,'C'],[9,'B'],[10,'B'],[12,'B'],[15,'A'],[16,'A'],[20,'A']]);
  for (let s=1;s<=4;s++) for (let p=1;p<=5;p++) {
    const level = criteria.levelOf(s,p,'initial');
    assert.equal(level.code, expected.get(s*p), `S=${s}, P=${p}`);
  }
});

test('fatal severity keeps at least the official low floor', () => {
  assert.equal(criteria.levelOf(4,1,'initial').code, 'D');
  assert.equal(criteria.levelOf(4,1,'residual').code, 'D');
});

test('adapted JSA severities use the official four values', () => {
  assert.ok(adapted.riesgos.every(r => [1,2,3,4].includes(r.severidad)));
  assert.equal(Array.from(adapted.severidades, x => x.valor).join(','), '1,2,3,4');
});

test('only grave residual JSA risk is blocked in the pilot rule', () => {
  assert.equal(criteria.blocks(criteria.levelOf(4,5,'residual'),'JSA'), true);
  assert.equal(criteria.blocks(criteria.levelOf(3,4,'residual'),'JSA'), false);
});

