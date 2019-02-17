const express = require('express');
const hbs = require('express-handlebars');
const http = require('http');
const https = require('https');
const path = require('path');
const fs = require('fs');
const process = require('process');
const bodyParser = require('body-parser');
const config = require('./config');
const googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyAStlYQh66ZsHEE9OUqT1KXo9VC8t3TEyM'
});
const nodeGeocoder = require('node-geocoder');
const ngOptions = {
  provider: 'google',
  httpAdapter: 'https', // Defaultf
  apiKey: 'AIzaSyAStlYQh66ZsHEE9OUqT1KXo9VC8t3TEyM', // for Mapquest, OpenCage, Google Premier
  formatter: null // 'gpx', 'string', ...
};
const geocoder = nodeGeocoder(ngOptions);

var albertoKey = 'AIzaSyAStlYQh66ZsHEE9OUqT1KXo9VC8t3TEyM';
var jaredKey = 'AIzaSyCCuO6urauhG_XFJvRRwet5r7_kpPBd6Cw';

const app = express();
const server = http.Server(app);

const PORT = process.env.port || 8080;
const HOST = process.env.host || 'localhost';
const ENV = app.get('env');

app.engine('hbs', hbs({
  extname: '.hbs'
}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('index', {
    title: 'Paint the Town',
    ages: config.userInput.ages,
    events: config.userInput.events,
    budgets: config.userInput.budgets,
    location: null
  });
});

app.post('/map', (req, realres) => {
  var key = "AIzaSyAStlYQh66ZsHEE9OUqT1KXo9VC8t3TEyM";
  var data = req.body;

  var age = data.selectAge;
  var akey = "";
  if (age = "13-19") {
    akey = "teen";
  }
  else if (age == "20-29") {
    akey = "young%20adult";
  }
  else if (age == "30-39" || "40-49") {
    akey = "professionals";
  }
  else if (age == "50-59" || "60+") {
    akey = "seniors";
  }

  var outing = data.selectOut;
  var outkey1 = "";
  var outkey2 = "";
  var outkey3 = "";
  var outkey4 = "";
  if (outing == "Business") {
    outkey1 = "fine%20dining";
    outkey2 = "cocktails";
    outkey3 = "cafe";
    outkey4 = "wine";
  }
  else if (outing == "Date") {
    outkey1 = "restaurant";
    outkey2 = "bar";
    outkey3 = "theater";
    outkey4 = "park";
  }
  else if (outing == "Party") {
    outkey1 = "club";
    outkey2 = "bar";
    outkey3 = "sports";
    outkey4 = "music";
  }
  else if (outing == "Show") {
    outkey1 = "music";
    outkey2 = "theater";
    outkey3 = "movie";
    outkey4 = "comedy";
  }
  else if (outing == "Sports") {
    outkey1 = "golf";
    outkey2 = "bowling";
    outkey3 = "sports";
    outkey4 = "park";
  }

  var budget = data.selectBudget;
  var bkey = ""
  if (budget == "Free" ) {
    bkey = "0";
  }
  else if (budget == "$") {
    bkey = "1";
  }
  else if (budget == "$") {
    bkey = "2";
  }
  else if (budget == "$$") {
    bkey = "3";
  }
  else if (budget == "$$$") {
    bkey = "4";
  }

  var location = data.selectLocation;

  var radius = 8045; //data.selectRadius * 1609 //meters conversion

  geocoder.geocode(location, function(err, res) {
    var latitude = res[0].latitude;
    var longitude = res[0].longitude;
    console.log(latitude);
    console.log('here');
    var url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?" +
      "key=" + key + "&location=" + latitude + "," + longitude + "&radius=" + radius;
    + "&keyword=" + outkey1 + "&keyword=" + outkey2 + "&keyword=" + outkey3 + "&keyword=" + outkey4 + "&keyword=" + akey + "&maxbudget=" + bkey;
    console.log(url);
    https.get(url, function(response) {
      var body = '';
      response.on('data', function(chunk) {
        body += chunk;
      });
      response.on('end', function() {
        var places = JSON.parse(body);
        var locations = places.results;
        //console.log(locations);
        var myObj = JSON.parse(body);
        //console.log(myObj)
        console.log(myObj.results[1])

        var mylats = [];
        var mylngs = [];
        var markerLocations = [];
        var markerTitles = [];
        var markerIcons = [];
        var markerPricing = [];
        var markerRating = [];

        for (var i = 1; i < myObj.results.length; i++) {
          //console.log(myObj.results[i].vicinity);
          mylats[i - 1] = myObj.results[i].geometry.location.lat
          mylngs[i - 1] = myObj.results[i].geometry.location.lng
          markerTitles[i - 1] = myObj.results[i].name
          markerIcons[i - 1] = myObj.results[i].icon
          markerPricing[i - 1] = myObj.results[i].price_level
          markerRating[i - 1] = myObj.results[i].rating
          //console.log(myObj.results[i].geometry.location.lat)
          //console.log(myObj.results[i].geometry.location.lng)
          console.log(mylats[i - 1])
          console.log(mylngs[i - 1])
        }

        for (var i = 0; i < mylats.length; i++) {
          markerLocations[i] = mylats[i] + ", " + mylngs[i];
          console.log(markerLocations)
          console.log(markerTitles)
        }

        realres.json(JSON.stringify(markerLocations));
        //response.json(locations);
      });
    });
  });
});

//app.get('/locations', (req))

app.get('/test', (req, res) => {
  res.render('test');
});

app.get('/test2', (req, res) => {
  res.render('test2');
});

app.use((req, res, next) => {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

if (app.get('env') === 'development') {
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', {
      status: err.status,
      message: err.message,
      error: err
    });
  });
}


app.use((err, req, res, next) => {
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', {
      status: err.status,
      message: err.message,
      error: {}
    });
  });
});

server.listen(PORT, HOST, () => {
  console.log(`${ENV.charAt(0).toUpperCase() + ENV.substring(1)} app listening at http://${server.address().address}:${server.address().port}`);
});
