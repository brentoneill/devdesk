var qs = require('querystring');
var express = require('express');
var router = express.Router();
var request = require('request');
var moment = require('moment');
var jwt = require('jwt-simple');
var config = require('../config');
var mongoose = require('mongoose');
var User = require('../entities/User');
var ensureAuthenticated = require('./helpers').ensureAuthenticated;

/*
 |--------------------------------------------------------------------------
 | Generate JSON Web Token
 |--------------------------------------------------------------------------
 */
function createToken(user) {
  var payload = {
    sub: user._id,
    iat: moment().unix(),
    exp: moment().add(14, 'days').unix()
  };
  return jwt.encode(payload, config.TOKEN_SECRET);
}

/*
 |--------------------------------------------------------------------------
 | Log in with Email
 |--------------------------------------------------------------------------
 */

router.route('/login')
  .post(function(req, res, next) {
    User.findOne({ email: req.body.email }, '+password', function(err, user, next) {
      if (err) return next(err);
      if (!user) {
        return res.status(401).send({ message: 'Wrong email and/or password' });
      }
      user.comparePassword(req.body.password, function(err, isMatch) {
        if (!isMatch) {
          return res.status(401).send({ message: 'Wrong email and/or password' });
        }
        res.send({ token: createToken(user) });
      });
    });
  });

/*
 |--------------------------------------------------------------------------
 | Create Email and Password Account
 |--------------------------------------------------------------------------
 */
 router.route('/signup')
  .post(function(req, res) {
    console.log("Hi");
    User.findOne({ email: req.body.email }, function(err, existingUser) {
      if (existingUser) {
        return res.status(409).send({ message: 'Email is already taken' });
      }
      var user = new User({
        displayName: req.body.displayName,
        email: req.body.email,
        password: req.body.password,
        website: req.body.website,
        phone: req.body.phone
      });
      user.save(function() {
        res.send({ token: createToken(user) });
      });
    });
  });

/*
 |--------------------------------------------------------------------------
 | Login with Google
 |--------------------------------------------------------------------------
 */
 router.route('/google')
  .post(function(req, res) {
    var accessTokenUrl = 'https://accounts.google.com/o/oauth2/token';
    var peopleApiUrl = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';
    var params = {
      code: req.body.code,
      client_id: req.body.clientId,
      client_secret: config.GOOGLE_SECRET,
      redirect_uri: req.body.redirectUri,
      grant_type: 'authorization_code'
    };

    // Step 1. Exchange authorization code for access token.
    request.post(accessTokenUrl, { json: true, form: params }, function(err, response, token) {
      var accessToken = token.access_token;
      var headers = { Authorization: 'Bearer ' + accessToken };

      // Step 2. Retrieve profile information about the current user.
      request.get({ url: peopleApiUrl, headers: headers, json: true }, function(err, response, profile) {

        // Step 3a. Link user accounts.
        if (req.headers.authorization) {
          User.findOne({ google: profile.sub }, function(err, existingUser) {
            if (existingUser) {
              return res.status(409).send({ message: 'There is already a Google account that belongs to you' });
            }
            var token = req.headers.authorization.split(' ')[1];
            var payload = jwt.decode(token, config.TOKEN_SECRET);
            User.findById(payload.sub, function(err, user) {
              if (!user) {
                return res.status(400).send({ message: 'User not found' });
              }
              user.google = profile.sub;
              user.picture = user.picture || profile.picture.replace('sz=50', 'sz=200');
              user.displayName = user.displayName || profile.name;
              user.save(function() {
                var token = createToken(user);
                res.send({ token: token });
              });
            });
          });
        } else {
          // Step 3b. Create a new user account or return an existing one.
          User.findOne({ google: profile.sub }, function(err, existingUser) {
            if (existingUser) {
              return res.send({ token: createToken(existingUser) });
            }
            var user = new User();
            user.google = profile.sub;
            user.picture = profile.picture.replace('sz=50', 'sz=200');
            user.displayName = profile.name;
            user.save(function(err) {
              var token = createToken(user);
              res.send({ token: token });
            });
          });
        }
      });
    });
  });

/*
 |--------------------------------------------------------------------------
 | Login with GitHub
 |--------------------------------------------------------------------------
 */
