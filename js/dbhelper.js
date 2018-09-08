/**
 * Common database helper functions.
 */


class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get BASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}`;
  }
  static get DATABASE_URL() {
    
    return `${DBHelper.BASE_URL}/restaurants`;
  }
  static createDb(store) {
    var dbPromise = idb.open('restaurant-store', 1, upgradeDB => {
      upgradeDB.createObjectStore(store, { keypath: 'id' });
    });

    const idbKeyval = {
      get(key) {
        return dbPromise.then(db => {
          return db.transaction(store)
            .objectStore(store).get(key);
        });
      },
      set(key, val) {
        return dbPromise.then(db => {
          const tx = db.transaction(store, 'readwrite');
          tx.objectStore(store).put(val, key);
          return tx.complete;
        });
      },
      delete(key) {
        return dbPromise.then(db => {
          const tx = db.transaction(store, 'readwrite');
          tx.objectStore(store).delete(key);
          return tx.complete;
        });
      },
      clear() {
        return dbPromise.then(db => {
          const tx = db.transaction(store, 'readwrite');
          tx.objectStore(store).clear();
          return tx.complete;
        });
      },
      keys() {
        return dbPromise.then(db => {
          const tx = db.transaction(store);
          const keys = [];
          const store = tx.objectStore(store);

          // This would be store.getAllKeys(), but it isn't supported by Edge or Safari.
          // openKeyCursor isn't supported by Safari, so we fall back
          (store.iterateKeyCursor || store.iterateCursor).call(store, cursor => {
            if (!cursor) return;
            keys.push(cursor.key);
            cursor.continue();
          });

          return tx.complete.then(() => keys);
        });
      }
    }
    return idbKeyval;

  }
  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    var idbPromise = DBHelper.createDb('restaurants');
    idbPromise.get('restaurants').then(val => {
      if(val) {
        callback(null, val)
      }
      else {
        fetch(DBHelper.DATABASE_URL)
        .then(response => response.json())
        .then(res => {
          idbPromise.set('restaurants', res);
          callback(null, res);
        })
        .catch(e => callback(e, null));
      }
    });

  }

  static offlineForm(formData) {
    var idbPromise = DBHelper.createDb('restaurants');
    
    idbPromise.get('offlineForm').then((val)=>{
      let dbArray = [];
      dbArray = val;
      dbArray.push(formData);
      idbPromise.set('offlineForm', dbArray);
    }).catch((e)=>{
      let dbArray = [];
      dbArray.push(formData);
      idbPromise.set('offlineForm', dbArray);
    });
    

  }
  static offlineFavorite(fav) {
    var idbPromise = DBHelper.createDb('restaurants');
    
    idbPromise.get('offlineFavorite').then((val)=>{
      let dbArray = [];
      dbArray = val;
      dbArray.push(fav);
      idbPromise.set('offlineFavorite', dbArray);
    }).catch((e)=>{
      let dbArray = [];
      dbArray.push(fav);
      idbPromise.set('offlineFavorite', dbArray);
    });
    

  }

  static onlineForm() {
    var idbPromise = DBHelper.createDb('restaurants');
    
    idbPromise.get('offlineForm').then(vals => {
      if(vals) {
        vals.forEach((val)=>{
          
          fetch(`${DBHelper.BASE_URL}/reviews`, {method:'POST', body: JSON.stringify(val)})
          .then(res => res.json())
          .then(response => {
            
          })
          .catch(message=> console.log(message));
         })
        idbPromise.delete('offlineForm');
        
        
      }
      else {
        return;
      }
    })
  }

  static onlineFavorite(id) {
    var idbPromise = DBHelper.createDb('restaurants');
    
    idbPromise.get('offlineFavorite').then(vals => {
      if(vals) {

        vals.forEach((val)=>{

          console.log(val.is_favorite);
          if(val.is_favorite == 'true') {
            fetch(`${DBHelper.BASE_URL}/restaurants/${id}/?is_favorite=true`, {method:'POST'})
              .then(res=>res.json())
              .then(response => {})
              .catch((e)=>{
                console.error(e);
              })
          }
          else {
            fetch(`${DBHelper.BASE_URL}/restaurants/${id}/?is_favorite=false`, {method:'POST'})
              .then(res=>res.json())
              .then(response => {
                
              })
              .catch((e)=>{
                console.error(e);
              })
          }
          
         })
        idbPromise.delete('offlineFavorite');
        
        
      }
      else {
        return;
      }
    })
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    // fetch all restaurants with proper error handling.
    var idbPromise = DBHelper.createDb('restaurants');
    idbPromise.get(`restaurantsById-${id}`).then(val => {
      if(val) {
        callback(null, val)
      }
      else {
        fetch(DBHelper.DATABASE_URL + '/' + id)
        .then(res => res.json())
        .then(res => {
          idbPromise.set(`restaurantsById-${id}`, res);
          callback(null, res);
        })
        .catch(e => callback(e, null));
      }
    });



  }

  static fetchReviewsByRestaurantId(id, callback) {
    var idbPromise = DBHelper.createDb('restaurants');
    idbPromise.get(`reviewsByRestaurantId-${id}`).then(val => {
      if(val) {
        callback(null, val)
      }
      else {

        fetch(DBHelper.BASE_URL + '/reviews/?restaurant_id=' + id)
          .then(res => res.json())
          .then(res => {
            idbPromise.set(`reviewsByRestaurantId-${id}`, res);
            
            callback(null, res);
          })
          .catch(e => callback(e, null));
      }
    })
  }

  static addReviewToCache(review, restaurant_id) {
    var idbPromise = DBHelper.createDb('restaurants');
    idbPromise.get(`reviewsByRestaurantId-${restaurant_id}`).then(val => {
        if(val) {
          val.push(review);

          idbPromise.set(`reviewsByRestaurantId-${restaurant_id}`, val);


        }
        else {
          console.error(`That review didn't work right...`)
        }
      })
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhoodAndFavorite(cuisine, neighborhood, favorite, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        if (favorite != 'all') {
          results = results.filter(r => r.is_favorite == favorite);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.photograph ? restaurant.photograph : "10"}.jpg`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker  
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {
        title: restaurant.name,
        alt: restaurant.name,
        url: DBHelper.urlForRestaurant(restaurant)
      })
    marker.addTo(newMap);
    return marker;
  }

  static resetFavorite(res, id) {
    var idbPromise = DBHelper.createDb('restaurants');
    idbPromise.get(`restaurantsById-${id}`).then(val => {
        if(val) {
          idbPromise.set(`restaurantsById-${id}`, res);

        }
        else {
          console.error(`That didn't work right...`)
        }
      })
  }

  

}

