const test = require('node:test');
const assert = require('node:assert/strict');
const { browserContext, runAsset } = require('./helpers');

const context = browserContext();
runAsset('assets/api-config.js', context);
runAsset('assets/common.js', context);

test('PPE controls are consolidated into one line', () => {
  const result = context.window.KTMEX.dedupeControls([
    'EPP: casco; lentes.', 'Equipo de protección personal: guantes anticorte.', 'EPP: casco; lentes.', 'Delimitar el área.', 'Delimitar el área.'
  ]);
  assert.equal(result.filter(x => x.startsWith('EPP:')).length, 1);
  assert.equal(result.filter(x => /Delimitar/.test(x)).length, 1);
  assert.match(result[0], /casco/i);
  assert.match(result[0], /guantes/i);
});

test('work permit documents are deduplicated by code', () => {
  assert.equal(Array.from(context.window.KTMEX.dedupeDocuments([
    'KQMS-SA-FO-013 Permiso LOTO', 'KQMS SA FO 013', 'KQMS-SA-FO-008', 'KQMS-SA-FO-008 Corte y soldadura'
  ])).join(','), 'KQMS-SA-FO-013,KQMS-SA-FO-008');
});

