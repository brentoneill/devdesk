var express = require('express');
var router = express.Router();
var app = express();
var ensureAuthenticated = require('./helpers').ensureAuthenticated;
var multer = require('multer');
var done = false;


app.use(multer({ dest: './app/uploads/avatars',
  rename: function (fieldname, filename){
    console.log(fieldname);
    return fieldname;
  },
  onFileUploadStart: function(file) {
    console.log(file.originalname + ' is starting')
  },
  onFileUploadComplete: function(file) {
    console.log(file.fieldname + ' uploaded to ' + file.path)
    done=true;
  }
}));

//PHOTO UPLOAD
router.post('/photo-upload', function(req,res){
    if(done==true){
      console.log(req.files);
      res.end("File uploaded.");
    }
});

module.exports = router;