router.route('/github')
  .post(function(req, res) {
    var accessTokenUrl = 'https://github.com/login/oauth/access_token';
    var userApiUrl = 'https://api.github.com/user';
    var params = {
      code: req.body.code,
      client_id: req.body.clientId,
      client_secret: config.GITHUB_SECRET,
      redirect_uri: req.body.redirectUri
    };

    // Step 1. Exchange authorization code for access token.
    request.get({ url: accessTokenUrl, qs: params }, function(err, response, accessToken) {
      accessToken = qs.parse(accessToken);
      var headers = { 'User-Agent': 'Satellizer' };

      // Step 2. Retrieve profile information about the current user.
      request.get({ url: userApiUrl, qs: accessToken, headers: headers, json: true }, function(err, response, profile) {

        // Step 3a. Link user accounts.
        if (req.headers.authorization) {
          User.findOne({ github: profile.id }, function(err, existingUser) {
            if (existingUser) {
              return res.status(409).send({ message: 'There is already a GitHub account that belongs to you' });
            }
            var token = req.headers.authorization.split(' ')[1];
            var payload = jwt.decode(token, config.TOKEN_SECRET);
            User.findById(payload.sub, function(err, user) {
              if (!user) {
                return res.status(400).send({ message: 'User not found' });
              }
              user.github = profile.id;
              user.picture = user.picture || profile.avatar_url;
              user.displayName = user.displayName || profile.name;
              user.save(function() {
                var token = createToken(user);
                res.send({ token: token });
              });
            });
          });
        } else {
          // Step 3b. Create a new user account or return an existing one.
          User.findOne({ github: profile.id }, function(err, existingUser) {
            if (existingUser) {
              var token = createToken(existingUser);
              return res.send({ token: token });
            }
            var user = new User();
            user.github = profile.id;
            user.picture = profile.avatar_url;
            user.displayName = profile.name;
            user.save(function() {
              var token = createToken(user);
              res.send({ token: token });
            });
          });
        }
      });
    });
  });

/*
 |--------------------------------------------------------------------------
 | Login with LinkedIn
 |--------------------------------------------------------------------------
 */
router.route('/linkedin')
  .post(function(req, res) {
    var accessTokenUrl = 'https://www.linkedin.com/uas/oauth2/accessToken';
    var peopleApiUrl = 'https://api.linkedin.com/v1/people/~:(id,first-name,last-name,email-address,picture-url)';
    var params = {
      code: req.body.code,
      client_id: req.body.clientId,
      client_secret: config.LINKEDIN_SECRET,
      redirect_uri: req.body.redirectUri,
      grant_type: 'authorization_code'
    };

    // Step 1. Exchange authorization code for access token.
    request.post(accessTokenUrl, { form: params, json: true }, function(err, response, body) {
      if (response.statusCode !== 200) {
        return res.status(response.statusCode).send({ message: body.error_description });
      }
      var params = {
        oauth2_access_token: body.access_token,
        format: 'json'
      };

      // Step 2. Retrieve profile information about the current user.
      request.get({ url: peopleApiUrl, qs: params, json: true }, function(err, response, profile) {

        // Step 3a. Link user accounts.
        if (req.headers.authorization) {
          User.findOne({ linkedin: profile.id }, function(err, existingUser) {
            if (existingUser) {
              return res.status(409).send({ message: 'There is already a LinkedIn account that belongs to you' });
            }
            var token = req.headers.authorization.split(' ')[1];
            var payload = jwt.decode(token, config.TOKEN_SECRET);
            User.findById(payload.sub, function(err, user) {
              if (!user) {
                return res.status(400).send({ message: 'User not found' });
              }
              user.linkedin = profile.id;
              user.picture = user.picture || profile.pictureUrl;
              user.displayName = user.displayName || profile.firstName + ' ' + profile.lastName;
              user.save(function() {
                var token = createToken(user);
                res.send({ token: token });
              });
            });
          });
        } else {
          // Step 3b. Create a new user account or return an existing one.
          User.findOne({ linkedin: profile.id }, function(err, existingUser) {
            if (existingUser) {
              return res.send({ token: createToken(existingUser) });
            }
            var user = new User();
            user.linkedin = profile.id;
            user.picture = profile.pictureUrl;
            user.displayName = profile.firstName + ' ' + profile.lastName;
            user.save(function() {
              var token = createToken(user);
              res.send({ token: token });
            });
          });
        }
      });
    });
  });

