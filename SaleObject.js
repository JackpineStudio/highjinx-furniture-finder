/**
 * SaleObject.js
 */

var title;
var link;
var description;
var image;
var pubDate;

function SaleObject(title, link, description, image, pubDate) {
	this.title = title;
	this.link = link;
	this.description = description;
	this.image = image;
	this.pubDate = pubDate;
	
	this.getTitle = function() {
		return this.title;
	};
	
	this.getLink = function() {
		return this.link;
	};
	
	this.getDescription = function() {
		return this.description;
	};

	this.getImage = function() {
		return this.image;
	};

	this.getPubDate = function() {
		return this.pubDate;
	};

	this.toString = function() {
		return this.title + " \n" + this.link + " \n" + this.description + " \n" + this.image + " \n" + this.pubDate;
	};
}

module.exports = SaleObject;