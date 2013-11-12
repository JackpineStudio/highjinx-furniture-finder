/**
 * Database_functions.js
 * This module contains functions needed to access the database 
 */

var mysql = require('mysql');
SaleObject = require('./SaleObject');
var connectionDetails = {};

connectionDetails['host'] = "127.0.0.1";
connectionDetails['user'] = "root";
connectionDetails['password'] = "password";
connectionDetails['database'] = "highjinx-database";

var pool = null;
var connection = null;
var connectionMade = false;

exports.setConnectionDetails = function(settings) {
	setConnectionDetails(settings);
	log(0, 'New connection details ' + settings);
};

function setConnectionDetails(settings) {
	connectionDetails = settings;
}

function createPool() {
	log(0, "Creating pool");
	if (pool == null) {
		pool = mysql.createPool({
			host : connectionDetails['host'],
			user : connectionDetails['user'],
			password : connectionDetails['password'],
			database : connectionDetails['database']
		});
		pool.on('connection', function(connection){
			//log(0, "Created pool succesfully!");
		});
	}

		
}

/*
 * This function creates a new connection to the database.
 * Connection details are provided from the map connectionDetails
 */
function connectToDatabase() {
	log(0, 'Creating connection to the databsase');
	connection = mysql.createConnection({
		host : connectionDetails['host'],
		user : connectionDetails['user'],
		password : connectionDetails['password'],
		database : connectionDetails['database']
	});
	connection.connect(function (err){
		connection.on('err', function() {
			log(-1,'Cannot connect to the database');
		});
		connectionMade = true;
		connection.setMaxListeners(200);
	});
}
/*
 * This function executes a query that gets the Count(*) from SaleObjects table
 */
