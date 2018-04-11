var XLSX = require('xlsx'),
    path = require('path');

module.exports.index = function (application, req, res) {
    if (req.session.authorized === true)
        res.redirect('/home');
    else
        res.render('index', {
            errors: JSON.stringify(false)
        });
};

module.exports.login = function (application, req, res) {
    let body = req.body;

    if (body['username'] === 'youruser' || body['password'] === 'yourpassword') {
        req.session.authorized = true;
        res.redirect('/home');
    } else if (body['username'] === 'adminuser' || body['password'] === 'adminpassword') {
        req.session.authorized = true;
        req.session.admin = true;
        res.redirect('/home');
    } else {
        res.render('index', {
            errors: JSON.stringify(true)
        });
    }
};

module.exports.home = function (application, req, res) {
    if (req.session.authorized !== true)
        res.redirect('/');
    else
        res.render('home', {});
};

module.exports.getPoints = function (application, req, res) {
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

    /*
    const Promise = require('promise');
    let auxf = function (points) {
        console.log(points.length);
        pontos = [];
        console.log(points.length);
        return Promise.all(
            points.map(point => searchPoint(point)))
            .then(() => {
                console.log("deu");
                console.log(pontos.length);
            });
    };

    let searchPoint = function (point) {
        let aux = Date.parse(point['Inicio Incidente']);
        let date = new Date(aux);
        point.year = date.getFullYear();
        point.month = date.getMonth();

        console.log("what");

        googleMapsClient.geocode({
            address: point['Local Rompimento']
        }, function (err, response) {
            if (!err) {
                console.log(cont + " " + i + " " + response.json.results[0].geometry.location.lat);
                point.Longitude = response.json.results[0].geometry.location.lng;
                point.Latitude = response.json.results[0].geometry.location.lat;
            } else {
                console.log(err);
                point = undefined;
            }

            pontos.push(point);
            console.log(point);
        });
    };

    auxf(pontos);*/

    //console.log(pontos);
    res.json({points: pontos});
};
