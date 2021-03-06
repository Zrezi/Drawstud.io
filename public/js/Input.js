var Input = {
	mouse : { x : 0, y : 0, buttonsPressed: [], isMoving: false},
	keysPressed : [],
	blockedKeys : []
}

var MouseButtonCodes = {
	0 : "left button",
	1 : "middle button",
	2 : "right button"
}

var KeyCodes = {
	3 : "break",
	8 : "backspace",
	9 : "tab",
	12 : "clear",
	13 : "enter",
	16 : "shift",
	17 : "ctrl",
	18 : "alt",
	19 : "pause/break",
	20 : "caps lock",
	27 : "escape",
	32 : "spacebar",
	33 : "page up",
	34 : "page down",
	35 : "end",
	36 : "home",
	37 : "left arrow",
	38 : "up arrow",
	39 : "right arrow",
	40 : "down arrow",
	41 : "select",
	42 : "print",
	43 : "execute",
	44 : "print screen",
	45 : "insert ",
	46 : "delete",
	48 : "0",
	49 : "1",
	50 : "2",
	51 : "3",
	52 : "4",
	53 : "5",
	54 : "6",
	55 : "7",
	56 : "8",
	57 : "9",
	58 : ":",
	59 : "semicolon",
	60 : "<",
	61 : "equals (firefox)",
	63 : "ß",
	64 : "@ (firefox)",
	65 : "a",
	66 : "b",
	67 : "c",
	68 : "d",
	69 : "e",
	70 : "f",
	71 : "g",
	72 : "h",
	73 : "i",
	74 : "j",
	75 : "k",
	76 : "l",
	77 : "m",
	78 : "n",
	79 : "o",
	80 : "p",
	81 : "q",
	82 : "r",
	83 : "s",
	84 : "t",
	85 : "u",
	86 : "v",
	87 : "w",
	88 : "x",
	89 : "y",
	90 : "z",
	91 : "windows key",
	92 : "right window key",
	93 : "windows menu",
	96 : "numpad 0",
	97 : "numpad 1",
	98 : "numpad 2",
	99 : "numpad 3",
	100 : "numpad 4",
	101 : "numpad 5",
	102 : "numpad 6",
	103 : "numpad 7",
	104 : "numpad 8",
	105 : "numpad 9",
	106 : "multiply",
	107 : "add",
	108 : "numpad period (firefox)",
	109 : "subtract",
	110 : "decimal point",
	111 : "divide",
	112 : "f1",
	113 : "f2",
	114 : "f3",
	115 : "f4",
	116 : "f5",
	117 : "f6",
	118 : "f7",
	119 : "f8",
	120 : "f9",
	121 : "f10",
	122 : "f11",
	123 : "f12",
	124 : "f13",
	125 : "f14",
	126 : "f15",
	127 : "f16",
	128 : "f17",
	129 : "f18",
	130 : "f19",
	131 : "f20",
	132 : "f21",
	133 : "f22",
	134 : "f23",
	135 : "f24",
	144 : "num lock",
	145 : "scroll lock",
	160 : "^",
	161 : '!',
	163 : "#",
	164 : '$',
	165 : 'ù',
	166 : "page backward",
	167 : "page forward",
	169 : "closing paren (AZERTY)",
	170 : '*',
	171 : "~ + * key",
	173 : "minus (firefox), mute/unmute",
	174 : "decrease volume level",
	175 : "increase volume level",
	176 : "next",
	177 : "previous",
	178 : "stop",
	179 : "play/pause",
	180 : "e-mail",
	181 : "mute/unmute (firefox)",
	182 : "decrease volume level (firefox)",
	183 : "increase volume level (firefox)",
	186 : "semi-colon",
	187 : "equal sign ",
	188 : "comma",
	189 : "dash",
	190 : "period",
	191 : "forward slash",
	192 : "grave accent",
	193 : "?",
	194 : "numpad period (chrome)",
	219 : "open bracket ",
	220 : "back slash",
	221 : "close bracket",
	222 : "single quote",
	223 : "`",
	224 : "left or right ⌘ key (firefox)",
	225 : "altgr",
	226 : "< /git >",
	230 : "GNOME Compose Key",
	233 : "XF86Forward",
	234 : "XF86Back",
	255 : "toggle touchpad"
};

function keyPressed(e) {
	Input.keysPressed[KeyCodes[e.keyCode]] = true;
}

function keyReleased(e) {
	Input.keysPressed[KeyCodes[e.keyCode]] = false;
  	Input.blockedKeys[KeyCodes[e.keyCode]] = false;
}

function mouseMove(e) {

	// Get the offset of the canvas element on the page
	var offset = $('#canvas').offset();

	// Get the position on the canvas
	Input.mouse.x = e.pageX - offset.left;
	Input.mouse.y = e.pageY - offset.top;

	// Mouse moving is now true
	Input.mouse.isMoving = true;
}

function mousePressed(e) {
	Input.mouse.buttonsPressed[MouseButtonCodes[e.button]] = true;

	// Update coords
	coords = {x: Input.mouse.x / Display.canvas.width, y: Input.mouse.y / Display.canvas.height};
}

function mouseReleased(e) {
	Input.mouse.buttonsPressed[MouseButtonCodes[e.button]] = false;
}

function mousewheel(e) {
    Materialize.toast('Screen Cleared!', 4000)
}

function touchPressed(e) {
	if ($(e.target).is("canvas")) e.preventDefault();

	// Simulate mouse press
	Input.mouse.buttonsPressed["left button"] = true;

	// Get the offset of the canvas element on the page
	var offset = $('#canvas').offset();

	// Get the position on the actual canvas
	Input.mouse.x = e.touches[0].pageX - offset.left;
	Input.mouse.y = e.touches[0].pageY - offset.top;

	// Update coords
	coords = {x: Input.mouse.x / Display.canvas.width, y: Input.mouse.y / Display.canvas.height};
}

function touchReleased(e) {
	if (e.target == canvas) e.preventDefault();
	Input.mouse.buttonsPressed["left button"] = false;
}

function touchMove(e) {
	if ($(e.target).is("canvas")) e.preventDefault();

	var offset = $('#canvas').offset();

	Input.mouse.x = e.touches[0].pageX - offset.left;
	Input.mouse.y = e.touches[0].pageY - offset.top;
	
	Input.mouse.isMoving = true;
}