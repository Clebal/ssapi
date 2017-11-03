const mysql = require('../helpers/mysql');

module.exports.all = (req, res) => {
  return mysql.query('SELECT * FROM hermandad', req, res);
};

module.exports.get = (param, req, res) => {
  return mysql.query(`SELECT * FROM hermandad WHERE title = '${param}'`, req, res);
};

module.exports.getItinerario = (param, req, res) => {
  return mysql.query(`SELECT i.* FROM itinerario i JOIN hermandad h ON i.id_hermandad = h.id WHERE h.title = '${param}'`, req, res);
};

module.exports.create = (req) => {
  // x-www-form-urlencoded
  var name = req.body.name;
  var title = req.body.title;
  var portada = req.body.portada;
  var info = req.body.info;
  var initialCord = req.body.initialCord;
  var horaSalida = req.body.horaSalida;
  var horaRecogida = req.body.horaRecogida;
  var markerSrc = req.body.markerSrc;
  var salida = req.body.salida;
  var date = req.body.date;

  mysql.query(`INSERT INTO hermandad(name, title, portada, info, initialCord, horaSalida, horaRecogida, markerSrc, salida, date) VALUES('${name}','${title}','${portada}','${info}','${initialCord}','${horaSalida}','${horaRecogida}','${markerSrc}','${salida}','${date}')`, req);
};

module.exports.update = (param, req, res) => {
// x-www-form-urlencoded
  var name = `'${req.body.name}'` || null;
  var title = `'${req.body.title}'` || null;
  var portada = `'${req.body.portada}'` || null;
  var info = `'${req.body.info}'` || null;
  var initialCord = `'${req.body.initialCord}'` || null;
  var horaSalida = `'${req.body.horaSalida}'` || null;
  var horaRecogida = `'${req.body.horaRecogida}'` || null;
  var markerSrc = `'${req.body.markerSrc}'` || null;
  var salida = `'${req.body.salida}'` || null;
  var date = `'${req.body.date}'` || null;
  var query = `
    UPDATE hermandad
    SET name = IF(${name} = 'undefined', name, ${name}),
        title = IF(${title} = 'undefined', title, ${title}),
        portada = IF(${portada} = 'undefined', portada, ${portada}),
        info = IF(${info} = 'undefined', info, ${info}),
        initialCord = IF(${initialCord} = 'undefined', initialCord, ${initialCord}),
        horaSalida = IF(${horaSalida} = 'undefined', horaSalida, ${horaSalida}),
        horaRecogida = IF(${horaRecogida} = 'undefined', horaRecogida, ${horaRecogida}),
        markerSrc = IF(${markerSrc} = 'undefined', markerSrc, ${markerSrc}),
        salida = IF(${salida} = 'undefined', salida, ${salida}),
        date = IF(${date} = 'undefined', date, ${date})
    WHERE title = '${param}'`;
  mysql.query(query, req);
    // res.send(query);
};
