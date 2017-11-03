function rad(x) {
  return x * Math.PI / 180;
}

function getDistance(p1, p2){

  const R = 6378137;

  const dLat = rad(p2.lat - p1.lat);
  const dLong = rad(p2.lng - p1.lng);

  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
  Math.cos(rad(p1.lat)) * Math.cos(rad(p2.lat)) *
  Math.sin(dLong / 2) * Math.sin(dLong / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;

  return d; // Distancia en metros.

}

module.exports.getDistance = getDistance;

module.exports.isInside = (p1, p2, radius) => {
  return getDistance(p1,p2) <= radius;
};
