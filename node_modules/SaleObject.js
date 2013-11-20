/**
 * SaleObject.js
 */

function SaleObject(title, link, description, image) {
	this.title = title;
	this.link = link;
	this.description = description;
	this.image = image;
	
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

	this.toString = function() {
		return this.title + " \n" + this.link + " \n" + this.description + " \n" + this.image;// + " \n" + this.pubDate;
	};
	
	this.setTitle = function(title) {
		this.title = title;
	};
	
	this.setImage = function(src) {
		this.image = src;
	};
	
	this.setDescription = function(des) {
		this.description = des;
	};
}

module.exports = SaleObject;