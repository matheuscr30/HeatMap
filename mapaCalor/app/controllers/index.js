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

    if( body['username'] === 'youruser' || body['password'] === 'yourpassword'){
        req.session.authorized = true;
        res.redirect('/home');
    } else if( body['username'] === 'adminuser' || body['password'] === 'adminpassword' ) {
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
    //console.log(sheet_name_list[0]);

    let worksheet = workbook.Sheets[sheet_name_list[0]];
    let range = XLSX.utils.decode_range(worksheet['!ref']);
    range.s.r = 1; // <-- zero-indexed, so setting to 1 will skip row 0
    worksheet['!ref'] = XLSX.utils.encode_range(range);

    let pontosAux = XLSX.utils.sheet_to_json(worksheet);
    let pontos = [];

    for (let i = 0; i < pontosAux.length; i++) {
        //console.log(pontosAux[i]['Motivo']);
        if (pontosAux[i]['Motivo'] === "Rompimento de Fibra")
            pontos.push(pontosAux[i]);
    }

    //console.log(pontos);
    res.json({points: pontos});
};