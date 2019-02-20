const express = require('express');
const exphbs = require('express-handlebars');

const http = require('http');
const https = require('https');

const path = require('path');
const fs = require('fs');
const process = require('process');

const bodyParser = require('body-parser');
const cors = require('cors');

const config = require('./config');
const private = require('./private.json');

const googleMapsClient = require('@google/maps').createClient({key: private.googleMapAPIKey});
const nodeGeocoder = require('node-geocoder');
const geocoder = nodeGeocoder({
  provider: 'google',
  httpAdapter: 'https', // Defaultf
  apiKey: private.googleMapAPIKey, // for Mapquest, OpenCage, Google Premier
  formatter: null // 'gpx', 'string', ...
});

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://jaredible.net:27017/";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  console.log("Connected!");
  db.close();
});

const app = express();
const server = http.Server(app);

const PORT = process.env.port || 8080;
const HOST = process.env.host || 'localhost';
const ENV = app.get('env');
const DEBUG = process.env.debug || false;

app.engine('hbs', exphbs.create({
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
}).engine);

app.set('view engine', 'hbs');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
  res.render('index', {
    title: 'Paint the Town',
    age: "",
    events: config.options.events,
    budgets: config.options.budgets,
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

  res.render('index', {
    title: 'Paint the Town',
    age: age,
    events: config.options.events,
    budgets: config.options.budgets,
    location: location,
    currentEvent: outing,
    currentBudget: budget
  });
});

app.get('/map', (req, res) => {
  var key = private.googleMapAPIKey;
  var data = req.body;

  var age = data.selectAge || 1;
  var keyA = "";
  if (age == 1) {
    keyA = "teen";
  } else if (age == 2) {
    keyA = "young%20adult";
  } else if (age == 3 || age == 4) {
    keyA = "professionals";
  } else if (age == 5 || age == 6) {
    keyA = "seniors";
  }

  var outing = data.selectOut || 1;
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
  var keyMaxBudget = ""
  if (budget == 1) {
    keyMaxBudget = "0";
  } else if (budget == 2) {
    keyMaxBudget = "1";
  } else if (budget == 3) {
    keyMaxBudget = "2";
  } else if (budget == 4) {
    keyMaxBudget = "3";
  } else if (budget == 5) {
    keyMaxBudget = "4";
  }

  var location = data.selectLocation || "";

  if (DEBUG) {
    console.log('age: ' + age + ' outing: ' + outing + ' budget: ' + budget + ' location: ' + location);
    console.log('keyA: ' + keyA); // TODO
  }

  var radius = 8045; //data.selectRadius * 1609 //meters conversion

  geocoder.geocode(location, function(err, res) {
    var latitude = res[0].latitude;
    var longitude = res[0].longitude;

    if (DEBUG) console.log('latitude: ' + latitude + ' longitude: ' + longitude);

    var url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=" + key + "&location=" + latitude + "," + longitude + "&radius=" + radius + "&keyword=" + outkey1 + "&keyword=" + outkey2 + "&keyword=" + outkey3 + "&keyword=" + outkey4 + "&keyword=" + keyA + "&maxbudget=" + keyMaxBudget;

    if (DEBUG) console.log('url: ' + url);

    https.get(url, function(res) {
      var body = '';

      res.on('data', function(chunk) {
        body += chunk;
      });

      res.on('end', function() {
        var places = JSON.parse(body);
        var locations = places.results;
        var data = JSON.parse(body);

        if (DEBUG) console.log('data: ' + data);

        var myLats = [];
        var myLngs = [];
        var markerTitles = []; // TODO use
        var markerIcons = []; // TODO use
        var markerPricing = []; // TODO use
        var markerRating = []; // TODO use

        for (var i = 1; i < data.results.length; i++) {
          myLats[i - 1] = data.results[i].geometry.location.lat;
          myLngs[i - 1] = data.results[i].geometry.location.lng;
          markerTitles[i - 1] = data.results[i].name;
          markerIcons[i - 1] = data.results[i].icon;
          markerPricing[i - 1] = data.results[i].price_level;
          markerRating[i - 1] = data.results[i].rating;

          if (DEBUG) {
            console.log(myLats[i - 1]);
            console.log(myLngs[i - 1]);
          }
        }

        var markerLocations = [];

        for (var i = 0; i < myLats.length; i++) {
          markerLocations[i] = myLats[i] + ', ' + myLngs[i];

          if (DEBUG) {
            console.log(markerLocations);
            console.log(markerTitles);
          }
        }

        res.json(markerLocations);
      });
    });
  });
});

server.listen(PORT, HOST, () => {
  console.log(`${ENV.charAt(0).toUpperCase() + ENV.substring(1)} app listening at http://${server.address().address}:${server.address().port}`);
});