function getCount() {
	if (connection == null)
		connectToDatabase();
	connectToDatabase();
	log(0, 'Getting count from the database');
	var sqlQuery = 'SELECT count(*) FROM SaleObjects';	
	var query = connection.query(sqlQuery);
	log(0, "Executing query '" + query.sql + "'");
	var count = 0;
	query
	.on('result', function(row) {
		count = row['count(*)'];
	})
	.on('end', function() {
		console.log(count);
		closeConnection();
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
	connectToDatabase();
	var sqlQuery = 'SELECT count(*) FROM SaleObjects WHERE link = ?';
	var query = connection.query(sqlQuery, [object.link]);
	log(0, "Executing query '" + query.sql + "'");
	var count = -1;
	query
	.on('result', function(row){
		count = row['count(*)'];
	})
	.on('end', function() {
		if (count != 0)
			exists =  true;
		exists =  false;
		closeConnection();
	});	
}

/*
 * This function executes the query to insert a single SaleObject into the database.
 * If the item doesn't exists in the database, assuming links are unique, it is inserted.
 * arguments:
 * 	object - SaleObject needed to be inserted
 * 	callback - Function to be called when insertion query is done execution
 *	count2 -  
 *	num - 
 */
function insertSingleItemIntoDatabase(object, connection) {
	if (object != null) {
		var sqlQuery = 'SELECT count(*) FROM SaleObjects WHERE link = ?';
		var query = connection.query(sqlQuery, [object.link]);
		log(0, "Executing query '" + query.sql + "'");
		var count = -1;
		query
		.on('result', function(row){
			count = row['count(*)'];	
		})
		.on('end', function() {
			if (count == 0) {
				var sqlQuery = "INSERT into SaleObjects (title, link, description, imageLink, dateAdded) values(?, ?, ?, ?, NOW())";
				var query = connection.query(sqlQuery, [object.getTitle(), object.getLink(), object.getDescription(), object.getImage()]);
				log(0, "Executing query '" + query.sql + "'");
				query.on('end' ,function() {
					log(0, "Succesfully inserted item into the database");	
				});
			}else {
				log(0, "This item exists in the database " + count);	
			}
			connection.end();
		});
	}
}


exports.insertSingleItemIntoDatabase = function(object) {
	connectToDatabase();
	insertSingleItemIntoDatabase(object, connection);
};

/*
 * This function inserts SaleObjects from objects array into the database;
 * arguments:
 *	 objects - Array of SaleObjects
 */
function insertIntoDatabase(objects) {
//	if (connection == null)
		connectToDatabase();
		for (var i = 0; i < objects.length; i++) {
			var object = objects[i];
			insertSingleItemIntoDatabase(object, connection);
		}
		connection.end();	
}

exports.insertIntoDatabase = function(objects) {
	insertIntoDatabase(objects);
};

/*
 * This function is for retrieving items from the database and load it into the passed objects array.
 */
function getObjectsFromDatabase(objects, callback, callback2) {
	if (connection == null)
		connectToDatabase();
	connectToDatabase();
	var sqlQuery = 'SELECT * FROM SaleObjects ORDER BY dateAdded DESC';	
	var query = connection.query(sqlQuery);
	log(0, "Executing query '" + query.sql + "'");
	query
	.on('result', function(row){
		var object = new SaleObject(row['title'], row['link'], row['description'], row['imageLink']);
		objects.push(object);
	})
	.on('end', function() {
		if (objects.length != -1)
			log(0, "Retrieved " + objects.length + " objects from the database");
		else 
			log(-1, "Error retrieving");
		closeConnection();
		if (callback2)
			callback(objects, callback2);
		else 
			callback(objects);
	});	
}

exports.getObjectsFromDatabase = function(objects, callback, callback2) {
	getObjectsFromDatabase(objects, callback, callback2);
};

function getObjectsFromDatabaseWithResponse(objects, callback, response) {
	if (connection == null)
		connectToDatabase();
	connectToDatabase();
	var sqlQuery = 'SELECT * FROM SaleObjects ORDER BY dateAdded DESC';	
	var query = connection.query(sqlQuery);
	log(0, "Executing query '" + query.sql + "'");
	query
	.on('result', function(row){
		var object = new SaleObject(row['title'], row['link'], row['description'], row['imageLink']);
		objects.push(object);
	})
	.on('end', function() {
		if (objects.length != -1)
			log(0, "Retrieved " + objects.length + "objects from the database");
		else 
			log(-1, "Error retrieving");
		closeConnection();
		callback(objects, response);
	});
}

exports.getObjectsFromDatabaseWithResponse = function(objects, callback, response) {
	getObjectsFromDatabaseWithResponse(objects, callback, response);
};

/*
 * This function is for updating the database. Given the interval (24).
 * The items that were added more than the given interval, are deleted.
 */
function updateDatabase(callback, callback2) {
	var count = -1;
	
	log(0, "Updating database");
	var sqlQuery = 'SELECT count(*) FROM SaleObjects WHERE dateAdded < DATE_SUB(NOW(), INTERVAL 24 HOUR)';
	var query = connection.query(sqlQuery);
	log(0, "Executing query '" + query.sql + "'");
	query
	.on('result', function(row) {
		count = row['count(*)'];
	})
	.on ('end', function() {
		connection.end();
		if (count != 0) {
			if (callback2)
				deleteOldEntries(callback, callback2);
			else
				deleteOldEntries(callback);
		}else {
			log(0, 'No need to delete from database');
			if (callback2)
				callback(callback2);
			if (callback)
				callback();
			log(0, 'Done updating the database');
		}
		
	});
}
exports.updateDatabase = function(callback, callback2) {
	connectToDatabase();
	updateDatabase(callback, callback2);
};
/*
 * This function updates the Updates table based on the items added in the last 10 minutes;
 */
function addUpdate() {
	if (connection == null)
		connectToDatabase();
	connectToDatabase();
	var count = -1;
	
	var sqlQuery = "SELECT count(*) as totalCount FROM"
				+ "("
				+ "SELECT TIMEDIFF(CURRENT_TIMESTAMP(), dateAdded) AS timeDifference FROM SaleObjects HAVING timeDifference < '00:10:00'"
				+ ") AS table1";
	var query = connection.query(sqlQuery);
	log(0, "Executing query '" + query.sql + "'");
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
			log(0, "Executing query '" + query.sql + "'");
			query
			.on ('end', function() {
				console.log('Added update');
				closeConnection();
			});
		} else if (count == 0) {
			console.log('No updates');
		}
	});
}

exports.addUpdate = function (){
	addUpdate();
};

/*
 * This function is for deleting entries from the database that were added more than the given interval hours ago.
 */
function deleteOldEntries(callback, callback2) {
	connectToDatabase();
	
	log(0, "Deleting from the database");
	var sqlQuery = 'DELETE FROM SaleObjects WHERE dateAdded < DATE_SUB(NOW(), INTERVAL 24 HOUR);';
	var query = connection.query(sqlQuery);
	log(0, "Executing query '" + query.sql + "'");
	query
	.on('end', function() {
		log(0, "Done deleting from database");
		connection.end();
		log(0, 'Done updating the database');
		if (callback2)
			callback(callback2);
		else {
			if(callback)
				callback();
		}
	});
};

function closeConnection() {
	log(0,"Closing connection");
	if (connection != null) {
		connection.end();
		connectionMade = false;
	}
}

exports.closeConnection = function() {
	closeConnection();
};

function log(messageType, message) {
	var type = "";
	if (messageType == 0)
		type = "[INFO]";
	else 
		type = "[WARNING]";
	var now = new Date();
	var timeString = now.toLocaleDateString() + " " + now.getHours()  + ":" + now.getMinutes() + ":"
				   + now.getSeconds() + ":" +  now.getMilliseconds();
	//Tue Nov 05 2013 10:31:18 GMT-0500 (EST):45
	console.log(timeString + " " + type + " " + message);
}


