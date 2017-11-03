var assert = require('assert');

describe('WebSocket', function() {
  describe('#require()', function() {
    it('debería crearse sin fallos', function(done) {

      var ws = require("../app/helpers/v2/websocket")(done);

    });
  });
});
