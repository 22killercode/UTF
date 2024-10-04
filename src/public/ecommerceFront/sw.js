//console.log('Entro al Service Worker');

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
  .then(function(registration) {
    console.log('Service Worker registered with scope:', registration.scope);
  }).catch(function(error) {
    //console.log('Service Worker registration failed:', error);
  });
}


self.addEventListener('install', event => {
  console.log('Service Worker instalado');
});

self.addEventListener('activate', event => {
  console.log('Service Worker activado');
});



