module.exports = (app) => {

  app.get('/hermandad/:her', (req, res) => {
    var result;
    if(req.request.params == undefined){
      result = app.realm.objects('Hermandad');
    }else{
      result = app.realm.objects('Hermandad').filtered(`nick = "${req.request.params}"`)[0];
    }
    return result;
  });

  app.get('/hermandad/:her/itinerario', (req, res) => {
    var result = app.realm.objects('Hermandad').filtered(`nick = "${req.request.params}"`)[0];
    return result.itinerario;
  });

  app.get('/hermandad/:her/itinerario-real', (req, res) => {
    var result = app.realm.objects('Hermandad').filtered(`nick = "${req.request.params}"`)[0];
    return result.itinerarioReal;
  });

  app.post('/hermandad/:her', (req, res) => {
    // HermandadService.update(req.params.her, req, res);
  });
  
};
