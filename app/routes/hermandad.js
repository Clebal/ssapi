module.exports = (app) => {
  const Hermandad = require('../models/hermandad')
  const fs = require('fs-jetpack')

  app.get('/hermandad', (req, res) => {
    Hermandad.all(req, res)
  })

  app.get('/hermandad/:her', (req, res) => {
    Hermandad.get(req.params.her, req, res)
  })

  app.get('/hermandad/:her/galeria', (req, res) => {
    function checkHermandad (hermandad) {
      return hermandad.split('-')[0] === req.params.her
    }

    res.send(fs.list('public/img').filter(checkHermandad))
  })

  app.get('/hermandad/:her/itinerario', (req, res) => {
    Hermandad.getItinerario(req.params.her, req, res)
  })

  app.get('/hermandad/:her/itinerario-real', (req, res) => {
    Hermandad.getItinerario(req.params.her, req, res)
  })

  app.post('/hermandad/:her', (req, res) => {
    Hermandad.update(req.params.her, req, res)
  })
}
