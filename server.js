/**
 * New node file
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

