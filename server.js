var express = require('express'),
    app = express();
var path = require('path');
var logger = require('morgan');
var config = require('./config');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var compress = require('compression');
var apiRouter = require('./app/routes/api')(express, mongoose);

// connect to our database (hosted locally)
mongoose.connect(config.database);
//uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));

app.use(function(req, res, next){
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,HEAD,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization,x-access-token');
    res.setHeader('X-Powered-By', 'None of ya business');
    next();
});

app.use(compress({level: 7}));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//app.options('/*', function(req, res){
//    res.header('Access-Control-Allow-Origin', req.headers.origin || "*");
//    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,HEAD,DELETE,OPTIONS');
//    res.header('Access-Control-Allow-Headers', 'content-Type,x-requested-with,x-access-token');
//});

app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', apiRouter);

//homepage
app.get('/home', function(req, res){
    //res.send("Hello World");
    res.sendFile(path.join(__dirname, '/public/app/views/index.html'));
});

//uploader
app.get('/makepost', function(req, res){
    //res.send("Hello World");
    res.sendFile(path.join(__dirname, '/public/app/services/uploadTest/index.html'));
});

//card directive test
app.get('/testCard', function(req, res){
    //res.send("Hello World");
    res.sendFile(path.join(__dirname, '/public/app/directives/testCard.html'));
});

app.get('/testAudio', function(req, res){
    //res.send("Hello World");
    res.sendFile(path.join(__dirname, '/public/app/directives/testAudio.html'));
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.send('error', {
            message: err.message,
            error: err
        });
        console.log('OJError: ' + err.stack);
    });
}

var server = app.listen(config.port);

server.timeout = 60000000;
console.log(app.get('env'));
console.log('Running on port' + config.port);
