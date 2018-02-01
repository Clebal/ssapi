const mysql = require('../helpers/mysql');
const fetch = require('node-fetch');
// const WebSocket = require('../helpers/websocket');
const fs = require('fs-jetpack');
const json = require('json-update');

const itinerario = require('./itinerario');


var rad = function(x) {
  return x * Math.PI / 180;
};

var getDistance = function(p1, p2) {
  var R = 6378137; // Earth’s mean radius in meter
  var dLat = rad(p2.lat - p1.lat);
  var dLong = rad(p2.lng - p1.lng);
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
  Math.cos(rad(p1.lat)) * Math.cos(rad(p2.lat)) *
  Math.sin(dLong / 2) * Math.sin(dLong / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d; // returns the distance in meter
};

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


function getFecha(){
	var date = new Date();
	return date.getDate() + '/' + (date.getMonth() + 1);
}

function getCurrentTime(){
	var date = new Date();
	var totalTime = date.getHours() * 60 + date.getMinutes();
	var hours = Math.floor(totalTime/60);
	var minutes = totalTime - (hours*60);
	return hours + ":" + minutes;
}

function convertToTime(hora){
	hora = hora.split(":");
	var totalTime = (hora[0] * 60) + parseInt(hora[1]);
	return totalTime;
}

function getUnixTime(hora, fecha){
	var date = fecha.split("/");
	return Date.parse(date[1]+"/"+date[0]+"/2017 "+hora)/1000;
}


module.exports.create = (her, req, res) => {
  const FILE = './app/map.json';
  const MAXTIME = 5;

  var latitud = req.body.latitud;
  var longitud = req.body.longitud;

  mysql.queryAsync(`SELECT salida, isOut FROM hermandad WHERE title='${her}'`,req).then(salidadb => {
    var hermandad = JSON.parse(salidadb[0].salida);
    if(salidadb[0].isOut == 1){
      var date = new Date();
      var timestamp = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
      var fecha = date.getDate() + '/' + (date.getMonth() + 1);

      // Inicializar variables
      var distancia;
      var velocidad;
      var url;
      var currentRecordTime;
      var lastRecordTime;
      var differenceTime;

      fs.readAsync(FILE, 'json').then((data) => {

        if (data[her].fecha === '') {
          data[her].fecha = fecha;
          data[her].timestamp = timestamp;
          data[her].latitud = latitud;
          data[her].longitud = longitud;
        //  data[her].velocidad = 0
        //  data[her].velocidad_acumulada = 0
          //data[her].numRegistros = 0

          json.update(FILE, data);

        } else {
          currentRecordTime = timestamp.split(':')[0] * 3600 + timestamp.split(':')[1] * 60 + timestamp.split(':')[2];
          lastRecordTime = data[her].timestamp.split(':')[0] * 3600 + data[her].timestamp.split(':')[1] * 60 + data[her].timestamp.split(':')[2];
          differenceTime = currentRecordTime - lastRecordTime;

          if (differenceTime >= MAXTIME || differenceTime < 0) {

            distancia = getDistance({"lat":data.tercera.latitud, "lng":data.tercera.longitud}, {"lat": latitud,  "lng": longitud});
            velocidad = distancia / MAXTIME;

            data[her].fecha = fecha;
            data[her].timestamp = timestamp;
            data[her].latitud = latitud;
            data[her].longitud = longitud;
            /*if(velocidad < 0){
              data[her].velocidad = 0
            }else{
              data[her].velocidad = velocidad
            }
            data[her].velocidad_acumulada += velocidad*/
            //data[her].numRegistros += 1

            json.update(FILE, data);

            var velocidad_media = data[her].velocidad_acumulada / data[her].numRegistros;

            // WebSocket.sendMessage(`"latitud": "${latitud}", "longitud": "${longitud}", "velocidad": "${velocidad_media}", "titulo": "${her}"`);

            var marcador = {"latitud": latitud, "longitud": longitud, "velocidad": velocidad_media, "titulo": her};
            itinerario.update(marcador, req);

          }

        }

      });


    }else{

    }

  });

  res.send(`{"status": "maybe yes, maybe no"}`);

};
