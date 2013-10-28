/**
 * server.js
 */

var http = require('http');
var readFeeds = require('./read_rss');

function onRequest(request, response) {
	var fileName = "index.html";
	var cssFileName = "style.css";
	fs.readFile(fileName, "binary", function(err, file) {
		response.writeHead(200);
		response.write(file, "binary");
		response.end();
	});
	fs.readFile(cssFileName, "binary", function(err, file) {
		response.writeHead(200);
		response.write(cssFileName, "binary");
		response.end();
	});
}

function writeToResponse(response, str) {
	response.write(str);
}


var dirName = "./";

//readFeeds.generateFiles();

var connect = require('connect');

var path = require('path');

var app  = connect()
	.use(connect.static(dirName + "index.html"))
	.use(function(request, response) { 
		
		var filePath = '.' + request.url;
		if (filePath == './')
			filePath = './index.html';
		
		var extname = path.extname(filePath);
		var contentType = 'text/html';
		switch (extname) {
				case '.css':
					contentType = 'text/css';
					break;
		}
		
		fs.exists(filePath, function(exists) {
			if (exists) {
				fs.readFile(filePath, function(error, content) {
					if (error) {
						response.writeHead(500);
						response.end();
					} else {
						response.writeHead(200, {'Content-Type' : contentType});
						response.end(content, 'utf-8');
					}
				});
			} else {
				response.writeHead(404);
				response.end();
			}
		});		
	});
http.createServer(app).listen(8080);