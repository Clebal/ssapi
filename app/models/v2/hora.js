function Hora(horas, minutos, segundos) {

  if (typeof (horas) === 'string') {

    var aux = horas.split(':');

    this.horas = aux[0];
    this.minutos = aux[1];
    this.segundos = aux[2];

  } else {

    this.horas = horas || "00";
    this.minutos = minutos || "00";
    this.segundos = segundos || "00";

  }

}

Hora.prototype.setHorasMinutos = function (oldHora, tiempo) {

  var i = 1;
  while(parseFloat(oldHora.minutos) + tiempo >= 60 * i ){

    i++;

  }

  i--;
  
  this.setHoras(parseFloat(oldHora.horas) + i);
  var aux = 60*i;
  this.setMinutos(parseFloat(oldHora.minutos) + tiempo - aux);

};

Hora.prototype.setHoras = function (horas) {

  if (horas == 24) {
    this.horas = "00";
  } else {
    this.horas = horas;
  }

};

Hora.prototype.setMinutos = function (minutos) {

  if (minutos < 10) {
    this.minutos = "0" + minutos;
  } else {
    this.minutos = minutos;
  }

};

Hora.prototype.toMinutes = function () {
  return parseFloat(this.horas) + this.minutos / 60 + this.segundos / 3600;
};

Hora.prototype.toMinutes = function () {
  return this.horas * 60 + parseFloat(this.minutos) + this.segundos / 60;
};

Hora.prototype.toSeconds = function () {
  return this.horas * 3600 + this.minutos * 60 + parseFloat(this.segundos);
};

Hora.prototype.toString = function () {
  return this.horas + ":" + this.minutos + ":" + this.segundos;
};

Hora.prototype.toQuery = function () {
  return this.horas + ":" + this.minutos;
};

module.exports = Hora;