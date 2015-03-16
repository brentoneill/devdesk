var express = require('express');
var router = express.Router();

//Mail Sending Module
var sendgrid  = require('sendgrid')('xxx', 'xxx');

//PDF conversion, writing Modules
var fs = require('fs');
var pdf = require('html-pdf');


var ensureAuthenticated = require('./helpers').ensureAuthenticated;

router.post('/generate-email', function(req, res, next){
  var html = req.body[0];
  var project = req.body[1];
  var recipient = project.client.email;
  // var sender = project.user.email;


  var options = {
                  filename: './app/tmp/pdf/' + project.name + '-contract.pdf',
                  format: 'Letter',
                  type: 'pdf',
                  height: '11in',
                  width: '8.5in'
                };


  pdf.create(html, options).toFile(function(err, res) {
    if (err) return console.log(err);
    console.log(res); // { filename: '/tmp/html-pdf-8ymPV.pdf' }
  });

  setTimeout(function(){
    console.log('starting email send');
    sendgrid.send({
      to:       'brentoneill@gmail.com',
      from:     'no-reply@devdesk.com',
      subject:  project.name + ' Web Development Contract Document',
      text:     'Attached you will find the contract agreement for your upcoming web development project',
      files: [
        {
          filename:     project.name + '-contract.pdf',
          contentType: '.pdf',
          url:         'http://localhost:1337/tmp/pdf/' + project.name + '-contract.pdf',
          content:      ('This is the content' | Buffer)
        }
      ],
    }, function(err, json) {
      if (err) { return res.send(err); }
      console.log('sent file via email');
    });
  }, 3000);

});


module.exports = router;
