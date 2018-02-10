const fetch = require('node-fetch');

var request = require('request'),
  cachedRequest = require('cached-request')(request),
  cacheDirectory = "./app/cache/v2/tmp/";

cachedRequest.setCacheDirectory(cacheDirectory);

function rad(x) {
  return x * Math.PI / 180;
}

function getDistance(p1, p2) {

  return new Promise(function(resolve, reject){

    // Definiremos la URL para pasarselo a Bing Maps
    var url = "http://dev.virtualearth.net/REST/v1/Routes/Walking?wayPoint.1=" + p1.lat + "," + p1.lng + "&waypoint.2=" + p2.lat + "," + p2.lng + "&key=Am-F_sLX4y6jfx5icgxDLIpXdlGknQSGgLu-556PAZKCa0KiLLSXPrH5FFm75eFp&routeAttributes=routeSummariesOnly";

    // console.log(url);

    // Calculamos la distancia entre el punto de control y
    // el nuevo que hemos recibido.
    cachedRequest({
      url: url,
      ttl: 5184000
    }, (error, response, data) => {

      data = JSON.parse(data);

      // Obtenemos la distancia recibida por Bing Maps.
      // Hay que multiplicarlo por 1000 ya que lo da en km.
      var distancia = data.resourceSets[0].resources[0].travelDistance * 1000;

      // console.log("Bing Maps --> " + distancia);

      // En caso de que esta sea 0 significa que está muy cerca
      // del punto de control y que por ende debemos coger la distancia
      // por algoritmo.
      if (distancia == 0) {

        distancia = getDistanceAlg(p1,p2);

      }

      resolve(distancia);

    });


  });

}

function getDistanceAlg(p1, p2){
  const R = 6378137;

  const dLat = rad(p2.lat - p1.lat);
  const dLong = rad(p2.lng - p1.lng);

  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(p1.lat)) * Math.cos(rad(p2.lat)) *
    Math.sin(dLong / 2) * Math.sin(dLong / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

module.exports.getDistance = getDistance;
module.exports.getDistanceAlg = getDistanceAlg;
module.exports.isInside = (distancia, radius) => {
  return distancia <= radius;
};
