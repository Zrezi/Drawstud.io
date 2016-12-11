var express = require('express'), 
app = express(),
http = require('http'),
socketIo = require('socket.io'),
jsonfile = require('jsonfile'),
bcrypt = require('bcrypt-nodejs');

var server =  http.createServer(app);
var io = socketIo.listen(server);
server.listen(5007);

app.use(express.static(__dirname + '/public'));
console.log("Server running on 127.0.0.1:5007");

var users = [];
var numberOfConnections = 0;

var createdRooms = [];

var line_history = [];

// Get the json database
var file = 'public/jsonDB.json';
jsonfile.spaces = 4
var jsonDB = jsonfile.readFileSync(file);

// Every 10 seconds, update the clients with the number of connections
interval = setInterval(function() {
	io.emit('CLIENT UPDATE CONNECTED USERS AMOUNT', numberOfConnections);
}, 10000);

io.on('connection', function (socket) {

	numberOfConnections++;

	// Generate a unique ID
	var uniqueID = Math.round((new Date).getTime() * Math.random());

	socket.emit('CLIENT INITIAL CONNECT');

	socket.emit('CLIENT UPDATE CONNECTED USERS AMOUNT', numberOfConnections);

	// Null this variable
	socket.room = null;

	socket.on('SERVER INITIAL CONNECT', function(data) {

		if (data == "draw") {
			addDrawingSocketEventsToSocket(socket, uniqueID);
		}

		if (data == "newAccount") {
			addNewAccountSocketEventsToSocket(socket, uniqueID);
		}

		if (data == "login") {
			addLoginSocketEventsToSocket(socket, uniqueID);
		}

		if (data == "dashboard") {
			addDashboardSocketEventsToSocket(socket, uniqueID);
		}

	});

	socket.on('disconnect', function() {
		numberOfConnections--;
	});
	

});

function checkForExistingUsername(name) {
	for (var i in users) {
		if (users[i].username == name) {
			return true;
		}
	}
	return false;
}

function getUserFromSocket(socket) {
	for (var i in users) {
		if (users[i].username == socket.username) {
			return users[i];
		}
	}
	return false;
}

function addDrawingSocketEventsToSocket(socket, uniqueID) {

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

function addNewAccountSocketEventsToSocket(socket, uniqueID) {
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
		
	})
}

function addLoginSocketEventsToSocket(socket, uniqueID) {
	socket.on('SERVER REQUEST LOGIN', function(data) {

		var accounts = jsonDB.accounts;

		for (var i in accounts) {
			var account = accounts[i];

			if (account.username == data.username) {

				bcrypt.compare(data.password, account.password, function(err, res) {
					if (res) {
						socket.emit('CLIENT UPDATE LOGIN SUCCESS', data);
					} else {
						socket.emit('CLIENT UPDATE LOGIN FAILED', "Wrong password!");
					}
				});
				
				return;

			}
		}

		socket.emit('CLIENT LOGIN FAILED', "That user cannot be found.");

	});
}

function addDashboardSocketEventsToSocket(socket, uniqueID) {

	socket.on('SERVER REQUEST VIEW ROOMS', function(data) {
		socket.emit('CLIENT UPDATE VIEW ROOMS DATA', createdRooms);
	});

	socket.on('SERVER REQUEST CREATE ROOM', function(data) {
		var rooms = Object.keys(io.sockets.adapter.rooms);
		for (var i in rooms) {
			if (data == rooms[i]) {
				socket.emit('CLIENT UPDATE CREATE ROOM FAILED');
				return;
			}
		}

		createdRooms.push(data);
		line_history[data] = [];
		socket.emit('CLIENT UPDATE CREATE ROOM SUCCESS', data);
	});

}