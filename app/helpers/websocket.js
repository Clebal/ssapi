const process = require("process");
const http = require("http");

// Variables de configuración //
process.title = 'node-chat';

const WSPORT = 1337;
const webSocketServer = require("websocket").server;

// HTTP Server //
const server = http.createServer((request, response) => { });

server.listen(WSPORT, () => {
    console.log(new Date() + " Server is listening on port " + WSPORT);
});

// WebSocket Server //
const wsServer = new webSocketServer({
    httpServer: server
});

var connection;

wsServer.on('request', (request) => {

    console.log(new Date() + ' Connection from origin ' + request.origin + '.');

    connection = request.accept(null, request.origin);

    console.log((new Date()) + ' Connection accepted.');


    connection.on('close', function (connection) {

    });
});

module.exports.sendMessage = (message) => {
  if(connection !== undefined){
    connection.send(JSON.stringify({data: message}));
  }
};
