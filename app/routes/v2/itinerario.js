module.exports = (app) => {

  const Itinerario = require('../../models/v2/itinerario');

  app.get('/v2/itinerario', (req, res) => {
    Itinerario.all(req, res);
  });

  app.get('/v2/itinerario/:her', (req, res) => {
    Itinerario.get(req.params.her, req, res);
  });

  app.get('/v2/itinerario-real/:her', (req, res) => {
    Itinerario.believe(req.params.her, req, res);
  });

};
