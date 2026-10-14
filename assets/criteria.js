(function () {
  'use strict';

  const levels = [
    { index: 1, code: 'E', name: '[E] Mínimo', min: 1, max: 3, color: '#2e7d32' },
    { index: 2, code: 'D', name: '[D] Bajo', min: 4, max: 4, color: '#6c8d3d' },
    { index: 3, code: 'C', name: '[C] Medio', scores: [5,6,8], color: '#b48a00' },
    { index: 4, code: 'B', name: '[B] Elevado', scores: [9,10,12], color: '#d97706' },
    { index: 5, code: 'A', name: '[A] Grave', min: 15, max: 20, color: '#b42318' }
  ];

  const severity = [
    { value: 1, name: 'MENOR', floorInitial: 1, floorResidual: 1 },
    { value: 2, name: 'MODERADA', floorInitial: 1, floorResidual: 1 },
    { value: 3, name: 'CRÍTICA', floorInitial: 1, floorResidual: 1 },
    { value: 4, name: 'FATAL', floorInitial: 2, floorResidual: 2 }
  ];

  const controls = [
    { id: 'none', name: 'Sin control verificado', rank: 0, maxReduction: 0 },
    { id: 'ppe', name: 'EPP', rank: 1, maxReduction: 1 },
    { id: 'administrative', name: 'Administrativo / procedimiento', rank: 2, maxReduction: 1 },
    { id: 'engineering', name: 'Ingeniería', rank: 3, maxReduction: 2 },
    { id: 'substitution', name: 'Sustitución', rank: 4, maxReduction: 3 },
    { id: 'elimination', name: 'Eliminación', rank: 5, maxReduction: 4 }
  ];

  function levelForScore(score) {
    return levels.find(item => item.scores ? item.scores.includes(score) : score >= item.min && score <= item.max) ||
      (score < 1 ? levels[0] : levels[levels.length - 1]);
  }

  function levelOf(severityValue, probabilityValue, phase) {
    const s = clamp(Number(severityValue), 1, 4);
    const p = clamp(Number(probabilityValue), 1, 5);
    const score = s * p;
    let level = levelForScore(score);
    const definition = severity.find(item => item.value === s) || severity[0];
    const floor = phase === 'residual' ? definition.floorResidual : definition.floorInitial;
    let floorApplied = false;
    if (level.index < floor) { level = levels[floor - 1]; floorApplied = true; }
    return Object.assign({}, level, { score, floorApplied });
  }

  function control(id) { return controls.find(item => item.id === id) || controls[0]; }
  function minResidual(initialProbability, controlId) {
    return Math.max(1, clamp(Number(initialProbability), 1, 5) - control(controlId).maxReduction);
  }
  function defaultResidual(initialProbability, controlId) { return minResidual(initialProbability, controlId); }

  function inferControl(texts) {
    const joined = normalize((texts || []).join(' '));
    if (/eliminar|retirar la fuente|suprimir/.test(joined)) return 'elimination';
    if (/sustituir|reemplazar por/.test(joined)) return 'substitution';
    if (/guarda|interlock|barandal|barrera fisica|extraccion localizada|ventilacion|plataforma fija|contencion secundaria|cubierta resistente|ingenier/.test(joined)) return 'engineering';
    if (/procedimiento|permiso|loto|bloquear|delimitar|senalizar|inspeccionar|vigia|plan de izaje|coordinar/.test(joined)) return 'administrative';
    if (/\bepp\b|equipo de proteccion personal|casco|guante|lentes|careta|arnes|respirador/.test(joined)) return 'ppe';
    return 'none';
  }

  function blocks(level, documentType) {
    if (documentType === 'JSA') return level.index >= 5;
    return false;
  }
  function blockingNames(documentType) { return documentType === 'JSA' ? ['[A] Grave'] : []; }

  function adaptCatalog(source) {
    if (!source) throw new Error('No se cargó el catálogo de riesgos.');
    const cloned = Object.assign({}, source);
    const originalRisks = source.risks || source.riesgos || [];
    const originalActivities = source.activities || source.actividades || [];
    const originalPermits = source.permits || source.permisos || [];
    const originalQuestions = source.questions || source.preguntasContexto || [];
    const originalRules = source.contextRules || source.reglasContexto || {};
    cloned.riesgos = originalRisks.map(item => {
      const raw = Number(item.jsaSeverity || item.severity || item.severidad || 1);
      const officialSeverity = raw <= 4 && item.jsaSeverity ? raw : fromFivePointSeverity(raw);
      return Object.assign({}, item, {
        id: item.id, tipo: item.tipo || item.type, peligro: item.peligro || item.hazard,
        riesgo: item.riesgo || item.event, consecuencia: item.consecuencia || item.consequence,
        severidad: officialSeverity, probabilidad: clamp(Number(item.probabilidad || item.probability || 1),1,5),
        controles: (item.controles || item.controls || []).slice(), documentos: (item.documentos || item.documents || []).slice()
      });
    });
    cloned.actividades = originalActivities.map(item => Object.assign({}, item, {
      nombre: item.nombre || item.name,
      permisosBase: (item.permisosBase || item.basePermits || []).slice(),
      pasos: (item.pasos || item.tasks || []).map(step => Object.assign({}, step, {
        tarea: step.tarea || step.task,
        riesgos: (step.riesgos || step.risks || []).slice(),
        aspectos: (step.aspectos || step.aspects || []).slice()
      }))
    }));
    cloned.permisos = originalPermits.map(item => Object.assign({}, item, { codigo:item.codigo || item.code, nombre:item.nombre || item.name }));
    cloned.preguntasContexto = originalQuestions.map(item => Object.assign({}, item, { etiqueta:item.etiqueta || item.label, ayuda:item.ayuda || item.help }));
    cloned.reglasContexto = Object.fromEntries(Object.entries(originalRules).map(([key,item]) => [key, Object.assign({}, item, {
      riesgos:(item.riesgos || item.risks || []).slice(), aspectos:(item.aspectos || item.aspects || []).slice(), permisos:(item.permisos || item.permits || []).slice()
    })]));
    cloned.severidades = severity.map(item => ({ valor:item.value, etiqueta:item.name }));
    cloned.probabilidades = [
      { valor:1, etiqueta:'REMOTA' }, { valor:2, etiqueta:'AISLADA' }, { valor:3, etiqueta:'OCASIONAL' },
      { valor:4, etiqueta:'RECURRENTE' }, { valor:5, etiqueta:'FRECUENTE' }
    ];
    return cloned;
  }

  function fromFivePointSeverity(value) {
    if (value >= 5) return 4;
    if (value >= 4) return 3;
    if (value >= 3) return 2;
    return 1;
  }
  function normalize(value) { return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(); }
  function clamp(value,min,max) { return Math.max(min,Math.min(max,Number.isFinite(value) ? value : min)); }

  window.KTMEX_CRITERIA = Object.freeze({
    version: 'JSA-F-SGA-8.1-7-DRAFT-MAPPING-2026-10-14',
    status: 'Mapeo técnico en borrador; requiere aprobación de Safety y Ambiental',
    levels, severity, controls, levelOf, control, minResidual, defaultResidual, inferControl, blocks, blockingNames, adaptCatalog
  });
})();
