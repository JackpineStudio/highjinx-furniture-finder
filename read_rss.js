/**
 * Read_rss.js
 */

var rss = require('./js-plugins/node-rss'),
	SaleObject = require('./SaleObject'),
	items = new Array(),
	feeds = ['http://ottawa.kijiji.ca/f-SearchAdRss?AdType=2&CatId=235&Location=1700184&PriceAlternative=3', 
	         'http://ottawa.en.craigslist.ca/fua/index.rss',
			 'http://www.usedottawa.com/index.rss?category=furniture'],
	count = 0;
	fs = require('fs');

var events = require('events'),
	util = require('util');
var eventEmitter = new events.EventEmitter();

var databaseHandler = require('./Database_functions');

var finishedLoading = false;

var count = 0;
var total = -1;

function loadFeed(feed, callback, increment, passedCount) {
	var response = rss.parseURL(feed, function(articles) {
		var count = 0;
		for(var i = 0; i < articles.length; i++){
			var article = articles[i];
			if(article.description.indexOf("<table") != -1){
				var desc = article.description;
				var fIndex = desc.indexOf("<img src="),
					lIndex = desc.indexOf("</center>");
				if(fIndex !== -1){
					article.image = desc.substring(fIndex + 10, lIndex - 2);
					fIndex = lIndex;
				}else{
					fIndex = desc.indexOf("</center>");
					article.image = "none";
				}
				lIndex = desc.length;
				desc = desc.substring(fIndex, lIndex);
				fIndex = desc.indexOf("<td>");
				lIndex = desc.indexOf("<a href=") === -1? desc.indexOf("<A HREF="): desc.indexOf("<a href=");
				desc = desc.substring(fIndex + 4, lIndex);
				article.description = desc;
			}else{
				article.image = "none";
			}
			var object = new SaleObject(article.title, article.link, article.description, article.image);
			count++;
			if (isFree(article.title)) {
				items.push(object);
				databaseHandler.insertSingleItemIntoDatabase(object);
			}
		}
	});
	/*if (databaseHandler != null) {
		databaseHandler.addUpdate();
	}*/
}

function isFree(title) {
	if (title.indexOf("$") != -1)
		return false;
	if (title.indexOf("WANTED") != -1)
		return false;
	return true;
}

function getImageLink(link) {
	var request = require('request');
	request.get(object.getLink(), function (error, response, body) {
		if(!error && response.statusCode == 200) {
			var cvs = body;
			var imgIndex = cvs.indexOf('<img class="view"');
			var subString = cvs.substr(imgIndex);
			var srcIndex = subString.indexOf('src="');
			var gettingSrc = false;
			var startIndex = -1;
			var length = 0;
			for (var i = srcIndex; i < subString.length; i++) {
				if(subString[i] == '"' && !gettingSrc) {
					gettingSrc = true;
					startIndex = i+1;
					continue;
				}
				if(subString[i] == '"' && gettingSrc) {
					gettingSrc = false;
					endIndex  = i+1;
					break;	
				}
				if (gettingSrc)
					length++;
			}	
			src = subString.substr(startIndex, length);
		}else {
			console.log("Error getting image");
		}
	});	
}

function loadFeeds(callback) {
	eventEmitter.on('doneArticles', function() {
		console.log("Calling done");
		console.log("Items length: " + items.length);
		total = total + items.length;
		databaseHandler.insertIntoDatabase(items);
		items = new Array();
	});
	
	var totalCount = -1;
	
	for (var i = 0; i < feeds.length; i++) {
		loadFeed(feeds[i], callback, false, totalCount);
	}
	
}

function emitEnd() {
	eventEmitter.emit('end');
}

function print(objects) {
	console.log("Loaded: " + objects.length + " items");
}

function generateHTML(objects, response) {
	var fileName = "./index.html";
	
	var str = "<!DOCTYPE HTML>\n"
				+"<html>\n"
				+	"<head>\n"
				+	'<link rel="stylesheet" type="text/css" href="style.css"/>'
				+	"<title>Furniture Finder</title>\n"
				+ "</head>"
				+ "<body>";
	for (var i = 0; i < objects.length; i++) {
		var obj = objects[i];
		var objStr = '<div class="item">\n' + "<h2>" + obj.getTitle() + "</h2>" + "<p>" + obj.getDescription() + "</p>" + '<a href="' + obj.getLink() + '">Link</a>' + "</div>\n";
		str = str + objStr;
	}
	var footer = "</body>\n</html>";
	str = str + footer;
	fs.writeFile(fileName, str, function(err) {
		if (err) {
			console.log(err);
		} else {
			console.log("Wrote to file")
		}
	});
	
}

function generateFile() {
	var objects = new Array();
	databaseHandler.getObjectsFromDatabase(objects, generateHTML);
}

function generateScript(response) {
	var objects = new Array();
	databaseHandler.getObjectsFromDatabaseWithResponse(objects, generateHTML, response);
}

var http = require('http');

var extensions = {".html" : "text/html", ".css" : "text/css" };

function onRequest(request, response) {
	var fileName = "index.html";
	fs.readFile(fileName, "binary", function(err, file) {
		response.writeHead(200);
		response.write(file, "binary");
		response.end();
	});
}

function writeToResponse(response, str) {
	response.write(str);
}

function checkCount(event, count, num) {
	if (count == num) {
		eventEmitter.emit(event);
	}
}

var fn = 2;
if (fn == 0)
	generateFile();
else if (fn == 1)
	http.createServer(onRequest).listen(8888);
else if (fn == 2) 
	databaseHandler.updateDatabase(loadFeeds);
else if (fn == 3) {
	databaseHandler.insertIntoDatabase(objects);
}else if (fn == 4) {
	preLoadFeeds();
}

