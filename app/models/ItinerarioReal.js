const Itinerario = require('./Itinerario');

class ItinerarioReal extends Itinerario {

  constructor(nombre, hora, lat, lng, llegado, sentido, id){
    super(nombre, hora, lat, lng, llegado, sentido, id);
  }

  static getSchema(){
    return {
      name: 'ItinerarioReal',
      primaryKey: 'id',
      properties: {
        id: {type: 'int', indexed: true},
        nombre: 'string',
        hora: 'string',
        lat: 'double',
        lng: 'double',
        llegado: {type: 'bool', default: false},
        sentido: 'string?',
      }
    }
  }

  static fromObject(object){
    return new ItinerarioReal(object.nombre, object.hora, object.lat, object.lng, object.llegado, object.sentido, object.id);
  }

}

module.exports = ItinerarioReal;