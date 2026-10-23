/* 德州扑克积分 · 离线缓存 Service Worker */
const CACHE='poker-score-v1';
const CORE=['./','index.html','manifest.json','icon.svg','icon-180.png'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE).catch(()=>{})).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});

self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET'||req.url.startsWith('blob:')||req.url.startsWith('data:'))return;
  e.respondWith(
    caches.match(req).then(hit=>{
      if(hit)return hit;
      return fetch(req).then(res=>{
        if(res&&res.ok&&res.type==='basic'){
          const copy=res.clone();
          caches.open(CACHE).then(c=>c.put(req,copy).catch(()=>{}));
        }
        return res;
      }).catch(()=>caches.match('./index.html'));
    })
  );
});
