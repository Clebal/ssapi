module.exports = (app) => {

  const ItinerarioService = require("../services/ItinerarioService");

  // app.get('/itinerario', (req, res) => {
  //   res.send(app.realm.objects('Itinerario'));
  // });

  // app.get('/itinerario/:her', (req, res) => {
  //   var result = [];
  //   for (let p of app.realm.objects('Hermandad').filtered(`nick = "${req.params.her}"`)[0].itinerario) {
  //     result.push(p);
  //   }
  //   res.send(result);
  // });

  app.get('/itinerario-real/:her', (req, res) => {

    var result = [];
    for (let p of app.realm.objects('Hermandad').filtered(`nick = "${req.params.her}"`)[0].itinerarioReal) {
      result.push(p);
    }
    res.send(result);

  });

  app.post('/itinerario/:her', async (req, res) => {
    var hermandad = app.realm.objects('Hermandad').filtered(`nick = "${req.params.her}"`)[0]
    try {
      var result = await ItinerarioService.add(hermandad, req.body.latitud, req.body.longitud, app, req.body.test);
    }catch(e){
      console.log(e);
    }
    res.send(result);
  });

};
