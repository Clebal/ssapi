const mysql = require('../../helpers/mysql');
const fetch = require('node-fetch');

// Helper
const Distance = require("../../helpers/v2/distance");

// Modelo
const Hora = require("./hora");

module.exports.all = (req, res) =>  {
  return mysql.query('SELECT * FROM itinerario', req, res);
};

module.exports.get = (her, req, res) =>  {
  return mysql.query(`SELECT IT.* FROM itinerario IT JOIN hermandad HER ON HER.id = IT.id_hermandad WHERE HER.title = '${her}' `, req, res);
};

module.exports.believe = (her, req) =>  {
  return new Promise((resolve, reject) => {
    resolve(mysql.queryAsync(`SELECT IT.* FROM itinerario_real IT JOIN hermandad HER ON HER.id = IT.id_hermandad WHERE HER.title = '${her}' `, req));
  })
};

function update(marcador, i, queue, req) {

  // console.log("Ejecuta update pasandole como parametro: " + marcador + " - " + i + " - " + queue);

  const date = new Date();

  mysql.queryAsync(`SELECT IT.* FROM itinerario_real IT INNER JOIN hermandad HER ON IT.id_hermandad = HER.id WHERE IT.llegado = 'no' AND HER.title = '${marcador.titulo}'`, req).then((puntosControl) => {

    // Obtenemos el punto de control más próximo.
    const puntoControl = puntosControl[i];

    // console.log("Nuestro punto de control en la iteración " + i + " es " + puntoControl.nombre);

    const coorOrigen = {
      lat: marcador.latitud,
      lng: marcador.longitud
    };
    const coorDestino = {
      lat: puntoControl.latitud,
      lng: puntoControl.longitud
    };

    // Calculamos la distancia entre el punto de control y
    // el nuevo que hemos recibido.
    Distance.getDistance(coorOrigen, coorDestino).then(function (distancia) {

      // console.log("La distancia obtenida es: " + distancia);

      var distanceAux = Distance.getDistanceAlg(coorOrigen, coorDestino);

      if (distancia - distanceAux >= 100) {
        distancia = distanceAux;
      }

      // Calculamos el tiempo (en min) que a esa velocidad
      // tardaremos en recorrer la distancia restante
      // hasta el siguiente punto de control.
      const tiempoMin = Math.ceil((distancia / marcador.velocidad) / 60);

      queue += tiempoMin;
      

      // Hora actual
      var horaInicial = new Hora(date.getHours(), date.getMinutes(), date.getSeconds());
      // Hora autocalculada
      var horaFinal = new Hora(date.getHours(), date.getMinutes(), date.getSeconds());

      horaFinal.setHorasMinutos(horaInicial, queue);

      const query = "UPDATE itinerario_real SET hora = '" + horaFinal.toQuery() + "' WHERE id = " + puntoControl.id;

      mysql.query(query, req);

      if (i == 0) {

        if (Distance.isInside(distancia, 10) == true) {
          mysql.query("UPDATE itinerario_real SET llegado = 'si' WHERE id = " + puntoControl.id, req);
        } else if (Distance.isInside(distancia, 200) == true) {
          if (puntoControl.sentido == "dcha" && coorOrigen.lng > puntoControl.longitud) {
            mysql.query("UPDATE itinerario_real SET llegado = 'si' WHERE id = " + puntoControl.id, req);
          } else if (puntoControl.sentido == "izda" && coorOrigen.lng < puntoControl.longitud) {
            mysql.query("UPDATE itinerario_real SET llegado = 'si' WHERE id = " + puntoControl.id, req);
          }
        }

      }

      if (i != puntosControl.length - 1 || (i != puntosControl.length && puntosControl.length == 1)) {

        marcadorx = {
          latitud: puntoControl.latitud,
          longitud: puntoControl.longitud,
          titulo: marcador.titulo,
          velocidad: marcador.velocidad
        };

        i += 1;

        update(marcadorx, i, queue, req);

      }

    }).catch((err) => {
      if (err) {
        console.log(err);
      }
    });

  }).catch((err) => {
    if (err) {
      console.log(err);
    }
  });

}

module.exports.update = update;