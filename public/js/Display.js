class Display {

	static init() {

		// Get a reference to the canvas html element
		Display.canvas = $('#canvas')[0];

		// Get the 2d context of that canvas
		Display.context = Display.canvas.getContext('2d');

		Display.cursorCanvas = $('#cursorCanvas')[0];
		Display.cursorCanvasContext = Display.cursorCanvas.getContext('2d');

		// Initialize unitSize variables
		Display.unitSize = { X: 0, Y: 0 };
		Display.oldUnitSize = Display.unitSize;

		// Call the resize function once to resize the canvas
		Display.resizeDisplay();
	}

	static resizeDisplay() {

		// Update the old unit size reference
		Display.oldUnitSize = Display.unitSize;

		var width = $('#cursorParent').width();
		var height = $('#cursorParent').height();

		Display.canvas.style.width = width;
		Display.canvas.style.height = height;

		// Resize the canvas dimensions
		Display.canvas.width = width;
		Display.canvas.height = height;
		Display.cursorCanvas.width = width;
		Display.cursorCanvas.height = height;

		// Update unitSize with the new dimensions
		Display.unitSize.X = Display.canvas.width / 32;
		Display.unitSize.Y = Display.canvas.height / 32;

		Display.cursorCanvasContext.font = Math.round((Display.unitSize.X / Display.unitSize.Y) + 10) + 'pt Arial';

		// Send a server request to get what's drawn on the screen
		socket.emit('SERVER REQUEST REDRAW');

	}

}