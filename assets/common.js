(function () {
  'use strict';

  const config = window.KTMEX_CONFIG || { apiUrl: '', requireAuth: false, sessionStorageKey: 'ktmex_safety_session_v1' };
  const memory = { session: readSession() };

  function normalizeText(value) {
    return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  }

  function controlKey(value) {
    const key = normalizeText(value);
    return /^(epp|equipo de proteccion personal)\b/.test(key) || key.includes('equipo de seguridad completo')
      ? '__EPP__' : key;
  }

  function dedupeControls(values) {
    const result = [];
    const seen = new Set();
    const ppe = [];
    let ppeIndex = -1;
    (values || []).map(v => String(v || '').trim()).filter(Boolean).forEach(text => {
      const key = controlKey(text);
      if (key === '__EPP__') {
        if (ppeIndex < 0) { ppeIndex = result.length; result.push(''); }
        const detail = text.replace(/^\s*(EPP|Equipo de protecci[oó]n personal)\s*:?\s*/i, '').replace(/[.;\s]+$/, '').trim();
        const detailKey = normalizeText(detail);
        if (detail && !seen.has('ppe:' + detailKey)) { seen.add('ppe:' + detailKey); ppe.push(detail); }
        return;
      }
      if (!key || seen.has(key)) return;
      seen.add(key);
      result.push(text);
    });
    if (ppeIndex >= 0) result[ppeIndex] = 'EPP: ' + (ppe.length ? ppe.join('; ') + '.' : 'usar el EPP definido para la tarea.');
    return result.filter(Boolean);
  }

  function documentKey(value) {
    const text = String(value || '').toUpperCase();
    const code = text.match(/KQMS[-\s]*SA[-\s]*FO[-\s]*(\d{3})/);
    return code ? `KQMS-SA-FO-${code[1]}` : normalizeText(value);
  }

  function dedupeDocuments(values) {
    const seen = new Set();
    const result = [];
    (values || []).map(v => String(v || '').trim()).filter(Boolean).forEach(text => {
      const key = documentKey(text);
      if (!key || seen.has(key)) return;
      seen.add(key);
      result.push(/^KQMS-SA-FO-\d{3}$/.test(key) ? key : text);
    });
    return result;
  }

  function readSession() {
    try {
      const parsed = JSON.parse(sessionStorage.getItem(config.sessionStorageKey) || 'null');
      if (!parsed || !parsed.token || (parsed.expiresAt && Date.now() >= new Date(parsed.expiresAt).getTime())) return null;
      return parsed;
    } catch (_) { return null; }
  }

  function saveSession(session) {
    memory.session = session || null;
    if (session) sessionStorage.setItem(config.sessionStorageKey, JSON.stringify(session));
    else sessionStorage.removeItem(config.sessionStorageKey);
    renderSession();
  }

  async function request(action, payload, options) {
    options = options || {};
    if (!config.apiUrl) throw new Error('API_NOT_CONFIGURED');
    const body = { action, payload: payload || {}, token: memory.session?.token || '' };
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), options.timeout || 25000);
    try {
      const response = await fetch(config.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(body),
        redirect: 'follow',
        signal: controller.signal
      });
      const data = await response.json();
      if (!response.ok || data.ok === false) {
        if (data.code === 'AUTH_REQUIRED' || data.code === 'SESSION_EXPIRED') saveSession(null);
        const error = new Error(data.message || `Error de API (${response.status})`);
        error.code = data.code || 'API_ERROR';
        throw error;
      }
      return Object.prototype.hasOwnProperty.call(data, 'data') ? data.data : data;
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('La solicitud excedió el tiempo permitido.');
      throw error;
    } finally { clearTimeout(timer); }
  }

  async function login(username, password) {
    const session = await request('login', { username, password });
    saveSession(session);
    return session;
  }

  async function logout() {
    try { if (memory.session) await request('logout', {}); } catch (_) { /* local logout always succeeds */ }
    saveSession(null);
  }

  function toast(message, error) {
    const node = document.getElementById('toast');
    if (!node) return;
    node.textContent = message;
    node.className = 'toast show' + (error ? ' error' : '');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => node.classList.remove('show'), 4200);
  }

  function renderSession() {
    document.querySelectorAll('[data-session-user]').forEach(node => {
      node.textContent = memory.session ? `${memory.session.displayName || memory.session.username} · ${memory.session.role}` : 'Modo piloto local';
    });
  }

  function showLogin() {
    if (document.getElementById('ktmexAuth')) return;
    const overlay = document.createElement('div');
    overlay.id = 'ktmexAuth';
    overlay.className = 'auth-overlay';
    overlay.innerHTML = `<form class="auth-card" id="ktmexLoginForm">
      <div class="eyebrow">Acceso controlado</div><h2>KTMEX Safety Management System</h2>
      <p>Use la cuenta asignada por Safety. Esta autenticación es independiente de Google Workspace.</p>
      <div class="field"><label class="required" for="loginUser">Usuario</label><input id="loginUser" autocomplete="username" required></div>
      <div class="field" style="margin-top:10px"><label class="required" for="loginPassword">Contraseña</label><input id="loginPassword" type="password" autocomplete="current-password" required></div>
      <div class="toolbar" style="margin-top:15px"><button class="btn btn-primary" type="submit">Ingresar</button><span class="help" id="loginMessage"></span></div>
    </form>`;
    document.body.appendChild(overlay);
    overlay.querySelector('form').addEventListener('submit', async event => {
      event.preventDefault();
      const msg = overlay.querySelector('#loginMessage');
      const button = overlay.querySelector('button');
      button.disabled = true; msg.textContent = 'Validando…';
      try {
        await login(overlay.querySelector('#loginUser').value.trim(), overlay.querySelector('#loginPassword').value);
        overlay.remove();
      } catch (error) { msg.textContent = error.message; }
      finally { button.disabled = false; }
    });
  }

  function initNavigation() {
    const page = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('[data-nav]').forEach(link => link.classList.toggle('active', link.getAttribute('href') === page));
    renderSession();
    if (config.requireAuth && config.apiUrl && !memory.session) showLogin();
  }

  function registerWebTool(definition) {
    if (!definition || !definition.name) return;
    window.__KTMEX_WEB_TOOLS__ = window.__KTMEX_WEB_TOOLS__ || {};
    window.__KTMEX_WEB_TOOLS__[definition.name] = definition;
  }

  window.KTMEX = Object.freeze({
    config,
    api: { request, login, logout, get session() { return memory.session; } },
    text: { normalize: normalizeText, controlKey, documentKey },
    dedupeControls,
    dedupeDocuments,
    toast,
    showLogin
  });
  window.registerWebTool = window.registerWebTool || registerWebTool;
  document.addEventListener('DOMContentLoaded', initNavigation);
})();
