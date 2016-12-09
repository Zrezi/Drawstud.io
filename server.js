var express = require('express'), 
app = express(),
http = require('http'),
socketIo = require('socket.io');

var server =  http.createServer(app);
var io = socketIo.listen(server);
server.listen(5007);

app.use(express.static(__dirname + '/public'));
console.log("Server running on 127.0.0.1:5007");

var users = [];

var line_history = [];

io.on('connection', function (socket) {

	// Generate a unique ID
	var ip = socket.request.connection.remoteAddress;
	var uniqueID = Math.round((new Date).getTime() * Math.random());

	console.log('New connection from: ' + ip);

	// Request a username from the client
	socket.emit('CLIENT REQUEST USERNAME', false);

	// Tell the server to update the socket's username
	socket.on('SERVER SET USERNAME', function(data) {

		// If the username is already used
		if (checkForExistingUsername(data) || data == '' || data == null) {

			// The requested username has already been taken, choose another
			socket.emit('CLIENT REQUEST USERNAME', true);

		} else {

			// Create a new user object
			var user = {};
			user.ipAddress = ip;
			user.uniqueID = uniqueID;
			user.username = data;
			user.position = {x: 0, y: 0};

			// Also add a socket variable with a reference to the username. This will be used to disconnect users
			socket.username = data;

			// Tell the user that they are verified
			socket.emit('CLIENT SET VERIFIED', {you: user, them: users});

			// Push it onto the user array
			users.push(user);

			// Let other users connected to the server know of the client's existence
			socket.broadcast.emit('CLIENT UPDATE NEW USER', user);
		}
	});

	/*ids.push(uniqueID);
	for (var i in ids) {
		var id = ids[i];
		if (id != uniqueID) {
			socket.emit('user connect', id);
		}
	}*/

	socket.on('SERVER UPDATE MOVE CURSOR', function(data) {
		socket.broadcast.emit('CLIENT UPDATE MOVE CURSOR', data);
	});

	socket.on('SERVER UPDATE DRAW LINE', function (data) {
		line_history.push(data);
		socket.broadcast.emit('CLIENT UPDATE DRAW LINE', data);
	});

	socket.on('SERVER REQUEST REDRAW', function(data) {
		for (var i in line_history) {
			socket.emit('CLIENT UPDATE DRAW LINE', line_history[i]);
		}
	});

	socket.on('disconnect', function() {

		var disconnectedUser = getUserFromSocket(socket);
		console.log('User ' + disconnectedUser.username + ' has disconnected.');

		for (var i in users) {
			var user = users[i];
			if (user.username == disconnectedUser.username) {
				users.splice(i, 1);
				socket.broadcast.emit('CLIENT UPDATE USER DISCONNECTED', disconnectedUser);
				break;
			}
		}
	});

	socket.on('SERVER UPDATE CLEAR CANVAS', function(data) {
		io.emit('CLIENT UPDATE CLEAR CANVAS', data);
		line_history = [];
	});

});

function checkForExistingIP(ip) {
	for (var i in users) {
		if (users[i].ipAddress == ip) {
			return true;
		}
	}
	return false;
}

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