/**
 * Database_functions.js
 * This module contains functions needed to access the database 
 */

var mysql = require('mysql');
SaleObject = require('./SaleObject');

var connectionDetails = {};
connectionDetails['host'] = "127.0.0.1";
connectionDetails['user'] = "user";
connectionDetails['password'] = "password";
connectionDetails['database'] = "highjinx-database";

connectionDetails['user'] = "root";
connectionDetails['password'] = "root";

var pool = null;
var connection = null;
function createPool() {
	if (pool == null) {
		pool = mysql.createPool({
			host : connectionDetails['host'],
			user : connectionDetails['user'],
			password : connectionDetails['password'],
			database : connectionDetails['database'],
		});
	}
	if (pool != null) 
		console.log("Created pool succesfully!");
}

/*
 * This function creates a new connection to the database.
 * Connection details are provided from the map connectionDetails
 */
function connectToDatabase() {
	console.log('Creating connection');
	connection = mysql.createConnection({
		host : connectionDetails['host'],
		user : connectionDetails['user'],
		password : connectionDetails['password'],
		database : connectionDetails['database'],
	});
	connection.connect(function (err){
		connection.on('err', function() {
			console.log('Cannot connect to the database');
		});
	});
}
/*
 * This function executes a query that gets the Count(*) from SaleObjects table
 */
function getCount() {
	if (connection == null)
		connectToDatabase();
	var sqlQuery = 'SELECT count(*) FROM SaleObjects';	
	var query = connection.query(sqlQuery);
	var count = 0;
	query
	.on('result', function(row) {
		count = row['count(*)'];
	})
	.on('end', function() {
		return count;
	});	
}
/*
 * This function checks whether the object is in the database or not
 * arguments:
 * 	object - SaleObject
 */
function exists(object) {
	if (connection == null)
		connectToDatabase();
	
	var sqlQuery = 'SELECT count(*) FROM SaleObjects WHERE link = ?';	
	var query = connection.query(sqlQuery, [object.link]);
	var count = -1;
	query
	.on('result', function(row){
		count = row['count(*)'];
	})
	.on('end', function() {
		console.log("Count is " + count);
		if (count != 0)
			exists =  true;
		exists =  false;
	});	
}

var events = require('events'),
	util = require('util');
var eventEmitter = new events.EventEmitter();

/*
 * This function executes the query to insert a single SaleObject into the database.
 * If the item doesn't exists in the database, assuming links are unique, it is inserted.
 * arguments:
 * 	object - SaleObject needed to be inserted
 * 	callback - Function to be called when insertion query is done execution
 *	count2 -  
 *	num - 
 */
exports.insertSingleItemIntoDatabase = function(object) {
	if (connection == null) {
		connectToDatabase();
	}
	if (object != null) {
		var sqlQuery = 'SELECT count(*) FROM SaleObjects WHERE link = ?';	
		var query = connection.query(sqlQuery, [object.link]);
		var count = -1;
		query
		.on('result', function(row){
			count = row['count(*)'];
		})
		.on('end', function() {
			if (count == 0) {
				var sqlQuery = "INSERT into SaleObjects (title, link, description, imageLink) values(?, ?, ?, ?)";
				var query = connection.query(sqlQuery, [object.getTitle(), object.getLink(), object.getDescription(), object.getImage()]);
				query.on('end' ,function() {
					console.log("Succesfully inserted item into the database");
				});	
			}else {
				console.log("This item exists in the database");	
			}
		});	
	};
};

/*
 * This function inserts SaleObjects from objects array into the database;
 * arguments:
 *	 objects - Array of SaleObjects
 */
exports.insertIntoDatabase = function(objects) {
	if (connection == null)
		connectToDatabase();
	var count = 0;	
	if (objects != null) {
		for (var i = 0; i < objects.length; i++) {
			var object = objects[i];
			exports.insertSingleItemIntoDatabase(object, checkCount, count, objects.length);
		}
	}
};

