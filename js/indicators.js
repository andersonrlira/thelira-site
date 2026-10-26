(()=>{
'use strict';
function renderPortals(){
 const labels={responding:'Página disponível',restricted:'Acesso protegido disponível',unavailable:'Indisponível na última checagem'};
 $('portalCards').innerHTML=(snapshot.portals||[]).map((p,i)=>'<article class="portal-card"><div class="portal-head"><span class="portal-index">0'+(i+1)+'</span><span class="portal-status '+(p.state==='responding'?'responding':p.state==='restricted'?'restricted':'unavailable')+'">'+esc(labels[p.state]||'Não verificado')+'</span></div><h3>'+esc(p.segment||'Segmento')+'</h3><span class="portal-kind">'+esc(p.kind||'')+'</span><p class="portal-description">'+esc(p.description||'')+'</p></article>').join('');
}
let snapshot=null,days=7;
const $=id=>document.getElementById('tm-'+id);
const number=new Intl.NumberFormat('pt-BR');
const percent=new Intl.NumberFormat('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
const dateFormat=new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',day:'2-digit',month:'2-digit'});
const longDate=new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const short=d=>dateFormat.format(new Date(d+'T12:00:00-03:00'));
function totals(rows){return rows.reduce((s,r)=>{for(const k of ['executions','success','error','crashed','canceled','running','waiting','new','unknown','durationSeconds','timedExecutions'])s[k]=(s[k]||0)+(r[k]||0);return s;},{});}
function rate(s){const n=(s.success||0)+(s.error||0)+(s.crashed||0)+(s.canceled||0);return n?100*s.success/n:null;}
function duration(n){if(!Number.isFinite(n))return '—';if(n<60)return percent.format(n)+' s';if(n<3600)return percent.format(n/60)+' min';return percent.format(n/3600)+' h';}
function draw(rows){
 const width=1000,height=240,left=45,right=12,top=12,bottom=30,plotW=width-left-right,plotH=height-top-bottom;
 const max=Math.max(1,...rows.filter(r=>r.available).map(r=>r.executions));
 const step=plotW/rows.length,bar=Math.min(58,step*.68),labelEvery=Math.max(1,Math.ceil(rows.length/9));
 let svg='<svg viewBox="0 0 '+width+' '+height+'" preserveAspectRatio="none" aria-hidden="true">';
 for(let i=0;i<=4;i++){const y=top+plotH*i/4;svg+='<line class="grid-line" x1="'+left+'" x2="'+(width-right)+'" y1="'+y+'" y2="'+y+'"/><text x="'+(left-10)+'" y="'+(y+3)+'" text-anchor="end">'+number.format(Math.round(max*(1-i/4)))+'</text>';}
 rows.forEach((r,i)=>{
  const x=left+step*i+(step-bar)/2;let y=top+plotH;
  const failed=r.error+r.crashed,other=r.executions-r.success-failed;
  const tooltip=r.available?short(r.date)+': '+number.format(r.executions)+' execuções; '+number.format(r.success)+' sem erro; '+number.format(failed)+' falhas; '+number.format(other)+' outros estados':short(r.date)+': histórico indisponível';
  svg+='<g><title>'+esc(tooltip)+'</title>';
  if(!r.available)svg+='<rect x="'+x+'" y="'+(y-3)+'" width="'+bar+'" height="3" fill="#393443"/>';
  for(const [count,color] of [[r.success,'#49d3b0'],[failed,'#ed999e'],[other,'#748aa0']]){const h=count/max*plotH;y-=h;if(h>0)svg+='<rect x="'+x+'" y="'+y+'" width="'+bar+'" height="'+h+'" rx="1" fill="'+color+'"/>';}
  svg+='<rect x="'+(left+step*i)+'" y="'+top+'" width="'+step+'" height="'+plotH+'" fill="transparent"/></g>';
  if(i%labelEvery===0||i===rows.length-1)svg+='<text x="'+(left+step*(i+.5))+'" y="'+(height-6)+'" text-anchor="middle">'+short(r.date)+'</text>';
 });
 $('dailyChart').innerHTML=svg+'</svg>';
 $('dailyChart').setAttribute('aria-label','Execuções por dia de '+short(rows[0].date)+' a '+short(rows.at(-1).date)+'. '+number.format(totals(rows).executions)+' execuções.');
}
function render(){
 if(!snapshot)return;
 const rows=snapshot.daily.slice(-days),s=totals(rows),r=rate(s),today=snapshot.daily.at(-1);
 $('processCount').textContent=number.format(snapshot.inventory.total);
 $('activeLabel').textContent=number.format(snapshot.inventory.active)+' ativos · '+number.format(snapshot.inventory.total-snapshot.inventory.active)+' inativos';
 $('todayCount').textContent=today.available?number.format(today.executions):'—';
 $('successCount').textContent=number.format(s.success||0);
 $('successSub').textContent=r===null?'Sem execuções finalizadas':percent.format(r)+'% das execuções finalizadas';
 $('failureCount').textContent=number.format((s.error||0)+(s.crashed||0));
 $('failureSub').textContent='Erros e interrupções · últimos '+days+' dias';
 $('heroRate').innerHTML=r===null?'—<small>%</small>':percent.format(r)+'<small>%</small>';
 $('detailRate').textContent=r===null?'—':percent.format(r)+'%';
 $('periodCount').textContent=number.format(s.executions||0);
 $('periodRange').textContent=short(rows[0].date)+' — '+short(rows.at(-1).date);
 $('averageDuration').textContent=s.timedExecutions?duration(s.durationSeconds/s.timedExecutions):'—';
 $('pendingCount').textContent=number.format((s.running||0)+(s.waiting||0)+(s.new||0));
 $('cancelledCount').textContent=number.format(s.canceled||0);
 const available=rows.filter(x=>x.available).length;
 $('coverageNote').textContent='Histórico disponível a partir de '+short(snapshot.coverage.historyFrom)+'. '+available+' de '+days+' dias com cobertura; primeiro dia pode estar incompleto. Hoje está em andamento. Valores anteriores à cobertura não são tratados como zero.';
 const max=Math.max(1,...snapshot.inventory.categories.map(c=>c.total));
 $('categories').innerHTML=snapshot.inventory.categories.map(c=>'<div class="category-row"><span class="category-label">'+esc({'Comunicacao':'Comunicação','Integracoes':'Integrações'}[c.label]||c.label)+'</span><span class="category-count"><b>'+number.format(c.total)+'</b> · '+number.format(c.active)+' ativos</span><div class="track"><div class="fill" style="width:'+(100*c.total/max)+'%"></div></div></div>').join('');
 draw(rows);renderPortals();refreshAge();
}
function refreshAge(){
 if(!snapshot)return;
 const age=Date.now()-new Date(snapshot.generatedAt).getTime(),fresh=age>=-60000&&age<=15*60000;
 $('statusDot').className='dot'+(fresh?'':' waiting');
 $('updateLabel').textContent=fresh?'Dados atualizados automaticamente':'Atualização atrasada · exibindo última coleta';
 $('updatedAt').textContent=longDate.format(new Date(snapshot.generatedAt))+' · Brasília';
 $('updatedAt').dateTime=snapshot.generatedAt;
}
async function load(){
 try{
  const response=await fetch('https://thelira.tech/indicadores/data.json',{cache:'no-store'});
  if(!response.ok)throw new Error('indisponível');
  const data=await response.json();
  if(data.schemaVersion!==1||!Array.isArray(data.daily)||!data.daily.length||!data.inventory)throw new Error('formato inválido');
  snapshot=data;$('errorBanner').hidden=true;render();
 }catch(e){$('errorBanner').hidden=false;if(snapshot){refreshAge();$('updateLabel').textContent='Falha na atualização · exibindo última coleta';}else{$('statusDot').className='dot offline';$('updateLabel').textContent='Indicadores temporariamente indisponíveis';$('dailyChart').innerHTML='<div class="empty">Não foi possível carregar o histórico.</div>';}}
}
document.querySelectorAll('.tli-periods [data-days]').forEach(b=>b.addEventListener('click',()=>{days=Number(b.dataset.days);document.querySelectorAll('.tli-periods [data-days]').forEach(x=>{const active=x===b;x.classList.toggle('selected',active);x.setAttribute('aria-pressed',String(active));});render();}));
load();setInterval(load,60000);setInterval(refreshAge,30000);




})();
