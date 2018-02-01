const fetch = require('node-fetch');
const fs = require('fs-jetpack');
const json = require('json-update');

// Model
const Itinerario = require('./itinerario');
const Hora = require("./hora");

// Helper
const Distance = require("../../helpers/v2/distance");
const WebSocket = require('../../helpers/v2/websocket');
const mysql = require('../../helpers/mysql');

module.exports.all = (req, res) =>  {
  return mysql.query('SELECT * FROM maps', req, res);
};

module.exports.get = (param, req, res) =>  {

  const FILE = './app/map.json';

  fs.readAsync(FILE, 'json').then((data) => {

    mysql.queryAsync(`SELECT isOut FROM hermandad WHERE title = '${param}'`, req).then(function (x) {

      res.send({
        latitud: data[param].latitud,
        longitud: data[param].longitud,
        status: x[0].isOut
      });

    });

  });

};

module.exports.create = (her, req, res) =>  {

  // console.log("_____________");

  const FILE = './app/map.json';

  const date = new Date();
  const TIMESTAMP = new Hora(date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds());
  const FECHA = date.getDate() + '/' + (date.getMonth() + 1);

  var latitud = req.body.latitud;
  var longitud = req.body.longitud;

  var marcador = {};

  mysql.queryAsync(`SELECT name, color, salida, isOut FROM hermandad WHERE title='${her}'`, req).then(salidadb => {

    if (salidadb[0].isOut == 1) {

      fs.readAsync(FILE, 'json').then(data => {

        console.log("Works!");

        var currentRecordTime = TIMESTAMP.toSeconds();
        var lastRecordTime = new Hora(data[her].timestamp).toSeconds();
        var differenceTime = currentRecordTime - lastRecordTime;

        // if (differenceTime >= MAXTIME || differenceTime < 0) {

        var coorOrigen = {
          lat: latitud,
          lng: longitud
        };
        var coorDestino = {
          lat: data[her].latitud,
          lng: data[her].longitud
        };

        var distancia = Distance.getDistanceAlg(coorOrigen, coorDestino);

        console.log("Distancia: " + distancia);

        var tiempoTranscurrido = TIMESTAMP.toSeconds() - new Hora(data[her].timestamp).toSeconds();

        var velocidad = null;

        var velocidad_media = null;

        if (data[her].numRegistros != 0) {
          velocidad = distancia / tiempoTranscurrido;
          console.log("Velocidad: " + velocidad);

          if (velocidad <= 0) {
            data[her].velocidad = 0;
          } else {
            data[her].velocidad = velocidad;
          }

          var velocidad_acumulada = parseFloat(data[her].velocidad_acumulada) + parseFloat(velocidad);

          data[her].velocidad_acumulada = velocidad_acumulada;

          console.log("Velocidad Acumulada: " + data[her].velocidad_acumulada);

          velocidad_media = data[her].velocidad_acumulada / data[her].numRegistros;

          data[her].velocidad_media = velocidad_media;

          console.log("Velocidad Media: " + velocidad_media);

          marcador = {
            latitud: latitud,
            longitud: longitud,
            velocidad: velocidad_media,
            titulo: her,
            icono: "Assets/markers/marcador-" + her + ".png"
          };

          Itinerario.update(marcador, 0, 0, req);

        }


        data[her].timestamp = TIMESTAMP.toString();
        data[her].latitud = latitud;
        data[her].longitud = longitud;

        data[her].numRegistros += 1;

        json.update(FILE, data);

        Itinerario.believe(her, req).then((data) => {

          marcador = {
            latitud: latitud,
            longitud: longitud,
            velocidad: velocidad_media,
            titulo: her,
            nombre: salidadb[0].name,
            color: "#" + salidadb[0].color,
            icono: "Assets/markers/marcador-" + her + ".png",
            itinerario: data
          };
  
          WebSocket.sendMessage(marcador);

          res.send(marcador);

        });

      }).catch(function (err) {
        console.log(err);
      });

      // }

    }

  }).catch(function (err) {
    console.log(err);
  });

};