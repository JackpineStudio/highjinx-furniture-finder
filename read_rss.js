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
		if(count >= 4){
			for (var a in articles){
				var article = articles[a];
				if(typeof(article) === 'object'){
					var object = new SaleObject(article.title, article.link, article.description, article.image, article.pubDate);
					items.push(object);
					console.log(article);
					console.log(typeof(article));
				}
			}
		}
		console.log("\n     ---- ==== <<< " + count + " >>>> ==== ----\n________________________________________\n");
	});
	console.log(number);
}

function loadFeedsIntoArray(items, feed_url) {
	
}

function saveToDatabase() {
	
}

for (var f in feeds){
	loadFeed(feeds[f]);
}