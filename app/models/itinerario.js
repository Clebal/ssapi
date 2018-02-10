class Itinerario {

  constructor(nombre, hora, lat, lng, llegado, sentido, id){
    this.id = id || null;
    this.nombre = nombre || null;
    this.lat = lat || null;
    this.lng = lng || null;
    this.llegado = llegado || null;
    this.sentido = sentido || null;
  }

  static getSchema(){
    return {
      name: 'Itinerario',
      primaryKey: 'id',
      properties: {
        id: {type: 'int', indexed: true},
        nombre: 'string',
        hora: 'string',
        lat: 'double',
        lng: 'double',
        sentido: 'string?',
      }
    }
  }

  static fromObject(object){
    return new Itinerario(object.nombre, object.hora, object.lat, object.lng, object.llegado, object.sentido, object.id);
  }

}

module.exports = Itinerario;