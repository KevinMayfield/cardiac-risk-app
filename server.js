'use strict';

var express = require('express');

// Constants
var PORT = 8000;
var HOST = '0.0.0.0';

// App
var app = express();

app.get('/', function(req, res) {
    res.redirect('index.html');
});

app.get('/index.html', function(req, res) {
    res.send("blah blah index.html");
});

app.listen(PORT, HOST);
console.log('Running on http://${HOST}:${PORT}');