/*
 |--------------------------------------------------------------------------
 | Login with Windows Live
 |--------------------------------------------------------------------------
 */
router.route('/live')
  .post(function(req, res) {
    async.waterfall([
      // Step 1. Exchange authorization code for access token.
      function(done) {
        var accessTokenUrl = 'https://login.live.com/oauth20_token.srf';
        var params = {
          code: req.body.code,
          client_id: req.body.clientId,
          client_secret: config.WINDOWS_LIVE_SECRET,
          redirect_uri: req.body.redirectUri,
          grant_type: 'authorization_code'
        };
        request.post(accessTokenUrl, { form: params, json: true }, function(err, response, accessToken) {
          done(null, accessToken);
        });
      },
      // Step 2. Retrieve profile information about the current user.
      function(accessToken, done) {
        var profileUrl = 'https://apis.live.net/v5.0/me?access_token=' + accessToken.access_token;
        request.get({ url: profileUrl, json: true }, function(err, response, profile) {
          done(err, profile);
        });
      },
      function(profile) {
        // Step 3a. Link user accounts.
        if (!req.headers.authorization) {
          User.findOne({ live: profile.id }, function(err, user) {
            if (user) {
              return res.send({ token: createToken(user) });
            }
            var newUser = new User();
            newUser.live = profile.id;
            newUser.displayName = profile.name;
            newUser.save(function() {
              var token = createToken(newUser);
              res.send({ token: token });
            });
          });
        } else {
          // Step 3b. Create a new user or return an existing account.
          User.findOne({ live: profile.id }, function(err, user) {
            if (user) {
              return res.status(409).send({ message: 'There is already a Windows Live account that belongs to you' });
            }
            var token = req.headers.authorization.split(' ')[1];
            var payload = jwt.decode(token, config.TOKEN_SECRET);
            User.findById(payload.sub, function(err, existingUser) {
              if (!existingUser) {
                return res.status(400).send({ message: 'User not found' });
              }
              existingUser.live = profile.id;
              existingUser.displayName = existingUser.name;
              existingUser.save(function() {
                var token = createToken(existingUser);
                res.send({ token: token });
              });
            });
          });
        }
      }
    ]);
  });

/*
 |--------------------------------------------------------------------------
 | Login with Facebook
 |--------------------------------------------------------------------------
 */
router.route('/facebook')
  .post(function(req, res) {
    var accessTokenUrl = 'https://graph.facebook.com/oauth/access_token';
    var graphApiUrl = 'https://graph.facebook.com/me';
    var params = {
      code: req.body.code,
      client_id: req.body.clientId,
      client_secret: config.FACEBOOK_SECRET,
      redirect_uri: req.body.redirectUri
    };

    // Step 1. Exchange authorization code for access token.
    request.get({ url: accessTokenUrl, qs: params, json: true }, function(err, response, accessToken) {
      if (response.statusCode !== 200) {
        return res.status(500).send({ message: accessToken.error.message });
      }
      accessToken = qs.parse(accessToken);

      // Step 2. Retrieve profile information about the current user.
      request.get({ url: graphApiUrl, qs: accessToken, json: true }, function(err, response, profile) {
        if (response.statusCode !== 200) {
          return res.status(500).send({ message: profile.error.message });
        }
        if (req.headers.authorization) {
          User.findOne({ facebook: profile.id }, function(err, existingUser) {
            if (existingUser) {
              return res.status(409).send({ message: 'There is already a Facebook account that belongs to you' });
            }
            var token = req.headers.authorization.split(' ')[1];
            var payload = jwt.decode(token, config.TOKEN_SECRET);
            User.findById(payload.sub, function(err, user) {
              if (!user) {
                return res.status(400).send({ message: 'User not found' });
              }
              user.facebook = profile.id;
              user.picture = user.picture || 'https://graph.facebook.com/' + profile.id + '/picture?type=large';
              user.displayName = user.displayName || profile.name;
              user.save(function() {
                var token = createToken(user);
                res.send({ token: token });
              });
            });
          });
        } else {
          // Step 3b. Create a new user account or return an existing one.
          User.findOne({ facebook: profile.id }, function(err, existingUser) {
            if (existingUser) {
              var token = createToken(existingUser);
              return res.send({ token: token });
            }
            var user = new User();
            user.facebook = profile.id;
            user.picture = 'https://graph.facebook.com/' + profile.id + '/picture?type=large';
            user.displayName = profile.name;
            user.save(function() {
              var token = createToken(user);
              res.send({ token: token });
            });
          });
        }
      });
    });
  });

