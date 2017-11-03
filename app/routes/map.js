module.exports = (app) => {
  const Map = require('../models/map');

  app.get('/map', (req, res) => {
    Map.all(req, res);
  });

  app.get('/map/:her', (req, res) => {
    Map.get(req.params.her, req, res);
  });

  app.post('/map/:her', (req, res) => {
    Map.create(req.params.her, req, res);
  });
};
