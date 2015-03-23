var express = require('express');
var router = express.Router();
var config = require('../config');
var sendgrid  = require('sendgrid')(config.sgName, config.sgPass);
var fs = require('fs');
var pdf = require('html-pdf');

var ensureAuthenticated = require('./helpers').ensureAuthenticated;

var css = fs.readFileSync('./app/assets/css/docs.css', 'utf8');

router.post('/send-contract', function(req, res, next){
  console.log('starting contract gen and emai send');
  var html = '<style>' +  css + '</style>' + req.body[0];
  console.log(html);
  var project = req.body[1]
  var projectName = project.name.replace(/\s/g, '');

  /////////////////////////////////////
  //CREATES PDF
  /////////////////////////////////////
  var options = {
        filename: './app/tmp/pdf/' + projectName + '-contract.pdf',
        format: 'Letter',
        type: 'pdf',
        height: '11in',
        width: '8.5in'
  };
  pdf.create(html, options).toFile(function(err, res) {
    if (err) return console.log(err);
    console.log(res); // { filename: '/tmp/html-pdf-8ymPV.pdf' }
  });


  /////////////////////////////////////
  //SENDS EMAIL
  /////////////////////////////////////
  setTimeout(function(){
    console.log('trying to email contract');
    sendgrid.send({
      to:       'brentoneill@gmail.com', //recipient
      from:     'no-reply@devdesk.com', //sender
      subject:  project.name + ' Contract Document from ' + project.user.fullName,
      text:     'Attached you will find the contract agreement for your upcoming web development project with ' + project.user.fullName+ '.\n\nBe sure to email ' + project.user.email + ' once you get a chance to look at the document.\n\nCheers!\n\n-that one guy at devdesk',
      files: [
        {
          filename:     projectName+ '-contract.pdf',
          contentType: '.pdf',
          url:         'http://localhost:1337/tmp/pdf/' + projectName + '-contract.pdf',
          content:      ('This is the content' | Buffer)
        }
      ],
    }, function(err, json) {
      if (err) { return res.send(err); }
      console.log('sent contract via email');
    });
  }, 3000);

});

router.post('/send-estimate', function(req, res, next){
  console.log('starting estimate gen and email send');
  var html = '<style>' +  css + '</style>' + req.body[0];
  var project = req.body[1];
  var recipient = project.client.email;
  var projectName = project.name.replace(/\s/g, '');

  /////////////////////////////////////
  //CREATES PDF
  /////////////////////////////////////
  var options = {
        filename: './app/tmp/pdf/' + projectName + '-estimate.pdf',
        format: 'Letter',
        type: 'pdf',
        height: '11in',
        width: '8.5in'
  };
  pdf.create(html, options).toFile(function(err, res) {
    if (err) return console.log(err);
    console.log(res);
  });


  /////////////////////////////////////
  //SENDS EMAIL
  /////////////////////////////////////
  setTimeout(function(){
    console.log('trying to email estimate');
    sendgrid.send({
      to:       'brentoneill@gmail.com', //project.user.email
      from:     'no-reply@devdesk.com',
      subject:  project.name + ' Estimate Document',
      text:     'Attached you will find the esimate of work for your upcoming web development project with ' + project.user.name + '\n\nCheers!\n\nthat one guy at devesk',
      files: [
        {
          filename:     projectName + '-estimate.pdf',
          contentType: '.pdf',
          url:         'http://localhost:1337/tmp/pdf/' + projectName + '-estimate.pdf',
          content:      ('This is the content' | Buffer)
        }
      ],
    }, function(err, json) {
      if (err) { return res.send(err); }
      console.log('sent estimate via email');
    });
  }, 3000);

});

