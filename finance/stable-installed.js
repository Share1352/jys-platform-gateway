(()=>{
  const BUILD='stable13';
  const standalone=window.matchMedia?.('(display-mode: standalone)')?.matches||window.navigator.standalone===true;
  function addStatus(){
    const settings=document.getElementById('settings');if(!settings||document.getElementById('installedBuildStatus'))return;
    const n=document.createElement('div');n.id='installedBuildStatus';n.className='notice';
    n.innerHTML=`<strong>${standalone?'iPhone Home Screen app':'Browser build'} · ${BUILD}</strong>${standalone?'This is the installed TriLedger app. It now updates itself while preserving the existing local finance database.':'Open the existing Home Screen TriLedger icon to use its own local data store.'}`;
    settings.insertAdjacentElement('afterbegin',n);
  }
  async function forceUpdate(){
    if(!('serviceWorker' in navigator))return;
    try{
      const reg=await navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'});
      await reg.update();
      let reloading=false;
      navigator.serviceWorker.addEventListener('controllerchange',()=>{
        if(reloading)return;reloading=true;
        const u=new URL(location.href);u.searchParams.set('installed','13');location.replace(u.href);
      });
      if(reg.waiting){reg.waiting.postMessage({type:'SKIP_WAITING'});}
    }catch(e){console.warn('TriLedger installed updater',e)}
  }
  addStatus();forceUpdate();
})();
