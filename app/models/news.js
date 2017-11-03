const mysql = require('../helpers/mysql');
const Marknote = require("../helpers/marknote");
const fetch = require('node-fetch');

module.exports.all = (num, req, res) => {

  if(num == 0){

    return mysql.query("SELECT * FROM news", req, res);

  }else{


    checkNews(req).then((x)=>{
      mysql.queryAsync("SELECT * FROM news", req).then((newsSSAPI)=>{
        var aux = [];
        if(newsSSAPI.length != num){
          for(var j = num; j <= newsSSAPI.length -1; j++){
            aux.push(newsSSAPI[j]);
          }
          res.send(aux);
        }else{
          res.send('');
        }
      });
    });

  }

};

function checkNews(req){
  return new Promise((resolve, reject) => {
    mysql.queryAsync("SELECT * FROM news ORDER BY id DESC LIMIT 1", req).then((noticia)=>{
      var url = `http://www.alcalanazarena.com/wp-json/wp/v2/posts?&per_page=1`;
      fetch(url).then(function (response) {
        return response.json();
      }).then(function(news) {
        console.log(noticia.length == 0);
        if(noticia.length == 0){
          getNewsToDB(15, req).then((x)=>{
            resolve(true);
          });
        }else{
          if(news[0].link != noticia[0].url){
            getNewsToDB(5, req).then((x)=>{
              resolve(true);
            });
          }else{
            resolve(false);
          }
        }
      });
    });
  });
}

function getNewsToDB(num = '15', req){

  return new Promise((resolve, reject)=>{

    console.log("updating...");
    var resultado = [];

    var images = [];
    var tipo = [];

    var url = `http://www.alcalanazarena.com/wp-json/wp/v2/posts?_embed&per_page=${num}`;
    fetch(url).then(function (response) {
      return response.json();
    }).then(function(posts) {

      for(var i = posts.length - 1; i >= 0 ; i--){

        images = [];

        var titulo = decodeXml(posts[i].title.rendered);

        /* */

        var textos = decodeXml(posts[i].content.rendered.replace(/<figcaption([^>]+)>(.*?)<(.*?)>/g,"").replace(/<span(.*?)>/g, "").replace(/<h6(.*?)>/g, "<h5>").replace(/(<\/strong>(.*?)<\/h6>)/g,"</h5>")).split("<h5>").join("_").toString().split("<\/h5>").join("_").toString().replace(/(<([^>]+)>)/ig,"").split("_");
        var contenido;
        textos = textos.map(function(s) { return s.trim(); });
        var content = "[";
        for(var j = 0; j <= textos.length - 1; j++){
          if(textos[j].length >= 75){
            if(textos[j] != ""){
              content += '{"tipo": "p", "valor": ["';
              contenido = textos[j].split("\n");
              for(var x = 0; x <= contenido.length -1; x++){
                content += contenido[x];
              }
              if(j == textos.length - 1){
                content += '"]}';
              }else{
                content += '"]},';
              }
            }
          }else{
            content += '{"tipo": "h5", "valor": "';
            content += textos[j].replace(/(@a[0-99])/g,"?");
            if(j == textos.length - 1){
              content += '"}';
            }else{
              content += '"},';
            }
          }
        }

        content += "]";

        /* */

        var parser = new Marknote.Parser();
        var doc = parser.parse("<article>"+decodeXml(posts[i].content.rendered)+"</article>");
        var root = doc.getRootElement();

        var control = 1;
        var x = 1;

        while(control != undefined){
          if(root.toString() == null || root.toString().split("<img")[x] == null){
            control = undefined;
          }else{
            images.push(root.toString().split("<img")[x].split("src=\"")[1].split("\"")[0]);
          }
          x++;
        }

        /* */

        var url = decodeXml(posts[i].link);

        var featured_image = posts[i]._embedded['wp:featuredmedia'][0].media_details.sizes.medium.source_url;

        if(tipo.length == 0){
          tipo.push('large');
        }else if(tipo[tipo.length-1] == "medium" && tipo[tipo.length-2] == "medium"){
          tipo.push('medium');
        }else if(tipo[tipo.length-1] == "medium"){
          tipo.push('large');
        }else if(tipo[tipo.length-1] == "large"){
          tipo.push('medium');
        }

        var noticia = {
          'titulo': titulo,
          'contenido': content,
          'images': images.toString(),
          'featured_image': featured_image,
          'url': url,
          'tipo': tipo[tipo.length-1]
        };

        mysql.query(`INSERT IGNORE INTO news(title, content, images, featured_image, url, cardType) VALUES('${noticia.titulo}', '${noticia.contenido}', '${noticia.images}', '${noticia.featured_image}', '${noticia.url}', '${noticia.tipo}')`, req);

      }

      resolve(true);
    });

  });
}

var escaped_one_to_xml_special_map = {
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
