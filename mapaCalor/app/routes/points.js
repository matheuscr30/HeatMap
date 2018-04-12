module.exports = function (application) {
    application.get('/points', function (req, res) {
        application.app.controllers.points.get(application, req, res);
    });

    application.get('/points/refresh', function (req, res) {
        application.app.controllers.points.refresh(application, req, res);
    });
};