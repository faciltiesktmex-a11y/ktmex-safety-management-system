const test = require('node:test');
const assert = require('node:assert/strict');
const { browserContext, runAsset } = require('./helpers');

const context = browserContext();
runAsset('assets/catalog.js', context);
const catalog = context.window.KTMEX_CATALOG;

test('catalog contains the fifteen requested activities', () => {
  assert.equal(catalog.activities.length, 15);
  assert.equal(Array.from(catalog.activities, a => a.id).join(','), Array.from({length:15},(_,i)=>`ACT-${String(i+1).padStart(3,'0')}`).join(','));
});

test('all task and context risk references exist', () => {
  const riskIds = new Set(catalog.risks.map(r => r.id));
  for (const activity of catalog.activities) for (const task of activity.tasks) {
    for (const id of [...task.risks, ...task.aspects]) assert.ok(riskIds.has(id), `${activity.id}/${task.task}: ${id}`);
  }
  for (const [contextId, rule] of Object.entries(catalog.contextRules)) {
    assert.ok(catalog.questions.some(q => q.id === contextId));
    for (const id of [...rule.risks, ...rule.aspects]) assert.ok(riskIds.has(id), `${contextId}: ${id}`);
  }
});

test('permit references are unique and valid', () => {
  const permitIds = new Set(catalog.permits.map(p => p.id));
  assert.equal(permitIds.size, 8);
  for (const activity of catalog.activities) for (const id of activity.basePermits) assert.ok(permitIds.has(id));
  for (const rule of Object.values(catalog.contextRules)) for (const id of rule.permits) assert.ok(permitIds.has(id));
});

test('draft catalog cannot be confused with a published catalog', () => {
  assert.equal(catalog.catalogStatus, 'DRAFT');
  assert.match(catalog.status, /NO APROBADO/i);
  assert.ok(catalog.risks.every(r => r.status === 'DRAFT'));
});

