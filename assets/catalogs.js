(function(){
  'use strict';
  const source=window.KTMEX_CATALOG,criteria=window.KTMEX_CRITERIA,catalog=criteria.adaptCatalog(source);
  function init(){
    byId('catalogVersion').textContent=catalog.version;byId('criteriaVersion').textContent=criteria.version;renderCriteria();renderRisks();
    byId('catalogSearch').addEventListener('input',renderRisks);byId('catalogType').addEventListener('change',renderRisks);
  }
  function renderCriteria(){
    byId('criteriaTables').innerHTML=`<div class="grid grid-3"><div><div class="eyebrow">JSA oficial</div><h3>S × P</h3><p>Severidad 1–4 y probabilidad 1–5. Resultado 1–20 y categorías E, D, C, B y A del F-SGA-8.1-7.</p></div><div><div class="eyebrow">JRA oficial</div><h3>UC y CT</h3><p>UC = S × F × P; CT = S × F × P × C. Valores tomados de KQMS-SA-FO-015 Rev. 00.</p></div><div><div class="eyebrow">Publicación</div><h3>${esc(source.catalogStatus)}</h3><p>${esc(source.status)}. La aprobación rápida productiva permanece bloqueada.</p></div></div>
      <div style="overflow:auto;margin-top:14px"><table class="catalog-table"><thead><tr><th>Categoría JSA</th><th>Puntaje</th><th>¿Bloquea?</th></tr></thead><tbody>${criteria.levels.map(l=>`<tr><td>${esc(l.name)}</td><td>${l.scores?l.scores.join(', '):l.min===l.max?l.min:`${l.min}–${l.max}`}</td><td>${criteria.blocks(l,'JSA')?'Sí':'No'}</td></tr>`).join('')}</tbody></table></div>`;
  }
  function renderRisks(){
    const term=KTMEX.text.normalize(byId('catalogSearch').value),type=byId('catalogType').value;
    const rows=catalog.riesgos.filter(r=>(!type||r.tipo===type)&&(!term||KTMEX.text.normalize([r.id,r.peligro,r.riesgo,r.consecuencia,...r.controles,...r.documentos].join(' ')).includes(term)));
    byId('riskCount').textContent=`${rows.length} registros`;
    byId('riskRows').innerHTML=rows.map(r=>`<tr><td><strong>${r.id}</strong><br><span class="chip gray">${r.status||'DRAFT'}</span></td><td>${esc(r.tipo)}</td><td>${esc(r.peligro)}</td><td>${esc(r.riesgo)}</td><td>${esc(r.consecuencia)}</td><td>JSA ${r.severidad}/${r.probabilidad}<br>JRA S=${r.jraSeverity}, F=${r.jraFrequency}, P=${r.jraProbability}</td><td>${KTMEX.dedupeControls(r.controles).map(esc).join('<br>')}</td><td>${KTMEX.dedupeDocuments(r.documentos).map(esc).join('<br>')||'—'}</td></tr>`).join('');
  }
  function byId(id){return document.getElementById(id);}function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  document.addEventListener('DOMContentLoaded',init);
})();
