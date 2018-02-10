class Hermandad {

  constructor(nick, nombre, descripcion, hermanoMayor, numHermanos, diaSalida, lugarSalida, color, salida, isOut, itinerario, itinerarioReal, id){
    this.id = id || null;
    this.nick = nick || null;
    this.nombre = nombre || null;
    this.descripcion = descripcion || null;
    this.hermanoMayor = hermanoMayor || null;
    this.numHermanos = numHermanos || null;
    this.diaSalida = diaSalida || null;
    this.lugarSalida = lugarSalida || null;
    this.color = color || null;
    this.salida = salida || null;
    this.isOut = isOut || null;

    /* To-Many */
    this.itinerario = itinerario || null;
    this.itinerarioReal = itinerarioReal || null;

  }

  static getSchema(){
    return { 
      name: 'Hermandad', 
      primaryKey: 'id',
      properties: {
        id: 'int',
        nick: 'string',
        nombre: 'string',
        descripcion: 'string',
        hermanoMayor: 'string',
        numHermanos: 'string',
        diaSalida: 'string',
        lugarSalida: 'string',
        color: 'string',
        salida: 'string',
        isOut: {type: 'bool?', default: false},
        itinerario: 'Itinerario[]',
        itinerarioReal: 'ItinerarioReal[]'
      }
    }
  }

  static fromJSON(object){
    return new Hermandad(object.nick, object.nombre, object.descripcion, object.hermanoMayor, object.numHermanos, object.diaSalida, object.lugarSalida, object.color, object.salida, object.isOut);
  }

}

module.exports = Hermandad;