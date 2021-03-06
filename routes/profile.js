var express = require('express');
var router = express.Router();
var User = require('../entities/User');
var config = require('../config');
var ensureAuthenticated = require('./helpers').ensureAuthenticated;

/*
 |--------------------------------------------------------------------------
 | GET /api/me
 |--------------------------------------------------------------------------
 */
router.route('/me')
  .all(ensureAuthenticated)
  .get(function(req, res) {
    User.findById(req.user, function(err, user) {
      res.send(user);
    });
  })
  .put(function(req, res) {
    User.findById(req.user, function(err, user) {
      if (!user) {
        return res.status(400).send({ message: 'User not found' });
      }
      console.log(req.body);
      user.displayName = req.body.displayName || user.displayName;
      user.fullName = req.body.fullName || user.fullName;
      user.email = req.body.email || user.email;
      user.website = req.body.website || '404 not-found';
      user.phone = req.body.phone || user.phone;
      user.address = req.body.address || user.address;
      user.city = req.body.city || user.city;
      user.state = req.body.state || user.state;
      user.zip = req.body.zip || user.zip;
      user.ratehr = req.body.ratehr;
      user.discountRatehr = req.body.discountRatehr;
      user.premiumRatehr = req.body.premiumRatehr;
      user.save(function(err) {
        res.status(200).end();
      });
    });
  });


module.exports = router;
