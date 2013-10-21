/**
 * New node file
 */

var mysql = require('mysql');
SaleObject = require('./SaleObject');

var connectionDetails = {};
connectionDetails['host'] = "127.0.0.1";
connectionDetails['user'] = "user";
connectionDetails['password'] = "password";
connectionDetails['database'] = "highjinx-database";

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

function connectToDatabase() {
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

//Executes a query that gets the Count(*) from SaleObjects table
function getCount() {
	if (connection == null)
		connectToDatabase();
	var sqlQuery = 'SELECT count(*) FROM SaleObjects';	
	var query = connection.query(sqlQuery);
	var count = 0;
	query
	.on('result', function(row){
		count = row['count(*)'];
	})
	.on('end', function() {
		
	});	
}

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

// objects is an array of SaleObject
exports.insertIntoDatabase = function(objects) {
	if (connection == null)
		connectToDatabase();
	if (objects != null) {
		for (var i = 0; i < objects.length; i++) {
			var object = objects[i];
			var sqlQuery = "INSERT into SaleObjects (title, link, description, imageLink) values(?, ?, ?, ?)";
			var query = connection.query(sqlQuery, [object.tile, object.title, object.description, object.imageLink], function(err, result) {
			});
			console.log(query.sql);
		};
	};
};

exports.insertSingleItemIntoDatabase = function(object) {
	if (connection == null)
		connectToDatabase();
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

exports.updateDatabase = function(callback) {
	if (connection == null)
		connectToDatabase();
	var count = -1;
	var sqlQuery = 'SELECT count(*) FROM SaleObjects WHERE dateAdded < DATE_SUB(NOW(), INTERVAL 24 HOUR);'
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
			callback();
		}
	});
};

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
}
exports.closeConnection = function() {
	console.log("Closing connection");
};

