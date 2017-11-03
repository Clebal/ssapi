const W3CWebSocket = require('websocket').w3cwebsocket;

module.exports.sendMessage = (message) => {
  var client = new W3CWebSocket('ws://achex.ca:4010');

  client.onerror = (err) => {
    console.error(err);
    console.log('Connection Error');
  };

  client.onopen = () => {
    console.log('WebSocket Client Connected');
    client.send('{"setID":"ssapi-server","passwd":"12345"}');

    var m = '{"to":"ssapi-app",' + message + '}';
    // console.log(m)
    client.send(m);
    console.log('Mensaje enviado al usuario.');
  };

  client.onclose = () => {
    console.log('Cerrado');
  };

  client.onmessage = (e) => {
    if (typeof e.data === 'string') {
      console.log("Received: '" + e.data + "'");
    }
  };
};

// sendMessage("paco", client);
