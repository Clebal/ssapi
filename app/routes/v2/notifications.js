module.exports = (app) => {

  const cron = require('node-cron');
  const storage = require('node-persist');

  const News = require("../../models/v2/news");
  const Notifications = require("../../models/v2/notifications");

  cron.schedule('0 */30 * * * *', function() {

    News.checkNews().then((news) => {

      if (news.length >= 1) {

        var description = news[0].content.rendered.replace(/<figcaption([^>]+)>(.*?)<(.*?)>/g, "").replace(/<span(.*?)>/g, "").replace(/<h6(.*?)>/g, "").replace(/(<\/strong>(.*?)<\/h6>)/g, "</h5>").replace(/(<([^>]+)>)/ig, "").substr(0, 197).trim() + "...";

        Notifications.sendNotification(news[0].title.rendered, description, news[0]._embedded['wp:featuredmedia'][0].media_details.sizes.medium_large.source_url);

      } else {

        // console.log("Sin noticias bro");

      }

    });

  });

  app.get("/v2/notification/test", (req, res) => {
    Notifications.sendNotification("Hola amigos", "Esto es una prueba", "https://pbs.twimg.com/media/DJ_kJ0eXUAA15NZ.png");
    storage.initSync();

    var regID = storage.getItemSync('regID');
    res.send(regID);
  });

  app.get("/v2/notification/checkKeys", (req, res) => {

    storage.init().then(() => {

      storage.setItem('regID', []);

      storage.getItem('regID').then((x) => {

        res.send(x);

      });

    });

  });

  app.get("/v2/notification/registration", (req, res) => {

    storage.init().then(() => {

      storage.setItem('regID', []);

      storage.getItem('regID').then((value) => {

        var check = false;

        value.forEach((item) => {

          if (item == req.query.regID) {
            check = true;
          }

        });

        if (!check) {

          storage.setItem('regID', value.concat([req.query.regID]));

        }

        storage.getItem('regID').then((x) => {

          res.send(x);

        });

      });

    });

  });

};
