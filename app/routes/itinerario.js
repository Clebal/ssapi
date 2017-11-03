module.exports = (app) => {
  const Itinerario = require('../models/itinerario')

  app.get('/itinerario', (req, res) => {
    Itinerario.all(req, res)
  })

  app.get('/itinerario/:her', (req, res) => {
    Itinerario.get(req.params.her, req, res)
  })

  app.get('/itinerario-real/:her', (req, res) => {
    Itinerario.believe(req.params.her, req, res);
  })

}
