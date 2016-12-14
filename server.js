// Import Nodejs modules
var express = require('express'), 
app = express(),
http = require('http'),
socketIo = require('socket.io'),
jsonfile = require('jsonfile'),
bcrypt = require('bcrypt-nodejs'),
async = require('async');

var server =  http.createServer(app);
var io = socketIo.listen(server);
server.listen(5007);

app.use(express.static(__dirname + '/public'));
console.log("Server running on 127.0.0.1:5007");

// The number of active connections to the server from any page
var numberOfConnections = 0;

// An array keeping track of all of the user created rooms
var createdRooms = [];

// Will eventually because an array of arrays (of line objects)
// line_history['room name'] => [{line 1 object}, {line 2 object}, ...]
var line_history = [];

// Get the json database on server load
var file = 'public/jsonDB.json';
jsonfile.spaces = 4;
var jsonDB = jsonfile.readFileSync(file);

// Every 10 seconds, update the clients with the number of connections
interval = setInterval(function() {
	io.emit('CLIENT UPDATE CONNECTED USERS AMOUNT', numberOfConnections);
}, 10000);

io.on('connection', function (socket) {

	numberOfConnections++;

	socket.emit('CLIENT INITIAL CONNECT');

	socket.emit('CLIENT UPDATE CONNECTED USERS AMOUNT', numberOfConnections);

	socket.room = null;

	socket.on('SERVER INITIAL CONNECT', function(data) {

		if (data == "draw") {
			addDrawingSocketEventsToSocket(socket);
		}

		if (data == "newAccount") {
			addNewAccountSocketEventsToSocket(socket);
		}

		if (data == "login") {
			addLoginSocketEventsToSocket(socket);
		}

		if (data == "dashboard") {
			addDashboardSocketEventsToSocket(socket);
		}

	});

	socket.on('disconnect', function() {
		numberOfConnections--;
	});
	
});

function addDrawingSocketEventsToSocket(socket) {

	socket.on('SERVER SET CLIENT ROOM', function(data) {
		socket.room = data;
		socket.join(socket.room);
	});

	socket.on('SERVER UPDATE DRAW LINE', function (data) {
		line_history[socket.room].push(data);
		socket.broadcast.to(socket.room).emit('CLIENT UPDATE DRAW LINE', data);
	});

	socket.on('SERVER REQUEST REDRAW', function(data) {
		for (var i in line_history[socket.room]) {
			socket.emit('CLIENT UPDATE DRAW LINE', line_history[socket.room][i]);
		}
	});

	socket.on('SERVER UPDATE CLEAR CANVAS', function(data) {
		io.sockets.in(socket.room).emit('CLIENT UPDATE CLEAR CANVAS', data);
		line_history[socket.room] = [];
	});

}

function addNewAccountSocketEventsToSocket(socket) {

	socket.on('SERVER REQUEST NEW ACCOUNT', function(data) {
		var accounts = jsonDB.accounts;

		for (var i in accounts) {
			var account = accounts[i];
			if (account.username == data.username) {
				socket.emit('CLIENT UPDATE NEW ACCOUNT FAILED', "Username is already taken!");
				return;
			}
		}

		bcrypt.hash(data.password, null, null, function(err, hash) {
		    // Store hash in your password DB.
		    // write new account to json database
			jsonDB.accounts.push({username: data.username, password: hash});
			jsonfile.writeFile(file, jsonDB, function (err) {
				/*if (err != null) console.error(err);*/
			});
			// tell the client that their account was created
			socket.emit('CLIENT UPDATE NEW ACCOUNT SUCCESS');
		});
		
	});

}

function addLoginSocketEventsToSocket(socket) {

	socket.on('SERVER REQUEST LOGIN', function(data) {

		async.series([
			function(callback) {
				var accounts = jsonDB.accounts;

				for (var i in accounts) {
					var account = accounts[i];

					if (account.username == data.username) {

						bcrypt.compare(data.password, account.password, function(err, res) {
							if (res) {
								callback(null, data);
							} else {
								callback(true, "Wrong password!");
							}
						});
						
						return;

					}
				}

				callback(true, "That user cannot be found.");

			}],
			function(err, results) {
				if (err) {
					socket.emit('CLIENT UPDATE LOGIN FAILED', results[0]);
					return;
				}
				socket.emit('CLIENT UPDATE LOGIN SUCCESS', results[0]);
				return;
		});
		

				

		

	});

}

function addDashboardSocketEventsToSocket(socket) {

	socket.on('SERVER REQUEST VIEW ROOMS', function(data) {
		socket.emit('CLIENT UPDATE VIEW ROOMS DATA', createdRooms);
	});

	socket.on('SERVER REQUEST CREATE ROOM', function(data) {

		// Check all rooms for name errors
		for (var i in createdRooms) {
			if (data == createdRooms[i]) {
				socket.emit('CLIENT UPDATE CREATE ROOM FAILED');
				return;
			}
		}

		// Add the created room name to the array of created rooms
		createdRooms.push(data);

		// Initialize the array of arrays
		// line_history['room name'] => []
		line_history[data] = [];

		// Tell the client it was a success
		socket.emit('CLIENT UPDATE CREATE ROOM SUCCESS', data);
	});

}