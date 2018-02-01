const express = require('express');
const fs = require('fs-jetpack');
const cluster = require('cluster');

const app = express();

require('./app/config/set-config-express')(app);

require('./app/routes/hermandad')(app);
require('./app/routes/map')(app);
require('./app/routes/news')(app);
require('./app/routes/itinerario')(app);
require('./app/routes/sale')(app);

// ******** V2 ********* //
require('./app/routes/v2/news')(app);
require('./app/routes/v2/notifications')(app);
require('./app/routes/v2/hermandad')(app);
require('./app/routes/v2/itinerario')(app);
require('./app/routes/v2/map')(app);
require('./app/helpers/v2/websocket');

app.get("/", (req, res) => {
  res.render("index");
})

// if (cluster.isMaster) {
//   console.log('start cluster with %s workers', workers)
//
//   for (var i = 0; i < workers; ++i) {
//     var worker = cluster.fork().process
//     console.log('worker %s started.', worker.pid)
//   }
//
//   cluster.on('exit', function (worker) {
//     console.log('worker %s died. restart...', worker.process.pid)
//     cluster.fork()
//   })
// } else {
  app.listen(app.get('settings').port);
// }

process.on('uncaughtException', function (err) {
  fs.readAsync('./error-log.txt', 'buffer').then((data) => {
    fs.writeAsync('./error-log.txt', data + '\n' + (new Date()).toUTCString() + ' - ' + err.message, {atomic: true}).then(() => {
      process.exit(1);
    });
  });
});
