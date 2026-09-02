(()=>{
  const loader=document.createElement('script');
  loader.src='app-v8.js?v=8';
  loader.onload=wait;
  loader.onerror=()=>alert('TriLedger could not load. Refresh while online.');
  document.body.appendChild(loader);

  function wait(){
    let n=0;const timer=setInterval(()=>{
      n++;
      try{if(window.__triledgerV8&&typeof S!=='undefined'&&typeof receiptCategory==='function'){clearInterval(timer);setup()}else if(n>260){clearInterval(timer)}}catch(e){if(n>260)clearInterval(timer)}
    },50)
  }

  function setup(){
    if(window.__triledgerV9)return;window.__triledgerV9=true;
    patchCategorizer();
    const repaired=repairFalseUtilities();
    if(repaired){persist();render();if(window.renderBudgetV8)renderBudgetV8()}
    addRepairNotice(repaired);
  }

  function normalize9(s){return String(s||'').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim()}
  function hasWord(x,w){return new RegExp(`(^|[^a-z0-9])${w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}([^a-z0-9]|$)`,'i').test(x)}
  function utilityEvidence(text){
    const x=normalize9(text);
    return /\beps\b|elektro|infostan|elektroprivreda|elektric|struja|vodovod|\bvoda\b|gas bill|utility bill|internet bill|telekom|yettel/.test(x)||hasWord(x,'a1')&&/(telekom|telefon|mobile|mobil|racun|račun|internet|postpaid|prepaid)/.test(x)
  }

  function safeCategory(text){
    const x=normalize9(text);
    if(S.merchantRules&&typeof S.merchantRules==='object'){
      const nx=x.replace(/[^a-z0-9čćšđž]+/g,' ').trim();
      for(const [m,c] of Object.entries(S.merchantRules).sort((a,b)=>b[0].length-a[0].length))if(m.length>=3&&nx.includes(m))return c
    }
    const rules=[
      ['Restaurant',/restoran|restaurant|mcdonald|mc donald|burger king|kfc|pizza|pizzeria|grill|roštilj|rostilj|bistro|kitchen|kuhinja/],
      ['Cafe',/\bcafe\b|\bkafe\b|coffee|coffeedream|kafeterija|espresso|cappuccino|barista/],
      ['Food',/maxi|\bidea\b|lidl|univerexport|aroma|shop.?go|\bdis\b|market|supermarket|pekara|bakery|hrana|grocery/],
      ['Health',/apoteka|pharmacy|lekovi|medic|dm droger|lilly droger/],
      ['Transport',/nis petrol|gazprom|\bomv\b|\bmol\b|fuel|gorivo|taxi|yandex|car:go|parking|prevoz|\bgsp\b/],
      ['Utilities',/\beps\b|elektro|infostan|elektroprivreda|struja|vodovod|internet bill|telekom|yettel/],
      ['Shopping',/ikea|jysk|zara|h&m|reserved|sport vision|gigatron|tehnomanija|shopping|ode[cć]a|obuca|obuća|droger/],
      ['Housing',/\brent\b|kirija|stanarina|landlord/],
      ['Education',/school|škola|skola|kurs|course|book|knjiga/],
      ['Travel',/hotel|hostel|booking|airbnb|flight|avio|airport/]
    ];
    for(const [c,r] of rules)if(r.test(x))return c;
    if(hasWord(x,'a1')&&/(telekom|telefon|mobile|mobil|racun|račun|internet|postpaid|prepaid)/.test(x))return 'Utilities';
    return 'Other'
  }

  function patchCategorizer(){
    receiptCategory=function(text){return safeCategory(text)}
  }

  function repairFalseUtilities(){
    let count=0;
    for(const t of S.tx||[]){
      if(t.type!=='Expense'||String(t.category||'').toLowerCase()!=='utilities')continue;
      if(!(t.receiptScanned||t.imported))continue;
      const evidence=[t.desc,t.receiptText].filter(Boolean).join('\n');
      if(utilityEvidence(evidence))continue;
      const replacement=safeCategory(evidence);
      t.category=replacement==='Utilities'?'Other':replacement;
      t.categoryRepair='removed false Utilities match from broad A1 rule';
      count++
    }
    return count
  }

  function addRepairNotice(count){
    const sec=document.getElementById('budgets');if(!sec)return;
    let n=document.getElementById('categoryRepairNotice');
    if(!n){n=document.createElement('div');n.id='categoryRepairNotice';n.className='notice';const top=document.getElementById('budgetV8Top');(top||sec.firstElementChild).insertAdjacentElement(top?'beforebegin':'afterend',n)}
    n.innerHTML=count?`<strong>Category repair completed</strong>${count} scanned/imported transaction${count===1?' was':'s were'} removed from Utilities because there was no genuine utility evidence. Use <b>What counts?</b> on any budget to inspect its source transactions.`:`<strong>Transparent budget totals</strong>Every budget now has a <b>What counts?</b> button showing the exact transactions included. Automatic Utilities categorization now requires real utility evidence; an isolated receipt code such as “A1” no longer triggers it.`
  }
})();