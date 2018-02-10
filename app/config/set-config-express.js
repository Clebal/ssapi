const path = require('path');
const express = require('express');
const compression = require('compression');
const connection = require('express-myconnection');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');

const realm = require("./Realm");

var expressConfig = async function (app) {

  // Motor de plantillas
  app.set('view engine', 'pug');
  app.set('views', './app/views')

  app.set('settings', require('./config'));
  app.locals.settings = app.get('settings');
  app.use(methodOverride('X-HTTP-Method-Override'));

  app.use(compression({ level: 1 }));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  app.use(express.static('public'));

  app.realm = await realm.open();
  realm.populateDatabase(app);

};

module.exports = expressConfig;