/*
 |--------------------------------------------------------------------------
 | Login with Yahoo
 |--------------------------------------------------------------------------
 */
router.route('/yahoo')
  .post(function(req, res) {
    var accessTokenUrl = 'https://api.login.yahoo.com/oauth2/get_token';
    var clientId = req.body.clientId;
    var clientSecret = config.YAHOO_SECRET;
    var formData = {
      code: req.body.code,
      redirect_uri: req.body.redirectUri,
      grant_type: 'authorization_code'
    };
    var headers = { Authorization: 'Basic ' + new Buffer(clientId + ':' + clientSecret).toString('base64') };

    // Step 1. Exchange authorization code for access token.
    request.post({ url: accessTokenUrl, form: formData, headers: headers, json: true }, function(err, response, body) {
      var socialApiUrl = 'https://social.yahooapis.com/v1/user/' + body.xoauth_yahoo_guid + '/profile?format=json';
      var headers = { Authorization: 'Bearer ' + body.access_token };

      // Step 2. Retrieve profile information about the current user.
      request.get({ url: socialApiUrl, headers: headers, json: true }, function(err, response, body) {

        // Step 3a. Link user accounts.
        if (req.headers.authorization) {
          User.findOne({ yahoo: body.profile.guid }, function(err, existingUser) {
            if (existingUser) {
              return res.status(409).send({ message: 'There is already a Yahoo account that belongs to you' });
            }
            var token = req.headers.authorization.split(' ')[1];
            var payload = jwt.decode(token, config.TOKEN_SECRET);
            User.findById(payload.sub, function(err, user) {
              if (!user) {
                return res.status(400).send({ message: 'User not found' });
              }
              user.yahoo = body.profile.guid;
              user.displayName = user.displayName || body.profile.nickname;
              user.save(function() {
                var token = createToken(user);
                res.send({ token: token });
              });
            });
          });
        } else {
          // Step 3b. Create a new user account or return an existing one.
          User.findOne({ yahoo: body.profile.guid }, function(err, existingUser) {
            if (existingUser) {
              return res.send({ token: createToken(existingUser) });
            }
            var user = new User();
            user.yahoo = body.profile.guid;
            user.displayName = body.profile.nickname;
            user.save(function() {
              var token = createToken(user);
              res.send({ token: token });
            });
          });
        }
      });
    });
  });

/*
 |--------------------------------------------------------------------------
 | Login with Twitter
 |--------------------------------------------------------------------------
 */
