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

/*
 * This function loads rss feeds from the feeds array.
 * Each rss item, if it is free creates a SaleObject.
 * The SaleObject(s) are then pushed into the items array.
 */
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

/*
 * This function checks whether the item is free or not according to presence of a dollar sign.
 * Also filters the WANTED items. 
 */
function isFree(title) {
	if (title.indexOf("$") != -1)
		return false;
	if (title.indexOf("WANTED") != -1)
		return false;
	return true;
}

/*
 * This function is for getting the image source by creating a get request with the link provided.
 * It first Kijiji's source's code. Not tested for other websites
 */

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
				+ "<html>\n"
				+ "	<head>\n"
				+ '		<link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.0.1/css/bootstrap.min.css">\n'
				+ '		<link rel="stylesheet" href="css/bootstrap.min.css">\n'
				+ '		<link rel="stylesheet" href="css/bootstrap-theme.min.css">'
				+ '		<link rel="stylesheet" href="css/main.css">'
				+ "		<title>Furniture Finder</title>\n"
				+ "	</head>\n"
				+ "	<body>\n"
				+ '		<div class="col-sm-12 col-md-12">\n'
				+ "			<h2>Highjinx Furniture Finder</h2>\n"
				+ "		</div>\n";
	for (var i = 0; i < objects.length; i++) {
		var obj = objects[i];
		var objStr =  '		<div class="col-sm-12 col-md-12 item">\n' 
					+ "			<h3>" + obj.getTitle() + "</h3>\n" 
					+ "			<p>" + obj.getDescription() + "</p>\n" 
					+ '			<a href="' + obj.getLink() + '">Link</a>\n' 
					+ "		</div>\n";
		str = str + objStr;
	}
	var footer = "	</body>\n"+
				"</html>";
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

exports.generateFiles = function() {
	generateFile();
}

var fn = 0;
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

