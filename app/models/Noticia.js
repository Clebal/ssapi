class Noticia {
  
  constructor(titulo, contenido, imagenes, url) {
    this.titulo = titulo || null;
    this.contenido = contenido || null;
    this.imagenes = imagenes || null;
    this.url = url || null;
  }

  static fromObject(object) {
    return new Noticia(object.titulo, object.contenido, object.imagenes, object.url);
  }

}

module.exports = Noticia;