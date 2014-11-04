var express = require('express');
var partials = require('express-partials')
var bodyParser = require('body-parser');

var path = require('path');
var favicon = require('serve-favicon');

var logger = require('morgan');

var routes = require('./routes/routes');

var engine = require('./engine/engine');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(partials());
app.use(bodyParser.urlencoded({ extended: false }));

app.locals.version = require('./package.json').version;

app.use(favicon(__dirname + '/public/favicon.ico'));

app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', engine.default);
app.get('/about', routes.about);
app.post('/search', engine.advanced_search);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
