module.exports = (app) => {

  const Hermandad = require('../../models/v2/hermandad');
  const fs = require('fs-jetpack');

  app.get('/v2/hermandad', (req, res) => {
    Hermandad.all(req, res);
  });

  app.get('/v2/hermandad/:her', (req, res) => {
    Hermandad.get(req.params.her, req, res);
  });

  app.get('/v2/hermandad/:her/itinerario', (req, res) => {
    Hermandad.getItinerario(req.params.her, req, res);
  });

  app.get('/v2/hermandad/:her/itinerario-real', (req, res) => {
    Hermandad.getItinerario(req.params.her, req, res);
  });

  app.post('/v2/hermandad/:her', (req, res) => {
    Hermandad.update(req.params.her, req, res);
  });
};
