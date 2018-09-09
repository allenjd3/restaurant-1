self.addEventListener('install', function(event) {
    event.waitUntil(
      caches.open('at-restaurant-v3').then(function(cache) {
        return cache.addAll(
          [
            '/',
            '/index.html',
            '/restaurant.html',
            '/img/1.jpg',
            '/img/2.jpg',
            '/img/3.jpg',
            '/img/4.jpg',
            '/img/5.jpg',
            '/img/6.jpg',
            '/img/7.jpg',
            '/img/8.jpg',
            '/img/9.jpg',
            '/img/10.jpg',
            '/js/main.js',
            '/js/restaurant_info.js',
            '/lib/star_1.svg',
            '/css/styles.css'

          ]
        );
      })
    );
  });

  self.addEventListener('fetch', function(event) {
    event.respondWith(
      caches.match(event.request)
        .then(function(response) {
          // Cache hit - return response
          
          if (response && response != 'reviewsByRestaurantId') {
            return response;
          }
  
          // IMPORTANT: Clone the request. A request is a stream and
          // can only be consumed once. Since we are consuming this
          // once by cache and once by the browser for fetch, we need
          // to clone the response.
          var fetchRequest = event.request.clone();
  
          return fetch(fetchRequest).then(
            function(response) {
              // Check if we received a valid response
              if(!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
  
              // IMPORTANT: Clone the response. A response is a stream
              // and because we want the browser to consume the response
              // as well as the cache consuming the response, we need
              // to clone it so we have two streams.
              var responseToCache = response.clone();

              caches.open('at-restaurant-v3')
                .then(function(cache) {

                  cache.put(event.request, responseToCache);
                  
                });
  
              return response;
            }
          );
        })
      );
  });
  