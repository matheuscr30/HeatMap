var XLSX = require('xlsx');
var path = require('path');

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

    if (body['username'] === '' || body['password'] === '' || body['username'] !== 'algartelecom2018' || body['password'] !== 'tstrt2018') {
        res.render('index', {
            errors: JSON.stringify(true)
        });
    }
    else {
        req.session.authorized = true;
        res.redirect('/home');
    }
};

module.exports.home = function (application, req, res) {
    if (req.session.authorized !== true)
        res.redirect('/');
    else
        res.render('home');
};

module.exports.getPoints = function (application, req, res) {
    var filePath = path.join(path.dirname(__dirname), 'public', 'xlsx');
    //console.log(filePath);
    var workbook = XLSX.readFile(filePath + '/trechosatualizados.xlsx');
    var sheet_name_list = workbook.SheetNames;
    //console.log(sheet_name_list[0]);

    var worksheet = workbook.Sheets[sheet_name_list[0]];
    var range = XLSX.utils.decode_range(worksheet['!ref']);
    range.s.r = 1; // <-- zero-indexed, so setting to 1 will skip row 0
    worksheet['!ref'] = XLSX.utils.encode_range(range);

    var pontosAux = XLSX.utils.sheet_to_json(worksheet);
    var pontos = [];

    for (var i = 0; i < pontosAux.length; i++) {
        //console.log(pontosAux[i]['Motivo']);
        if (pontosAux[i]['Motivo'] === "Rompimento de Fibra"
            && pontosAux[i]["Protocolo"] != "173260146"
            && pontosAux[i]["Protocolo"] != "173273362"
            && pontosAux[i]["Protocolo"] != "173251368")
            pontos.push(pontosAux[i]);
    }

    //console.log(pontos);
    res.json({points: pontos});
};