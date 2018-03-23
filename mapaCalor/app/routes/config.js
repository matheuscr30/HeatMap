module.exports = function (application) {
    var multipart = require('connect-multiparty');
    var multipartMiddleware = multipart();
    application.get('/rotas', function (req, res) {
        application.app.controllers.config.rotas(application, req, res);
    });

    application.post('/rotas', multipartMiddleware, function (req, res) {
        application.app.controllers.config.postRotas(application, req, res);
    });

    application.get('/rompimentos', function (req, res) {
        application.app.controllers.config.rompimentos(application, req, res);
    });

    application.post('/rompimentos', function (req, res) {
        application.app.controllers.config.postRompimentos(application, req, res);
    });
};