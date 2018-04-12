const Point = require('../models/point');
var XLSX = require('xlsx'),
    path = require('path');

module.exports.get = function (application, req, res) {
    Point.find({}, (err, points) => {
        res.status(200).json({points: points});
    });
};

module.exports.refresh = function (application, req, res) {
    Point.remove({}, (err, result) => {

    });

    let filePath = path.join(path.dirname(__dirname), 'public', 'xlsx');
    //console.log(filePath);
    let workbook = XLSX.readFile(filePath + '/trechosatualizados.xlsx');
    let sheet_name_list = workbook.SheetNames;
    //console.log(sheet_name_list[0]);3

    let worksheet = workbook.Sheets[sheet_name_list[0]];
    let range = XLSX.utils.decode_range(worksheet['!ref']);
    range.s.r = 0; // <-- zero-indexed, so setting to 1 will skip row 0
    worksheet['!ref'] = XLSX.utils.encode_range(range);

    let pontosAux = XLSX.utils.sheet_to_json(worksheet);
    let pontos = [];

    for (let i = 0; i < pontosAux.length; i++) {
        //console.log(pontosAux[i]['Solução']);
        if (pontosAux[i]['Solução'] === "RECUPERAÇÃO DE FIBRA" &&
            pontosAux[i]['Local Rompimento'] &&
            pontosAux[i]['Local Rompimento'] !== "NÃO INFORMADO" &&
            pontosAux[i]['Local Rompimento'].indexOf("<>") === -1 &&
            pontosAux[i]['Operadora'] === "ALGAR TELECOM") {
            pontos.push(pontosAux[i]);
        }
    }

    let googleMapsClient = require('@google/maps').createClient({
        key: 'AIzaSyC5NNONZMPnkrdvvCWJ9ordrYcybEK16mo'
    });

    function searchPoint(index, point) {
        let aux = Date.parse(point['Inicio Incidente']);
        let date = new Date(aux);
        point.year = date.getFullYear();
        point.month = date.getMonth();

        googleMapsClient.geocode({
            address: point['Local Rompimento']
        }, function (err, response) {
            if (response) {
                if (response.json.status === 'OK') {
                    point.Longitude = response.json.results[0].geometry.location.lng;
                    point.Latitude = response.json.results[0].geometry.location.lat;

                    let p = new Point({
                        inicio_incidente: point['Inicio Incidente'],
                        local_rompimento: point['Local Rompimento'],
                        protocolo: point['Protocolo'],
                        fim_incidente: point['Fim do Incidente'],
                        origem_problema: point['Origem do Problema'],
                        causa: point["Causa"],
                        latitude: point.Latitude,
                        longitude: point.Longitude,
                        year: point.year,
                        month: point.month
                    });

                    p.save(function (err, result) {
                        //console.log(result);
                        if (err) {
                            console.log(err);
                        } else {
                            //console.log(result);
                        }
                    });
                }

            } else {
                console.log(err);
                point = undefined;
            }
        });
    }

    for (let i = 0; i < pontos.length; i++) {
        let aux = Date.parse(pontos[i]['Inicio Incidente']);
        let date = new Date(aux);
        pontos[i].year = date.getFullYear();
        pontos[i].month = date.getMonth();

        searchPoint(i, pontos[i]);
    }
};