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

app.post('/', (req, res) => {
  console.log('testing');

  var age = req.selectAge;
  var outing = req.selectOut;
  var budget = req.selectBudget;
  var location = req.selectLocation;

  console.log('age:' + age + ' outing:' + outing + ' budget:' + budget + ' location:' + location);

  res.render('index', {
    title: 'Paint the Town'
  });
});

app.get('/map', (req, res) => {
  res.render('map');
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
