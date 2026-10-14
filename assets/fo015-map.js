(function () {
  'use strict';
  window.KTMEX_TEMPLATE_MAPS = Object.freeze({
    JSA: {
      code: 'F-SGA-8.1-7',
      sourceFile: 'F-SGA-8.1-7Análisis de riesgo para trabajos especiales(1).xlsx',
      sha256: 'c36ab53bdb5052ee266061d4356c0bb91469db42cbadf52d98b7d3cc2c71c264',
      sheet: 'JSA',
      printArea: 'A1:S49',
      general: { company: 'C4', period: 'S4', activity: 'C5', schedule: 'S5' },
      firstRow: 9,
      lastRow: 28,
      taskPairs: 10,
      columns: {
        task: 'A', type: 'D', hazardEventConsequence: 'E', severityBefore: 'F', probabilityBefore: 'H',
        categoryBefore: 'K', controls: 'L', severityAfter: 'M', probabilityAfter: 'O', categoryAfter: 'R', documents: 'S'
      },
      note: 'Cada tarea utiliza dos renglones consecutivos: Seguridad y Ambiental.'
    },
    JRA: {
      code: 'KQMS-SA-FO-015',
      revision: '00',
      sourceFile: 'KQMS-SA-FO-015 ANÁLISIS DE RIESGO PARA TRABAJOS RUTINARIOS- JRA Rev.00.xls',
      sha256: '4706a9ad5bcc08eec63a9e56db935dffc34fac8a1e4351bcf708b68b409d1246',
      sheet: 'Analisis de riesgos ',
      printArea: 'A1:AG68',
      general: {
        date: 'B5', folio: 'E5', evaluator: 'G5', department: 'B7', lineMachine: 'E7', processActivity: 'J7',
        hasMoe: 'B9', workCategory: 'S13', activityType: 'AB13'
      },
      chemicals: { firstRow: 24, lastRow: 33, substance: 'C', identifier: 'L', frequency: 'Q', duration: 'R', airborne: 'S', dermal: 'T', engineering: 'U', ppe: 'V' },
      risks: { firstRow: 37, lastRow: 66, task: 'C', potentialRisks: 'K', category: 'S', severity: 'T', frequency: 'U', probability: 'V', control: 'W', uc: 'X', ct: 'Y', notes: 'Z' },
      formulas: { uc: '=IF(COUNTA(T{row}:V{row})>0,SUM(T{row}*U{row}*V{row}),"")', ct: '=IF(COUNTA(T{row}:W{row})>0,SUM(T{row}*U{row}*V{row}*W{row}),"")' },
      limits: { maxChemicalRows: 10, maxRiskRows: 30 },
      note: 'El original oficial está en .xls. Para automatizarlo en Apps Script se debe convertir una copia controlada a Google Sheets y conservar el original sin cambios.'
    }
  });
  window.KTMEX_FO015_MAP = window.KTMEX_TEMPLATE_MAPS.JRA;
})();

