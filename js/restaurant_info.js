let restaurant;
let reviews;
var newMap;


/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {  
  fetchReviewsByRestaurantId();
  initMap();
  if(navigator.onLine){
    DBHelper.onlineForm();
  }
});

/**
 * Initialize leaflet map
 */
initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {      
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
        scrollWheelZoom: false
      });
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
        mapboxToken: 'pk.eyJ1IjoiamFsbGVuNCIsImEiOiJjamo0eXJxa3gxc3lpM2twMWhuY2lob3AwIn0.I2rZ1epi98n9LDHBZg_l_g',
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'    
      }).addTo(newMap);
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
}  
 

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }

  if (!getParameterByName('id')) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    let id = getParameterByName('id');
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });

  }
}


fetchReviewsByRestaurantId = (id = getParameterByName('id')) => {
  DBHelper.fetchReviewsByRestaurantId(id, (error, reviews) => {
      
    self.reviews = reviews;
    if(!reviews) {
      console.error(error);
      return;
    }
  });
}


/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.setAttribute('alt', restaurant.alt);
  image.src = DBHelper.imageUrlForRestaurant(restaurant);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  
  fillReviewsHTML();

}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');

  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!self.reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  self.reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  
  container.appendChild(ul);
  
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  li.setAttribute('id',  `review-${review.id}`)
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  myDate = new Date(review.createdAt);
  date.innerHTML = `Posted: ${(myDate.getMonth() + 1)}/${myDate.getDate()}/${myDate.getFullYear()} at ${myDate.getHours()}:${myDate.getMinutes()}`
  
  
  
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.setAttribute('class', 'rating-stars');
  switch(Number(review.rating)) {
    case 1: 
      rating.innerHTML = `<img src="./lib/star_1.svg" alt="1 star" />`;
      break;
    case 2:
      rating.innerHTML = `<img src="./lib/star_1.svg" alt="1 star" /> <img src="./lib/star_1.svg" alt="1 star" />`;
      break;
    case 3:
      rating.innerHTML = `<img src="./lib/star_1.svg" alt="1 star" /> <img src="./lib/star_1.svg" alt="1 star" /> <img src="./lib/star_1.svg" alt="1 star" />`;
      break;
    case 4:
      rating.innerHTML = `<img src="./lib/star_1.svg" alt="1 star" /> <img src="./lib/star_1.svg" alt="1 star" /> <img src="./lib/star_1.svg" alt="1 star" /> <img src="./lib/star_1.svg" alt="1 star" />`;
      break;
    case 5:
      rating.innerHTML = `<img src="./lib/star_1.svg" alt="1 star" /> <img src="./lib/star_1.svg" alt="1 star" /> <img src="./lib/star_1.svg" alt="1 star" /> <img src="./lib/star_1.svg" alt="1 star" /> <img src="./lib/star_1.svg" alt="1 star" />`;
      break;
    default:
      rating.innerHTML = `There was a problem`;
  }
  
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}


var radios = document.forms["reviewForm"].elements["rating"];
for(var i = 0, max = radios.length; i < max; i++) {
    radios[i].onclick = function() {
        let rev = document.getElementsByClassName('review-star')
        for (var i = 0; i < rev.length; i++) {
          rev[i].style.opacity = 0.3; 
        }
        this.nextElementSibling.style.opacity = 1;
        prevAll(this);
    }
}

prevAll = (element) => {
  while (element = element.previousElementSibling)
      element.style.opacity = 1;
  return;
}

const form = document.forms.namedItem('reviewForm');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const id = getParameterByName('id');
  const data = new FormData(form);
  data.append('restaurant_id', parseInt(id));

  let dataObj = {};
  data.forEach((val, key) => {
    dataObj[key] = val;
  });

  // data.append('rating',starRating1.getRating());
  if(navigator.onLine) {
    fetch(`${DBHelper.BASE_URL}/reviews`, {method:'POST', body: data})
    .then(res => res.json())
    .then(response => {
      const ul = document.getElementById('reviews-list');
      ul.appendChild(createReviewHTML(response));
      location.href = `#review-${response.id}`
      DBHelper.addReviewToCache(response, id);
      document.getElementById('review-form').reset();
    })
    .catch(message=> console.log(message));
  }
  else {
    const ul = document.getElementById('reviews-list');
    dataObj.id = (Math.random()*10000) + 4999;
    dataObj.createdAt = new Date(Date.now());
    ul.appendChild(createReviewHTML(dataObj));
    location.href = `#review-${dataObj.id}`
    DBHelper.addReviewToCache(dataObj, id)
    DBHelper.offlineForm(dataObj);
    document.getElementById('review-form').reset();
  }
  
});




/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  li.setAttribute('aria-current', 'page');
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
