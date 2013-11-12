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
	events = require('events');
	eventEmitter = new events.EventEmitter();
	async = require('async');
var databaseHandler = require('./Database_functions');

var count = 0;
var total = -1;

var end = new Date('13 Apr 2012 13:30:00');

var _second = 1000;
var _minute = _second * 60;
var _hour = _minute * 60;
var _day = _hour *24;
var timer;
var distance = -3406;
var time = 50;

function showRemaining()
{
    var now = new Date();
    distance = end - now;
    console.log(time);
    if (time < 0 ) {
    	// handle expiry here..
       clearInterval( timer ); // stop the timer from continuing ..
       time = 3406;
       //alert('Expired'); // alert a message that the timer has expired..
    }
    time--;
    console.log(time);
 
}

/*
 * TODO: Fix the infinite loop problem
 * This function loads rss feeds from the feeds array.
 * Each rss item, if it is free creates a SaleObject.
 * The SaleObject(s) are then pushed into the items array.
 */
function loadFeed(feed, callback2) {
	rss.parseURL(feed, function(articles) {	
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
			
			if (isFree(article.title)) {
				items.push(object);
				databaseHandler.insertSingleItemIntoDatabase(object);
			}
		} 
	});
	
}


function insertFeeds(articles) {
	
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
	/*eventEmitter.on('doneArticles', function() {
		console.log("Calling done");
		console.log("Items length: " + items.length);
		total = total + items.length;
		databaseHandler.insertIntoDatabase(items);
		items = new Array();
	});
	*/
	/*for (var i = 0; i < feeds.length; i++) {
		loadFeed(feeds[i]);
	}*/
	items = new Array();
	for (var i = 0; i < feeds.length; i++) 
		loadFeed(feeds[i]);
	
}

function print(objects) {
	objects= items;
	console.log("Loaded: " + objects.length + " items");
}

function createHTML(str, objects, callback2) {
	var fileName = "./index.html";
	var count = -1;
	var size = objects.length;
	//size = 5;
	var initArray = '\n\t\t\t<div ng-init="saleObjects= [\n';
	for (var i = 0; i < size; i++) {
		var obj = objects[i];
		if ((obj.getTitle()).indexOf("\"") != -1) {
			while( (obj.getTitle()).indexOf("\"") != -1 ) {
			var arr = obj.getTitle().split("\"");
			var desc = "";
			for (var j = 0; j < arr.length; j++) 
				desc += arr[j];
			obj.setTitle(desc);
			}
		}
		if ((obj.getTitle()).indexOf("\'") != -1 ) {
			while( (obj.getTitle()).indexOf("\'") != -1 ) {
				var arr = obj.getTitle().split("\'");
				var desc = "";
				for (var j = 0; j < arr.length; j++) 
					desc += arr[j];
				obj.setTitle(desc);
			}
			
		}
		if ((obj.getDescription()).indexOf("\"") != -1) {
			while( (obj.getDescription()).indexOf("\"") != -1 ) {
				var arr = obj.getDescription().split("\"");
				var desc = "";
				for (var j = 0; j < arr.length; j++) 
					desc += arr[j];
				obj.setDescription(desc);
			}
		}
		if ((obj.getDescription()).indexOf("\'") != -1 ) {
			while( (obj.getDescription()).indexOf("\'") != -1 ) {
				var arr = obj.getDescription().split("\'");
				var desc = "";
				for (var j = 0; j < arr.length; j++) 
					desc += arr[j];
				obj.setDescription(desc);
			}
			
		}
		
		initArray += '\t\t\t\t{title:\'' + obj.getTitle() + '\',\n '
				   + '\t\t\t\tdescription:\'' + obj.getDescription()  + '\',\n '
				   + '\t\t\t\tlink:\'' +  obj.getLink() + '\'}';
		
		if(i != (size -1)) {
			initArray += ",\n";
		} else {
			initArray += ']">\n';
		}
		count--;
		if (count == 0) {
			objStr += "\t\t\t\t</div>\n";
			count = -1;
		}
		//str = str + objStr;
	}
	str = str + initArray ;
	var footer = "\n\t\t\t</div>\n" +
				 "\t\t</div>\n" +
				 "\t</body>\n"+
				 "</html>";
	str = str + footer;
	fs.writeFile(fileName, str, function(err) {
		if (err) {
			console.log(err);
		} else {
			console.log("Wrote to file " + fileName);
			// Call at the end of the function
			if (callback2)
				callback2();
		}
	});
}

function generateHTML(objects, callback2) {
	
	var str = "<!DOCTYPE HTML>\n"
				+ "<html>\n"
				+ "\t<head>\n"
				+ '\t\t<link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.0.1/css/bootstrap.min.css">\n'
				+ '\t\t<link rel="stylesheet" href="css/bootstrap.min.css">\n'
				+ '\t\t<link rel="stylesheet" href="css/bootstrap-theme.min.css">'
				+ '\t\t<link rel="stylesheet" href="css/main.css">'
				+ "\t\t<title>Furniture Finder</title>\n"
				+ "\t</head>\n"
				+ "\t<body>\n"
				+ '\t\t<div class="col-sm-12 col-md-12 title">\n'
				+ '\t\t\t<h2>Highjinx Furniture Finder</h2>\n'
				+ "\t\t</div>\n"
				+ '\t\t<div class="col-sm-12 col-md-12 title">\n'	
				+ '\t\t\t<input type="text"></input>'
				+ '\t\t</div>\n'
				+ '\t\t<div class="container">\n';
	
	fs.readFile('./sample.html', 'binary', function (err, data) {
		if (err) {
			console.log('Error reading sample.html', err);
			createHTML(str, objects, callback2);
		} else {
			createHTML(data, objects, callback2);
			
		}
	});
}
function generateFile() {
	var objects = new Array();
	databaseHandler.getObjectsFromDatabase(objects, generateHTML);
}
function generateFileWithCallback(callback2) {
	var objects = new Array();
	databaseHandler.getObjectsFromDatabase(objects, generateHTML, callback2);
}

function generateScript(response) {
	var objects = new Array();
	databaseHandler.getObjectsFromDatabaseWithResponse(objects, generateHTML, response);
}

function checkCount(event, count, num) {
	if (count == num) {
		eventEmitter.emit(event);
	}
}

exports.generateFiles = function(callback) {
	if (callback)
		generateFileWithCallback(callback);
	else 
		generateFile();
};

function updateDatabase(callback2) {
	databaseHandler.updateDatabase(loadFeeds, callback2);
}

exports.updateDatabase = function(callback2) {
	updateDatabase(callback2);
	
};
