module.exports = (app) => {

  const mysql = require('../helpers/mysql');

  app.get('/activar/:her', (req, res) => {
    mysql.query(`UPDATE hermandad SET isOut = 1 WHERE title = '${req.params.her}'`, req);
    mysql.query(`UPDATE itinerario_real SET llegado = 'si' WHERE itinerario_real.id_hermandad = (SELECT her.id FROM hermandad her WHERE her.title = '${req.params.her}') ORDER BY id ASC LIMIT 1;`, req);
    res.send("Vamonos " + req.params.her + "!!");
  })


  app.get('/desactivar/:her', (req, res) => {
    mysql.query(`UPDATE hermandad SET isOut = 0 WHERE title = '${req.params.her}'`, req);
    res.send("Desactivado " + req.params.her + "!!");
  })


}