router.post('/send-invoice', function(req, res, next){
  console.log('starting invoice gen and email send');
  var html = '<style>' +  css + '</style>' + req.body[0];
  var project = req.body[1];
  var index = req.body[2] + 1
  var recipient = project.client.email;
  var projectName = project.name.replace(/\s/g, '');

  /////////////////////////////////////
  //CREATES PDF
  /////////////////////////////////////
  var options = {
        filename: './app/tmp/pdf/' + projectName + '-invoice' + index + '.pdf',
        format: 'Letter',
        type: 'pdf',
        height: '11in',
        width: '8.5in'
  };
  pdf.create(html, options).toFile(function(err, res) {
    if (err) return console.log(err);
    console.log(res);
  });


  /////////////////////////////////////
  //SENDS EMAIL
  /////////////////////////////////////
  setTimeout(function(){
    console.log('trying to email invoice');
    sendgrid.send({
      to:       'brentoneill@gmail.com', //project.user.email
      from:     'no-reply@devdesk.com',
      subject:  'Invoice #' + index + ' for ' + project.name,
      text:     'Attached you will find an invoice for you ongoing project with ' + project.user.name + '\n\nCheers!\n\nthat one guy at devesk',
      files: [
        {
          filename:     projectName + '-invoice' + index + '.pdf',
          contentType: '.pdf',
          url:         'http://localhost:1337/tmp/pdf/' + projectName + '-invoice' + index + '.pdf',
          content:      ('This is the content' | Buffer)
        }
      ],
    }, function(err, json) {
      if (err) { return res.send(err); }
      console.log('sent invoice via email');
    });
  }, 3000);

});

router.post('/send-estimate-reminder', function(req, res, next){
  var project = req.body[0];
  var recipient = project.client.email;
  var projectName = project.name.replace(/\s/g, '');
  console.log('starting estimate reminder send');
  console.log(project);
  sendgrid.send({
    to:       'brentoneill@gmail.com',  //project.user.email
    from:     'no-reply@devdesk.com',
    subject:  project.name + 'Estimate Reminder',
    text:     'Just a friendly reminder from your freelance developer that you have a project estimate awaiting your review.\n\nFor your convenience, we have attached that estimate in this email.\n\n\nHave a good one!\n\n- the team [guy] at devdesk.',
    files: [
      {
        filename:     projectName + '-estimate.pdf',
        contentType: '.pdf',
        url:         'http://localhost:1337/tmp/pdf/' + projectName + '-estimate.pdf',
        content:      ('This is the content' | Buffer)
      }
    ],
  }, function(err, json) {
    if (err) { return res.send(err); }
    console.log('sent estimate reminder via email');
  });

});

router.post('/send-contract-reminder', function(req, res, next){
  var project = req.body[0];
  var type = req.body[1]
  var recipient = project.client.email;
  var projectName = project.name.replace(/\s/g, '');
  console.log('starting contract reminder email send');
  sendgrid.send({
    to:       'brentoneill@gmail.com',  //project.user.email
    from:     'no-reply@devdesk.com',
    subject:  project.name + ' contract document reminder',
    text:     'Just a friendly reminder from your freelance developer that you have a contract awaiting your signature.\n\nFor your convenience, we have attached that contract in this email.\n\n\nHave a good one!\n\n- the team [guy] at devdesk.',
    files: [
      {
        filename:     projectName + '-contract.pdf',
        contentType: '.pdf',
        url:         'http://localhost:1337/tmp/pdf/' + projectName+ '-contract.pdf',
        content:      ('This is the content' | Buffer)
      }
    ],
  }, function(err, json) {
    if (err) { return res.send(err); }
    console.log('sent contract reminder via email');
  });

});

router.post('/send-invoice-reminder', function(req, res, next){
  var project = req.body[0];
  var index = req.body[1] + 1
  var recipient = project.client.email;
  var projectName = project.name.replace(/\s/g, '');
  console.log('starting invoice reminder send');
  sendgrid.send({
    to:       'brentoneill@gmail.com',  //project.user.email
    from:     'no-reply@devdesk.com',
    subject:  project.name + ' Invoice #' + index + ' reminder',
    text:     'Just a friendly reminder from your freelance developer that you have an invoice the requires you attention.\n\nFor your convenience, we have attached that invoice in this email.\n\n\nHave a good one!\n\n- the team [guy] at devdesk.',
    files: [
      {
        filename:     projectName + '-invoice' + index + '.pdf',
        contentType: '.pdf',
        url:         'http://localhost:1337/tmp/pdf/' + projectName + '-invoice' + index + '.pdf',
        content:      ('This is the content' | Buffer)
      }
    ],
  }, function(err, json) {
    if (err) { return res.send(err); }
    console.log('sent invoice reminder via email');
  });

});

module.exports = router;
