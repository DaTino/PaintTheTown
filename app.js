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
    budgets: config.userInput.budgets
  });
});

app.post('/map', (req, realres) => {
  var key = "AIzaSyAStlYQh66ZsHEE9OUqT1KXo9VC8t3TEyM";
  var data = req.body;

  var age = data.selectAge;
  if (data.selectAge == "13-29") {
    age = "teens";
  }
  else if (data.selectAge == "20-29") {
    age = "young%20adults"
  }
  else if (data.selectAge == "30-39" || "40-49") {
    age = "professionals"
  }
  else if (data.selectAge == "50-59" || "60+") {
    age = "seniors"
  }
  else {
    age = "";
  }

  var outing =  data.selectOut;
  if (data.selectOut == "Business") {
    var outkey1 = "fine%20dining";
    var outkey2 = "wine";
    var outkey3 = "cocktails";
    var outkey4 = "cafe";
  }
  else if (data.selectOut == "Date") {
    var outkey1 = "theater";
    var outkey2 = "restaurant";
    var outkey3 = "bar";
    var outkey4 = "park";
  }
  else if (data.selectOut == "Party") {
    var outkey1 = "bar";
    var outkey2 = "night%20club";
    var outkey3 = "bowling";
    var outkey4 = "music";
  }
  else if (data.selectOut == "Show") {
    var outkey1 = "concert";
    var outkey2 = "music";
    var outkey3 = "theater";
    var outkey4 = "movie";
  }
  else if (data.selectOut == "Sports") {
    var outkey1 = "golf";
    var outkey2 = "sports";
    var outkey3 = "bowling";
    var outkey4 = "rink";
  }
  else {
    outkey1 = "";
    outkey2 = "";
    outkey3 = "";
    outkey4 = "";
  }
  /*
    keywords:
    date = theaters, restaurants, bars, parks
    show = concert, theaters, movies, music
    sports = sports, rinks, bowling
    business = dining, restaurants, wine
  */
  var budget = data.selectBudget;
  if (data.selectBudget == "Free") {
    budget = "0";
  }
  else if (data.selevtBudget == "$") {
    budget = "1";
  }
  if (data.selectBudget == "$$") {
    budget = "2";
  }
  if (data.selectBudget == "$$$") {
    budget = "3";
  }
  if (data.selectBudget == "$$$$") {
    budget = "4";
  }
  else {
    budget = "";
  }
  /*
    values between 0-4
  */
  var location = data.selectLocation;
  var radius = 8045; //set to 5 miles data.selectRadius * 1609 //meters conversion

  geocoder.geocode(location, function(err, res) {
    var latitude = res[0].latitude;
    var longitude = res[0].longitude;
    console.log(latitude);
    console.log('here');
    var url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?" +
      "key=" + key + "&location=" + latitude + "," + longitude + "&radius=" + radius + "&keyword=" + outing1 + "&keyword=" + outing2 + "&keyword=" + outing3 + "&keyword=" + outing4 + "&keyword=" + age + "&maxbudget=" + budget;
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

        return realres.render('map', {
          Location: markerLocations
        });
        //response.json(locations);
      });
    });
  });

  console.log('age:' + age + ' outing:' + outing + ' budget:' + budget + ' location:' + location);

  res.render('index', {
    title: 'Paint the Town'
  });
});


});

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
/*
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
*/
server.listen(PORT, HOST, () => {
  console.log(`${ENV.charAt(0).toUpperCase() + ENV.substring(1)} app listening at http://${server.address().address}:${server.address().port}`);
});
