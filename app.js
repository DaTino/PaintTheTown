const express = require('express');
const path = require('path');
const process = require('process');

const app = express();
const server = require('http').Server(app);

const PORT = process.env.port || 8000;
const HOST = process.env.host || 'localhost';
const ENV = app.get('env');

app.use(express.static(path.join(__dirname, 'assets')));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/index.html'));
});

server.listen(PORT, HOST, () => {
  console.log(`${ENV.charAt(0).toUpperCase() + ENV.substring(1)} app listening at http://${server.address().address}:${server.address().port}`);
});
