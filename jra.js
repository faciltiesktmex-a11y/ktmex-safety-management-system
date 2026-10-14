(function () {
  'use strict';
  let catalog = window.KTMEX_CATALOG;
  const map = window.KTMEX_FO015_MAP;
  let risks = Object.fromEntries(catalog.risks.filter(item => item.type === 'SEGURIDAD').map(item => [item.id,item]));
  let activities = Object.fromEntries(catalog.activities.map(item => [item.id,item]));
  const state = { activity:null, tasks:[], chemicals:[], otherHazards:{}, approvals:{}, id:'', folio:'', status:'DRAFT', dirty:false };
  const approvalRoles = [
    ['MGR_AM','MGR / AM'], ['ENGINEERING','Engineering'], ['SAFETY','Safety'], ['ENVIRONMENTAL','Environmental']
  ];
  const factorOptions = {
    severity:[[2,'Primeros auxilios'],[3,'Registrable / tiempo perdido'],[20,'Incapacidad permanente'],[40,'Fatalidad']],
    frequency:[[1,'Poco frecuente'],[4,'1–10 por semana'],[6,'1–10 por turno'],[8,'Más de 10 por turno']],
    probability:[[.5,'Improbable'],[1,'Posible o probable']],
    control:[[1,'Ninguna'],[.9,'Moderadamente efectiva / EPP'],[.5,'Efectiva / estandarización'],[.1,'Muy efectiva / ingeniería']]
  };

  async function init() {
    if(KTMEX.config.apiUrl&&KTMEX.api.session){
      try{
        catalog=await KTMEX.catalog.load();
        risks=Object.fromEntries(catalog.risks.filter(item=>item.type==='SEGURIDAD').map(item=>[item.id,item]));
        activities=Object.fromEntries(catalog.activities.map(item=>[item.id,item]));
      }catch(error){
        KTMEX.toast('No se pudo cargar el catálogo vigente: '+error.message,true);
        byId('activitySelect').disabled=true;
        return;
      }
    }
    byId('evalDate').value = new Date().toISOString().slice(0,10);
    byId('workCategory').innerHTML = optionList([['','Seleccione…'],['Conveyance','Conveyance'],['Production','Producción'],['Maintenance','Mantenimiento'],['Other','Otros']]);
    catalog.activities.forEach(item => byId('activitySelect').append(new Option(item.name,item.id)));
    byId('activitySelect').append(new Option('+ Agregar actividad nueva','__new__'));
    byId('activitySelect').addEventListener('change', event => selectActivity(event.target.value));
    byId('useNewActivity').addEventListener('click', useNewActivity);
    byId('addTask').addEventListener('click', () => { state.tasks.push(createTask({task:'',risks:[]})); touch(); render(); });
    byId('chemicalUse').addEventListener('change', renderChemicals);
    byId('addChemical').addEventListener('click', () => { if (state.chemicals.length < map.limits.maxChemicalRows) state.chemicals.push(blankChemical()); renderChemicals(); });
    byId('saveDraft').addEventListener('click', () => save(false));
    byId('submitApproval').addEventListener('click', () => save(true));
    byId('exportFo015').addEventListener('click', exportOfficial);
    byId('newJra').addEventListener('click', reset);
    byId('masterFile')?.addEventListener('change', verifyMaster);
    document.querySelectorAll('[data-general]').forEach(node => node.addEventListener('input', touch));
    byId('fieldCheck').addEventListener('change', updateSummary);
    renderOtherHazards(); renderApprovals(); renderChemLegend(); render(); renderMasterStatus();
  }

  function selectActivity(id) {
    byId('newActivityPanel').classList.toggle('hidden', id !== '__new__');
    if (id === '__new__') { state.activity=null; state.tasks=[]; render(); byId('newActivityName').focus(); return; }
    const activity = activities[id];
    state.activity = activity || null;
    state.tasks = activity ? activity.tasks.map(createTask) : [];
    revokeApprovals(); touch(); render();
  }

  function useNewActivity() {
    const name = byId('newActivityName').value.trim();
    if (name.length < 4) return KTMEX.toast('Capture un nombre de al menos cuatro caracteres.',true);
    const custom = { id:'custom-' + Date.now(), name, isNew:true, tasks:[{task:'',risks:[]}] };
    activities[custom.id] = custom;
    const option = new Option(name + ' (nueva)',custom.id);
    const select = byId('activitySelect'); select.add(option,select.options.length-1); select.value=custom.id;
    state.activity=custom; state.tasks=custom.tasks.map(createTask); byId('newActivityPanel').classList.add('hidden');
    touch(); render(); KTMEX.toast('Actividad marcada como excepción para revisión técnica.');
  }

  function createTask(source) {
    const selected = new Set(source.risks || []);
    const evaluations = {};
    selected.forEach(id => { if (risks[id]) evaluations[id]=defaults(risks[id]); });
    return { description:source.task || '', manualIds:selected, contextIds:new Set(), context:{}, evaluations };
  }
  function defaults(risk) { return { s:risk.jraSeverity || 3, f:risk.jraFrequency || 4, p:risk.jraProbability || 1, c:.5 }; }
  function selectedIds(task) { return [...new Set([...task.manualIds,...task.contextIds])].filter(id => risks[id]); }

  function toggleContext(taskIndex,id,checked) {
    const task=state.tasks[taskIndex]; task.context[id]=checked;
    const derived=(catalog.contextRules[id]?.risks || []).filter(riskId => risks[riskId]);
    task.contextIds = new Set(Object.keys(task.context).filter(key => task.context[key]).flatMap(key => catalog.contextRules[key]?.risks || []).filter(riskId => risks[riskId]));
    derived.forEach(riskId => { if (!task.evaluations[riskId]) task.evaluations[riskId]=defaults(risks[riskId]); });
    revokeApprovals(); touch(); render();
  }
  function toggleRisk(taskIndex,id,checked) {
    const task=state.tasks[taskIndex];
    if (checked) { task.manualIds.add(id); if (!task.evaluations[id]) task.evaluations[id]=defaults(risks[id]); }
    else task.manualIds.delete(id);
    revokeApprovals(); touch(); render();
  }
  function updateEval(taskIndex,id,key,value) { state.tasks[taskIndex].evaluations[id][key]=Number(value); revokeApprovals(); touch(); renderPreview(); updateSummary(); }

  function render() {
    const root=byId('tasksContainer');
    if (!state.tasks.length) { root.className='empty'; root.textContent='Seleccione una actividad para cargar la secuencia sugerida.'; }
    else {
      root.className='';
      root.innerHTML=state.tasks.map((task,index) => taskHtml(task,index)).join('');
      bindTaskEvents(root);
    }
    renderPreview(); updateSummary();
  }

  function taskHtml(task,index) {
    const ids=selectedIds(task);
    return `<article class="card" style="margin-bottom:12px;border-left:5px solid #198754">
      <div class="card-header"><h3 class="step-title"><span class="step-number">${index+1}</span>Tarea ${index+1}</h3><button class="btn btn-light btn-sm" data-remove-task="${index}">Eliminar</button></div>
      <div class="card-body">
        <div class="field"><label class="required">Descripción de la tarea</label><textarea data-task-text="${index}">${escapeHtml(task.description)}</textarea></div>
        <details style="margin-top:10px"><summary><strong>Preguntas de contexto de esta tarea</strong> · ${Object.values(task.context).filter(Boolean).length} seleccionada(s)</summary>
          <div class="context-grid" style="margin-top:9px">${catalog.questions.map(q => `<label class="check-card"><input type="checkbox" data-context="${index}:${q.id}" ${task.context[q.id]?'checked':''}><span><strong>${escapeHtml(q.label)}</strong><span>${escapeHtml(q.help)}</span></span></label>`).join('')}</div>
        </details>
        <details style="margin-top:10px" open><summary><strong>Riesgos aplicables</strong> · ${ids.length} seleccionado(s)</summary>
          <div class="context-grid" style="margin-top:9px">${Object.values(risks).map(risk => `<label class="check-card"><input type="checkbox" data-risk="${index}:${risk.id}" ${ids.includes(risk.id)?'checked':''} ${task.contextIds.has(risk.id)?'disabled title="Agregado por contexto"':''}><span><strong>${risk.id} · ${escapeHtml(risk.event)}</strong><span>${escapeHtml(risk.hazard)} → ${escapeHtml(risk.consequence)}</span></span></label>`).join('')}</div>
        </details>
        ${ids.length ? `<div style="overflow:auto;margin-top:12px"><table class="catalog-table"><thead><tr><th>Riesgo</th><th>H</th><th>S</th><th>F</th><th>P</th><th>C</th><th>UC</th><th>CT</th></tr></thead><tbody>${ids.map(id => evalRow(task,index,id)).join('')}</tbody></table></div>` : '<div class="notice danger" style="margin-top:10px">Seleccione al menos un riesgo para esta tarea.</div>'}
      </div></article>`;
  }
  function evalRow(task,taskIndex,id) {
    const risk=risks[id], value=task.evaluations[id] || (task.evaluations[id]=defaults(risk));
    const uc=value.s*value.f*value.p, ct=uc*value.c;
    return `<tr><td><strong>${id}</strong><br>${escapeHtml(risk.event)}</td><td>${risk.jraCategory}</td>
      <td>${factorSelect(taskIndex,id,'s',factorOptions.severity,value.s)}</td><td>${factorSelect(taskIndex,id,'f',factorOptions.frequency,value.f)}</td>
      <td>${factorSelect(taskIndex,id,'p',factorOptions.probability,value.p)}</td><td>${factorSelect(taskIndex,id,'c',factorOptions.control,value.c)}</td>
      <td>${format(uc)}</td><td style="font-weight:800;color:${ct>20?'#b42318':'#12613e'}">${format(ct)}</td></tr>`;
  }
  function factorSelect(task,id,key,options,current) { return `<select data-eval="${task}:${id}:${key}">${options.map(([value,label]) => `<option value="${value}" ${Number(value)===Number(current)?'selected':''}>${value} · ${label}</option>`).join('')}</select>`; }

  function bindTaskEvents(root) {
    root.querySelectorAll('[data-task-text]').forEach(node => node.addEventListener('input',e => { state.tasks[+e.target.dataset.taskText].description=e.target.value; revokeApprovals(); touch(); renderPreview(); updateSummary(); }));
    root.querySelectorAll('[data-remove-task]').forEach(node => node.addEventListener('click',e => { state.tasks.splice(+e.target.dataset.removeTask,1); revokeApprovals(); touch(); render(); }));
    root.querySelectorAll('[data-context]').forEach(node => node.addEventListener('change',e => { const [i,id]=e.target.dataset.context.split(':'); toggleContext(+i,id,e.target.checked); }));
    root.querySelectorAll('[data-risk]').forEach(node => node.addEventListener('change',e => { const [i,id]=e.target.dataset.risk.split(':'); toggleRisk(+i,id,e.target.checked); }));
    root.querySelectorAll('[data-eval]').forEach(node => node.addEventListener('change',e => { const [i,id,key]=e.target.dataset.eval.split(':'); updateEval(+i,id,key,e.target.value); }));
  }

  function groupedRows() {
    const rows=[];
    state.tasks.forEach((task,taskIndex) => {
      const groups={};
      selectedIds(task).forEach(id => { const risk=risks[id]; (groups[risk.jraCategory] ||= []).push({risk,value:task.evaluations[id] || defaults(risk)}); });
      Object.entries(groups).sort().forEach(([category,items]) => {
        const s=Math.max(...items.map(x=>x.value.s)), f=Math.max(...items.map(x=>x.value.f)), p=Math.max(...items.map(x=>x.value.p)), c=Math.max(...items.map(x=>x.value.c));
        rows.push({ taskIndex, task:task.description, category, ids:items.map(x=>x.risk.id),
          risks:items.map(x=>`${x.risk.hazard} | ${x.risk.event} | ${x.risk.consequence}`),
          controls:KTMEX.dedupeControls(items.flatMap(x=>x.risk.controls)), s,f,p,c,uc:s*f*p,ct:s*f*p*c });
      });
    });
    return rows;
  }

  function renderPreview() {
    const rows=groupedRows(), node=byId('fo015Preview');
    if (!rows.length) { node.innerHTML='<div class="empty">Los renglones aparecerán al seleccionar riesgos.</div>'; return; }
    node.innerHTML=`<div style="overflow:auto"><table class="catalog-table"><thead><tr><th>No.</th><th>Tarea</th><th>Riesgos potenciales</th><th>H</th><th>S</th><th>F</th><th>P</th><th>C</th><th>UC</th><th>CT</th><th>Notas / controles</th></tr></thead><tbody>${rows.map((row,i)=>`<tr><td>${i+1}</td><td>${escapeHtml(row.task)}</td><td>${row.risks.map(escapeHtml).join('<br>')}</td><td>${row.category}</td><td>${row.s}</td><td>${row.f}</td><td>${row.p}</td><td>${row.c}</td><td>${format(row.uc)}</td><td>${format(row.ct)}</td><td>${row.controls.map(escapeHtml).join('<br>')}</td></tr>`).join('')}</tbody></table></div>${rows.length>map.limits.maxRiskRows?'<div class="notice danger">El formato admite 30 renglones. Reduzca o divida el JRA.</div>':''}`;
  }

  function renderChemicals() {
    const visible=byId('chemicalUse').value==='yes'; byId('chemicalsBlock').classList.toggle('hidden',!visible);
    if (!visible) return;
    if (!state.chemicals.length) state.chemicals.push(blankChemical());
    byId('chemicalsRows').innerHTML=state.chemicals.map((item,i)=>`<tr><td>${i+1}</td>${['substance','identifier','frequency','duration','airborne','dermal','engineering','ppe','ppeText'].map(key=>`<td><input style="min-width:80px;width:100%" data-chemical="${i}:${key}" value="${escapeAttr(item[key])}"></td>`).join('')}<td><button class="btn btn-light btn-sm" data-remove-chemical="${i}">×</button></td></tr>`).join('');
    byId('chemicalsHint').textContent=`${state.chemicals.length} de ${map.limits.maxChemicalRows} renglones del formato principal.`;
    byId('chemicalsRows').querySelectorAll('[data-chemical]').forEach(node=>node.addEventListener('input',e=>{const[i,key]=e.target.dataset.chemical.split(':');state.chemicals[+i][key]=e.target.value;touch();}));
    byId('chemicalsRows').querySelectorAll('[data-remove-chemical]').forEach(node=>node.addEventListener('click',e=>{state.chemicals.splice(+e.target.dataset.removeChemical,1);renderChemicals();touch();}));
  }
  function blankChemical(){return{substance:'',identifier:'',frequency:'',duration:'',airborne:'',dermal:'',engineering:'',ppe:'',ppeText:''};}
  function renderChemLegend(){byId('chemLegend').innerHTML='<strong>Frecuencia:</strong> 1 poco frecuente, 2 anual, 4 mensual, 6 semanal, 8 diario. <strong>Duración:</strong> 1 &lt;5%, 2 =5–25%, 4 =25–75%, 6 &gt;75%. Aire/dérmico y controles deben calificarse conforme a la hoja de instrucciones del formato.';}
  function renderOtherHazards(){
    const values=['Ruido','Biológicos','Radiación','Láser','Calor/frío','Corte y soldadura','Fosa o lodos','Emisiones por vehículos','Maquinado'];
    byId('otherHazards').innerHTML=values.map((label,i)=>`<label class="check-card"><input type="checkbox" data-other="${i}"><span><strong>${label}</strong><span>Marcar si puede aplicar.</span></span></label>`).join('');
    byId('otherHazards').querySelectorAll('[data-other]').forEach((node,i)=>node.addEventListener('change',e=>{state.otherHazards[values[i]]=e.target.checked;touch();}));
  }

  function renderApprovals() {
    byId('approvalList').innerHTML=approvalRoles.map(([id,label])=>{const approval=state.approvals[id];return `<div class="approval-item"><strong>${label}</strong><span>${approval?`Liberado por ${escapeHtml(approval.name)} · ${new Date(approval.at).toLocaleString('es-MX')}`:'Pendiente'}</span>${approval?'':`<button class="btn btn-light btn-sm" style="margin-top:6px" data-approve="${id}">Liberar demo</button>`}</div>`;}).join('');
    byId('approvalList').querySelectorAll('[data-approve]').forEach(node=>node.addEventListener('click',()=>approve(node.dataset.approve)));
    byId('approvalCount').textContent=`${Object.keys(state.approvals).length} / ${approvalRoles.length}`;
  }
  async function approve(role) {
    try {
      validate(true); if (!state.id) throw new Error('Guarde o envíe el JRA antes de liberarlo.');
      let approval;
      if (KTMEX.config.apiUrl) approval=await KTMEX.api.request('approveJra',{id:state.id,role});
      else approval={name:`Usuario demo (${role})`,at:new Date().toISOString()};
      state.approvals[role]={name:approval.name||approval.approver||role,at:approval.at||approval.approvedAt||new Date().toISOString()};
      renderApprovals(); updateSummary(); KTMEX.toast('Liberación registrada.');
    } catch(error){KTMEX.toast(error.message,true);}
  }
  function revokeApprovals(){if(Object.keys(state.approvals).length){state.approvals={};renderApprovals();}}

  function payload() {
    return { id:state.id,folio:state.folio,status:state.status,catalogVersion:catalog.version,activityId:state.activity?.id||'',activityName:state.activity?.name||'',activityNew:Boolean(state.activity?.isNew),
      general:{date:byId('evalDate').value,evaluator:byId('evaluator').value.trim(),department:byId('department').value.trim(),lineMachine:byId('areaMachine').value.trim(),process:byId('processName').value.trim(),workCategory:byId('workCategory').value,activityType:byId('activityType').value,hasMoe:byId('moeExists').value,moeCode:byId('moeCode').value.trim(),moeRevision:byId('moeRevision').value.trim()},
      fieldCheck:byId('fieldCheck').checked,adjustHeights:byId('adjustHeights').checked,rows:groupedRows(),chemicals:byId('chemicalUse').value==='yes'?state.chemicals.filter(x=>x.substance.trim()):[],otherHazards:Object.keys(state.otherHazards).filter(k=>state.otherHazards[k]),approvals:state.approvals};
  }
  function validate(requireField) {
    if(!state.activity) throw new Error('Seleccione una actividad.');
    for(const [id,label] of [['evalDate','fecha'],['evaluator','evaluador'],['department','departamento'],['areaMachine','línea o máquina'],['processName','proceso'],['workCategory','categoría de trabajo'],['moeExists','existencia de MOE']]) if(!byId(id).value) throw new Error(`Capture ${label}.`);
    if(!state.tasks.length) throw new Error('Agregue al menos una tarea.');
    state.tasks.forEach((task,i)=>{if(!task.description.trim())throw new Error(`Capture la descripción de la tarea ${i+1}.`);if(!selectedIds(task).length)throw new Error(`Seleccione riesgos para la tarea ${i+1}.`);});
    const rows=groupedRows(); if(rows.length>map.limits.maxRiskRows)throw new Error('El formato admite máximo 30 renglones de riesgo.');
    if(requireField&&!byId('fieldCheck').checked)throw new Error('Confirme la revisión de campo.');
    return true;
  }
  async function save(submit) {
    try {
      validate(submit); const data=payload(); data.status=submit?'SUBMITTED':'DRAFT';
      let result;
      if(KTMEX.config.apiUrl) result=await KTMEX.api.request('saveJra',{payload:data,submit});
      else {result={id:state.id||crypto.randomUUID(),folio:state.folio||`JRA-DEMO-${Date.now()}`,status:data.status};localStorage.setItem('ktmex_jra_'+result.id,JSON.stringify(data));}
      state.id=result.id;state.folio=result.folio;state.status=result.status||data.status;state.dirty=false;byId('folioLabel').textContent=state.folio;updateSummary();KTMEX.toast(submit?'JRA enviado a liberación.':'Borrador guardado.');
    } catch(error){KTMEX.toast(error.message,true);}
  }
  async function exportOfficial(){
    try{validate(true);if(Object.keys(state.approvals).length<approvalRoles.length)throw new Error('Faltan liberaciones digitales.');const result=await KTMEX_XLSX_FILL.exportViaBackend(payload());if(result.base64){const bytes=Uint8Array.from(atob(result.base64),c=>c.charCodeAt(0)),url=URL.createObjectURL(new Blob([bytes],{type:result.mimeType||'application/pdf'})),link=document.createElement('a');link.href=url;link.download=result.filename||'JRA.pdf';document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}else if(result.url)window.open(result.url,'_blank','noopener');KTMEX.toast('Formato generado.');}catch(error){KTMEX.toast(error.message,true);}
  }
  async function verifyMaster(event){
    try{const result=await KTMEX_XLSX_FILL.verifyMaster(event.target.files[0],map);byId('masterStatus').className='notice '+(result.ok?'info':'danger');byId('masterStatus').textContent=result.ok?'Maestro oficial verificado por SHA-256.':'El archivo seleccionado no coincide con el original oficial.';}catch(error){KTMEX.toast(error.message,true);}
  }
  function renderMasterStatus(){byId('masterStatus').className='notice info';byId('masterStatus').innerHTML=`<strong>Maestro identificado:</strong> ${map.code} Rev. ${map.revision}. El original .xls se conserva por huella SHA-256; para generar el archivo, configure en Apps Script una copia controlada convertida a Google Sheets.`;if(!KTMEX.config.apiUrl)byId('masterFileRow')?.classList.remove('hidden');}

  function updateSummary(){
    const rows=groupedRows(), maxUc=rows.length?Math.max(...rows.map(x=>x.uc)):null,maxCt=rows.length?Math.max(...rows.map(x=>x.ct)):null;
    byId('metricTasks').textContent=state.tasks.length;byId('metricRisks').textContent=state.tasks.reduce((sum,t)=>sum+selectedIds(t).length,0);byId('metricUc').textContent=maxUc==null?'—':format(maxUc);byId('metricCt').textContent=maxCt==null?'—':format(maxCt);
    const complete=state.activity&&state.tasks.length&&state.tasks.every(t=>t.description.trim()&&selectedIds(t).length)&&byId('fieldCheck').checked;
    const approvals=Object.keys(state.approvals).length, status=byId('releaseStatus');
    if(state.activity?.isNew){status.className='release-box release-blocked';status.textContent='EXCEPCIÓN: actividad nueva; requiere revisión técnica y alta en catálogo.';}
    else if(!complete){status.className='release-box release-blocked';status.textContent='Complete la información y la confirmación de campo.';}
    else if(catalog.catalogStatus!=='PUBLISHED'){status.className='release-box release-blocked';status.textContent='PILOTO: catálogo pendiente de aprobación; no habilitado para ruta rápida productiva.';}
    else if(approvals<approvalRoles.length){status.className='release-box release-ok';status.textContent='Criterio completo; pendiente de liberaciones digitales.';}
    else{status.className='release-box release-ok';status.textContent='LIBERADO: listo para generar, imprimir y recabar firmas manuscritas.';}
    byId('exportFo015').disabled=approvals<approvalRoles.length;
  }
  function touch(){state.dirty=true;}
  function reset(){if(state.dirty&&!confirm('Se perderán los cambios no guardados. ¿Continuar?'))return;location.reload();}
  function optionList(items){return items.map(([value,label])=>`<option value="${value}">${label}</option>`).join('');}
  function byId(id){return document.getElementById(id);}
  function format(value){return Number.isInteger(value)?String(value):Number(value).toFixed(1).replace(/\.0$/,'');}
  function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function escapeAttr(value){return escapeHtml(value).replace(/\n/g,'&#10;');}
  document.addEventListener('DOMContentLoaded',init);
})();
