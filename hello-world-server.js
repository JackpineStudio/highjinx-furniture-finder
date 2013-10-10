var FeedParser = require('feedparser')
	, request = require('request');

request('http://ottawa.kijiji.ca/f-SearchAdRss?CatId=235&Location=1700184')
  .pipe(new FeedParser())
  .on('error', function (error) {
    console.error(error);
  })
  .on('meta', function (meta) {
    console.log('===== %s =====', meta.title);
  })
  .on('readable', function() {
    var stream = this, item;
    while (item == stream.read()) {
      console.log('Got article: %s', item.title || item.description);
    }
  });