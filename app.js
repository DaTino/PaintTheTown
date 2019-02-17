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
  httpAdapter: 'https', // Default
  apiKey: 'AIzaSyAStlYQh66ZsHEE9OUqT1KXo9VC8t3TEyM', // for Mapquest, OpenCage, Google Premier
  formatter: null        // 'gpx', 'string', ...
};
const geocoder = nodeGeocoder(ngOptions);


var albertoKey = 'AIzaSyAStlYQh66ZsHEE9OUqT1KXo9VC8t3TEyM';
var jaredKey = 'AIzaSyCCuO6urauhG_XFJvRRwet5r7_kpPBd6Cw';

const app = express();
const server = http.Server(app);

const PORT = process.env.port || 8080;
const HOST = process.env.host || 'localhost';
const ENV = app.get('env');

app.engine('hbs', hbs({extname: '.hbs'}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('index', {
    title: 'Paint the Town',
    ages: config.userInput.ages,
    events: config.userInput.events,
    budgets: config.userInput.ages
  });
});

app.post('/map', (req, res) => {
  var key = "AIzaSyAStlYQh66ZsHEE9OUqT1KXo9VC8t3TEyM";
   //var data = req.body;
   //var age = data.selectAge;
   var outing = "date"; //data.selectOut;
   var budget = "2"; //data.selectBudget;
   var location = "Philadelphia, PA"; //data.selectLocation;
   var radius = 16090; //data.selectRadius * 1609 //meters conversion

   geocoder.geocode(location, function(err, res) {
     var latitude = res[0].latitude;
     var longitude= res[0].longitude;
     console.log(latitude);
     console.log('here');
     var url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?"
      + "key=" + key  + "&location=" + latitude + "," + longitude + "&radius=" + radius;
      //+ "&keyword=" + outing + "&maxbudget=" + budget;
      console.log(url);
      https.get(url, function(response) {
          var body ='';
          console.log('cock');
          response.on('data', function(chunk) {
            body += chunk;
          });
        console.log('piss');
        response.on('end', function() {
          var places = JSON.parse(body);
          var locations = places.results;
          console.log(locations);
          res.json(locations);
        });
      }).on('error', function() {
          console.log("Got error: I broke" );
      });
    }).on('error', function() {
        console.log("Got error: I broke" );
    });

   //api stuff called
   /*
   https://maps.googleapis.com/maps/api/place/nearbysearch/output?parameters
   key
   locations
   radius
   maxprice
   keyword
   rankby=prominence

   */

   res.render('map');
});

app.get('/test', (req, res) => {
  res.render('test');
});

app.get('/titties', (req, res) => {
  var key = 'AIzaSyAStlYQh66ZsHEE9OUqT1KXo9VC8t3TEyM';
  var location = encodeURIComponent(req.query.location);
  var radius = 16000;
  var sensor = false;
  var types = "restaurant";
  var keyword = "fast";

  var https = require('https');
  var url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?" + "key=" + key + "&location=" + location + "&radius=" + radius + "&sensor=" + sensor + "&types=" + types + "&keyword=" + keyword;
    console.log(url);
  https.get(url, function(response) {
    var body ='';
    response.on('data', function(chunk) {
      body += chunk;
    });

   res.render('map');
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
