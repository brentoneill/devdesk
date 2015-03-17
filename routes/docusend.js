var express = require('express');
var router = express.Router();
var config = require('../config');

//Mail Sending Module
<<<<<<< HEAD
var sendgrid  = require('sendgrid')(config.sgName, config.sgPass);

//PDF conversion, writing Modules
var fs = require('fs');
var pdf = require('html-pdf');


var ensureAuthenticated = require('./helpers').ensureAuthenticated;

router.post('/send-contract', function(req, res, next){
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
      to:       'brentoneill@gmail.com', //project.user.email
      from:     'noreply@Devdesk.com',
      subject:  project.name + ' Web Development Contract Document',
      text:     'Attached you will find the contract agreement for your upcoming web development project with ',
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





router.post('/send-estimate', function(req, res, next){
  var html = req.body[0];
  var project = req.body[1];
  var recipient = project.client.email;

  var options = {
                  filename: './app/tmp/pdf/' + project.name + '-estimate.pdf',
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
    console.log('starting estimate send');
    sendgrid.send({
      to:       'brentoneill@gmail.com', //project.user.email
      from:     'noreply@Devdesk.com',
      subject:  project.name + ' Web Development Estimate Document',
      text:     'Attached you will find the contract agreement for your upcoming web development project with ',
      files: [
        {
          filename:     project.name + '-estimate.pdf',
          contentType: '.pdf',
          url:         'http://localhost:1337/tmp/pdf/' + project.name + '-estimate.pdf',
          content:      ('This is the content' | Buffer)
        }
      ],
    }, function(err, json) {
      if (err) { return res.send(err); }
      console.log('sent file via email');
    });
  }, 3000);

});

router.post('/send-estimate-reminder', function(req, res, next){
  var project = req.body[0];
  var type = req.body[1]
  console.log(project, type);
  console.log('starting reminder email send');
  sendgrid.send({
    to:       'brentoneill@gmail.com',  //project.user.email
    from:     project.user.fullNname +' @ Devdesk.com',
    subject:  project.name + ' ' + type + ' document reminder',
    text:     'Just a friendly reminder from your freelance developer that you have a pa project estimate awaiting your review.\n\n For your convenience, we have attached that estimate in this email.\n\n\nHave a good one!\n\n- the team [guy] at devdesk.',
    files: [
      {
        filename:     project.name + '-estimate.pdf',
        contentType: '.pdf',
        url:         'http://localhost:1337/tmp/pdf/' + project.name + '-estimate.pdf',
        content:      ('This is the content' | Buffer)
      }
    ],
  }, function(err, json) {
    if (err) { return res.send(err); }
    console.log('sent file via email');
  });

});


router.post('/send-contract-reminder', function(req, res, next){
  var project = req.body[0];
  var type = req.body[1]
  console.log(project, type);
  console.log('starting reminder email send');
  sendgrid.send({
    to:       'brentoneill@gmail.com',  //project.user.email
    from:     project.user.name + ' @ Devdesk.com',
    subject:  project.user.fullName + ' ' + type + ' document reminder',
    text:     'Just a friendly reminder from your freelance developer that you have a project contract awaiting your signature.\n\n For your convenience, we have attached that contract in this email.\n\n\nHave a good one!\n\n- the team [guy] at devdesk.',
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

});



module.exports = router;
