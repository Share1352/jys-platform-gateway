(()=>{
  const s=document.createElement('script');
  s.src='app-v5.js?v=5';
  s.onload=setupV6;
  s.onerror=()=>alert('TriLedger could not load its finance engine. Please refresh while online.');
  document.body.appendChild(s);

  function setupV6(){
    const CUSTOM_KEY='triledger-custom-categories-v1';
    let custom=[];
    try{custom=JSON.parse(localStorage.getItem(CUSTOM_KEY)||'[]');if(!Array.isArray(custom))custom=[]}catch{custom=[]}
    custom=custom.filter(x=>typeof x==='string'&&x.trim()).map(x=>x.trim());
    for(const c of custom)if(!cats.some(x=>x.toLowerCase()===c.toLowerCase()))cats.push(c);

    const originalFill=fillSelects;
    fillSelects=function(){
      originalFill();
      const all=[...cats];
      const html=all.map(c=>`<option>${escapeHtml(c)}</option>`).join('');
      tcat.innerHTML=html;bcat.innerHTML=html;
    };

    window.openIncome=function(){
      openTx(false);
      ttype.value='Income';
      txFormMode();
      setTimeout(()=>tamount.focus(),50);
    };

    const dlg=document.createElement('dialog');
    dlg.id='categoryDlg';
    dlg.innerHTML=`<form id="categoryForm" class="forms">
      <label class="full">New category<input id="newCategoryName" required maxlength="40" placeholder="e.g. Gifts, Beauty, Household"></label>
      <div class="actions full"><button type="button" id="cancelCategory">Cancel</button><button class="primary">Add category</button></div>
    </form>`;
    document.body.appendChild(dlg);
    const form=dlg.querySelector('#categoryForm'),input=dlg.querySelector('#newCategoryName');
    dlg.querySelector('#cancelCategory').onclick=()=>dlg.close();
    window.openCategory=function(){input.value='';dlg.showModal();setTimeout(()=>input.focus(),40)};
    form.onsubmit=e=>{
      e.preventDefault();const name=input.value.trim();if(!name)return;
      if(cats.some(c=>c.toLowerCase()===name.toLowerCase())){alert('That category already exists.');return}
      custom.push(name);cats.push(name);localStorage.setItem(CUSTOM_KEY,JSON.stringify(custom));dlg.close();render();renderCategoryManager();
    };
    window.deleteCustomCategory=function(name){
      const used=S.tx.some(t=>t.category===name)||S.budgets.some(b=>b.category===name);
      if(used){alert('This category is already used by a transaction or budget. Reassign those items before deleting it.');return}
      custom=custom.filter(c=>c!==name);localStorage.setItem(CUSTOM_KEY,JSON.stringify(custom));
      const i=cats.indexOf(name);if(i>=0)cats.splice(i,1);render();renderCategoryManager();
    };

    addQuickButtons();
    addCategoryManager();
    render();
    renderCategoryManager();

    function addQuickButtons(){
      const header=document.querySelector('header .toolbar-actions');
      if(header&&!document.getElementById('headerIncome')){
        const income=button('+ Income','openIncome()', 'headerIncome');
        const cat=button('+ Category','openCategory()', 'headerCategory');
        const expense=[...header.querySelectorAll('button')].find(b=>b.textContent.includes('Expense'));
        header.insertBefore(income,expense||null);header.insertBefore(cat,expense||null);
      }
      const txActions=document.querySelector('#tx .toolbar-actions');
      if(txActions&&!document.getElementById('txIncome')){
        const income=button('+ Income','openIncome()', 'txIncome');
        const cat=button('+ Category','openCategory()', 'txCategory');
        txActions.append(income,cat);
      }
      const budgetActions=document.querySelector('#budgets .toolbar');
      if(budgetActions&&!document.getElementById('budgetCategory')){
        const cat=button('+ Category','openCategory()', 'budgetCategory');
        const addBudget=[...budgetActions.querySelectorAll('button')].find(b=>b.textContent.includes('Budget'));
        budgetActions.insertBefore(cat,addBudget||null);
      }
    }
    function addCategoryManager(){
      const settings=document.getElementById('settings');if(!settings||document.getElementById('categoryManager'))return;
      const backupHeading=[...settings.querySelectorAll('h2')].find(h=>h.textContent.trim()==='Backup');
      const wrap=document.createElement('div');wrap.id='categoryManager';wrap.innerHTML=`<h2>Categories</h2><div class="panel"><div class="toolbar" style="margin:0 0 10px"><div><strong>Custom categories</strong><div class="help">Create categories that appear in transactions and budgets.</div></div><button onclick="openCategory()">+ Category</button></div><div id="customCategoryList" class="list"></div></div>`;
      settings.insertBefore(wrap,backupHeading||null);
    }
    function renderCategoryManager(){
      const el=document.getElementById('customCategoryList');if(!el)return;
      el.innerHTML=custom.length?custom.map(c=>`<div class="row"><div><strong>${escapeHtml(c)}</strong><small>Custom category</small></div><button onclick="deleteCustomCategory('${escapeJs(c)}')">Delete</button></div>`).join(''):'<div class="empty">No custom categories yet</div>';
    }
    function button(label,handler,id){const b=document.createElement('button');b.id=id;b.textContent=label;b.setAttribute('onclick',handler);return b}
    function escapeHtml(v){return String(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
    function escapeJs(v){return String(v).replace(/\\/g,'\\\\').replace(/'/g,"\\'")}
  }
})();
