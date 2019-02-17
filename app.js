const express = require('express');
const hbs = require('express-handlebars');
const path = require('path');
const fs = require('fs');
const process = require('process');
const bodyParser = require('body-parser');
const config = require('./config');
const googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyAStlYQh66ZsHEE9OUqT1KXo9VC8t3TEyM'
});

const app = express();
const server = require('http').Server(app);

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
    ages: ['test1', 'test2', 'test3']
  });
});

app.get('/redirect', (req, res) => {
  res.render('redirect');
});

app.post('/test', (req, res) => {
  res.redirect('index');
});

app.get('/titties', (req, res) => {
  var key = req.query.key;
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

    response.on('end', function() {
      var places = JSON.parse(body);
      var locations = places.results;
      var randLoc = locations[Math.floor(Math.random() * locations.length)];

      res.json(randLoc);
    });
  }).on('error', function(e) {
    console.log("Got error: " + e.message);
  });
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
