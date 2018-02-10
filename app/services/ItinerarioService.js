const fetch = require('node-fetch');
const fs = require('fs-jetpack');
const json = require('json-update');

// Helper
const Distance = require("../helpers/distance");
const WebSocket = require('../helpers/websocket');

// Modelo
const Hora = require("../models/Hora");
const Itinerario = require('../models/itinerario');

async function add(her, lat, lng, app, test) {

  return new Promise(async (resolve, reject) => {

    // Ruta del archivo
    const FILE = './app/map.json';

    const date = new Date();
    const TIMESTAMP = new Hora(date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds());
    const FECHA = date.getDate() + '/' + (date.getMonth() + 1);

    var marcador = {};

    // Si la hermandad está en la calle
    if (her.isOut) {

      // Obtenemos los datos del registro
      if(test === undefined){
        var data = await fs.readAsync(FILE, 'json');
      }else{
        var data = JSON.parse(test);
      }

      // Cogemos el objeto de la hermandad que estamos actualizando
      hermandadRegistro = data[her.nick];

      marcador = {
        nick: her.nick,
        nombre: her.nombre,
        lat: lat,
        lng: lng,
        color: "#" + her.color,
        icono: "Assets/markers/marcador-" + her + ".png",
        itinerario: her.itinerarioReal
      };

      if (hermandadRegistro.numRegistros != 0) {

        var lastRecordTime = new Hora(hermandadRegistro.timestamp).toSeconds();
        var tiempoTranscurrido = TIMESTAMP.toSeconds() - lastRecordTime;

        var coorOrigen = { lat: lat, lng: lng };
        var coorDestino = { lat: hermandadRegistro.lat, lng: hermandadRegistro.lng };

        var distancia = Distance.getDistanceAlg(coorOrigen, coorDestino);
        console.log("Distancia: " + distancia);

        var velocidad = distancia / tiempoTranscurrido;
        console.log("Velocidad: " + velocidad);

        if (velocidad <= 0) {
          hermandadRegistro.velocidad = 0;
        } else {
          hermandadRegistro.velocidad = velocidad;
        }

        hermandadRegistro.velocidadAcumulada = parseFloat(hermandadRegistro.velocidadAcumulada) + parseFloat(velocidad);
        hermandadRegistro.velocidadMedia = hermandadRegistro.velocidadAcumulada / hermandadRegistro.numRegistros;

        console.log("Velocidad Acumulada: " + hermandadRegistro.velocidadAcumulada);
        console.log("Velocidad Media: " + hermandadRegistro.velocidadMedia);

        if(test === undefined){
          marcador.itinerario = await update(marcador, her, hermandadRegistro.velocidadMedia, app)
        }

      }

      WebSocket.sendMessage(marcador);

      hermandadRegistro.timestamp = TIMESTAMP.toString();
      hermandadRegistro.lat = lat;
      hermandadRegistro.lng = lng;

      hermandadRegistro.numRegistros += 1;

      data[her.nick] = hermandadRegistro;

      if(test === undefined){
        json.update(FILE, data);
        resolve(marcador);
      }else{
        resolve(data);
      }

    }

  })

};

function update(marcador, hermandad, velocidad, app) {

  return new Promise((resolve, reject) => {

    const date = new Date();

    var cola = 0;

    var itinerario = hermandad.itinerarioReal;
    var puntosControl = itinerario.filtered("llegado == false ");

    // Obtenemos el punto de control más próximo.
    puntosControl.forEach((puntoControl, index) => {

      console.log(index);

      if (index != 0) {
        marcador = puntosControl[index - 1];
      }

      const coorOrigen = { lat: marcador.lat, lng: marcador.lng };
      const coorDestino = { lat: puntoControl.lat, lng: puntoControl.lng };

      // Calculamos la distancia entre el punto de control y
      // el nuevo que hemos recibido.
      Distance.getDistance(coorOrigen, coorDestino).then((distancia) => {

        // console.log("La distancia obtenida es: " + distancia);

        var distanceAux = Distance.getDistanceAlg(coorOrigen, coorDestino);

        if (distancia - distanceAux >= 100) {
          distancia = distanceAux;
        }

        // Calculamos el tiempo (en min) que a esa velocidad
        // tardaremos en recorrer la distancia restante
        // hasta el siguiente punto de control.
        const tiempoMin = Math.ceil((distancia / velocidad) / 60);

        cola += tiempoMin;

        // Hora actual
        var horaInicial = new Hora(date.getHours(), date.getMinutes(), date.getSeconds());
        // Hora autocalculada
        var horaFinal = new Hora(date.getHours(), date.getMinutes(), date.getSeconds());

        horaFinal.setHorasMinutos(horaInicial, cola);

        app.realm.write(() => {

          puntoControl.hora = horaFinal.toQuery();

          if (index == 0) {

            if (Distance.isInside(distancia, 10) == true) {
              puntoControl.llegado = true;
            } else if (Distance.isInside(distancia, 200) == true) {
              if (puntoControl.sentido == "dcha" && coorOrigen.lng > puntoControl.longitud) {
                puntoControl.llegado = true;
              } else if (puntoControl.sentido == "izda" && coorOrigen.lng < puntoControl.longitud) {
                puntoControl.llegado = true;
              }
            }

          }

        })

      }).catch((err) => {
        reject(err);
      });

    })

    resolve(itinerario);

  })

}

module.exports = {
  update: update,
  add: add
}