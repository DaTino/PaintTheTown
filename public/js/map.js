var map, infoWindow;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {
      lat: 38.6270,
      lng: -90.1994
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
      // map.setCenter(pos);
    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }

  var geocoder = new google.maps.Geocoder();
  var location = $('#pac-input').val() || "";

  if (location) {
    geocoder.geocode({
      'address': location
    }, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        var lat = results[0].geometry.location.lat();
        var lng = results[0].geometry.location.lng();
        map.setCenter({
          lat: lat,
          lng: lng
        });
        alert(lat + ' ' + lng);
      }
    });
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
        var mapOptions = {}

        var marker = new google.maps.Marker({
          position: myLatlng,
          title: "Hello World!",
          icon: {
            url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
          }
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
