
var path = require('path');
var async = require('async');
var bodyParser = require('body-parser');
var express = require('express');
var logger = require('morgan');
var mongoose = require('mongoose');
var config = require('./config');
var User = require('./entities/User');
var authRoutes = require('./routes/auth');
var crudRoutes = require('./routes/apiCrud');
var clientRoutes = require('./routes/clients');
var projectRoutes = require('./routes/projects');
var profileRoutes = require('./routes/profile');
var docusendRoutes = require('./routes/docusend');
var uploadRoutes = require('./routes/upload');
var aws = require('aws-sdk');


var AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
var AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
var S3_BUCKET = process.env.S3_BUCKET


mongoose.connect(config.MONGO_URI);

mongoose.connection.on('error', function() {
  console.error('MongoDB Connection Error. Please make sure that MongoDB is running.');
});

var app = express();

app.set('port', process.env.PORT || 1337);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));




// Force HTTPS on Heroku
if (app.get('env') === 'production') {
  app.use(function(req, res, next) {
    var protocol = req.get('x-forwarded-proto');
    protocol == 'https' ? next() : res.redirect('https://' + req.hostname + req.url);
  });
}
app.use(express.static(path.join(__dirname, 'app')));

// login/logout and linking third party providers
app.use('/auth', authRoutes);
app.use('/api', profileRoutes);
// basic crud endpoints a la tiny-server
app.use('/api/collections', crudRoutes);
app.use('/api/collections/clients', clientRoutes);
app.use('/api/collections/projects', projectRoutes);
app.use('/', docusendRoutes);
app.use('/', uploadRoutes);


/*
 |--------------------------------------------------------------------------
 | Start the Server
 |--------------------------------------------------------------------------
 */
app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
