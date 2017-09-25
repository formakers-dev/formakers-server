var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var config = require('./config')[process.env.NODE_ENV];

app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

var router = require('./routes')(app);

var server = app.listen(port, function() {
  console.log('Express server has started on port ', port);
});


var db = mongoose.connection;
db.on('error', console.error);
db.once('open', function() {
  console.log('Conencted to mongd server');
});

mongoose.connect(config.dbUrl);
