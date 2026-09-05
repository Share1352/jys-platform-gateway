const CACHE='triledger-finance-installed14';
const ASSETS=['./','./index.html','./manifest.webmanifest','./styles.css','./app.js','./stable-migration.js','./stable-ui.js','./stable-budget.js','./stable-plan.js','./stable-workspaces.js','./stable-intelligence.js','./stable-installed.js'];

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
    const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    await Promise.all(windows.map(async client=>{
      try{
        const u=new URL(client.url);
        if(u.origin===self.location.origin&&u.pathname.startsWith('/finance/')&&u.searchParams.get('installed')!=='14'){
          u.searchParams.set('installed','14');
          await client.navigate(u.href);
        }
      }catch{}
    }));
  })());
});

self.addEventListener('message',event=>{
  if(event.data?.type==='SKIP_WAITING')self.skipWaiting();
});

self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;
  if(event.request.mode==='navigate'){
    event.respondWith((async()=>{
      try{
        const response=await fetch(event.request,{cache:'no-store'});
        if(response&&response.ok){const cache=await caches.open(CACHE);await cache.put('./index.html',response.clone())}
        return response;
      }catch{
        return (await caches.match('./index.html'))||Response.error();
      }
    })());
    return;
  }
  event.respondWith((async()=>{
    try{
      const response=await fetch(event.request,{cache:'no-store'});
      if(response&&response.ok){const cache=await caches.open(CACHE);await cache.put(event.request,response.clone())}
      return response;
    }catch{
      return (await caches.match(event.request))||Response.error();
    }
  })());
});
