var express =   require("express");
var multer  =   require('multer');
//var app     =   express();
let router = require('express').Router();
let mysql  = require('mysql');
//let fileUpload = require('express-fileupload');
var bodyParser = require('body-parser');
var urlencode = bodyParser.urlencoded({ extended: true});
var ExifImage = require('exif').ExifImage;
//var path = require('path');
//var axios = require('axios');


 var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '12345',
  database : 'maps',
  port : 3306
 });

 connection.connect();

 router.get('/cityData/:name/typeData/:type', function(req,res) {
    let mapsImage = "SELECT * FROM user_image WHERE city = ? AND type = ?";
    connection.query(mapsImage, [req.params.name,req.params.type], function (err,rows){
      //console.log(rows);
      let data = {"dataCity" : {
          output: rows
      }}
      res.send(data);

    })
  });




  module.exports=router;
