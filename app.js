const express = require('express');
const exphbs = require('express-handlebars');
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
const cors = require('cors');

var albertoKey = 'AIzaSyAStlYQh66ZsHEE9OUqT1KXo9VC8t3TEyM';
var jaredKey = 'AIzaSyCCuO6urauhG_XFJvRRwet5r7_kpPBd6Cw';

const app = express();
const server = http.Server(app);

const PORT = process.env.port || 8080;
const HOST = process.env.host || 'localhost';
const ENV = app.get('env');

var hbs = exphbs.create({
  extname: '.hbs',
  helpers: {
    if_eq: function(a, b, opts) {
      if (a == b) {
        return opts.fn(this);
      } else {
        return opts.inverse(this);
      }
    }
  }
});
app.engine('hbs', hbs.engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('index', {
    title: 'Paint the Town',
    age: "",
    events: config.userInput.events,
    budgets: config.userInput.budgets,
    location: "",
    currentEvent: "",
    currentBudget: ""
  });
});

app.post('/', (req, res) => {
  var age = req.body.selectAge;
  var outing = req.body.selectOut;
  var budget = req.body.selectBudget;
  var location = req.body.selectLocation;

  console.log('age:' + age + ' outing:' + outing + ' budget:' + budget + ' location:' + location);

  res.render('index', {
    title: 'Paint the Town',
    age: age,
    events: config.userInput.events,
    budgets: config.userInput.budgets,
    location: location,
    currentEvent: outing,
    currentBudget: budget
  });
});

app.get('/map', (req, realres) => {
  var key = "AIzaSyAStlYQh66ZsHEE9OUqT1KXo9VC8t3TEyM";
  var data = req.body;

  var age = data.selectAge || 1;
  var akey = "";
  if (age == 1) {
    akey = "teen";
  } else if (age == 2) {
    akey = "young%20adult";
  } else if (age == 3 || age == 4) {
    akey = "professionals";
  } else if (age == 5 || age == 6) {
    akey = "seniors";
  }

  var outing = data.selectOut || 1;
  console.log(outing);
  var outkey1 = "";
  var outkey2 = "";
  var outkey3 = "";
  var outkey4 = "";
  if (outing == 1) {
    outkey1 = "fine%20dining";
    outkey2 = "cocktails";
    outkey3 = "cafe";
    outkey4 = "wine";
  } else if (outing == 2) {
    outkey1 = "restaurant";
    outkey2 = "bar";
    outkey3 = "theater";
    outkey4 = "park";
  } else if (outing == 3) {
    outkey1 = "club";
    outkey2 = "bar";
    outkey3 = "sports";
    outkey4 = "music";
  } else if (outing == 4) {
    outkey1 = "music";
    outkey2 = "theater";
    outkey3 = "movie";
    outkey4 = "comedy";
  } else if (outing == 5) {
    outkey1 = "golf";
    outkey2 = "bowling";
    outkey3 = "sports";
    outkey4 = "park";
  }

  var budget = data.selectBudget || 1;
  console.log(budget);
  var bkey = ""
  if (budget == 1) {
    bkey = "0";
  } else if (budget == 2) {
    bkey = "1";
  } else if (budget == 3) {
    bkey = "2";
  } else if (budget == 4) {
    bkey = "3";
  } else if (budget == 5) {
    bkey = "4";
  }

  var location = data.selectLocation || "St. Louis, MO";

  var radius = 8045; //data.selectRadius * 1609 //meters conversion

  geocoder.geocode(location, function(err, res) {
    var latitude = res[0].latitude;
    var longitude = res[0].longitude;
    console.log(latitude);
    console.log('here');
    var url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?" +
      "key=" + key + "&location=" + latitude + "," + longitude + "&radius=" + radius + "&keyword=" + outkey1 + "&keyword=" + outkey2 + "&keyword=" + outkey3 + "&keyword=" + outkey4 + "&keyword=" + akey + "&maxbudget=" + bkey;
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
        console.log(myObj)
        // console.log(myObj.results[1])

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

        realres.json(markerLocations);
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


server.listen(PORT, HOST, () => {
  console.log(`${ENV.charAt(0).toUpperCase() + ENV.substring(1)} app listening at http://${server.address().address}:${server.address().port}`);
});
