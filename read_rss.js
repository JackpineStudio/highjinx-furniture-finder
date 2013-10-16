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

var databaseHandler = require('./Database_functions');
function loadFeed(feed) {
	var response = rss.parseURL(feed, function(articles) {
		count++;
		//console.log("\n________________________________________\n     ---- ==== <<< " + count + " >>>> ==== ----\n");
		for(var a = 0; a < articles.length; a++){
			var article = articles[a];
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
				//article.image = "none";
			}
			var object = new SaleObject(article.title, article.link, article.description, article.image);
			
			if (object.getImage() == null && object.getLink().indexOf("kijiji") != -1) {
				getImageLink(object.getLink());
			}
			items.push(object);
			//console.log(object.toString());
			//console.log("\n");
			//if (isFree(article.title))
			//	databaseHandler.insertSingleItemIntoDatabase(object);
		}
		//console.log("\n     ---- ==== <<< " + count + " >>>> ==== ----\n________________________________________\n");
		
	});
	
}

function loadFeedsIntoArray(items, feed_url) {
	
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

for (var f = 0; f < feeds.length; f++){
	loadFeed(feeds[f]);
}

databaseHandler.endConnection();

//getImageLink('http://ottawa.kijiji.ca/c-buy-and-sell-furniture-chairs-recliners-Free-Chairs-W0QQAdIdZ533887290');
