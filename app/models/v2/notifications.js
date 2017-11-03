const fetch = require("node-fetch");

const storage = require("node-persist");

module.exports.sendNotification = (titulo, descripcion, featured_image) => {

  var API_ACCESS_KEY = 'AAAArb1kRa4:APA91bHXslv809bbK5PspcrpcuYbf2jdD5VKx12A3e_1RV8KrZgHM7_sJAUPvagGOuX5n9LdeE5B2NOgynXmXmZTDHhCo2kwwBh3BzGPbhHCy2C8aJO_S8_Sqck1DeB5yjMNwc7EJURL';

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
