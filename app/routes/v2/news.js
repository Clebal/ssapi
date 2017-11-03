module.exports = (app) => {

  const News = require("../../models/v2/news");
  const jetpack = require("fs-jetpack");

  app.get('/v2/news', async(req, res) => {

    const num = req.query.num;
    const offset = req.query.offset;

    const force = req.query.force;

    var resultado;

    if (num == undefined && offset == undefined) {
      resultado = await News.getNews(force);
    } else if (num != undefined && offset == undefined) {
      resultado = await News.getNews(force, num);
    } else {
      resultado = await News.getNews(force, num, offset);
    }

    res.send(resultado);

  });

}
