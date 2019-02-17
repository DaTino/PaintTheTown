var map, infoWindow;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {
      lat: -34.397,
      lng: 150.644
    },
    zoom: 16
  });
  infoWindow = new google.maps.InfoWindow;

  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      infoWindow.setPosition(pos);
      infoWindow.setContent('Location found.');
      infoWindow.open(map);
      map.setCenter(pos);
    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }

  var input = document.getElementById('pac-input');
  var searchBox = new google.maps.places.SearchBox(input);

  var markers = [];
  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener('places_changed', function() {
    var places = searchBox.getPlaces();
    if (places.length == 0) {
      return;
    }

    // Clear out the old markers.
    markers.forEach(function(marker) {
      marker.setMap(null);
    });
    markers = [];

    // For each place, get the icon, name and location.
    var bounds = new google.maps.LatLngBounds();
  });

  var age = $('#selectAge').val();
  var outing = $('#selectOut').val();
  var budget = $('#selectBudget').val();
  var location = $('#pac-input').val();

  console.log('age:' + age + ' outing:' + outing + ' budget:' + budget + ' location:' + location);

  if (age && outing && budget && location) {
    $.getJSON('/map', function(data, status) {
      for (var i = 0; i < data.length; i++) {
        var loc = data[i].split(',');
        console.log(loc);

        var myLatlng = new google.maps.LatLng(parseFloat(loc[0]), parseFloat(loc[1]));
        var mapOptions = {
        }

        var marker = new google.maps.Marker({
          position: myLatlng,
          title: "Hello World!"
        });

        marker.setMap(map);
      }
    });
  }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ? 'Error: The Geolocation service failed.' : 'Error: Your browser doesn\'t support geolocation.');
  infoWindow.open(map);
}
