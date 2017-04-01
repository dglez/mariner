var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//mongoose and sessions
var mongoose = require('mongoose');
var session = require("express-session");
var MongoStore = require("connect-mongo")(session);
var connection = require('./db/connection.js');
// routes
var index = require('./routes/index');
var api = require('./routes/api');
var users = require('./routes/users');


var app = express();

connection.on("error", console.error.bind(console, "connection error: "));
//use simple sessions to track log-ins
app.use(session({
    secret: "The great Gatsby",
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({
        mongooseConnection: connection
    })
}));

// make the user id available to the templates
app.use(function(req,res,next){
    res.locals.currentUser = req.session.userId;
    next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(require('node-sass-middleware')({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    indentedSyntax: true,
    sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/api', api);
app.use('/users', users);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