function checkCount(event, count, num) {
	if (count == num) {
		eventEmitter.emit(event);
	}
}

/*
 * This function is for retrieving items from the database and load it into the passed objects array.
 */
exports.getObjectsFromDatabase = function(objects, callback) {
	if (connection == null)
		connectToDatabase();
	var sqlQuery = 'SELECT * FROM SaleObjects ORDER BY dateAdded DESC';	
	var query = connection.query(sqlQuery);
	query
	.on('result', function(row){
		var object = new SaleObject(row['title'], row['link'], row['description'], row['imageLink']);
		objects.push(object);
	})
	.on('end', function() {
		console.log("At the end objects contain " + objects.length);
		connection.end();
		callback(objects);
	});	
};

exports.getObjectsFromDatabaseWithResponse = function(objects, callback, response) {
	if (connection == null)
		connectToDatabase();
	var sqlQuery = 'SELECT * FROM SaleObjects ORDER BY dateAdded DESC';	
	var query = connection.query(sqlQuery);
	query
	.on('result', function(row){
		var object = new SaleObject(row['title'], row['link'], row['description'], row['imageLink']);
		objects.push(object);
	})
	.on('end', function() {
		console.log("At the end objects contain " + objects.length);
		connection.end();
		callback(objects, response);
	});	
};

/*
 * This function is for updating the database. Given the interval (24).
 * The items that were added more than the given interval, are deleted.
 */
exports.updateDatabase = function(callback, parameter) {
	if (connection == null)
		connectToDatabase();
	var count = -1;
	var sqlQuery = 'SELECT count(*) FROM SaleObjects WHERE dateAdded < DATE_SUB(NOW(), INTERVAL 24 HOUR)';
	var query = connection.query(sqlQuery);
	query
	.on('result', function(row) {
		count = row['count(*)'];
	})
	.on ('end', function() {
		if (count != 0)
			deleteOldEntries(callback);
		else {
			console.log('No need to delete');
			callback(parameter);
		}
	});
};
/*
 * This function updates the Updates table based on the items added in the last 10 minutes;
 */
exports.addUpdate = function (){
	if (connection == null)
		connectToDatabase();
	var count = -1;
	
	var sqlQuery = "SELECT count(*) as totalCount FROM"
				+ "("
				+ "SELECT TIMEDIFF(CURRENT_TIMESTAMP(), dateAdded) AS timeDifference FROM SaleObjects HAVING timeDifference < '00:10:00'"
				+ ") AS table1";
	
	var query = connection.query(sqlQuery);
	query
	.on('result', function(row) {
		count = row['totalCount'];
	})
	.on ('end', function() {
		if (count != 0) {
			var sqlQuery = "INSERT INTO Updates (dateUpdated, itemsAdded)" 
						+ 	"(SELECT CURRENT_TIMESTAMP(), count(*) FROM "
						+ 	"("
						+ 		"SELECT TIMEDIFF(CURRENT_TIMESTAMP(), dateAdded) AS timeDifference FROM SaleObjects HAVING timeDifference < '00:10:00'"
						+ 	") 	AS table1"
						+	")";
			var query = connection.query(sqlQuery);
			query
			.on ('end', function() {
				console.log('Added update');
			});
		} else if (count == 0) {
			console.log('No updates');
		}
	});
};

/*
 * This function is for deleting entries from the database that were added more than the given interval hours ago.
 */
function deleteOldEntries(callback) {
	if (connection == null)
		connectToDatabase();
	var sqlQuery = 'DELETE FROM SaleObjects WHERE dateAdded < DATE_SUB(NOW(), INTERVAL 24 HOUR);';
	var query = connection.query(sqlQuery);
	query
	.on('end', function() {
		console.log("Done deleting from database");
		callback();
	});
};

function closeConnection() {
	console.log("Closing connection");
	if (connection != null) {
		connection.end();
		//connection = null;
	}
}

exports.closeConnection = function() {
	closeConnection
};

