(function () {
  'use strict';
  async function sha256(file) {
    if (!window.crypto?.subtle) throw new Error('El navegador no permite verificar la huella del archivo.');
    const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
    return Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2,'0')).join('');
  }
  async function verifyMaster(file, map) {
    if (!file) return { ok:false, reason:'Seleccione el archivo maestro.' };
    const digest = await sha256(file);
    return { ok:digest === map.sha256, digest, expected:map.sha256, reason:digest === map.sha256 ? '' : 'La huella no coincide con el maestro autorizado.' };
  }
  async function exportViaBackend(payload) {
    if (!window.KTMEX?.config?.apiUrl) throw new Error('La exportación del formato oficial requiere configurar el Web App de Apps Script.');
    return KTMEX.api.request('exportJra', { payload }, { timeout:60000 });
  }
  window.KTMEX_XLSX_FILL = Object.freeze({ sha256, verifyMaster, exportViaBackend });
})();
