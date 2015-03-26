module.exports = {
  TOKEN_SECRET: process.env.TOKEN_SECRET || 'A hard to guess string',
  MONGO_URI: process.env.MONGOLAB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/test',
  FACEBOOK_SECRET: process.env.FACEBOOK_SECRET || 'Facebook App Secret',
  FOURSQUARE_SECRET: process.env.FOURSQUARE_SECRET || 'Foursquare Client Secret',
  GOOGLE_SECRET: process.env.GOOGLE_SECRET || 'Google Client Secret',
  GITHUB_SECRET: process.env.GITHUB_SECRET || 'GitHub Client Secret',
  LINKEDIN_SECRET: process.env.LINKEDIN_SECRET || 'LinkedIn Client Secret',
  WINDOWS_LIVE_SECRET: process.env.WINDOWS_LIVE_SECRET || 'Windows Live Secret',
  TWITTER_KEY: process.env.TWITTER_KEY || 'Twitter Consumer Key',
  TWITTER_SECRET: process.env.TWITTER_SECRET || 'Twitter Consumer Secret',
  TWITTER_CALLBACK: process.env.TWITTER_CALLBACK || 'Twitter Callback Url',
  YAHOO_SECRET: process.env.YAHOO_SECRET || 'Yahoo Client Secret',
  sgName : 'brentoneill',
  sgPass : '466370',
  AWS_ACCESS_KEY : process.env.AWS_ACCESS_KEY || 'AKIAIOTRVM7OBQ5N3BJQ',
  AWS_SECRET_KEY : process.env.AWS_SECRET_KEY || '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',
  S3_BUCKET : process.env.S3_BUCKET || 'devdesk-docs'

};
