(()=>{
  const loader=document.createElement('script');
  loader.src='app-v7.js?v=7';
  loader.onload=waitForV7;
  loader.onerror=()=>alert('TriLedger could not load the finance engine. Refresh while online.');
  document.body.appendChild(loader);

  function waitForV7(){
    let tries=0;
    const timer=setInterval(()=>{
      tries++;
      try{
        if(typeof S!=='undefined'&&typeof budgetRows==='function'&&typeof txRsd==='function'&&window.__triledgerV7){
          clearInterval(timer);setupV8();
        }else if(tries>240){clearInterval(timer);console.error('TriLedger v8 timed out waiting for v7')}
      }catch(e){if(tries>240){clearInterval(timer);console.error(e)}}
    },50);
  }

  function setupV8(){
    if(window.__triledgerV8)return;window.__triledgerV8=true;
    addStyles();upgradeBudgetPage();patchBudgetRows();patchRender();render();renderBudgetV8();
  }

  function addStyles(){
    const st=document.createElement('style');st.id='v8styles';st.textContent=`
      .budget-hero{display:grid;grid-template-columns:minmax(190px,250px) 1fr;gap:18px;align-items:center;margin:12px 0 18px}.budget-donut{width:100%;max-width:230px;aspect-ratio:1;display:block;margin:auto}.budget-legend{display:grid;gap:8px}.legend-row{display:grid;grid-template-columns:12px 1fr auto;gap:9px;align-items:center}.legend-dot{width:10px;height:10px;border-radius:50%;background:var(--dot)}.budget-summary-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:12px 0}.budget-mini{border:1px solid var(--l);background:#0b1525;border-radius:14px;padding:12px}.budget-mini strong{display:block;font-size:18px;margin-top:4px}.budget-card{border:1px solid var(--l);background:linear-gradient(180deg,#101d30,#0b1525);border-radius:18px;padding:15px;margin-bottom:12px}.budget-card-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.budget-title{font-size:19px;font-weight:800}.budget-meta{color:var(--m);font-size:13px;margin-top:3px}.budget-amounts{display:flex;justify-content:space-between;gap:12px;margin-top:12px}.budget-amounts strong{font-size:17px}.budget-track{height:11px;border-radius:999px;background:#17243a;overflow:hidden;margin:10px 0}.budget-track i{display:block;height:100%;background:var(--a);border-radius:999px}.budget-track i.warn{background:#d5a347}.budget-track i.over{background:#db6974}.budget-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.budget-details{margin-top:10px;padding-top:10px;border-top:1px solid var(--l);display:none}.budget-details.open{display:block}.audit-row{display:grid;grid-template-columns:1fr auto;gap:10px;padding:9px 0;border-bottom:1px solid #1a2940}.audit-row:last-child{border-bottom:0}.audit-desc{font-weight:700}.audit-meta{font-size:12px;color:var(--m);margin-top:2px}.reclass-select{max-width:150px;padding:7px}.budget-note{font-size:12px;color:var(--m);margin-top:8px}.budget-zero{padding:18px;border:1px dashed var(--l);border-radius:14px;color:var(--m);text-align:center}.budget-monthbar{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:10px}.budget-monthbar input{min-width:160px}.budget-section-title{display:flex;justify-content:space-between;gap:10px;align-items:center;margin-top:18px}.spend-bars{display:grid;gap:10px}.spend-bar-row{display:grid;grid-template-columns:minmax(90px,145px) 1fr auto;gap:10px;align-items:center}.spend-bar{height:12px;border-radius:999px;background:#17243a;overflow:hidden}.spend-bar i{height:100%;display:block;border-radius:999px;background:var(--a)}
      @media(max-width:650px){.budget-hero{grid-template-columns:1fr}.budget-summary-grid{grid-template-columns:1fr 1fr}.budget-summary-grid .budget-mini:last-child{grid-column:1/-1}.budget-amounts{display:grid;grid-template-columns:1fr 1fr}.spend-bar-row{grid-template-columns:90px 1fr auto}.budget-card-head{align-items:center}}
    `;document.head.appendChild(st);
  }

  function upgradeBudgetPage(){
    const sec=document.getElementById('budgets');if(!sec)return;
    const old=document.getElementById('budgetV8Top');if(old)return;
    const toolbar=sec.querySelector('.toolbar');
    const wrap=document.createElement('div');wrap.id='budgetV8Top';wrap.innerHTML=`
      <div class="budget-monthbar"><label>Budget month <input id="budgetMonthV8" type="month"></label><button type="button" onclick="setBudgetMonthNow()">This month</button></div>
      <div class="budget-summary-grid"><div class="budget-mini"><small>Total planned</small><strong id="budgetPlannedV8">—</strong></div><div class="budget-mini"><small>Spent</small><strong id="budgetSpentV8">—</strong></div><div class="budget-mini"><small>Remaining</small><strong id="budgetRemainingV8">—</strong></div></div>
      <div class="panel budget-hero"><svg id="budgetDonutV8" class="budget-donut" viewBox="0 0 220 220" aria-label="Budget spending diagram"></svg><div><h3 style="margin:0 0 10px">Budget usage</h3><div id="budgetLegendV8" class="budget-legend"></div></div></div>
      <div class="budget-section-title"><h2 style="margin-bottom:10px">Spending by category</h2></div><div id="spendBarsV8" class="panel spend-bars"></div>
      <div class="budget-section-title"><div><h2 style="margin-bottom:4px">Budget details</h2><small>Tap “What counts?” to see every transaction included.</small></div></div>`;
    toolbar.insertAdjacentElement('afterend',wrap);
    const input=document.getElementById('budgetMonthV8');input.value=currentLocalMonth();input.addEventListener('change',renderBudgetV8);
  }

  function currentLocalMonth(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`}
  window.setBudgetMonthNow=function(){const el=document.getElementById('budgetMonthV8');if(el){el.value=currentLocalMonth();renderBudgetV8()}}
  function chosenMonth(){return document.getElementById('budgetMonthV8')?.value||currentLocalMonth()}
  function norm(s){return String(s||'').trim().toLowerCase()}
  function scopeOf(t){return acc(t.account)?.scope||''}
  function parts(t){
    if(Array.isArray(t.splits)&&t.splits.length)return t.splits.map(s=>({category:String(s.category||'Other').trim(),rsd:+s.rsdAmount||0,tx:t}));
    return [{category:String(t.category||'Other').trim(),rsd:txRsd(t),tx:t}];
  }
  function matchingParts(b,m){
    const bc=norm(b.category),bs=norm(b.scope);
    const out=[];
    for(const t of S.tx){
      if(t.type!=='Expense'||!String(t.date||'').startsWith(m)||norm(scopeOf(t))!==bs)continue;
      for(const p of parts(t))if(norm(p.category)===bc&&p.rsd>0)out.push(p);
    }
    return out;
  }
  function spentRsd(b,m){return matchingParts(b,m).reduce((x,p)=>x+p.rsd,0)}
  function spentBudgetCurrency(b,m){const r=spentRsd(b,m);return b.currency==='RSD'?r:b.currency==='VND'?conv(r,'RSD','VND'):conv(r,'RSD','EUR')}
  function budgetRsd(b){return b.currency==='RSD'?+b.amount||0:conv(+b.amount||0,b.currency,'RSD')}
  function fmt(n,c='RSD'){return money(Number.isFinite(+n)?+n:0,c)}
  function esc8(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

  function patchBudgetRows(){
    budgetRows=function(){
      const m=chosenMonth();
      if(!S.budgets.length)return '<div class="empty">No budgets yet</div>';
      return S.budgets.map(b=>{
        const spent=spentBudgetCurrency(b,m),remaining=(+b.amount||0)-spent,pct=b.amount?spent/b.amount*100:0,count=matchingParts(b,m).length;
        const cls=pct>=100?'over':pct>=80?'warn':'';
        return `<div class="budget-card"><div class="budget-card-head"><div><div class="budget-title">${esc8(b.category)}</div><div class="budget-meta">${esc8(b.scope)} · ${esc8(b.currency)} · ${count} transaction${count===1?'':'s'} counted</div></div><span class="v7-chip">${pct>=100?'OVER':pct>=80?'WATCH':'OK'}</span></div><div class="budget-amounts"><div><small>Spent</small><strong>${fmt(spent,b.currency)}</strong></div><div style="text-align:right"><small>Budget</small><strong>${fmt(b.amount,b.currency)}</strong></div></div><div class="budget-track"><i class="${cls}" style="width:${Math.max(0,Math.min(100,pct))}%"></i></div><div class="budget-meta">${remaining>=0?fmt(remaining,b.currency)+' remaining':fmt(Math.abs(remaining),b.currency)+' over budget'}</div><div class="budget-actions"><button type="button" onclick="toggleBudgetAudit('${b.id}')">What counts?</button><button type="button" onclick="delBudget('${b.id}')">Delete</button></div><div id="audit-${b.id}" class="budget-details">${auditHtml(b,m)}</div></div>`;
      }).join('')
    }
  }

  function auditHtml(b,m){
    const ps=matchingParts(b,m);
    if(!ps.length)return '<div class="budget-zero">No expenses are assigned to this category for the selected month.</div>';
    return `<div class="budget-note">These are the only entries currently included in ${esc8(b.category)}. If one is wrong, change its category below.</div>`+ps.map((p,i)=>{
      const t=p.tx,a=acc(t.account);const opts=cats.map(c=>`<option ${norm(c)===norm(p.category)?'selected':''}>${esc8(c)}</option>`).join('');
      return `<div class="audit-row"><div><div class="audit-desc">${esc8(t.desc||'Expense')}</div><div class="audit-meta">${esc8(t.date||'')} · ${esc8(a?.name||'')} · ${fmt(p.rsd,'RSD')}</div></div><select class="reclass-select" onchange="reclassBudgetTx('${t.id}',${i},this.value)">${opts}</select></div>`
    }).join('')
  }

  window.toggleBudgetAudit=function(id){const el=document.getElementById('audit-'+id);if(el)el.classList.toggle('open')}
  window.reclassBudgetTx=function(txId,partIndex,newCategory){
    const t=S.tx.find(x=>x.id===txId);if(!t)return;
    if(Array.isArray(t.splits)&&t.splits.length){const matching=t.splits.filter(s=>+s.rsdAmount>0);if(matching[partIndex])matching[partIndex].category=newCategory}
    else t.category=newCategory;
    if(S.merchantRules&&t.desc){const k=String(t.desc).toLowerCase().trim();if(k)S.merchantRules[k]=newCategory}
    persist();render();renderBudgetV8();
  }

  function patchRender(){
    const oldRender=render;render=function(){oldRender();renderBudgetV8()};
    const oldV7=window.renderV7;window.renderV7=function(){if(oldV7)oldV7();renderBudgetV8()};
  }

  window.renderBudgetV8=function(){
    const list=document.getElementById('budgetList');if(list)list.innerHTML=budgetRows();
    const m=chosenMonth();const budgets=S.budgets||[];
    const plannedR=budgets.reduce((x,b)=>x+budgetRsd(b),0),spentR=budgets.reduce((x,b)=>x+spentRsd(b,m),0),remainingR=plannedR-spentR;
    const p=document.getElementById('budgetPlannedV8'),s=document.getElementById('budgetSpentV8'),r=document.getElementById('budgetRemainingV8');if(p)p.textContent=fmt(plannedR,'RSD');if(s)s.textContent=fmt(spentR,'RSD');if(r)r.textContent=fmt(remainingR,'RSD');
    renderDonut(m);renderSpendBars(m);
  }

  function renderDonut(m){
    const svg=document.getElementById('budgetDonutV8'),legend=document.getElementById('budgetLegendV8');if(!svg||!legend)return;
    const rows=S.budgets.map(b=>({name:b.category,value:spentRsd(b,m)})).filter(x=>x.value>0).sort((a,b)=>b.value-a.value);const total=rows.reduce((x,r)=>x+r.value,0);
    if(!total){svg.innerHTML='<circle cx="110" cy="110" r="76" fill="none" stroke="#1b2b43" stroke-width="28"/><text x="110" y="105" text-anchor="middle" fill="#8ea1be" font-size="14">No spending</text><text x="110" y="126" text-anchor="middle" fill="#8ea1be" font-size="12">this month</text>';legend.innerHTML='<div class="muted">No budgeted-category expenses for the selected month.</div>';return}
    const palette=['#5f95ff','#56c79b','#d2a351','#c875e8','#ed7c86','#74b7d8','#9ea86d','#dd8b55'];let a=-Math.PI/2,paths='';rows.forEach((row,i)=>{const ang=row.value/total*Math.PI*2,b=a+ang;paths+=arcPath(110,110,76,48,a,b,palette[i%palette.length]);a=b});svg.innerHTML=paths+`<text x="110" y="104" text-anchor="middle" fill="#eef4ff" font-size="14">Spent</text><text x="110" y="127" text-anchor="middle" fill="#eef4ff" font-size="18" font-weight="700">${shortRsd(total)}</text>`;legend.innerHTML=rows.slice(0,8).map((row,i)=>`<div class="legend-row"><span class="legend-dot" style="--dot:${palette[i%palette.length]}"></span><span>${esc8(row.name)}</span><strong>${shortRsd(row.value)}</strong></div>`).join('')
  }
  function arcPath(cx,cy,r,ri,a0,a1,color){const p=(rad,rr)=>[cx+Math.cos(rad)*rr,cy+Math.sin(rad)*rr],p1=p(a0,r),p2=p(a1,r),q2=p(a1,ri),q1=p(a0,ri),large=a1-a0>Math.PI?1:0;return `<path d="M ${p1[0]} ${p1[1]} A ${r} ${r} 0 ${large} 1 ${p2[0]} ${p2[1]} L ${q2[0]} ${q2[1]} A ${ri} ${ri} 0 ${large} 0 ${q1[0]} ${q1[1]} Z" fill="${color}"/>`}
  function shortRsd(n){return new Intl.NumberFormat(undefined,{notation:'compact',maximumFractionDigits:1}).format(n)+' RSD'}

  function renderSpendBars(m){
    const el=document.getElementById('spendBarsV8');if(!el)return;const rows=S.budgets.map(b=>({name:b.category,spent:spentRsd(b,m),limit:budgetRsd(b)})).sort((a,b)=>b.spent-a.spent);const max=Math.max(1,...rows.map(r=>Math.max(r.limit,r.spent)));
    if(!rows.length){el.innerHTML='<div class="budget-zero">Add a budget to see the visual comparison.</div>';return}
    el.innerHTML=rows.map(r=>`<div class="spend-bar-row"><strong>${esc8(r.name)}</strong><div class="spend-bar"><i style="width:${Math.min(100,r.spent/max*100)}%"></i></div><span>${shortRsd(r.spent)}</span></div>`).join('')
  }
})();