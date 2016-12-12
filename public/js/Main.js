var interval;
var FPS = 60;

// Reference to the socket.io socket
var socket;

// Reference to the client's user state on the server
var user = {};

// An array of all of the other clients on the server
var otherUsers = [];

// Used for drawing
var coords = false;
var lineWidth = 2;
var lineColor = "black";

$(document).ready(function() {

    // Connect to the socket and quit if it doesn't connect
	socket = io.connect();
	if (!socket) {
		console.log('IO DIDN\'T WORK')
		return false;
	}

    // Load up cursor image
    cursorImage = new Image();
    cursorImage.src = "img/cursor.png";

    // Init the display object
    Display.init();

    // Add all of the listeners
    document.addEventListener('keydown', keyPressed, true);
    document.addEventListener('keyup', keyReleased, true);
    Display.canvas.addEventListener('mousedown', mousePressed, true);
    Display.canvas.addEventListener('mouseup', mouseReleased, true);
    Display.canvas.addEventListener('mousemove', mouseMove, true);
    Display.canvas.addEventListener('touchstart', touchPressed, false);
    Display.canvas.addEventListener('touchend', touchReleased, false);
    Display.canvas.addEventListener('touchmove', touchMove, false);
    $('#canvas').on('mousewheel', mousewheel);

    // Set the window's resize method to Display's resize method
    window.onresize = Display.resizeDisplay;

    // Set canvas context values initially
    Display.context.strokeStyle = lineColor;
    Display.context.lineWidth = lineWidth;

    // Set up socket emissions
    handleSocketEvents();
});

function start() {

    interval = setInterval(function() {

        if (Input.mouse.buttonsPressed["left button"] && Input.mouse.isMoving) {

            // Placeholder variables to make everything easier to write (and read for that matter)
            var w = Display.canvas.width;
            var h = Display.canvas.height;

            // Calculate normalized x and y coordinates so every size screen can see the line
        	var normalizedX = Input.mouse.x / w;
        	var normalizedY = Input.mouse.y / h;

            // Draw the line on your screen
            Display.context.beginPath();
            Display.context.moveTo(normalizedX * w, normalizedY * h);
            Display.context.lineTo(coords.x * w, coords.y * h);
            Display.context.closePath();
            Display.context.stroke();

            // Emit the line to all other clients
            socket.emit('SERVER UPDATE DRAW LINE',
    	        {
    	            position: {x: normalizedX, y: normalizedY},
    	            previousPosition: coords,
    	            color: lineColor,
    	            lineWidth: lineWidth
    	        }
		    );

            // Recalculate "last used" coordinates
            coords = {x: normalizedX, y: normalizedY};

            // So there isn't infinite lines drawn when the mouse button is clicked, but the mouse isn't moving
            Input.mouse.isMoving = false;

        }

    }, 1000 / FPS);

}

function clearScreen() {
    socket.emit('SERVER UPDATE CLEAR CANVAS', getUserReference());
}

function getUserReference() {
    return sessionStorage.getItem('dsio__username');
}

function handleSocketEvents() {

    socket.on('CLIENT INITIAL CONNECT', function() {
        Materialize.toast('Connected to drawing server', 2500);
        socket.emit('SERVER INITIAL CONNECT', "draw");
        socket.emit('SERVER SET CLIENT ROOM', sessionStorage.getItem('dsio__room'));
        socket.emit('SERVER REQUEST REDRAW');
        start();
    });

    socket.on('CLIENT UPDATE DRAW LINE', function(data) {
    	// Get context variables before the draw
        var style = Display.context.strokeStyle;
        var width = Display.context.lineWidth;

        // Update the context variables to the line's style and color
        Display.context.strokeStyle = data.lineColor;
        Display.context.lineWidth = data.lineWidth;

        // Get canvas dimensions
        var w = Display.canvas.width;
        var h = Display.canvas.height;

        // Draw the line
        Display.context.beginPath();
        Display.context.moveTo(data.previousPosition.x * w, data.previousPosition.y * h);
        Display.context.lineTo(data.position.x * w, data.position.y * h);
        Display.context.closePath();
        Display.context.stroke();

        // Set the context variables back to their original value
        Display.context.strokeStyle = style;
        Display.context.lineWidth = width;
    });

    // Simply wipe the canvas
    socket.on('CLIENT UPDATE CLEAR CANVAS', function(data) {
        Display.context.clearRect(0, 0, Display.canvas.width, Display.canvas.height);
        Materialize.toast('Screen Cleared By ' + data, 2000);
    });

    socket.on('CLIENT UPDATE CONNECTED USERS AMOUNT', function(data) {
       $('#onlinePeople').html(data); 
    });
}