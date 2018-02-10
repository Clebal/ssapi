const Hermandad = require("../models/Hermandad");
const Itinerario = require("../models/Itinerario");
const ItinerarioReal = require("../models/ItinerarioReal");
const Noticia = require("../models/Noticia");

const Realm = require("realm");

async function open() {
    return await Realm.open({ path: 'ssapi.realm', schema: [Hermandad.getSchema(), Itinerario.getSchema(), ItinerarioReal.getSchema()] });
}

function populateDatabase(app) {

    if (!app.realm.objects('Hermandad').length) {
        app.realm.write(() => {
            const populateHermandad = require("./populateHermandad.json").data;
            const populateItinerario = require("./populateItinerario.json").data;
            populateHermandad.forEach(hermandadItem => {
                let hermandad = app.realm.create('Hermandad', hermandadItem);
                hermandad.itinerario = populateItinerario.filter(item => { return item.id_hermandad == hermandadItem.id });
                hermandad.itinerarioReal = populateItinerario.filter(item => { return item.id_hermandad == hermandadItem.id });
            })
        })
    }

}

function addItinerarioReal(hermandad, app) {

    const populateItinerario = require("./populateItinerario.json").data;
    app.realm.write(_ => {
        app.realm.objects('Hermandad').filtered(`nick == "${hermandad.nick}"`)[0].itinerarioReal = itinerarioReal.data.filter(item => { return item.id_hermandad = hermandad.id });
    })

}

module.exports = {
    open,
    populateDatabase,
    addItinerarioReal
}