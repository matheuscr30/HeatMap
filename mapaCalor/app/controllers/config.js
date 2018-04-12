var path = require('path'),
    fs = require('fs');

module.exports.rotas = function (application, req, res) {
    if (req.session.admin != undefined && req.session.admin === true)
        res.render('rotas', {errorAlert: JSON.stringify(""), messageDialog: JSON.stringify("")});
    else {
        res.render('rotas', {errorAlert: JSON.stringify("Acesso Negado"), messageDialog: JSON.stringify("")});
    }
};

module.exports.postRotas = function (application, req, res) {
    //console.log(req.files);
    //console.log(req.files.arquivoRota.name);

    let extension = req.files.arquivoRota.name.split('.')[1];
    let oldPath = req.files.arquivoRota.path;
    let newPath = path.join(path.dirname(__dirname), 'public', 'kml');
    newPath += "/" + "rotas.kml";     //change to a fixed name

    if (extension != "kml")
        return res.render('rotas', {
            errorAlert: JSON.stringify(""),
            messageDialog: JSON.stringify("Formato não suportado")
        });

    fs.readFile(oldPath, function (err, data) {
        fs.writeFile(newPath, data, function (err) {
            fs.unlink(oldPath, function (err) {
                if (err)
                    return res.render('rotas', {
                        errorAlert: JSON.stringify(""),
                        messageDialog: JSON.stringify("Desculpe, ocorreu um erro interno")
                    });
                else
                    return res.render('rotas', {
                        errorAlert: JSON.stringify(""),
                        messageDialog: JSON.stringify("Rotas atualizadas com sucesso")
                    });
            });
        });
    });
};

module.exports.rompimentos = function (application, req, res) {
    if (req.session.admin != undefined && req.session.admin === true)
        res.render('rompimentos', {errorAlert: JSON.stringify(""), messageDialog: JSON.stringify("")});
    else {
        res.render('rompimentos', {errorAlert: JSON.stringify("Acesso Negado"), messageDialog: JSON.stringify("")});
    }
};

module.exports.postRompimentos = function (application, req, res) {

    let extension = req.files.arquivoRompimento.name.split('.')[1];
    let oldPath = req.files.arquivoRompimento.path;
    let newPath = path.join(path.dirname(__dirname), 'public', 'xlsx');
    newPath += "/trechosatualizados.xlsx";

    if (extension != "xlsx")
        return res.render('rompimentos', {
            errorAlert: JSON.stringify(""),
            messageDialog: JSON.stringify("Formato não suportado")
        });

    application.app.controllers.points.refresh(application, req, res);

    fs.readFile(oldPath, function (err, data) {
        fs.writeFile(newPath, data, function (err) {
            fs.unlink(oldPath, function (err) {
                if (err)
                    return res.render('rompimentos', {
                        errorAlert: JSON.stringify(""),
                        messageDialog: JSON.stringify("Desculpe, ocorreu um erro interno")
                    });
                else
                    return res.render('rompimentos', {
                        errorAlert: JSON.stringify(""),
                        messageDialog: JSON.stringify("Rompimentos atualizados com sucesso")
                    });
            });
        });
    });
};
