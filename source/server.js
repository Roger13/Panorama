"use strict";

const express = require('express'),
      bodyParser = require('body-parser'),
      app = express();
    
app.set('port', process.env.PORT || 5000);
app.use(bodyParser.json());
app.use(bodyParser.text());

app.use(express.static('public'))

app.listen(app.get('port'), function() {
  console.log('Running on port ', app.get('port'));
});