const express = require('express');
const hbs = require('express-handlebars');
const path = require('path');
const fs = require('fs');
const process = require('process');
const bodyParser = require('body-parser');
const config = require('./config');

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
    ages: ['13 to 21', '21 to 65', '65+']
  });
});

app.post('/test', (req, res) => {
  console.log('testing');
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
