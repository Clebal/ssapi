const fetch = require('node-fetch');
const fs = require('fs-jetpack');
const json = require('json-update');

// Model
const Itinerario = require('./itinerario');

// Helper
const Distance = require("../../helpers/v2/distance");
const WebSocket = require('../../helpers/v2/websocket');
const mysql = require('../../helpers/mysql');

module.exports.all = (req, res) => {
  return mysql.query('SELECT * FROM maps', req, res);
};

module.exports.get = (param, req, res) => {

  const FILE = './app/map.json';

  fs.readAsync(FILE, 'json').then((data) => {

    mysql.queryAsync(`SELECT isOut FROM hermandad WHERE title = '${param}'`, req).then(function(x){

      res.send({latitud: data[param].latitud, longitud: data[param].longitud, status: x[0].isOut});

    });

  });

};

module.exports.create = (her, req, res) => {

  const FILE      = './app/map.json';
  const MAXTIME   = 5;

  const DATE      = new Date();
  const TIMESTAMP = new Hour(date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds());
  const FECHA     = date.getDate() + '/' + (date.getMonth() + 1);

  var latitud  = req.body.latitud;
  var longitud = req.body.longitud;

  mysql.queryAsync(`SELECT salida, isOut FROM hermandad WHERE title='${her}'`, req).then(salidadb => {

    if(salidadb[0].isOut == 1){

      fs.readAsync(FILE, 'json').then(data => {

          var currentRecordTime = TIMESTAMP.toSeconds();
          var lastRecordTime = new Hora(data[her].timestamp).toSeconds();
          var differenceTime = currentRecordTime - lastRecordTime;

          if (differenceTime >= MAXTIME || differenceTime < 0) {

            var coorOrigen = {lat:data.tercera.latitud, lng:data.tercera.longitud};
            var coorDestino = {lat: latitud,  lng: longitud};

            var distancia = getDistance(coorOrigen, coorDestino);
            var velocidad = distancia / MAXTIME;

            data[her].timestamp = TIMESTAMP;
            data[her].latitud = latitud;
            data[her].longitud = longitud;

            if(velocidad <= 0){
              data[her].velocidad = 0;
            }else{
              data[her].velocidad = velocidad;
            }

            data[her].velocidad_acumulada += velocidad;

            data[her].numRegistros += 1;

            var velocidad_media = data[her].velocidad_acumulada / data[her].numRegistros;

            data[her].velocidad_media = velocidad_media;

            json.update(FILE, data);

            var marcador = {latitud: latitud, longitud: longitud, velocidad: velocidad_media, titulo: her};

            WebSocket.sendMessage(marcador);

            Itinerario.update(marcador, req);

          }

      });

    }

  });

  res.send(`{"status": "maybe yes, maybe no"}`);

};