router.route('/twitter')
  .post(function(req, res) {
    var requestTokenUrl = 'https://api.twitter.com/oauth/request_token';
    var accessTokenUrl = 'https://api.twitter.com/oauth/access_token';
    var authenticateUrl = 'https://api.twitter.com/oauth/authenticate';

    if (!req.query.oauth_token || !req.query.oauth_verifier) {
      var requestTokenOauth = {
        consumer_key: config.TWITTER_KEY,
        consumer_secret: config.TWITTER_SECRET,
        callback: config.TWITTER_CALLBACK
      };

      // Step 1. Obtain request token for the authorization popup.
      request.post({ url: requestTokenUrl, oauth: requestTokenOauth }, function(err, response, body) {
        var oauthToken = qs.parse(body);
        var params = qs.stringify({ oauth_token: oauthToken.oauth_token });

        // Step 2. Redirect to the authorization screen.
        res.redirect(authenticateUrl + '?' + params);
      });
    } else {
      var accessTokenOauth = {
        consumer_key: config.TWITTER_KEY,
        consumer_secret: config.TWITTER_SECRET,
        token: req.query.oauth_token,
        verifier: req.query.oauth_verifier
      };

      // Step 3. Exchange oauth token and oauth verifier for access token.
      request.post({ url: accessTokenUrl, oauth: accessTokenOauth }, function(err, response, profile) {
        profile = qs.parse(profile);

        // Step 4a. Link user accounts.
        if (req.headers.authorization) {
          User.findOne({ twitter: profile.user_id }, function(err, existingUser) {
            if (existingUser) {
              return res.status(409).send({ message: 'There is already a Twitter account that belongs to you' });
            }
            var token = req.headers.authorization.split(' ')[1];
            var payload = jwt.decode(token, config.TOKEN_SECRET);
            User.findById(payload.sub, function(err, user) {
              if (!user) {
                return res.status(400).send({ message: 'User not found' });
              }
              user.twitter = profile.user_id;
              user.displayName = user.displayName || profile.screen_name;
              user.save(function(err) {
                res.send({ token: createToken(user) });
              });
            });
          });
        } else {
          // Step 4b. Create a new user account or return an existing one.
          User.findOne({ twitter: profile.user_id }, function(err, existingUser) {
            if (existingUser) {
              var token = createToken(existingUser);
              return res.send({ token: token });
            }
            var user = new User();
            user.twitter = profile.user_id;
            user.displayName = profile.screen_name;
            user.save(function() {
              var token = createToken(user);
              res.send({ token: token });
            });
          });
        }
      });
    }
  });

/*
 |--------------------------------------------------------------------------
 | Login with Foursquare
 |--------------------------------------------------------------------------
 */
router.route('/foursquare')
  .post(function(req, res) {
    var accessTokenUrl = 'https://foursquare.com/oauth2/access_token';
    var profileUrl = 'https://api.foursquare.com/v2/users/self';
    var formData = {
      code: req.body.code,
      client_id: req.body.clientId,
      client_secret: config.FOURSQUARE_SECRET,
      redirect_uri: req.body.redirectUri,
      grant_type: 'authorization_code'
    };

    // Step 1. Exchange authorization code for access token.
    request.post({ url: accessTokenUrl, form: formData, json: true }, function(err, response, body) {
      var params = {
        v: '20140806',
        oauth_token: body.access_token
      };

      // Step 2. Retrieve information about the current user.
      request.get({ url: profileUrl, qs: params, json: true }, function(err, response, profile) {
        profile = profile.response.user;

        // Step 3a. Link user accounts.
        if (req.headers.authorization) {
          User.findOne({ foursquare: profile.id }, function(err, existingUser) {
            if (existingUser) {
              return res.status(409).send({ message: 'There is already a Foursquare account that belongs to you' });
            }
            var token = req.headers.authorization.split(' ')[1];
            var payload = jwt.decode(token, config.TOKEN_SECRET);
            User.findById(payload.sub, function(err, user) {
              if (!user) {
                return res.status(400).send({ message: 'User not found' });
              }
              user.foursquare = profile.id;
              user.picture = user.picture || profile.photo.prefix + '300x300' + profile.photo.suffix;
              user.displayName = user.displayName || profile.firstName + ' ' + profile.lastName;
              user.save(function() {
                var token = createToken(user);
                res.send({ token: token });
              });
            });
          });
        } else {
          // Step 3b. Create a new user account or return an existing one.
          User.findOne({ foursquare: profile.id }, function(err, existingUser) {
            if (existingUser) {
              var token = createToken(existingUser);
              return res.send({ token: token });
            }
            var user = new User();
            user.foursquare = profile.id;
            user.picture = profile.photo.prefix + '300x300' + profile.photo.suffix;
            user.displayName = profile.firstName + ' ' + profile.lastName;
            user.save(function() {
              var token = createToken(user);
              res.send({ token: token });
            });
          });
        }
      });
    });
  });


/*
 |--------------------------------------------------------------------------
 | Unlink Provider
 |--------------------------------------------------------------------------
 */
 router.route('/unlink/:provider')
  .all(ensureAuthenticated)
  .get(function(req, res) {
    var provider = req.params.provider;
    User.findById(req.user, function(err, user) {
      if (!user) {
        return res.status(400).send({ message: 'User not found' });
      }
      user[provider] = undefined;
      user.save(function() {
        res.status(200).end();
      });
    });
  });

module.exports = router;
