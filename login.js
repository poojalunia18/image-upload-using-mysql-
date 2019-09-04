var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
//var uploadImage = require('./routes/uploadImage');
//let fileUpload = require('express-fileupload');
var http = require ('http');
//var busboy = require("then-busboy");
var app = express();
//const app = express();
//var Busboy = require('busboy');
//const busboy = require('connect-busboy');
//const busboyBodyParser = require('busboy-body-parser');
var upload = require('./routes/uploadImage');
var mapupload = require('./routes/maps');

var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '12345',
	database : 'maps',
  port     :  3306
});

connection.connect();
global.db = connection;

//console.log(upload)
//app.use(Upload);

// connection.query('SELECT * FROM user_auth WHERE username = "poojalunia" AND password = "pooja"', function(error, results, fields) {
//   if (results) {
//     console.log(results)
//     console.log('test');
//
//   } else {
//     console.log(error)
//   }
//   console.log("test3")
// });

var app = express();
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
//app.use(fileUpload());
app.use(upload);
app.use(mapupload);
//app.use(uploadImage);
//app.use(busboyBodyParser());

app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/public/login.html'));
});
app.get('/uploadPage', function(request, response) {
	response.sendFile(path.join(__dirname + '/public/Upload.html'));
});
app.get('/maps', function(request, response) {
	response.sendFile(path.join(__dirname + '/public/maps.html'));
});

app.post('/auth', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
  //console.log("asdasd");
	if (username && password) {
		connection.query('SELECT username, password FROM user_auth WHERE username = ? AND password = ?', [ username, password], function(error, results, fields) {
			if (results.length > 0) {
        //console.log('test');
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/uploadPage');
			} else {
				response.send('Incorrect Username and/or Password!');
			}
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.get('/home', function(request, response) {
	if (request.session.loggedin) {
		response.send('Welcome back, ' + request.session.username + '!');
	} else {
		response.send('Please login to view this page!');
	}
	response.end();
});

app.listen(3000, console.log("running on port 3000"));
