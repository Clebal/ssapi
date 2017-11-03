const mysql = require('../../helpers/mysql');
const fetch = require('node-fetch');

// Helper
const Distance = require("../../helpers/v2/distance");

// Modelo
const Hora = require("./hora");

module.exports.all = (req, res) => {
  return mysql.query('SELECT * FROM itinerario', req, res);
};

module.exports.get = (her, req, res) => {
  return mysql.query(`SELECT IT.* FROM itinerario IT JOIN hermandad HER ON HER.id = IT.id_hermandad WHERE HER.title = '${her}' `, req, res);
};

module.exports.believe = (her, req, res) => {
  return mysql.query(`SELECT IT.* FROM itinerario_real IT JOIN hermandad HER ON HER.id = IT.id_hermandad WHERE HER.title = '${her}' `, req, res);
};

module.exports.update = (marcador, req) => {

  const date = new Date();

  mysql.queryAsync(`SELECT IT.* FROM itinerario_real IT INNER JOIN hermandad HER ON IT.id_hermandad = HER.id WHERE IT.llegado = 'no' AND HER.title = '${marcador.titulo}'`, req).then((puntosControl)=>{

    // Obtenemos el punto de control más próximo.
    const puntoControl = puntosControl[0];

    const coorOrigen  = {lat: puntoControl.latitud, lng: puntoControl.longitud };
    const coorDestino = {lat: marcador.latitud,     lng: marcador.longitud };

    // Calculamos la distancia entre el punto de control y
    // el nuevo que hemos recibido.
    const distancia = Distance.getDistance(coorOrigen, coorDestino);

    console.log("La distancia obtenida es: " + distancia);

    // Calculamos el tiempo (en min) que a esa velocidad
    // tardaremos en recorrer la distancia restante
    // hasta el siguiente punto de control.
    const tiempoMin = Math.ceil((distancia/marcador.velocidad)/60);

    // Hora actual
    var horaInicial  =  new Hora(date.getHours(), date.getMinutes());
    // Hora autocalculada
    var horaFinal    =  new Hora(date.getHours(), date.getMinutes());

    horaFinal.setHorasMinutos(horaInicial, tiempoMin);

    const query = "UPDATE itinerario_real SET hora = "+horaFinal.toString()+" WHERE id = "+puntoControl.id;

    console.log(query);

    mysql.query(query, req);

    if(Distance.isInside(coorOrigen, coorDestino, 50) == true){
      mysql.query("UPDATE itinerario_real SET llegado = 'si' WHERE id = "+puntoControl.id, req);
    }

    }).catch((err)=>{if(err){ console.log(err); }});

};
