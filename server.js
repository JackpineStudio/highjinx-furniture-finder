/**
 * server.js
 */

var http = require('http');
var fs = require('fs');
//var readFeeds = require('./read_rss');

var updateInterval = new Date("October 1, 2013 12:00:00");
var lastUpdated = new Date("October 31, 2013 12:53:00");

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


function update() {
	// Call update on read-rss.js
	// set lastUpdated
	lastUpdated = new Date();
	console.log("Updating...");
}

function readFromConfigFile() {
	console.log("Reading from config file");
	try {
		var config = require('./server-config.json');
		console.log(JSON.parse(config));
	}catch (err) {
		console.log(err);
	} 
	
}

function changeConfigFile() {

}

function setInterval() {

}

function checkUpdate() {
	var now = new Date();
	var now2 = new Date();
	//now.setHours(15);
	
	var nowDay = now.getDate();
	var nowHours = now.getHours();
	var nowMinutes = now.getMinutes();

	var lastUpdatedDay = lastUpdated.getDate();
	var lastUpdatedHours = lastUpdated.getHours();
	var lastUpdatedMinutes = lastUpdated.getMinutes();

	var dayDiff = nowDay - lastUpdatedDay;
	var hourDiff = nowHours - lastUpdatedHours;
	var minuteDiff = nowMinutes - lastUpdatedMinutes;

	var decide = updateInterval.getMinutes();
	console.log(dayDiff + ":"  + hourDiff + ":" + minuteDiff);
	if (minuteDiff == decide)
	{
		console.log("Time to update");
		process.exit(code=0);
	} 
	
}

function showMenu() {
	console.log("Welcome to highjinx furniture finder server");
	console.log("Commands that can be entered");
	console.log("1. Manual Update Database");
	console.log("2. Set interval to update");
	console.log("3. Restart the server");
	console.log("4. Exit");
	rl.question("What would you like to do ? ", function(answer) {
		executeMenu(answer);
	});
}

function executeMenu(num) {
	if (isNaN(num))
		console.log("Please enter a number!");
	else {
		var number = parseInt(num);
		switch(number) {
			case 1: 
				update();
				break;
			case 2:
				readFromConfigFile();
				break;
			case 4: 
				running = false;
				process.exit(code=0);
				break;
			case 5:
				checkUpdate();
				break;
		}
	}
}

var dirName = "./";

//readFeeds.generateFiles();

var connect = require('connect');

var path = require('path');
var readline = require('readline');

var rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

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
var running = true;
showMenu();

