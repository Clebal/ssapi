module.exports = (app) => {
  
  const Map = require('../../models/v2/map');

  app.get('/v2/map', (req, res) => {
    Map.all(req, res);
  });

  app.get('/v2/map/:her', (req, res) => {
    Map.get(req.params.her, req, res);
  });

  app.post('/v2/map/:her', (req, res) => {
    Map.create(req.params.her, req, res);
  });

};
