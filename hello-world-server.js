var http = require('http')
	, FeedParser = require('feedparser')
	, request('request')
	;

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(1337, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1337/');

request('http://ottawa.kijiji.ca/f-SearchAdRss?CatId=235&Location=1700184').on('error', function (error) {
	console.error(error);
	})
  .pipe(new FeedParser())
  .on('error', function (error) {
    console.error(error);
  })
  .on('meta', function (meta) {
    console.log('===== %s =====', meta.title);
  })
  .on('readable', function() {
    var stream = this, item;
    while (item = stream.read()) {
      console.log('Got article: %s', item.title || item.description);
    }
  });