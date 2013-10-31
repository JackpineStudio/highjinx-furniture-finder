/**
 * server.js
 * 
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
//Port number that the server listens for requests
var port = 8080;
//Default interval is set to 12 hours. 
var updateInterval = new Date("October 1, 2013 12:00:00");
// lastUpdated is always changed when server starts.
// It will be set to the current date.
var lastUpdated = new Date("October 31, 2013 12:53:00");

/*
* TODO: Finish the implementation
* This function is reponsible for reading a config file for the server.
* This file will mostly contain important information for the execution of the server.
* The config file will contain database connection details and updateInterval
*/
function readFromConfigFile() {
	console.log("Reading from config file");
	try {
		var config = require('./server-config.json');
		console.log(JSON.parse(config));
	}catch (err) {
		console.log(err);
	} 
	
}

/* TODO:Finish the implementation
* This function will be responsible for changing the config file.
*/
function changeConfigFile() {

}

/*
* This function is called when the user requests to change the interval. The default is 12 hours.
* The user has to enter the new interval in DD:HH:MM format in which DD represents two digit days, HH represents hours and MM represents minutes.
*/
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

/*
* This function sets the interval to a new one.
* arguments: 
	- newInteval: Is a new dateObject
*/
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


/*
* This function looks at the time difference between lastUpdated and now.
* It will return true if the time difference is equal to the defined interval.
*/
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
	if (hourDiff == decide)
		return true;
	return false;
}

/*
* This function is for restarting the server;
*/
function restartSystem() {
	console.log("\nRestarting system");
	server.close();
	startServer();
}
/*
* This function starts the server.
* The server listens on the port 8080
* Port number can be changed at the begining of this code by modifying the port variable.
*/
function startServer() {
	lastUpdated = new Date();
	console.log("\nStarting server");
	server = http.createServer(app).listen(port);
	update();
}

/*
* This function displays the menu selections for executing certain commands.
*/
function showMenu() {
	if(checkUpdate()) {
		update();
	}
	console.log("\nWelcome to highjinx furniture finder server");
	console.log("Commands that can be entered");
	console.log("	1. Manually Update Database");
	console.log("	2. Set interval to update");
	console.log("	3. Restart the server");
	console.log("	4. Exit");
	console.log("What would you like to do ?");
	rl.question("Please enter a number: ", function(answer) {
		executeMenu(answer);
	});
}
/*
* Update function updates the database and generates a new html with the new entries added.
* So far it only calls the function to generate the html file.
*/
function update() {
	// Call update on read-rss.js
	console.log("Updating database and the html file");
	lastUpdated = new Date();
	//readFeeds.updateDatabase();
	readFeeds.generateFiles(showMenu);
}

/*
* This function calls the appropriate menu item. 
*/
function executeMenu(num) {
	if (isNaN(num)) {
		console.log("Please enter a number!");
		showMenu();
	}else {
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
			default:
				console.log("Invalid selection");
				showMenu();
				break;
		}
	}
}


/*
* This is where the server side is set up.
* The server serves the required html and css files.
* It can be modified to server any file type. 
*/
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

