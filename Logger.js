/**
 * Logger.js
 */
var logFile = null;

function log(messageType, message) {
	var type = "";
	if (messageType == 0)
		type = "[INFO]";
	else 
		type = "[WARNING]";
	var now = new Date();
	var timeString = now.toLocaleDateString() + " " + now.getHours()  + ":" + now.getMinutes() + ":"
				   + now.getSeconds() + ":" +  now.getMilliseconds();
	//Tue Nov 05 2013 10:31:18 GMT-0500 (EST):45
	console.log(timeString, type, message);
	
}

exports.log = function(messageType, message) {
	if(!logFile)
		log(messageType, message);
};

function setLogFile(fileName) {
	logFile = fileName;
}

exports.setLogFile = function(fileName) {
	setLogFile(fileName);
};