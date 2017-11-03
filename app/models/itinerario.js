const mysql = require('../helpers/mysql');
const fetch = require('node-fetch');

module.exports.all = (req, res) => {
  return mysql.query('SELECT * FROM itinerario', req, res);
};

module.exports.get = (her, req, res) => {
  return mysql.query(`SELECT IT.* FROM itinerario IT JOIN hermandad HER ON HER.id = IT.id_hermandad WHERE HER.title = '${her}' `, req, res);
};

module.exports.believe = (her, req, res) => {
  return mysql.query(`SELECT IT.* FROM itinerario_real IT JOIN hermandad HER ON HER.id = IT.id_hermandad WHERE HER.title = '${her}' `, req, res);
};

module.exports.update  = (marcador, req) => {
  var date = new Date();
  console.log("------");
  mysql.queryAsync(`SELECT IT.* FROM itinerario_real IT INNER JOIN hermandad HER ON IT.id_hermandad = HER.id WHERE IT.llegado = 'no' AND HER.title = '${marcador.titulo}'`, req).then((live)=>{
    var url = `https://maps.googleapis.com/maps/api/distancematrix/json?key=AIzaSyBUkO2IaOTX6AoeelSh28XQeJ2Zzrf2XPI&origins=${live[0].latitud},${live[0].longitud}&destinations=${marcador.latitud},${marcador.longitud}&mode=walking&language=es-ES`;
    fetch(url).then((response)=>{
      return response.json();
    }).then((gmaps)=>{
      console.log(gmaps.rows[0]);
      if(gmaps.rows[0] != undefined){
        var distancia = gmaps.rows[0].elements[0].distance.value;
        console.log(distancia);
        var tiempo = Math.ceil(distancia/marcador.velocidad);
        var hora_inicial =  date.getHours() + ':' + date.getMinutes();
        hora_inicial = hora_inicial.split(':');
        var horaFinal;
        var aux = parseFloat(hora_inicial[1]) + Math.ceil((tiempo / 60));


        if(aux >= 60){
          horaFinal = (parseFloat(hora_inicial[0])+1);
          if(horaFinal == 24){
            horaFinal = 0;
          }
          horaFinal += ":";
          horaFinal_aux = parseFloat(hora_inicial[1]) + Math.ceil((tiempo / 60) - 60);
          if(horaFinal_aux < 10){
            horaFinal += "0"+horaFinal_aux;
          }else{
            horaFinal += horaFinal_aux;
          }
        }else{
          horaFinal = hora_inicial[0];
          if(horaFinal == 24){
            horaFinal = 0;
          }
          horaFinal += ":";
          horaFinal_aux = parseFloat(hora_inicial[1]) + Math.ceil((tiempo / 60));
          console.log("horaFinal_aux: " + horaFinal_aux);
          if(horaFinal_aux < 10){
            horaFinal += "0"+horaFinal_aux;
          }else{
            horaFinal += parseFloat(hora_inicial[1]) + Math.ceil((tiempo / 60));
          }
        }

        console.log("UPDATE itinerario_real SET hora = "+horaFinal+" WHERE id = "+live[0].id);
        mysql.query("UPDATE itinerario_real SET hora = '"+horaFinal+"' WHERE id = "+live[0].id, req);
        if(isInside({"lat": live[0].latitud, "lng":live[0].longitud},{"lat": marcador.latitud, "lng": marcador.longitud},50) == true){
          mysql.query("UPDATE itinerario_real SET llegado = 'si' WHERE id = "+live[0].id, req);
        }
      }
    });
  }).catch((err)=>{if(err){  }});
};


function rad(x) {
  return x * Math.PI / 180;
}

function getDistance(p1, p2) {
  var R = 6378137; // Earth’s mean radius in meter
  var dLat = rad(p2.lat - p1.lat);
  var dLong = rad(p2.lng - p1.lng);
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
  Math.cos(rad(p1.lat)) * Math.cos(rad(p2.lat)) *
  Math.sin(dLong / 2) * Math.sin(dLong / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d; // returns the distance in meter
}

function isInside(p1, p2, radius) {
  return getDistance(p1,p2) <= radius; // returns the distance in meter
}
