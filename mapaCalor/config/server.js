const expressSession = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const express = require('express');
const consign = require('consign');

/* iniciar o objeto do express */
var app = express();

mongoose.connect('mongodb://localhost:27017/heatmap');

/* setar as variáveis 'view engine' e 'views' do express */
app.set('view engine', 'ejs');
app.set('views', './app/views');

/* configurar o middleware express.static */
app.use(express.static('./app/public'));

/* configurar o middleware body-parser */
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json({limit: '50mb'}));

app.use(expressSession({
    secret : 'secret',
    resave : false,
    saveUninitialized : false
}));

/* efetua o autoload das rotas, dos models e dos controllers para o objeto app */
consign()
	.include('app/routes')
	.then('app/controllers')
	.into(app);

/* exportar o objeto app */
module.exports = app;