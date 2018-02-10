const Marknote = require("../helpers/marknote");
const request = require('request');
const cachedRequest = require('cached-request')(request);
const cacheDirectory = "./app/cache/v2/tmp/";
const storage = require("node-persist");
const fetch = require("node-fetch");

cachedRequest.setCacheDirectory(cacheDirectory);

module.exports.getNews = (force, num = 10, offset = 0) => {

  return new Promise((resolve, reject) => {

    var resultado = [];

    var url = `http://www.alcalanazarena.com/wp-json/wp/v2/posts?_embed&per_page=${num}&offset=${offset}`;

    var ttl;
    if (force) {
      ttl = 0;
    } else {
      ttl = 432000;
    }

    cachedRequest({
      url: url,
      ttl: ttl
    }, (error, response, body) => {

      var posts = JSON.parse(body);

      for (let i = 0; i < posts.length; i++) {

        /* getId */

        var id = posts[i].id;

        /* getTitle - Obtener el titulo del post */

        var titulo = decodeXml(posts[i].title.rendered);

        /* getContent - Obtener el contenido del post como una array de objectos Post_Content  */

        var post_content_array = getContent(posts[i].content.rendered);


        /* getURL - Obtener URL del post en cuestión */

        var url = decodeXml(posts[i].link);

        /* getFeaturedImage - Obtener la imagen destacada del post */

        var featured_image = posts[i]._embedded['wp:featuredmedia'][0].media_details.sizes.medium.source_url;

        /* getImages - Obtener las imagenes como array de URLs */
        var images = getImages(posts[i].content.rendered).unshift(featured_image);

        /* */

        var noticia = {
          id: id,
          titulo: titulo,
          contenido: post_content_array,
          imagenes: images,
          url: url
        };

        resultado.push(noticia);

      }

      resolve(resultado);

    });
  });
};

module.exports.checkNews = () => {

  return new Promise((resolve, reject) => {

    const KEY = "lastNewsDate";

    storage.initSync();

    const lastNewsDate = storage.getItemSync(KEY);

    console.log(lastNewsDate);

    if (lastNewsDate == undefined) {

      fetch("http://www.alcalanazarena.com/wp-json/wp/v2/posts?per_page=1").then((response) => {
        return response.json();
      }).then((news) => {
        storage.setItemSync(KEY, news[0].date);
      }).catch((err) => {
        reject(err);
      });

    } else {

      const url = `http://www.alcalanazarena.com/wp-json/wp/v2/posts?_embed&after=${lastNewsDate}`;

      fetch(url).then((response) => {
        return response.json();
      }).then((news) => {

        if(news.length != 0){
          storage.setItemSync(KEY, news[0].date);
        }

        resolve(news);

      }).catch((err) => {
        reject(err);
      });

    }

  });

};

/* Funciones para refactorizar el código */

function Post_Content(tipo, valor) {
  this.tipo = tipo || null;
  this.valor = valor || null;
}

function getContent(plainXml) {

  var textos = decodeXml(plainXml.replace(/<figcaption([^>]+)>(.*?)<(.*?)>/g, "").replace(/<span(.*?)>/g, "").replace(/<h6(.*?)>/g, "<h5>").replace(/(<\/strong>(.*?)<\/h6>)/g, "</h5>")).split("<h5>").join("_").toString().split("<\/h5>").join("_").toString().replace(/(<([^>]+)>)/ig, "").split("_").map(function(s) {
    return s.trim();
  });

  var post_content_array = [];

  for (let j = 0; j <= textos.length - 1; j++) {

    if (textos[j].length >= 75 && textos[j] != "") {

      var contenido = textos[j].split("\n");

      for (var x = 0; x <= contenido.length - 1; x++) {
        post_content_array.push(new Post_Content("p", contenido[x]));
      }

    } else {
      post_content_array.push(new Post_Content("h5", textos[j].replace(/(@a[0-99])/g, "?")));
    }

  }

  return post_content_array;

}

function getImages(plainXml) {

  var images = [];

  var parser = new Marknote.Parser();
  var doc = parser.parse("<article>" + decodeXml(plainXml) + "</article>");
  var root = doc.getRootElement();

  var control = 1;
  var x = 1;

  while (control != undefined) {
    if (root.toString() == null || root.toString().split("<img")[x] == null) {
      control = undefined;
    } else {
      images.push(root.toString().split("<img")[x].split("src=\"")[1].split("\"")[0]);
    }
    x++;
  }

  return images;

}

/* Helpers */

const escaped_one_to_xml_special_map = {
  '\u00e1': 'á',
  '\u00e9': 'é',
  '\u00ed': 'í',
  '\u00f3': 'ó',
  '\u00fa': 'ú',
  '\u00c1': 'Á',
  '\u00c9': 'É',
  '\u00cd': 'Í',
  '\u00d3': 'Ó',
  '\u00da': 'Ú',
  '\u00f1': 'ñ',
  '\u00d1': 'Ñ',
  '&amp;': '&',
  '&quot;': '"',
  '&#8220;': '“',
  '&#8221;': '”',
  '&#8216;': '”',
  '&#8217;': '”',
  '&#8230;': '…',
  '&rdquo;': '”',
  '&ldquo;': '”',
  '&#8211;': '–',
  '&ndash;': '–',
  '&ntilde;': 'ñ',
  '&aacute;': 'á',
  '&eacute;': 'é',
  '&iacute;': 'í',
  '&oacute;': 'ó',
  '&uacute;': 'ú',
  '&lt;': '<',
  '&gt;': '>',
  '&nbsp;': '',
  '&#65533': ''
};

function decodeXml(string) {
  return string.replace(/(&#65533|&nbsp;|&#8230;|\u00e1|\u00e9|\u00ed|\u00f3|\u00fa|\u00c1|\u00c9|\u00cd|\u00d3|\u00da|\u00f1|\u00d1|&quot;|&lt;|&gt;|&amp;|&#8220;|&#8221;|&#8216;|&#8217;|&#8211;|&ndash;|&rdquo;|&ldquo;|&ntilde;|&aacute;|&eacute;|&iacute;|&oacute;|&uacute;)/g,
    function(str, item) {
      return escaped_one_to_xml_special_map[item];
    });
}
