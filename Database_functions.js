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
	if (pool === null) {
		pool = mysql.createPool({
			host : connectionDetails['host'],
			user : connectionDetails['user'],
			password : connectionDetails['password'],
			database : connectionDetails['database'],
		});
	}
	
	if (pool !== null) 
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
	if (connection === null)
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

// objects is an array of SaleObject
exports.insertIntoDatabase = function(objects) {
	if (connection === null)
		connectToDatabase();
	if (objects !== null) {
		for (var i = 0; i < objects.length; i++) {
			var object = objects[i];
			var sqlQuery = "INSERT into SaleObjects (title, link, description, imageLink) values(?, ?, ?, ?)";
			var query = connection.query(sqlQuery, [object.tile, object.title, object.description, object.imageLink], function(err, result) {
			});
		}
	}
};

exports.getObjectsFromDatabase = function(objects) {
	if (connection === null)
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
		endConnection();
	});
	
	
};


function endConnection() {
	if (connection !== null)
		connection.end();
}



