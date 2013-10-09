#highjinx
##free furniture finder
###Problem
Highjinx needs an internal app for finding free furniture postings on the internet. It needs to be easy to use and relevant. The postings have be good quality and not too far from Ottawa.
###Solution
- Create an app that scrapes free furniture postings from:
[Kijiji Ottawa and closeby regions](http://ottawa.kijiji.ca/)
, [Craigslist Ottawa and closeby regions](http://ottawa.en.craigslist.ca/), [Used Ottawa](http://www.usedottawa.com/)
- Scrape the RSS feeds from these websites
- Create an email notifier for new findings. 
- Create an interface for easy access to the history of findings.
- Information Filter
- For the application to work we need a good list of furniture type words to search for. 
- Below there is a link from Wikipedia that includes all furniture types. http://en.wikipedia.org/wiki/List_of_furniture_types

###Technology
This project needs both front and backend development. The scraped information will need to be stored in a database.

- Suggested technology for backend development and integration
  - node.js 
  - ruby on rails
  - php
- Suggested solution for database platform
  - mySQL
  - mongoDB
  - Suggested solution for frontend development 
  - Bootstrap & jQuery

###UX Design
The user has minimal input in the application as the it will be almost completely automatic. The interface will also just be a list of all furniture found listed by date.
###UI Design
The UI design will mostly concentrate on good typography that will be easy to read.



### Tools

Created with [Nodeclipse v0.5](https://github.com/Nodeclipse/nodeclipse-1)
 ([Eclipse Marketplace](http://marketplace.eclipse.org/content/nodeclipse), [site](http://www.nodeclipse.org))   
