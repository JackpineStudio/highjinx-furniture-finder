/**
 * Read_rss.js
 */

var rss = require('./js-plugins/node-rss'),
	SaleObject = require('./SaleObject'),
	fs = require('fs'),
	databaseHandler = require('./Database_functions');
	Logger = require('./Logger.js');
	items = new Array(),
	feeds = ['http://ottawa.kijiji.ca/f-SearchAdRss?AdType=2&CatId=235&Location=1700184&PriceAlternative=3', 
	         'http://ottawa.en.craigslist.ca/fua/index.rss',
			 'http://www.usedottawa.com/index.rss?category=furniture'],
	count = 0;
	
var count = 0;
var total = -1;
var databaseHandler;
var showMenuCallback = null;
/*
 * This function loads rss feeds from the feeds array.
 * Each rss item, if it is free creates a SaleObject.
 * The SaleObject(s) are then pushed into the items array.
 */
function loadFeed(feed, callback2) {
	rss.parseURL(feed, function(articles) {	
		for(var i = 0; i < (articles.length + 1); i++){
			if (i == articles.length) {
				getAll();
				continue;
			}
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
			
			var object = new SaleObject(article.title, article.link, article.description, article.image);
			
			if (isFree(article.title)) {
				items.push(object);
				databaseHandler.insertSingleItemIntoDatabase(object);
			}
			
		}else {
			console.log("Error getting image");
		}
	});	
}

function getAll() {
	var size = 14;
	for (var i = 0; i < size; i++) {
		try {
			getMore(i);
		} catch (e) {
			//maybe try after a while
			console.log(e);
			break;
		}
	}
}

function getMore(pageNum) {
	var link = 'http://ottawa.kijiji.ca/f-buy-and-sell-furniture-W0QQAdTypeZ2QQCatIdZ235QQPageZ';
	//var pageNum = 1;
	var end = 'QQPriceAlternativeZ3';
	var request = require('request');
	link = link + pageNum + end;
	var numOfPages = -1;
	request.get(link, function (error, response, body) {
		var htmlparser = require('htmlparser2');
		if(!error && response.statusCode == 200) {
			var cvs = body;
			var tagOpen = false;
			var gettingCount = false;
			var objectDetails = {};
			objectDetails['title'] = "notSet";
			objectDetails['link'] = "notSet";
			objectDetails['description'] = "notSet";
			objectDetails['image'] = " ";
			var row = 0;
			var resultRow = "resultRow" + row;
			var item = 0;
			var parser = new htmlparser.Parser({
				onopentag: function(name, attribs) {
					if (row == 20) {
						return;
					}
					if(name == "tr" && attribs.id == resultRow) {
						tagOpen = true;
						item = 0;
					} 
					if (name =="a" && tagOpen) {
						objectDetails['link'] = attribs.href;
					}
					
					if(name == "img" && tagOpen) {
						objectDetails['image'] = attribs.src;
						
					}
					if (name == "span" && attribs.class == "titlecount") {
						gettingCount = true;
					}
				},
				ontext: function(text) {
					if(tagOpen) {
						item++;
						var arr = text.split("\r\n");	
						if(text.search("/^[a-zA-z]+$/") === -1) {
							if(item == 11) {
								if(text != "\r\n")
									objectDetails['title'] = text;
							} else if(item == 13) {
								if(objectDetails['title'] == "notSet")
									objectDetails['title'] = text;
								else 
									objectDetails['description'] = text;
							} else if (item == 15) {
								if(arr[1].indexOf("\r\n") == -1) {
									if(objectDetails['description'] == "notSet") {
										objectDetails['description'] = text;
									}
								}	
							}
						}
					}
					if (gettingCount ) {
						var startIndex = text.indexOf("(");
						var endIndex = text.indexOf(")");
						if((startIndex != -1 ) && (endIndex != -1)) {
							var count = text.substr(startIndex+1, (endIndex-1));
							count = parseInt(count);
							numOfPages  = Math.ceil((count / 20)) ;
							gettingCount = false;
						}
					}
				},
				onclosetag :function(tagname) {
					if(tagname == "tr" && tagOpen) {
						tagOpen = false;
						item = 0;
						var object = new SaleObject(objectDetails['title'], objectDetails['link'], objectDetails['description'], objectDetails['image']);
						databaseHandler.insertSingleItemIntoDatabase(object);
						row++;
						resultRow = "resultRow" + row;		
						objectDetails['title'] = "notSet";
						objectDetails['link'] = "notSet";
						objectDetails['description'] = "notSet";
						objectDetails['image'] = " ";
					} 
				}
			});
			parser.write(cvs);
			parser.end();
		
		}
	});
}

function loadFeeds(callback) {
	var interval = 10 * 1000;
	var intervalFn = setInterval(function(){
		generateFile();
		clearInterval(intervalFn);
			if(callback) {
			intervalFn = setInterval(function() {
				if(showMenuCallback) {
					console.log("\nDone\n");
					showMenuCallback();
				}
				clearInterval(intervalFn);
			}, interval);
		}
	}, interval);
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
		var title = obj.getTitle().replace(/[\|&;\$%@"<>\(\)\+,]/g, "");
		var description = obj.getDescription().replace(/[\|&;\$%@"<>\(\)\+,]/g, "");
		obj.setTitle(title);
		obj.setDescription(description);
		initArray += '\t\t\t\t{title:\'' + obj.getTitle() + '\',\n '
				   + '\t\t\t\tdescription:\'' + obj.getDescription()  + '\',\n '
				   + '\t\t\t\imageLink:\'' + obj.getImage()  + '\',\n '
				   + '\t\t\t\tlink:\'' +  obj.getLink() + '\'}';
		
		if(i != (size -1)) {
			initArray += ",\n";
		} 
		count--;
		if (count == 0) {
			objStr += "\t\t\t\t</div>\n";
			count = -1;
		}
	}
	str = str + initArray ;
	var footer = ']">\n' +
				 "\n\t\t\t</div>\n" +
				 "\t\t</div>\n" +
				 "\t</body>\n"+
				 "</html>";
	str = str + footer;
	fs.writeFile(fileName, str, function(err) {
		if (err) {
			Logger.log(1, err);
		} else {
			Logger.log(0, "Wrote to file " + fileName);
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
			Logger.log(1, 'Error reading sample.html', err);
			createHTML(str, objects, callback2);
		} else {
			createHTML(data, objects, callback2);
			
		}
	});	
}
function generateFile() {
	var interval = 2 * 1000;
	var intervalFn = setInterval(function(){
		if(showMenuCallback)
			showMenuCallback();
		clearInterval(intervalFn);
	}, interval);
	var objects = new Array();
	databaseHandler.getObjectsFromDatabase(objects, generateHTML);
}
function generateFileWithCallback(callback, calback2) {
	var objects = new Array();
	callback2();
	databaseHandler.getObjectsFromDatabase(objects, generateHTML, callback);
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

exports.generateFiles = function(callback, callback2) {
	if (callback)
		generateFileWithCallback(callback, callback2);
	else 
		generateFile();
};


function updateDatabase(callback2, callback3) {
	databaseHandler.updateDatabase(callback2, callback3);
}


exports.updateDatabase = function(callback2, callback3, callback4) {
	showMenuCallback = callback4;
	updateDatabase(loadFeeds, callback3);
};

exports.setDatabaseHandler = function(handler) {
	databaseHandler = handler;
};

