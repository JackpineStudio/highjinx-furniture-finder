/**
 * Read_rss.js
 */

var rss = require('./js-plugins/node-rss');
var SaleObject = require('./SaleObject');
var items = new Array();
var feeds = ['http://ottawa.kijiji.ca/f-SearchAdRss?AdType=2&CatId=235&Location=1700184&PriceAlternative=3', 'http://ottawa.en.craigslist.ca/search/zip?query=furniture&format=rss'
		, 'http://www.usedottawa.com/index.rss?category=household'];

function loadFeed(feed) {
		var feed_url = feeds[x];
		var response = rss.parseURL(feed_url, function(articles) {
			for (var i = 0; i < articles.length; i++) {
				//var item = articles[i];
				//var object = new SaleObject(item.title, item.link, item.description, item.image, item.pubDate);
				//items[i] = object;
				console.log(articles[i]);
				console.log();
			}
		});
}

function loadFeedsIntoArray(items, feed_url) {
	
}

function saveToDatabase() {
	
}

for (var feed in feeds) {
	loadFeed(feed);
}