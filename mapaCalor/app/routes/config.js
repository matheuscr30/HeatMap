module.exports = function (application) {
    application.get('/rotas', function (req, res) {
        application.app.controllers.config.rotas(application, req, res);
    });

    application.post('/rotas', function (req, res) {
        application.app.controllers.config.postRotas(application, req, res);
    });

    application.get('/rompimentos', function (req, res) {
        application.app.controllers.config.rompimentos(application, req, res);
    });

    application.post('/rompimentos', function (req, res) {
        application.app.controllers.config.postRompimentos(application, req, res);
    });
};