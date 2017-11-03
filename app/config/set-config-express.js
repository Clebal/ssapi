const path = require('path');
const express = require('express');
const compression = require('compression');
const connection = require('express-myconnection');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');

var expressConfig = function (app) {
  app.set('settings', require('./config'));
  app.locals.settings = app.get('settings');

  app.use(methodOverride('X-HTTP-Method-Override'));

  app.use('/public', express.static(process.cwd() + '/public'));

  app.use('/node_modules', express.static(path.join(process.cwd() + '/node_modules')));

  app.use(compression({level: 1}));
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());

  //app.use(connection(mysql, app.get('settings').database, 'single'))
};

module.exports = expressConfig;
