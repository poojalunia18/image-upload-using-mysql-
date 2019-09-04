var express =   require("express");
var multer  =   require('multer');
//var app     =   express();
let router = require('express').Router();
let mysql  = require('mysql');
//let fileUpload = require('express-fileupload');
var bodyParser = require('body-parser');
var urlencode = bodyParser.urlencoded({ extended: true});
var ExifImage = require('exif').ExifImage;
var path = require('path');
var axios = require('axios');


 var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '12345',
  database : 'maps',
  port : 3306
});

 connection.connect();

 //global.db = connection;


 var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "./public/image");
    },
    filename: function (req, file, callback) {
        callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    }
});

var upload = multer({ storage: storage }).single('avatar'); //Field name and max count

/* router.get("/uploadPage", function (req, res) {
    res.sendFile(__dirname + "/public/Upload.html");
}); */

/* function checkFileType(file, cb){
   // Allowed ext
   const filetypes = /jpeg|jpg|png/;
   // Check ext
   const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
   // Check mime
   const mimetype = filetypes.test(file.mimetype);

   if(mimetype && extname){
     return cb(null,true);
   } else {
     cb('Error: Images Only!');
   }
 } */



router.post("/api/avatar/Datatype/:type", function (req, res) {
  console.log(req);

  var type = req.params.type;
  console.log(type);

  var fileTypes = [
'image/jpeg',
'image/png'
]

 function validFileType(file) {
    for(var i = 0; i < fileTypes.length; i++) {
    if(file.type === fileTypes[i]) {
      return true;
    }
}

return false;
}
    upload(req, res, function (err) {
        if (err) {
            return res.end("Something went wrong!");
        }
        try {
            new ExifImage({ image : req.file.path }, function (error, exifData) {
                if (error)
                    console.log('Error: '+error.message);
                else
                // Calculate latitude decimal
                var latDegree = exifData.gps.GPSLatitude[0];
                var latMinute = exifData.gps.GPSLatitude[1];
                var latSecond = exifData.gps.GPSLatitude[2];
                var latDirection = exifData.gps.GPSLatitudeRef;

                var latFinal = ConvertDMSToDD(latDegree, latMinute, latSecond, latDirection);
                console.log(latFinal);

                // Calculate longitude decimal
                var lonDegree = exifData.gps.GPSLongitude[0];
                var lonMinute = exifData.gps.GPSLongitude[1];
                var lonSecond = exifData.gps.GPSLongitude[2];
                var lonDirection = exifData.gps.GPSLongitudeRef;

                var lonFinal = ConvertDMSToDD(lonDegree, lonMinute, lonSecond, lonDirection);
                console.log(lonFinal);
                //console.log(exifData.gps.GPSLatitude[0]);
                // let src = geocode();
                // console.log(src);
                axios.get('https://maps.googleapis.com/maps/api/geocode/json?latlng='+latFinal+','+lonFinal+'&sensor=true&key=AIzaSyD18DNJohlNtYCofN5AR12KaT4fbnMG5Wg')
                 .then(function (response) {

                   // handle success
                   var city = response.data.plus_code.compound_code;
                   //var sliced = city.substr((0,city.indexOf(' ')+1));
                   var sliced = city.slice((0,city.indexOf(' ')+1));
                   //var sliced1 = sliced.trim(' ');
                   let cityName = '';
                   for(var i =0; i< sliced.length; i++){
                     if(sliced.substring(i,i+1) == ','){
                       break;
                     }
                     cityName = cityName + sliced.substring(i,i+1);

                 }
                 //console.log(cityName);

                 let insertQuery = "INSERT INTO user_image(image, city, lon, lat, type) VAlUES (?,?,?,?,?)";
                 connection.query(insertQuery, [req.file.path, cityName, lonFinal, latFinal, type],function (err,rows){
                   //console.log(err);
                   console.log(rows);
                 })
               })


                 .catch((err)=> console.log(err))

            });
        } catch (error) {
            console.log('Error: ' + error.message);
        }
        res.redirect('/maps');

    })
});

function ConvertDMSToDD(degrees, minutes, seconds, direction) {

    var dd = degrees + (minutes/60) + (seconds/3600);

    if (direction == "S" || direction == "W") {
        dd = dd * -1;
    }

    return dd;
}
module.exports=router;
