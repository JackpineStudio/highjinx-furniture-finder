/**
 * server.js
 */

var http = require('http');
var fs = require('fs');
var connect = require('connect');
var path = require('path');
var readline = require('readline');
var readFeeds = require('./read_rss');

var dirName = "./";
var server;
var rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});



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
	console.log("Updating...");
	readFeeds.generateFiles();
	lastUpdated = new Date();
	console.log("Updated database");
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

function changeInterval() {
	rl.question("Enter an interval Days:Hours:Minutes: ", function(answer) {
		var numbers = answer.split(":");
		
		var days = numbers[0];
		var hours = numbers[1];
		var minutes = numbers[2];
		var newInterval = new Date("October " + days + " ,2013 " + hours + ":" + minutes + ":" + "00");
		setInterval(newInterval);
	});
	
}

//DD:HH:MM
function setInterval(newInterval) {
	updateInterval = newInterval;

	var days = updateInterval.getDate();
	var hours = updateInterval.getHours();
	var minutes = updateInterval.getMinutes()
	
	var dayString = " day";
	var hourString = " hour";
	var minuteString = " minute";

	if (days > 1 || days == 0)
		dayString += "s";
	if (hours > 1 || hours == 0)
		hourString += "s";
	if (minutes > 1 || minutes == 0)
		minuteString += "s";

	dayString += " ";
	hourString += " ";
	minuteString += " ";

	console.log("Database will update in "  + days + dayString +   + hours + hourString + minutes + minuteString);  
	showMenu();
}

function checkUpdate() {
	var now = new Date();
	
	var nowDay = now.getDate();
	var nowHours = now.getHours();
	var nowMinutes = now.getMinutes();

	var lastUpdatedDay = lastUpdated.getDate();
	var lastUpdatedHours = lastUpdated.getHours();
	var lastUpdatedMinutes = lastUpdated.getMinutes();

	var dayDiff = nowDay - lastUpdatedDay;
	var hourDiff = nowHours - lastUpdatedHours;
	var minuteDiff = nowMinutes - lastUpdatedMinutes;

	var decide = updateInterval.getHours();
	console.log(dayDiff + ":"  + hourDiff + ":" + minuteDiff);
	if (hourDiff == decide)
	{
		return true;
	} 
	return false;
}

function restartSystem() {
	console.log("Restarting system");
	server.close();
	startServer();
	showMenu();
}

function startServer() {
	update();
	console.log("Starting server");
	server = http.createServer(app).listen(8080);
}

function showMenu() {
	if(checkUpdate) {
		update();
	}
	console.log("Welcome to highjinx furniture finder server");
	console.log("Commands that can be entered");
	console.log("1. Manually Update Database");
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
				changeInterval();
				break;
			case 3:
				restartSystem();
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
startServer();
showMenu();

