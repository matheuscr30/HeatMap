const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var pointSchema = new Schema({
    inicio_incidente: {type: String, required: true},
    local_rompimento: {type: String, required: true},
    protocolo: {type: String, required: true},
    fim_incidente: {type: String, required: true},
    origem_problema: {type: String, required: true},
    causa: {type: String, required: true},
    latitude: {type: String, required: true},
    longitude: {type: String, required: true},
    year: {type: String, required: true},
    month: {type: String, required: true},
});

var Point = mongoose.model('Point', pointSchema);

module.exports = Point;