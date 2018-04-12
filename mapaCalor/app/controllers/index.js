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