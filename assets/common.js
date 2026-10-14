(function () {
  'use strict';

  const config = window.KTMEX_CONFIG || { apiUrl: '', requireAuth: false, sessionStorageKey: 'ktmex_safety_session_v1' };
  const memory = { session: readSession(), catalogPromise: null };

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
    document.dispatchEvent(new CustomEvent('ktmex:session-change', { detail: { session: memory.session } }));
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
    renderHeaderAccess();
  }

  function renderHeaderAccess() {
    const header = document.querySelector('.header-inner');
    if (!header) return;
    let controls = document.getElementById('ktmexSessionControls');
    if (!controls) {
      controls = document.createElement('div');
      controls.id = 'ktmexSessionControls';
      controls.className = 'session-controls';
      const badge = header.querySelector('.pilot-badge');
      header.insertBefore(controls, badge || null);
    }
    if (memory.session) {
      controls.innerHTML = `<span class="session-user" title="Sesión activa">${escapeHtml(memory.session.displayName || memory.session.username)}<small>${escapeHtml(memory.session.role || '')}</small></span><button class="header-auth-button" type="button" data-auth-action="logout">Cerrar sesión</button>`;
      controls.querySelector('[data-auth-action="logout"]').addEventListener('click', async () => {
        await logout();
        location.reload();
      });
    } else {
      controls.innerHTML = '<button class="header-auth-button" type="button" data-auth-action="login">Iniciar sesión</button>';
      controls.querySelector('[data-auth-action="login"]').addEventListener('click', showLogin);
    }
  }

  function showLogin() {
    if (!config.apiUrl) {
      toast('Primero configure la URL /exec de Google Apps Script en assets/api-config.js.', true);
      return;
    }
    if (document.getElementById('ktmexAuth')) return;
    const overlay = document.createElement('div');
    overlay.id = 'ktmexAuth';
    overlay.className = 'auth-overlay';
    overlay.innerHTML = `<form class="auth-card" id="ktmexLoginForm">
      ${config.requireAuth ? '' : '<button class="auth-close" type="button" aria-label="Cerrar">×</button>'}
      <div class="eyebrow">Acceso controlado</div><h2>KTMEX Safety Management System</h2>
      <p>Use la cuenta asignada por Safety. Esta autenticación es independiente de Google Workspace.</p>
      <div class="field"><label class="required" for="loginUser">Usuario</label><input id="loginUser" autocomplete="username" required></div>
      <div class="field" style="margin-top:10px"><label class="required" for="loginPassword">Contraseña</label><input id="loginPassword" type="password" autocomplete="current-password" required></div>
      <div class="toolbar" style="margin-top:15px"><button class="btn btn-primary" type="submit">Ingresar</button><span class="help" id="loginMessage"></span></div>
    </form>`;
    document.body.appendChild(overlay);
    const close = overlay.querySelector('.auth-close');
    if (close) close.addEventListener('click', () => overlay.remove());
    overlay.querySelector('form').addEventListener('submit', async event => {
      event.preventDefault();
      const msg = overlay.querySelector('#loginMessage');
      const button = overlay.querySelector('button[type="submit"]');
      button.disabled = true; msg.textContent = 'Validando…';
      try {
        await login(overlay.querySelector('#loginUser').value.trim(), overlay.querySelector('#loginPassword').value);
        location.reload();
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

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  }

  function parseArray(value) {
    if (Array.isArray(value)) return value;
    try {
      const parsed = JSON.parse(String(value || '[]'));
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) { return []; }
  }

  function catalogFromBootstrap(response) {
    const raw = response && response.catalog;
    if (!raw) throw new Error('El backend no devolvió el catálogo vigente.');
    const controlsByRisk = {};
    (raw.controls || []).forEach(control => {
      const id = String(control.risk_id || '');
      if (!id) return;
      (controlsByRisk[id] ||= []).push(control);
    });
    Object.values(controlsByRisk).forEach(rows => rows.sort((a,b) => String(a.control_id).localeCompare(String(b.control_id))));
    const risks = (raw.risks || []).map(row => {
      const controlRows = controlsByRisk[String(row.risk_id)] || [];
      const controls = dedupeControls(controlRows.map(item => item.control_text));
      const documents = dedupeDocuments(controlRows.flatMap(item => parseArray(item.document_codes_json)));
      return {
        id:String(row.risk_id), type:String(row.type), tipo:String(row.type),
        hazard:String(row.hazard), peligro:String(row.hazard), event:String(row.dangerous_event), riesgo:String(row.dangerous_event),
        consequence:String(row.consequence), consecuencia:String(row.consequence),
        jsaSeverity:Number(row.jsa_severity), severidad:Number(row.jsa_severity), probability:Number(row.jsa_probability), probabilidad:Number(row.jsa_probability),
        jraCategory:String(row.jra_category), jraSeverity:Number(row.jra_severity), jraFrequency:Number(row.jra_frequency), jraProbability:Number(row.jra_probability),
        controls, controles:controls, documents, documentos:documents, owner:String(row.owner || ''), status:String(row.status || '')
      };
    });
    const tasksByActivity = {};
    (raw.tasks || []).forEach(row => {
      const id = String(row.activity_id || '');
      if (!id) return;
      (tasksByActivity[id] ||= []).push(row);
    });
    Object.values(tasksByActivity).forEach(rows => rows.sort((a,b) => Number(a.sequence || 0) - Number(b.sequence || 0)));
    const activities = (raw.activities || []).map(row => {
      const tasks = (tasksByActivity[String(row.activity_id)] || []).map(task => ({
        task:String(task.task_text), tarea:String(task.task_text), risks:parseArray(task.risk_ids_json), riesgos:parseArray(task.risk_ids_json),
        aspects:parseArray(task.aspect_ids_json), aspectos:parseArray(task.aspect_ids_json), contextIds:parseArray(task.context_ids_json)
      }));
      const basePermits = parseArray(row.base_permit_ids_json);
      return { id:String(row.activity_id), name:String(row.name), nombre:String(row.name), basePermits, permisosBase:basePermits, tasks, pasos:tasks, status:String(row.status || '') };
    });
    const permits = (raw.permits || []).map(row => ({ id:String(row.permit_id), code:String(row.code), codigo:String(row.code), name:String(row.name), nombre:String(row.name) }));
    const questions = (raw.questions || []).map(row => ({ id:String(row.context_id), label:String(row.label), etiqueta:String(row.label), help:String(row.help_text || ''), ayuda:String(row.help_text || '') }));
    const contextRules = Object.fromEntries((raw.rules || []).map(row => [String(row.context_id), {
      risks:parseArray(row.risk_ids_json), riesgos:parseArray(row.risk_ids_json), aspects:parseArray(row.aspect_ids_json), aspectos:parseArray(row.aspect_ids_json),
      permits:parseArray(row.permit_ids_json), permisos:parseArray(row.permit_ids_json)
    }]));
    if (!activities.length || !risks.length) throw new Error('El catálogo publicado no contiene actividades o riesgos.');
    return {
      version:String(raw.version || ''), catalogStatus:String(raw.status || ''), status:raw.status === 'PUBLISHED' ? 'CATÁLOGO PUBLICADO POR SAFETY Y AMBIENTAL' : String(raw.status || ''),
      activities, actividades:activities, risks, riesgos:risks, permits, permisos:permits, questions, preguntasContexto:questions, contextRules, reglasContexto:contextRules
    };
  }

  function loadCatalog(options) {
    options = options || {};
    if (!config.apiUrl || !memory.session) return Promise.resolve(window.KTMEX_CATALOG);
    if (!memory.catalogPromise || options.refresh) {
      memory.catalogPromise = request('bootstrap', {}).then(catalogFromBootstrap).catch(error => {
        memory.catalogPromise = null;
        throw error;
      });
    }
    return memory.catalogPromise;
  }

  window.KTMEX = Object.freeze({
    config,
    api: { request, login, logout, get session() { return memory.session; } },
    catalog: { load: loadCatalog, fromBootstrap: catalogFromBootstrap },
    text: { normalize: normalizeText, controlKey, documentKey },
    dedupeControls,
    dedupeDocuments,
    toast,
    showLogin
  });
  window.registerWebTool = window.registerWebTool || registerWebTool;
  document.addEventListener('DOMContentLoaded', initNavigation);
})();
