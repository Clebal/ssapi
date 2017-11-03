function Hora(horas, minutos, segundos) {

  if (typeof(horas) === 'string') {

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

Hora.prototype.setHorasMinutos = function(oldHora, tiempo) {

  if (parseFloat(oldHora.minutos) + tiempo >= 60) {

    this.setHoras(parseFloat(oldHora.horas) + 1);

    this.setMinutos(parseFloat(oldHora.minutos) + tiempo - 60);

  } else {

    this.setHoras(oldHora.horas);

    this.setMinutos(parseFloat(oldHora.minutos) + tiempo);

  }

};

Hora.prototype.setHoras = function(horas) {

  if (horas == 24) {
    this.horas = "00";
  } else {
    this.horas = horas;
  }

};

Hora.prototype.setMinutos = function(minutos) {

  if (minutos < 10) {
    this.minutos = "0" + minutos;
  } else {
    this.minutos = minutos;
  }

};

Hora.prototype.toMinutes = function() {
  return parseFloat(this.horas) + this.minutos / 60 + this.segundos / 3600;
};

Hora.prototype.toMinutes = function() {
  return this.horas * 60 + parseFloat(this.minutos) + this.segundos / 60;
};

Hora.prototype.toSeconds = function() {
  return this.horas * 3600 + this.minutos * 60 + parseFloat(this.segundos);
};

Hora.prototype.toString = function() {
  return this.horas + ":" + this.minutos + ":" + this.segundos;
};

module.exports = Hora;
