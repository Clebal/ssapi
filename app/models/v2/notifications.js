const fetch = require("node-fetch");

const storage = require("node-persist");

module.exports.sendNotification = (titulo, descripcion, featured_image) => {

  var API_ACCESS_KEY = '';
  
  storage.initSync();
  var regID = storage.getItemSync('regID');

  console.log("regID: " + regID);

  fetch('https://android.googleapis.com/gcm/send', {
    method: 'post',
    headers: {
      'Authorization': 'key=' + API_ACCESS_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      registration_ids: regID,
      data: {
        title: "Hay una nueva noticia",
        body: titulo
      }
    })
  }).then(function(response) {
    console.log(response.statusText);
  }, function(error) {
    console.log(error);
  });

};
