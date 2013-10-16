/**
 * Read_rss.js
 */

var rss = require('./js-plugins/node-rss'),
	SaleObject = require('./SaleObject'),
	items = new Array(),
	feeds = ['http://ottawa.kijiji.ca/f-SearchAdRss?AdType=2&CatId=235&Location=1700184&PriceAlternative=3', 'http://ottawa.en.craigslist.ca/fua/index.rss'
			, 'http://www.usedottawa.com/index.rss?category=furniture'],
	count = 0, number = 0;

function loadFeed(feed) {
	number++;
	var response = rss.parseURL(feed, function(articles) {
		count++;
		console.log("\n________________________________________\n     ---- ==== <<< " + count + " >>>> ==== ----\n");
		console.log(feed);
		//if(JSON.stringify(articles[0]).indexOf("[ title:") !== -1){
			for (var a in articles){
				var article = articles[a];
				if(typeof(article) === 'object'){
//					if(article.description.indexOf("<table") != -1){
//						var desc = article.description;
//						var fIndex = desc.indexOf("<img src="),
//							lIndex = desc.indexOf("</center>");
//						if(fIndex !== -1){
//							article.image = desc.substring(fIndex + 11, lIndex - 3);
//							fIndex = lIndex;
//						}else{
//							fIndex = desc.indexOf("</center>");
//							article.image = "none";
//						}
//						lIndex = desc.length;
//						desc = desc.substring(fIndex, lIndex);
//						fIndex = desc.indexOf("<td>");
//						lIndex = desc.indexOf("<a href=") === -1? desc.indexOf("<A HREF="): desc.indexOf("<a href=");
//						desc = desc.substring(fIndex + 4, lIndex);
//						article.description = desc;
//					}else{
//						article.image = "none";
//					}
//					var object = new SaleObject(article.title, article.link, article.description, article.image);
//					items.push(object);
//					console.log(object.toString());
					console.log(article);
					console.log("\n");
				}
			}
		//}
		console.log("\n     ---- ==== <<< " + count + " >>>> ==== ----\n________________________________________\n");
	});
	console.log(number);
}

function loadFeedsIntoArray(items, feed_url) {
	
}

function saveToDatabase() {
	
}

//for (var f in feeds){
	loadFeed(feeds[2]);
//}