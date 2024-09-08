const botApi = new Worker("bots.js")
botApi.onmessage = (botMove) => {promiseDB = true; game.updateAttributes(game.handleMove(...botMove.data, false))}

const descHotkeys = "You can drag or click to move.\n\nRight click to highlight squares and drag right click to draw arrows.\n\nHotkeys (PC ONLY):\n\n\tX to flip board.\nR to reset board.\nU to undo move.\nLeft Arrow to move back a move.\nRight Arrow to move forward a move.\nUp Arrow to go to the start of a game.\nDown Arrow to go to the end of a game."
const descStandard = "Chess with the standard starting position and rules. Play with a friend, or one of the bots!\n\nBefore starting, you can choose who plays as white and black. You must also choose time controls for both players."
const desc960 = "Chess, but the starting position is random. Play with a friend, or one of the bots!\n\nBefore starting, you can choose who plays as white and black. You must also choose time controls for both players."
const descCustom = "Chess, but you set up the starting position. Play with a friend, or one of the bots!\n\nBefore starting, you can choose who plays as white and black. You must also choose time controls for both players."

let startFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"
let testFENs = [
	// "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR", // w KQkq - 0 1
	"r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R", // w KQkq -
	// "8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8", // w - - needs context or breaks game
	// "r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1", // w kq - 0 1 breaks game as black
	"rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R", // w KQ - 1 8
	"rn1qkb1r/pp2pppp/2p2n2/5b2/P1pP3N/2N5/1P2PPPP/R1BQKB1R"
]


// let t1 = new Date().getTime()
// console.log(new Chess(testFENs[0]).moveTest(1), (new Date().getTime() - t1)/1000)

let results = []
let gameCount = 0

let backTime = 0, backMenuStartTime = 0, backCreditsStartTime = 0, backPuzzlesStartTime = 0
let clickedTime = 0
let transitionDuration = 500
let promiseDB = true
let currentTransition = [null, null]
let mouseBuffer = [false, false, false]
let menuDebounce = true, backDebounce = true
let decile, game, time
let mode = "menu"
let players = ["Human", "Fortuna", "Astor", "Lazaward", "Aleph"]
let wPlayer = 1, bPlayer = 1
let menuPreset = ["Standard", descStandard, [51, 153, 255], [0, 77, 153], [0, 34, 102]]
let boardColours = [[200, 200, 200], [160, 100, 60]]
let colourPickerMode = 0
let customAdvanced = false
let songCounter = 0

let puzzleCounter = false
let puzzlesStartTime = 0
let puzzleResults = Array(25).fill(null)
let puzzlesFinish = false
let puzzlesData = [ // {0} FEN String => {1} Move Notation => {2} Bot Moves => {3} Side to Move
	["6k1/5p1p/R5pP/1p6/2pP4/4p1K1/3bB1P1/8", ["Ra8+"], [], true],
	["6k1/5R1p/2N5/1p5p/1P5P/5RPK/8/3q4", ["Qh1+"], [], false],
	["1k6/pppr1p1p/1q2p1pb/5n2/8/1P6/PQP2PPP/2R2RK1", ["Qh8+", "Rd8", "Qxd8+"], [[4, 2, 4, 1, false]], true], 
	["r2q1r1k/p3np1p/bp4pP/3p2Q1/3p4/3n1P2/PP1KN1P1/R5NR", ["Qf6+", "Kg8", "Qg7+"], [[8, 1, 7, 1, false]], true],
	["8/R1Q1nkp1/4p3/3pPp2/5r2/3b4/5P1P/6K1", ["Rg4+", "Kh1", "Be4+", "f3", "Bxf3+"], [[7, 8, 8, 8, false], [6, 7, 6, 6, false]], false],
	["6k1/2q2pp1/p6p/1p6/8/P3Q1PP/1P3R1K/1r6", ["Qe8+", "Kh7", "Qe4+", "g6", "Qxb1"], [[7, 1, 8, 2, false], [7, 2, 7, 3, false]], true],
	["5rk1/pR1R3p/1pp1p1p1/4r3/2P5/8/P1P2P1P/6K1", ["Rg7+", "Kh8", "Rxh7+", "Kg8", "Rbg7+"], [[7, 1, 8, 1, false], [8, 1, 7, 1, false]], true],
	["8/Q1pkr1pp/2r5/8/8/6P1/PP2qPP1/R5KR", ["Qe1+", "Rxe1", "Rxe1+", "Kh2", "Rh6+"], [[1, 8, 5, 8, false], [7, 8, 8, 7, false]], false],
	["2r5/3b2pk/5b2/P1pBp2p/2P1P3/2NnBPK1/6PP/R4R2", ["h4+"], [], false],
	["r4rk1/p1p3pp/4p3/2Np4/Q2PnB2/4Pn1P/5qP1/2R2R1K", ["Qg1+", "Rxg1", "Nf2+"], [[6, 8, 7, 8, false]], false],
	["4N2k/7P/5Kr1/8/2p5/8/8/8", ["Kxg6", "c3", "Nd6", "c2", "Nf7+"], [[3, 5, 3, 6, false], [3, 6, 3, 7, false]], true],
	["3r1rk1/2pqbppp/p1n2n2/1p6/3Np3/1PN1P1Pb/PBP2PBP/RQ3RK1", ["Nxc6", "Bxg2", "Nxe7+", "Qxe7", "Kxg2"], [[8, 6, 7, 7, false], [4, 2, 5, 2, false]], true],
	["5rk1/p4Npp/4p3/3p4/8/4PR2/r2n2PP/5RK1", ["Nh6+", "gxh6", "Rg3+", "Kh8", "Rxf8+"], [[7, 2, 8, 3, false], [7, 1, 8, 1, false]], true],
	["1q2r3/p3R1pk/1p3pNp/3p1P1Q/b1pP4/P6P/1P4P1/7K", ["Nf8+", "Kh8", "Qg6", "Rxe7", "Qh7+"], [[8, 2, 8, 1, false], [5, 1, 5, 2, false]], true],
	["5k2/1p3pp1/p6p/3PP3/P3PK2/1Pr2RP1/8/8", ["g5+", "Kg4", "h5+", "Kxg5", "Rxf3"], [[6, 5, 7, 5, false], [7, 5, 7, 4, false]], false],
	["3r4/6RP/8/4p1P1/8/4k3/3p4/3K4", ["Rc8", "Rc7", "Rxc7", "h8=Q", "Rc1+"], [[7, 2, 3, 2, false], [8, 2, 8, 1, "Q"]], false],
	["2krB3/pbp2r2/1p1b2q1/6Bp/2pp4/4Q3/PP3PPP/R3R1K1", ["Qh3+", "Rdd7", "Qxd7+", "Rxd7", "Bxg6"], [[4, 1, 4, 2, false], [6, 2, 4, 2, false]], true],
	["1q3r1k/3N2pp/R1b1p3/1p1p4/1QpPn3/2P1p2P/3N1PP1/R4BK1", ["exf2+", "Kh1", "Ng3+", "Kh2", "Nxf1+", "Kh1", "Qh2+"], [[7, 8, 8, 8, false], [8, 8, 8, 7, false], [8, 7, 8, 8, false]], false],
	["b4rk1/pp2Rpp1/2p4p/2Qn4/8/P2P1P1P/1q3P2/4R1K1", ["R7e2", "Qf6", "Qxf8+", "Kxf8", "Re8+"], [[2, 7, 6, 3, false], [7, 1, 6, 1, false]], true],
	["1r3k1r/ppp5/3b4/3Q4/5q2/1B3n1p/PP2RP2/1K5R", ["Rxh3", "Nd2+", "Kc2", "Nxb3", "Rxh8+", "Kg7", "Rxb8"], [[6, 6, 4, 7, false], [4, 7, 2, 6, false], [6, 1, 7, 2, false]], true],
	["4r1k1/5pp1/2p2q2/Q7/2Pp3p/P2P2P1/4rPKP/4RR2", ["h3+", "Kxh3", "Qe6+", "Kg2", "Rxe1", "Rxe1", "Qxe1", "Qxe1", "Rxe1"], [[7, 7, 8, 6, false], [8, 6, 7, 7, false], [6, 8, 5, 8, false], [1, 4, 5, 8, false]], false],
	["3nr3/R1pbkpPR/1p3p2/3P4/1b5Q/5n2/B1N1q2P/1r2B2K", ["Qxb4+", "Rxb4", "Bxb4+", "c5", "dxc6+"], [[2, 8, 2, 5, false], [3, 2, 3, 4, false]], true],
	["4nrk1/p1r1qp1p/6pQ/4p1PP/np2P3/3P1PN1/P3N2R/4K2R", ["Qxh7+", "Kxh7", "hxg6+", "Kxg6", "Rh6+", "Kxg5", "R1h5+"], [[7, 1, 8, 2, false], [8, 2, 7, 3, false], [7, 3, 7, 4, false]], true],
	["5rk1/ppq2ppp/2p5/4bN2/4P3/6Q1/PPP2PPP/3R2K1", ["Nh6+", "Kh8", "Qxe5", "Qxe5", "Nxf7+", "Rxf7", "Rd8+", "Qe8", "Rxe8+", "Rf8", "Rxf8+"], [[7, 1, 8, 1, false], [3, 2, 5, 4, false], [6, 1, 6, 2, false], [5, 4, 5, 1, false], [6, 2, 6, 1, false]], true],
	["2k5/6R1/N7/8/8/6K1/7p/5b2", ["Rg8+", "Kb7", "Nc5+", "Kb6", "Na4+", "Kb5", "Nc3+", "Kb4", "Na2+", "Kb3", "Nc1+", "Kb2", "Kxh2", "Kxc1", "Rg1"], [[3, 1, 2, 2, false], [2, 2, 2, 3, false], [2, 3, 2, 4, false], [2, 4, 2, 5, false], [2, 5, 2, 6, false], [2, 6, 2, 7, false], [2, 7, 3, 8, false]], true]
]

let puzzleValid = []
let puzzleBots = []


let menuButtonStyle = `
	transition: background-color 0.5s, width 0.5s, opacity 0.5s, left 0.5s;
	font-family: kodeMono, Courier New, Arial, serif;
	-webkit-text-stroke: black 0.5vh;
	border-bottom-right-radius: 3vh;
	border-top-right-radius: 3vh;
	-webkit-touch-callout: none;
	position: absolute;
	padding-right: 2vw;
	text-align: right;
	font-weight: bold;
	user-select: none;
	font-size: 15vh;
	cursor: default;
	color: #E0E0E0;
	opacity: 0.9;
	height: 20vh;
` 

function preload() {
	// Pieces by Cburnett - Own work, CC BY-SA 3.0
    pieces = {
        "k": loadImage("Pieces/bKing.png"),
        "q": loadImage("Pieces/bQueen.png"),
        "r": loadImage("Pieces/bRook.png"),
    	"b": loadImage("Pieces/bBishop.png"),
        "n": loadImage("Pieces/bKnight.png"),
        "p": loadImage("Pieces/bPawn.png"),
        "K": loadImage("Pieces/wKing.png"),
        "Q": loadImage("Pieces/wQueen.png"),
        "R": loadImage("Pieces/wRook.png"),
        "B": loadImage("Pieces/wBishop.png"),
        "N": loadImage("Pieces/wKnight.png"),
        "P": loadImage("Pieces/wPawn.png")
    }
	sfx = {
		"check": loadSound("SFX/check.mp3"),
		"move": loadSound("SFX/move.mp3"),
		"hover": loadSound("SFX/menuHover.mp3"),
		"click1": loadSound("SFX/menuClick1.mp3"),
		"click2": loadSound("SFX/menuClick2.mp3"),
		"click3": loadSound("SFX/menuClick3.mp3"),
		"correct": loadSound("SFX/correct.mp3"),
		"error": loadSound("SFX/error.mp3"),
		"back": loadSound("SFX/back.mp3")
	}
	songs = {
		// "Kirara Magic - Checkmate": loadSound("Songs/Checkmate.mp3"),
		// "KLYDIX - Dream Flower": loadSound("Songs/Dream Flower.mp3"),
		// "Tobu - Escape": loadSound("Songs/Escape.mp3"),
		// "Xomu - Last Dance": loadSound("Songs/Last Dance.mp3"),
		// "Sakuzyo - Lost Memory": loadSound("Songs/Lost Memory.mp3"),
		// "EspiDev - Parfait": loadSound("Songs/Parfait.mp3"),
		"PIKASONIC - Relive": loadSound("Songs/Relive.mp3"),
		// "megawolf77 - Shining Sprinter": loadSound("Songs/Shining Sprinter.mp3"),
		// "F-777 - Stay Tuned": loadSound("Songs/Stay Tuned.mp3"),
		// "BuildCastlesInAir - Untitled Song": loadSound("Songs/Untitled Song.mp3"),
	}
	correctImg = loadImage("Icons/correct.png")
	incorrectImg = loadImage("Icons/incorrect.png")
	settingsImg = loadImage("Icons/settings.png")
	kodeMono = loadFont("Font/KodeMono.ttf")
}

function setup() {
	for (let s in songs) {songs[s].onended(audioHandler)}
	playlist = shuffle(Object.keys(songs))
	playingSong = playlist[0]
	songs[playingSong].play()

	createCanvas(windowWidth, windowHeight)
	textFont(kodeMono)
	game = new Chess(random(testFENs))
	//game = new Chess(startFEN, players[3-1], players[3-1])

	backButton = createDiv("Back")
	backButton.style(menuButtonStyle + `
		-webkit-text-stroke: black 0.25vh;
		border-bottom-left-radius: 1vh;
		border-top-left-radius: 1vh;
		background-color: #4A4A4A;
		padding-left: 1vw;
		text-align: left;
		font-size: 8vh;
		height: 10vh;
		left: 100vw;
		width: 0vw;
		top: 5vh;
	`)
	buttons = {
		divs: {
			"top": createDiv("Play"),
			"middle": createDiv("Puzzles"),
			"bottom": createDiv("Credits"),
		},

		uColour: {
			"Play": "#C8C8C8",
			"Puzzles": "#969696",
			"Credits": "#646464",

			"Standard": "#64B5F6",
			"Chess960": "#1E88E5",
			"Custom": "#1565C0",

			"Classic": "#FBC02D",
			"Rhythm": "#F9A825",
			"Solo": "#F57F17"
		},

		vColour: {
			"Play": "#3399FF",
			"Puzzles": "#FFA500",
			"Credits": "#884DFF",
			
			"Standard": "#0097A7",
			"Chess960": "#00838F",
			"Custom": "#006064",

			"Classic": "#FF5722",
			"Rhythm": "#E64A19",
			"Solo": "#BF360C"
		},

		width: {
			"Play": 70,
			"Puzzles": 60,
			"Credits": 50,

			"Standard": 70,
			"Chess960": 60,
			"Custom": 50,

			"Classic": 70,
			"Rhythm": 60,
			"Solo": 50
		},

		sound: {
			"Play": "click1",
			"Puzzles": "click2",
			"Credits": "click3"
		},

		mode: { // is this necessary?
			"Play": "game",
			"Puzzles": "puzzlesMenu",
			"Credits": "creditsMenu"
		},

		"Play": { // Menu after button clicked
			"top": "Standard",
			"middle": "Chess960",
			"bottom": "Custom"
		},

		"Puzzles": {
			"top": "Classic",
			"middle": "Rhythm",
			"bottom": "Solo"
		},

		"Credits": {
			"top": "Secret",
			"middle": "Easter",
			"bottom": "Egg"
		}
	}
	timeInputs = {
		"wMins": createInput("10"),
		"wSecs": createInput("00"),
		"wIncr": createInput("0"),
		"bMins": createInput("10"),
		"bSecs": createInput("00"),
		"bIncr": createInput("0")
	}
	colourSliders = {
		"red": createSlider(0, 255),
		"green": createSlider(0, 255),
		"blue": createSlider(0, 255)
	}
	volumeSliders = {
		"music": createSlider(0, 1, 1, 0.01),
		"sfx": createSlider(0, 1, 1, 0.01)
	}
	customMenu = {
		"fen": createInput(random(testFENs)),
		"side": createSlider(0, 1, 0, 1), 
		"target": createInput("-"),
		"halfmoves": createInput(0),
		"fullmoves": createInput(0),
		"w1": createCheckbox("O-O-O", true),
		"w2": createCheckbox("O-O", true),
		"b1": createCheckbox("O-O-O", true),
		"b2": createCheckbox("O-O", true)
	}
	transitionDivs = {
		"div1": createDiv(),
		"div2": createDiv()
	}
	for (let v of ["w1", "w2", "b1", "b2"]) {customMenu[v].style("color: white")}
	for (let v in customMenu) {customMenu[v].style("font-family: kodeMono")}

	for (let box in timeInputs) {
		timeInputs[box].attribute("maxlength", "2")
		timeInputs[box].style(`font-family: kodeMono, Courier New, Arial, serif; background-color: rgba(0, 0, 0, 0); 
		font-size: 5vh; border: none; border-radius: 5px; text-align: center; overflow: auto;
		color: ${box.slice(0, 1) === "w" ? "white" : "black"}`)
	}

	for (let div in buttons.divs) {
		let text = buttons.divs[div].html()
		let properties = `background-color: ${buttons.uColour[text]}; width: ${buttons.width[text]}vw`
		buttons.divs[div].style(menuButtonStyle + properties)
		buttons.divs[div].class("p5Canvas")
	}

	for (let element of document.getElementsByClassName("p5Canvas")) {
		element.addEventListener("contextmenu", v => v.preventDefault())
	}
}

function draw() {
	if (mode !== "start") {for (let v in customMenu) {customMenu[v].position(-windowWidth, 0)}}
	resizeCanvas(windowWidth, windowHeight)

	clear()

	for (let song in songs) {songs[song].setVolume(volumeSliders["music"].value())}
	for (let e in sfx) {sfx[e].setVolume(volumeSliders["sfx"].value())}

	time = new Date().getTime()
	decile = min(windowWidth, windowHeight) / 10
	background(50)

	buttons.divs["top"].position(0, windowHeight * 0.2)
	buttons.divs["middle"].position(0, windowHeight * 0.45)
	buttons.divs["bottom"].position(0, windowHeight * 0.7)

	game.draw()

	if (mode === "start" || time <= backMenuStartTime + 500) {drawMenu(...menuPreset)} else {
		for (let box in timeInputs) {
			timeInputs[box].position(-windowWidth, -windowHeight)
			timeInputs[box].size(decile*0.75, decile*0.75)
		}
	}

	if (buttons.divs["top"].html() === "Secret" || time <= backCreditsStartTime + 500) {drawCredits()}

	for (let div in buttons.divs) {
		buttons.divs[div].mouseOver(mouseHover)
		buttons.divs[div].mouseOut(mouseNotHover)
		buttons.divs[div].mousePressed(mouseClickedElement)
	}
	backButton.mouseOver(mouseHover)
	backButton.mouseOut(mouseNotHover)
	backButton.mousePressed(mouseClickedElement)

	if (mode === "menu" && ["Play", "Standard"].includes(buttons.divs["top"].html())) {image(settingsImg, windowWidth-decile*3, decile*7, decile*2, decile*2)}
	if (mode === "settings") {drawSettings()} else {
		for (let s in volumeSliders) {volumeSliders[s].position(-windowWidth, 0)}
		for (let s in colourSliders) {colourSliders[s].position(-windowWidth, 0)}
	}

	if (puzzleCounter !== false || time <= backPuzzlesStartTime + 500) {drawPuzzles()}

	transition(clickedTime, transitionDuration, ...currentTransition)

	//botTest(3, 3, 100)
}

function audioHandler() {
	songCounter++
	playingSong = playlist[songCounter % playlist.length]
	songs[playingSong].play()
}

function drawMenu(title, desc, colour1, colour2, colour3) {
	let offset = decile/10
	let alpha = (mode === "start") ? 255 : 255 - (255 * factor(backMenuStartTime, 500, "sine"))

	timeInputs["wMins"].position(windowWidth*0.1775 - decile*1.45, decile*5.975)
	timeInputs["wSecs"].position(windowWidth*0.1775 - decile*0.45, decile*5.975)
	timeInputs["wIncr"].position(windowWidth*0.1775 + decile*0.6, decile*5.975)

	timeInputs["bMins"].position(windowWidth*0.5225 - decile*1.45, decile*5.975)
	timeInputs["bSecs"].position(windowWidth*0.5225 - decile*0.45, decile*5.975)
	timeInputs["bIncr"].position(windowWidth*0.5225 + decile*0.6, decile*5.975)

	for (let box in timeInputs) {
		timeInputs[box].size(decile*0.75, decile*0.75)
		timeInputs[box].style(`opacity: ${alpha/255}`)
	}

	push() // Background
	stroke(0, 0)
	fill(...colour1, alpha)
	textAlign(CENTER)
	rect(0, 0, windowWidth*0.6, windowHeight*0.2)
	triangle(windowWidth*0.6, 0, windowWidth*0.6, windowHeight*0.2, windowWidth*0.7, windowHeight*0.2)
	rectMode(CENTER)
	rect(windowWidth/2, windowHeight*0.6, windowWidth, windowHeight*0.8)
	stroke(...colour1, alpha)
	line(0, windowHeight*0.2, windowWidth, windowHeight*0.2)
	strokeWeight(10)

	fill(...colour2, alpha)
	stroke(255, alpha)
	rect(windowWidth*0.1775, decile*4.75, windowWidth*0.315, decile*5, decile/2) // White and black outlines
	stroke(0, alpha)
	rect(windowWidth*0.5225, decile*4.75, windowWidth*0.315, decile*5, decile/2)

	rectMode(CENTER)
	stroke(0, 0) // Tertiary colour shading
	fill(...colour3, alpha)
	rect(windowWidth*0.35-offset, decile+offset, windowWidth*0.48125, decile*1.5)
	rect(windowWidth*0.075-offset, decile+offset, windowWidth*0.025, decile*1.5)
	rect(windowWidth*0.04-offset, decile+offset, windowWidth*0.0125, decile*1.5)
	rect(windowWidth*0.02-offset, decile+offset, windowWidth*0.00625, decile*1.5)
	triangle(windowWidth*0.59-offset, decile*0.25+offset, windowWidth*0.59-offset, decile*1.75+offset, windowWidth*0.6625-offset, decile*1.75+offset)
	
	rect(windowWidth*0.5225-offset, decile*8.65+offset, windowWidth*0.2, decile*1.8) // Start button
	triangle(windowWidth*0.6224-offset, decile*9.55+offset, windowWidth*0.6224-offset, decile*7.75+offset, windowWidth*0.67-offset, decile*7.75+offset)
	rect(windowWidth*0.21-offset, decile*8.65+offset, windowWidth*0.38, decile*1.8) // Errors Box

	rectMode(CORNER)
	rect(windowWidth*0.7, 2.25*decile, windowWidth*0.3-decile/4, decile*7.7)

	stroke(0, 0)
	fill(...colour2, alpha) // Secondary colour fills
	rect(windowWidth*0.7+decile/10, 2.15*decile, windowWidth*0.3-decile/4, decile*7.7)
	rectMode(CENTER)
	triangle(windowWidth*0.59, decile*0.25, windowWidth*0.59, decile*1.75, windowWidth*0.6625, decile*1.75)
	rect(windowWidth*0.35, decile, windowWidth*0.48125, decile*1.5)
	rect(windowWidth*0.075, decile, windowWidth*0.025, decile*1.5)
	rect(windowWidth*0.04, decile, windowWidth*0.0125, decile*1.5)
	rect(windowWidth*0.02, decile, windowWidth*0.00625, decile*1.5)
	rect(windowWidth*0.5225, decile*8.65, windowWidth*0.2, decile*1.8) // Start button
	triangle(windowWidth*0.6224, decile*9.55, windowWidth*0.6224, decile*7.75, windowWidth*0.67, decile*7.75)

	rect(windowWidth*0.21, decile*8.65, windowWidth*0.38, decile*1.8) // Errors Box

	fill((colour1[0]+colour2[0])/2, (colour1[1]+colour2[1])/2, (colour1[2]+colour2[2])/2, alpha) // Avg colour
	rect(windowWidth*0.1775, decile*4.3, windowWidth*0.275, decile*1.5) // Black and white outlines interior boxes
	rect(windowWidth*0.5225, decile*4.3, windowWidth*0.275, decile*1.5)
	rect(windowWidth*0.1775, decile*6.05, windowWidth*0.275, decile*1.5)
	rect(windowWidth*0.5225, decile*6.05, windowWidth*0.275, decile*1.5)

	rect(windowWidth*0.1775, decile*2.75+5, windowWidth*0.15, decile*1) // Top bit
	rect(windowWidth*0.5225, decile*2.75+5, windowWidth*0.15, decile*1)

	triangle(windowWidth*0.252, (decile*2.75+5), windowWidth*0.252, (decile*2.75+5)-decile*0.5, windowWidth*0.315, (decile*2.75+5)-decile*0.5)
	triangle(windowWidth*0.252, (decile*2.75+5)+decile*0.5, windowWidth*0.252, (decile*2.75+5)-decile*0.5, windowWidth*0.2842, (decile*2.75+5)-decile*0.5)
	triangle(windowWidth*0.103, (decile*2.75+5), windowWidth*0.103, (decile*2.75+5)-decile*0.5, windowWidth*0.04, (decile*2.75+5)-decile*0.5)
	triangle(windowWidth*0.103, (decile*2.75+5)+decile*0.5, windowWidth*0.103, (decile*2.75+5)-decile*0.5, windowWidth*0.0715, (decile*2.75+5)-decile*0.5)

	triangle(windowWidth*0.597, (decile*2.75+5), windowWidth*0.597, (decile*2.75+5)-decile*0.5, windowWidth*0.66, (decile*2.75+5)-decile*0.5)
	triangle(windowWidth*0.597, (decile*2.75+5)+decile*0.5, windowWidth*0.597, (decile*2.75+5)-decile*0.5, windowWidth*0.62992, (decile*2.75+5)-decile*0.5)
	triangle(windowWidth*0.448, (decile*2.75+5), windowWidth*0.448, (decile*2.75+5)-decile*0.5, windowWidth*0.385, (decile*2.75+5)-decile*0.5)
	triangle(windowWidth*0.448, (decile*2.75+5)+decile*0.5, windowWidth*0.448, (decile*2.75+5)-decile*0.5, windowWidth*0.4165, (decile*2.75+5)-decile*0.5)


	fill(...colour1, alpha) // Corner negative triangles
	triangle(windowWidth, windowHeight*0.2, windowWidth, windowHeight*0.2+decile*0.75, windowWidth-decile*0.75, windowHeight*0.2)

	fill(...colour2, alpha)
	triangle(windowWidth*0.039, decile*5.06, windowWidth*0.039, decile*4.51, windowWidth*0.06, decile*5.06)
	triangle(windowWidth*0.316, decile*5.06, windowWidth*0.316, decile*4.51, windowWidth*0.295, decile*5.06)
	triangle(windowWidth*0.384, decile*5.06, windowWidth*0.384, decile*4.51, windowWidth*0.405, decile*5.06)
	triangle(windowWidth*0.661, decile*5.06, windowWidth*0.661, decile*4.51, windowWidth*0.64, decile*5.06)
	triangle(windowWidth*0.039, decile*6.81, windowWidth*0.039, decile*6.26, windowWidth*0.06, decile*6.81)
	triangle(windowWidth*0.316, decile*6.81, windowWidth*0.316, decile*6.26, windowWidth*0.295, decile*6.81)
	triangle(windowWidth*0.384, decile*6.81, windowWidth*0.384, decile*6.26, windowWidth*0.405, decile*6.81)
	triangle(windowWidth*0.661, decile*6.81, windowWidth*0.661, decile*6.26, windowWidth*0.64, decile*6.81)

	fill(255, alpha) // Text
	strokeWeight(3)
	stroke(0, alpha)
	textSize(1.5*decile)
	text(title, windowWidth*0.35, windowHeight*0.15)
	textSize(decile/4)
	textAlign(CORNER)
	rectMode(CORNERS)
	strokeWeight(1)
	if (!customAdvanced || title !== "Custom") {text(desc + "\n\n\n" + descHotkeys, windowWidth*0.7+decile/4, 2.5*decile, windowWidth*0.3-decile/4, decile*7.5)}

	textSize(decile*0.75)
	textAlign(CENTER)
	stroke(0, 0)
	fill(255, alpha)
	text("White", windowWidth*0.1775, decile*3.1)
	fill(0, alpha)
	text("Black", windowWidth*0.5225, decile*3.1)

	textAlign(LEFT)
	strokeWeight(0.4)
	fill(255, alpha)
	textSize(decile*0.4)
	text("Player:", windowWidth*0.05, decile*4)
	text("Timer:", windowWidth*0.05, decile*5.7)
	push()
	textSize(decile*0.6)
	text("<", windowWidth*0.075, decile*4.9)
	pop()
	fill(0, alpha)
	text("Player:", windowWidth*0.395, decile*4)
	text("Timer:", windowWidth*0.395, decile*5.7)
	push()
	textSize(decile*0.6)
	text("<", windowWidth*0.42, decile*4.9)
	pop()

	textAlign(RIGHT)
	fill(255, alpha)
	push()
	textSize(decile*0.6)
	text(">", windowWidth*0.28, decile*4.9)
	pop()
	text(`(${wPlayer}/5)`, windowWidth*0.305, decile*4)
	text("?", windowWidth*0.305, decile*5.7)
	fill(0, alpha)
	push()
	textSize(decile*0.6)
	text(">", windowWidth*0.625, decile*4.9)
	pop()
	text(`(${bPlayer}/5)`, windowWidth*0.65, decile*4)
	text("?", windowWidth*0.65, decile*5.7)

	textAlign(CENTER)
	textSize(decile*0.6)
	fill(255, alpha)
	text(players[wPlayer-1], windowWidth*0.1775, decile*4.9)
	text(":  +", windowWidth*0.1775, decile*6.525)

	fill(0, alpha)
	text(players[bPlayer-1], windowWidth*0.5225, decile*4.9)
	text(":  +", windowWidth*0.5225, decile*6.525)

	fill(255, alpha)
	strokeWeight(2)
	stroke(0, alpha)
	textSize(1.25*decile)
	text("Start!", windowWidth*0.5305, decile*9.075)

	let ratioX = mouseX/windowWidth
	let ratioY = mouseY/windowHeight
	textSize(decile/3)
	textAlign(CENTER, CENTER)
	rectMode(CENTER)
	if (0.525 <= ratioY && ratioY <= 0.575 && ((0.285 <= ratioX && ratioX <= 0.315) || (0.63 <= ratioX && ratioX <= 0.66))) {
		fill(...colour2, alpha)
		stroke(...colour3, alpha)
		rect(mouseX+windowWidth*0.155-decile*0.25, mouseY-decile*2.25, windowWidth*0.31, decile*5, decile/2)
		fill(255, alpha)
		stroke(0, alpha)
		strokeWeight(1) // No, there isnt an easier way to colour everything... I looked... :C
		text("Time is given in the format:\n\n\n\n\n\n\n\nNote that increment is given   \nin seconds and it refers to    \nthe time added after each move.", mouseX+windowWidth*0.155-decile*0.25, mouseY-decile*2.25)
		text("\n\n  :  + \n\n\n\n\n\n\n\n", mouseX+windowWidth*0.155-decile*0.25, mouseY-decile*2.25)
		fill(235, 192, 52)
		text("\n\nmm     \n\n\n\n\n\n\n\n", mouseX+windowWidth*0.155-decile*0.25, mouseY-decile*2.25)
		fill(90, 211, 219)
		text("\n\n   ss  \n\n\n\n\n\n\n\n", mouseX+windowWidth*0.155-decile*0.25, mouseY-decile*2.25)
		fill(151, 18, 204)
		text("\n\n      i\n\n\n\n\n\n\n\n", mouseX+windowWidth*0.155-decile*0.25, mouseY-decile*2.25)
		fill(235, 192, 52)
		text("\n\n\n\nm   minutes\n\n\n\n\n\n", mouseX+windowWidth*0.155-decile*0.25, mouseY-decile*2.25)
		fill(90, 211, 219)
		text("\n\n\n\n\ns   seconds\n\n\n\n\n", mouseX+windowWidth*0.155-decile*0.25, mouseY-decile*2.25)
		fill(151, 18, 204)
		text("\n\n\n\n\n\ni   increment\n\n\n\n", mouseX+windowWidth*0.155-decile*0.25, mouseY-decile*2.25)
		fill(255)
		text("\n\n\n\n  =        \n\n\n\n\n\n", mouseX+windowWidth*0.155-decile*0.25, mouseY-decile*2.25)
		text("\n\n\n\n\n  =        \n\n\n\n\n", mouseX+windowWidth*0.155-decile*0.25, mouseY-decile*2.25)
		text("\n\n\n\n\n\n  =          \n\n\n\n", mouseX+windowWidth*0.155-decile*0.25, mouseY-decile*2.25)
	}

	if (title === "Custom" && mode === "start") {
		push()
		fill(40, 126, 63)
		strokeWeight(0)
		rect(windowWidth*0.21, decile*9.2, decile*3.75, decile*0.5, decile/8)
		triangle(windowWidth*0.025, decile*8.95, windowWidth*0.025, decile*9.45, windowWidth*0.025 + decile/2, decile*9.45)
		triangle(windowWidth*0.395, decile*8.95, windowWidth*0.395, decile*9.45, windowWidth*0.395 - decile/2, decile*9.45)
		pop()

		textAlign(CORNER)
		text("FEN:", windowWidth*0.025, decile*8.125)
		text("Side to Move: White", windowWidth*0.025, decile*8.625)
		textAlign(CENTER)
		text("Advanced Settings", windowWidth*0.21, decile*9.125)
		textAlign(RIGHT)
		text("Black", windowWidth*0.395, decile*8.625)
		customMenu["fen"].position(windowWidth*0.075, decile*7.85)
		customMenu["fen"].size(windowWidth*0.3125, decile*0.5)
		customMenu["fen"].style("background-color: #287E3F")
		customMenu["side"].position(windowWidth*0.025 + decile*4.2, decile*8.5)
		customMenu["side"].size((windowWidth*0.395-decile*1.8) - (windowWidth*0.025 + decile*3.85))

		if (customAdvanced) {
			textAlign(LEFT)
			text("Passant Square:", windowWidth*0.7+decile*0.25, decile*3.5)
			text("Fullmoves:", windowWidth*0.7+decile*0.25, decile*4.25)
			text("Halfmoves:", windowWidth*0.7+decile*0.25, decile*5)
			text("If you don't understand any of this, you can look up 'Forsyth-Edwards Notation' on Wikipedia. If you break the game here, it's on you.", windowWidth*0.85 - decile*0.025, decile*8.5, windowWidth*0.275)

			textSize(decile/2)
			text("White", windowWidth*0.7+decile*0.75, decile*5.75)
			textAlign(RIGHT)
			text("Black", windowWidth-decile*0.8, decile*5.75)
			textAlign(CENTER)
			text("Advanced Settings", windowWidth*0.85 - decile*0.025, decile*2.5)
			fill(...colour3, alpha)
			strokeWeight(0)
			rect(windowWidth*0.85 - decile*0.025, decile*3, windowWidth*0.3-decile, decile*0.125)
			customMenu["target"].position(windowWidth*0.7+decile*3.4, decile*3.3)
			customMenu["target"].size(decile/12*5, decile/12*5)			
			customMenu["fullmoves"].position(windowWidth*0.7+decile*2.4, decile*4.05)
			customMenu["fullmoves"].size(decile/12*5, decile/12*5)
			customMenu["halfmoves"].position(windowWidth*0.7+decile*2.4, decile*4.8)
			customMenu["halfmoves"].size(decile/12*5, decile/12*5)
			customMenu["w1"].position(windowWidth*0.7+decile*0.75, decile*6.25)
			customMenu["w2"].position(windowWidth*0.7+decile*0.75, decile*6.75)
			customMenu["b1"].position(windowWidth-decile*2.25, decile*6.25)
			customMenu["b2"].position(windowWidth-decile*2.25, decile*6.75)
		} else {
			customMenu["target"].position(-windowWidth, 0)
			customMenu["halfmoves"].position(-windowWidth, 0)
			customMenu["fullmoves"].position(-windowWidth, 0)
			customMenu["w1"].position(-windowWidth, 0)
			customMenu["w2"].position(-windowWidth, 0)
			customMenu["b1"].position(-windowWidth, 0)
			customMenu["b2"].position(-windowWidth, 0)
		}
	}
	pop()
}

function drawPuzzles() {
	let alpha = (puzzleCounter !== false) ? 255 : 255 - (255 * factor(backPuzzlesStartTime, 500, "sine"))
	let secsPassed = floor(((puzzlesFinish ? puzzlesFinish : time)-puzzlesStartTime)/1000)
	let mins = String(floor(secsPassed / 60))
	let secs = (secsPassed % 60).toLocaleString('en-US', {minimumIntegerDigits: 2})
	push()
	rectMode(CENTER)
	textAlign(CENTER)
	imageMode(CENTER)
	strokeWeight(0)
	textSize(decile)

	fill(25, alpha)
	rect((windowWidth+decile*9)/2, decile*5.875, decile*5.5, decile*6.5, decile*0.35)
	rect((windowWidth+decile*9)/2, decile*1.725, decile*3.1125, decile*1.25)
	triangle((windowWidth+decile*9)/2 + decile*1.55, decile*1.1, (windowWidth+decile*9)/2 + decile*1.55, decile*2.35, (windowWidth+decile*9)/2 + decile*2.05, decile*1.725)
	triangle((windowWidth+decile*9)/2 - decile*1.55, decile*1.1, (windowWidth+decile*9)/2 - decile*1.55, decile*2.35, (windowWidth+decile*9)/2 - decile*2.05, decile*1.725)

	fill(100, alpha)
	rect((windowWidth+decile*9)/2, decile*1.625, decile*3.0125, decile*1.25)
	triangle((windowWidth+decile*9)/2 + decile*1.5, decile, (windowWidth+decile*9)/2 + decile*1.5, decile*2.25, (windowWidth+decile*9)/2 + decile*2, decile*1.625)
	triangle((windowWidth+decile*9)/2 - decile*1.5, decile, (windowWidth+decile*9)/2 - decile*1.5, decile*2.25, (windowWidth+decile*9)/2 - decile*2, decile*1.625)


	fill(175, alpha)
	text(mins + ":" + secs, (windowWidth+decile*9)/2, decile*2)

	if (puzzleCounter !== false) {
		fill(puzzlesData[puzzleCounter][3] ? 230 : 25)
		rect((windowWidth+decile*9)/2, decile*5.375, decile*5.23, decile*5.25, decile/4)

		textSize(decile/2)
		fill(!puzzlesData[puzzleCounter][3] ? 230 : 25)
		text(puzzlesData[puzzleCounter][3] ? "White to Move" : "Black to Move", (windowWidth+decile*9)/2, decile*3.375)
		rect((windowWidth+decile*9)/2 - decile*1.2, decile*3.5, decile*1.5, decile/20)
	}

	fill(75, alpha)
	rect((windowWidth+decile*9)/2, decile*6.375, decile*5.25, decile*5.25, 0, 0, decile/4, decile/4)


	noSmooth()
	for (let i = -2; i <= 2; i++) {
		for (let j = -2; j <= 2; j++) {
			let result = puzzleResults[(j+2)*5 + i+2]
			if (result !== null) {
				tint(255, alpha)
				image(result ? correctImg : incorrectImg, (windowWidth+decile*9)/2 + decile*i, decile*6.375 + decile*j, decile*0.75, decile*0.75)
			} else {
				fill(50, alpha)
				square((windowWidth+decile*9)/2 + decile*i, decile*6.375 + decile*j, decile*0.75)
			}
		}
	}
	smooth()
	pop()
}

function drawCredits() {
	let alpha = (buttons.divs["top"].html() === "Secret") ? 255 : 255 - (255 * factor(backCreditsStartTime, 500, "sine"))
	push()
	rectMode(CORNER)
	strokeWeight(0)

	fill(0, alpha) // shadow thingy
	rect(decile*9, decile, decile*0.125, decile*0.125)

	fill(150, 100, 215, alpha) // main background
	rect(decile*9.125, decile, decile*7, decile*1.5)
	rect(decile*9.125, decile*2.5, windowWidth-decile*9.25, decile*6.5)
	triangle(decile*16.12, decile, decile*16.12, decile*2.5, decile*17, decile*2.5)
	triangle(decile*16.12, decile*1.5, decile*16.12, decile*2.5, decile*19, decile*2.5)
	triangle(decile*16.12, decile*2, decile*16.12, decile*2.5, windowWidth-decile*0.125, decile*2.51)

	rectMode(CORNERS) // darkest shade
	fill(100, 50, 175, alpha)
	rect(decile*9.35, decile*2.5, windowWidth-decile*5, decile*2.65)
	triangle(windowWidth-decile*5, decile*2.5, windowWidth-decile*4.85, decile*2.5, windowWidth-decile*5, decile*2.65)

	rect(decile*15.5, decile*1.1, decile*15.6, decile*2.25)
	rect(decile*9.325, decile*3.1, windowWidth-decile*0.35, decile*6.85)
	rect(decile*9.325, decile*7.7, windowWidth-decile*0.35, decile*8.85)

	fill(200, 150, 255, alpha) // text highlight colour
	rect(decile*9.225, decile*1.1, decile*15.5, decile*2.25)
	rect(decile*9.225, decile*3, windowWidth-decile*0.25, decile*6.75)
	rect(decile*9.225, decile*7.6, windowWidth-decile*0.25, decile*8.75)


	fill(100, 50, 175, alpha) // underlining the word "You"
	rect(decile*12.5, decile*8.5, decile*13.75, decile*8.6)


	fill(53, 30, 100, alpha)
	textSize(decile)
	text("Thanks to:", decile*9.25, decile*2)
	textSize(decile*0.75)
	text("p5.js - Graphics Library\nPixabay - Sound Effects\nCBurnett - Chess Pieces\nKode Mono - Text Font\n\n...and YOU, for playing!", decile*9.25, decile*3.75)
	pop()
}

function drawSettings() {
	for (let slider in volumeSliders) {volumeSliders[slider].style(`width: 44vh;`)}
	push()
	rectMode(CENTER)
	textAlign(CENTER)
	strokeWeight(0)

	fill(50)
	rect(windowWidth/2, windowHeight/2, windowWidth, windowHeight)
	fill(155)
	rect(windowWidth/2, windowHeight/2, windowWidth-decile, decile*9, decile/2)

	fill(125)
	rect(decile*3.25, decile*1.4, decile*5, decile*1.25, decile/5, 0, 0, decile/5)
	rect(decile*6.75, decile*1, decile*7, decile*0.03125)
	rect(decile*6.75, decile*1.2, decile*7, decile*0.0625)
	rect(decile*6.75, decile*1.4, decile*7, decile*0.125)
	rect(decile*6.75, decile*1.6, decile*7, decile*0.0625)
	rect(decile*6.75, decile*1.8, decile*7, decile*0.03125)

	for (let v = 0; v <= 4.5; v += 1.5) {
		triangle(decile*(5.75+v), decile*2.025, decile*(5.75+v), decile*0.775, decile*(6.375+v), decile*1.4)
		triangle(decile*(5.75+v), decile*2.025, decile*(5.75+v), decile*1.4, decile*(5.125+v), decile*2.025)
		triangle(decile*(5.75+v), decile*0.775, decile*(5.75+v), decile*1.4, decile*(5.125+v), decile*0.775)
	}
	fill(50)
	textSize(decile)
	text("Settings", decile*3.25, decile*1.75)

	fill(175)
	square(windowWidth/2-decile, decile*3.15, decile*1.8)
	square(windowWidth/2+decile, decile*3.15, decile*1.8)
	triangle(windowWidth/2-decile*1.9, decile*2.25, windowWidth/2-decile*1.9, decile*4.05, windowWidth/2-decile*2.75, decile*4.05)
	triangle(windowWidth/2+decile*1.9, decile*2.25, windowWidth/2+decile*1.9, decile*4.05, windowWidth/2+decile*2.75, decile*4.05)
	triangle(windowWidth/2-decile*0.1, decile*4.05, windowWidth/2-decile*2.75, decile*4.05, windowWidth/2-decile*0.1, decile*4.75)
	triangle(windowWidth/2+decile*0.1, decile*4.05, windowWidth/2+decile*2.75, decile*4.05, windowWidth/2+decile*0.1, decile*4.75)

	strokeWeight(3); stroke(50)
	fill(...boardColours[0])
	square(windowWidth/2-decile, decile*3.15, decile*1.5, decile/8)
	fill(...boardColours[1])
	square(windowWidth/2+decile, decile*3.15, decile*1.5, decile/8)
	strokeWeight(0)

	fill(175) // Board Preview
	square(windowWidth/2, decile*6.75, decile*3.5, decile/8)
	rect(windowWidth/2 - decile*2.25, decile*6.75, decile/4, decile*3.5, decile/8)
	rect(windowWidth/2 + decile*2.25, decile*6.75, decile/4, decile*3.5, decile/8)
	fill(...boardColours[1])
	square(windowWidth/2, decile*6.75, decile*3)
	strokeWeight(0)
	fill(...boardColours[0])
	square(windowWidth/2 + decile*0.75, decile*7.5, decile*1.5)
	square(windowWidth/2 - decile*0.75, decile*6, decile*1.5)

	drawColourPicker(false)

	fill(75)
	rectMode(CORNER)
	arc(decile, decile*9, decile, decile, HALF_PI, PI)
	stroke(75); strokeWeight(1)
	rect(decile, decile*8.75, windowWidth*0.6-decile, decile*0.75)
	rect(decile/2, decile*8.75, windowWidth*0.6-decile, decile*0.25)
	triangle(windowWidth*0.6, decile*8.75, windowWidth*0.6, decile*9.5, windowWidth*0.6+decile*1.25, decile*9.5)
	strokeWeight(0)

	fill(175)
	rect(decile*0.75, decile*2.25, decile*5, decile*1.8, decile/8, 0, 0, decile/8)
	rect(decile*0.75, decile*4.25, decile*5, decile*1.8, decile/8, 0, 0, decile/8)
	triangle(decile*5.75, decile*2.25, decile*5.75, decile*4.05, decile*6.5, decile*2.5)
	triangle(decile*5.75, decile*4.25, decile*5.75, decile*6.05, decile*6.5, decile*4.5)

	fill(250, 50, 50) // Reset Defaults Button
	rect(decile*0.75, decile*6.55, decile*4.75, decile*1.8, decile/10)
	fill(155); stroke(155); strokeWeight(2)
	triangle(decile*0.75, decile*7.6, decile*0.75, decile*8.35, decile*1.75, decile*8.35)
	triangle(decile*5.5, decile*7.2, decile*5.5, decile*6.55, decile*4.5, decile*6.55)
	strokeWeight(0)

	textSize(decile/2)
	textAlign(LEFT)
	fill(200)
	text(`Now Playing: ${playingSong}`, decile, decile*9.3)

	fill(75)
	textSize(decile*0.66)
	text("Music Volume", decile*0.875, decile*3)
	text("SFX Volume", decile*0.875, decile*5)
	fill(150, 1, 3)
	text("Restore\n   Defaults", decile*0.875, decile*7.25)

	textAlign(CENTER, CENTER)
	strokeWeight(3); stroke(50)
	fill(255)
	text("Board\nPreview", windowWidth/2, decile*6.75)

	textSize(decile/5); strokeWeight(1)
	fill(75)
	text("Lighter\nBoard\nColour", windowWidth/2-decile, decile*3.125)
	fill(175)
	text("Darker\nBoard\nColour", windowWidth/2+decile, decile*3.125)

	volumeSliders["music"].position(decile, decile*3.5)
	volumeSliders["sfx"].position(decile, decile*5.5)
	pop()
}

function drawColourPicker() {
	let offset = windowWidth/2 - decile*3.75
	push()
	rectMode(CENTER)
	strokeWeight(0)
	fill(200)
	rect(windowWidth/2 + offset, decile*5, decile*5, decile*7.5, decile/2)

	fill(colourSliders["red"].value(), colourSliders["green"].value(), colourSliders["blue"].value())
	rect(windowWidth/2 + offset, decile*3.75, decile*4.5, decile*4.5, decile/3)

	for (let slider in colourSliders) {colourSliders[slider].style(`width: 35vh; accent-color: ${slider}`)}

	colourSliders["red"].position(windowWidth/2 + offset - decile*2.25, decile*6.25)
	colourSliders["green"].position(windowWidth/2 + offset - decile*2.25, decile*6.75)
	colourSliders["blue"].position(windowWidth/2 + offset - decile*2.25, decile*7.25)

	if (colourPickerMode) {
		fill(102, 171, 42)
		rect(windowWidth/2 + offset - decile*1.25, decile*8.15, decile*2, decile*0.85, decile/5)
		fill(201, 1, 3)
		rect(windowWidth/2 + offset + decile*1.25, decile*8.15, decile*2, decile*0.85, decile/5)

		fill(50)
		textSize(decile/2)
		textAlign(CENTER)
		text("Save", windowWidth/2 + offset - decile*1.25, decile*8.3)
		text("Exit", windowWidth/2 + offset + decile*1.25, decile*8.3)
	} else {
		fill(50)
		textSize(decile/2)
		textAlign(CENTER)
		text("Nothing Selected", windowWidth/2 + offset, decile*8.3)
	}


	textAlign(CENTER, TOP)
	textSize(decile/4)
	fill(255, 0, 0)
	text(colourSliders["red"].value(), windowWidth/2 + offset + decile*1.85, decile*6.25)
	fill(0, 128, 0)
	text(colourSliders["green"].value(), windowWidth/2 + offset + decile*1.85, decile*6.75)
	fill(0, 0, 255)
	text(colourSliders["blue"].value(), windowWidth/2 + offset + decile*1.85, decile*7.25)
	pop()

}

function generate960() {
	let arr960 = Array(8).fill("N")
	let arrNums = Array.from({length: 8}, (_, i)=> i)
	let kingPos = floor(random(1, 7))
	let lRook = floor(random(0, kingPos)), rRook = floor(random(kingPos+1, 8))
	arr960[kingPos] = "K"
	arr960[lRook] = "R"
	arr960[rRook] = "R"
	arrNums = arrNums.filter(v => ![kingPos, lRook, rRook].includes(v))
	let lBishop = random(arrNums)
	let rBishop = random(arrNums.filter(v => v % 2 !== (lBishop % 2 === 0 ? 0 : 1)))
	arr960[lBishop] = "B"
	arr960[rBishop] = "B"
	arrNums = arrNums.filter(v => ![lBishop, rBishop].includes(v))
	arr960[random(arrNums)] = "Q"

	return arr960.join("")
}

function mouseHover() {
	if (menuDebounce) {
		if (this.html() === "Back" && backDebounce) {
			if (buttons.divs["top"].html() !== "Play") {
				sfx["hover"].play()
				this.style("width: 17vw; left: 82vw; background-color: #F44336")
			}
		} else if (mode === "menu") {
			sfx["hover"].play()
			this.style(`width: ${buttons.width[this.html()] + 10}vw; background-color: ${buttons.vColour[this.html()]}`)
		}
	}
}

function mouseNotHover() {
	if (menuDebounce) {
		if (this.html() === "Back" && backDebounce) {
			this.style("width: 14vw; left: 85vw; background-color: #4A4A4A")
		} else if (mode === "menu") {
			this.style(`width: ${buttons.width[this.html()]}vw; background-color: ${buttons.uColour[this.html()]}`)
		}
	}
}

function mouseClickedElement() {
	let clickedButton = this.html()

	if (menuDebounce && mode === "menu") {
		switch (clickedButton) {
			case "Play":
			case "Puzzles":
			case "Credits":
				sfx["click1"].play()
				break
	
			case "Standard":
			case "Chess960":
			case "Custom":
			case "Classic":
			case "Rhythm":
			case "Solo":
				sfx["click2"].play()
		}
	}

	if (clickedButton === "Back") { ///// If back button pressed
		if (puzzleCounter !== false) {backPuzzlesStartTime = time; puzzleCounter = false}
		else if (mode === "game") {backTime = time}
		else if (mode === "start") {backMenuStartTime = time}
		else if (buttons.divs["top"].html() === "Secret") {backCreditsStartTime = time; buttons.divs["top"].html("Secret 2: Electric Boogaloo")}
		mode = "menu"
		backDebounce = false
		sfx["back"].play()
		if (buttons.divs["top"].html() !== "Play") {
			let prevButtons = {
				"top": "Play",
				"middle": "Puzzles",
				"bottom": "Credits"
			}
			for (let div in buttons.divs) {
				buttons.divs[div].style("opacity: 0; width: 0vw")
			}

			// Remove back button
			backButton.style("opacity: 0; background-color: #4A4A4A; width: 0vw; left: 100vw")

			setTimeout(() => {
				menuDebounce = true
				backDebounce = true
				for (let v of ["top", "middle", "bottom"]) {
					let newText = prevButtons[v]
					buttons.divs[v].html(newText)
					buttons.divs[v].style(`opacity: 0.9; background-color: ${buttons.uColour[newText]}; width: ${buttons.width[newText]}vw`)
				}
			}, 750)
		} else {menuDebounce = true}


	} else if (menuDebounce && mode === "menu") {
		menuDebounce = false

  		if (["Play", "Puzzles", "Credits"].includes(clickedButton)) { // every other button
			for (let div in buttons.divs) {
				buttons.divs[div].style("opacity: 0; width: 0vw")

				if (clickedButton !== "Play") { //////// Non-Play TRANSITION
					clickedTime = time
					transitionDuration = 750
					currentTransition = ["fadeIn", "sine"]
					setTimeout(() => {
						clickedTime = time
						currentTransition = ["fadeOut", "cosine"]
						transitionDuration = 250
						setTimeout(() => {
							transitionDivs["div1"].position(0, 0)
							transitionDivs["div1"].size(0, 0)
							transitionDivs["div2"].position(0, 0)
							transitionDivs["div2"].size(0, 0)
							currentTransition = [null, null]
						}, 250)
					}, 750)
				}

				setTimeout(() => {
					menuDebounce = true // Bring back back button
					backButton.style("width: 14vw; left: 85vw; opacity: 0.9; background-color: #4A4A4A")

					if (clickedButton === "Puzzles") {
						puzzlesStartTime = time
						puzzlesFinish = false
						puzzleCounter = 0
						puzzleResults = Array(25).fill(null)
						puzzleValid = [...puzzlesData[0][1]]
						puzzleBots = [...puzzlesData[0][2]]
						mode = "game"
						game.status = "killed"
						game = new Chess(puzzlesData[0][0], "Human", "Human", Infinity, Infinity, Infinity, Infinity, puzzlesData[0][3])
					} 

					for (let v of ["top", "middle", "bottom"]) {
						let newText = buttons[clickedButton][v]
						buttons.divs[v].html(newText)
						buttons.divs[v].style(`opacity: ${clickedButton !== "Play" ? 0 : 0.9}; background-color: ${buttons.uColour[newText]}; width: ${clickedButton === "Puzzles" ? 0 : buttons.width[newText]}vw`)
					}
				}, 750)
			}
		} else if (["Standard", "Chess960", "Custom"].includes(clickedButton)) { ///// Standard Gamemode /////
			clickedTime = time
			transitionDuration = 250
			currentTransition = ["fadeIn", "sine"]

			if (clickedButton === "Standard") {
				// menuPreset = ["Standard", descStandard, [203, 205, 209], [132, 133, 135], [71, 72, 74]]
				menuPreset = ["Standard", descStandard, [51, 153, 255], [0, 77, 153], [0, 34, 102]]
			} else if (clickedButton === "Chess960") {
				menuPreset = ["Chess960", desc960, [212, 111, 17], [133, 71, 15], [71, 41, 14]]
			} else {
				menuPreset = ["Custom", descCustom, [50, 168, 82], [29, 84, 44], [21, 46, 28]]
			}

			backButton.style("opacity: 0; background-color: #4A4A4A; width: 0vw; left: 100vw")
			for (let v of ["top", "middle", "bottom"]) {
				let newText = buttons.divs[v].html()
				buttons.divs[v].html(newText)
				buttons.divs[v].style(`opacity: 0; background-color: ${buttons.uColour[newText]}; width: 0vw`)
			}
			
			setTimeout(() => { // Fade out | part, sine | START MENU
				mode = "start"

				timeInputs["wMins"].value("10"); timeInputs["wSecs"].value("00"); timeInputs["wIncr"].value("0")
				timeInputs["bMins"].value("10"); timeInputs["bSecs"].value("00"); timeInputs["bIncr"].value("0")
				wPlayer = 1; bPlayer = 1
				clickedTime = time
				currentTransition = ["fadeOut", "cosine"]
				
				setTimeout(() => {
					menuDebounce = true
					transitionDivs["div1"].position(0, 0)
					transitionDivs["div1"].size(0, 0)
					transitionDivs["div2"].position(0, 0)
					transitionDivs["div2"].size(0, 0)
					currentTransition = [null, null]
					backButton.style("width: 14vw; left: 85vw; opacity: 0.9; background-color: #4A4A4A")
				}, 250)
			}, 250)
		} else {menuDebounce = true}
	}
}

function transition(start, duration, type, style="linear") {
	push()
	let col = 0
	fill(col)
	stroke(0, 0)
	let t = factor(start, duration, style)
	switch (type) {
		////////// Transition In //////////
		case "ribbon":
			let slide = lerp(0, sqrt((windowWidth+windowHeight/2)**2/2), t)
			transitionDivs["div1"].position(0, -windowWidth*5)
			transitionDivs["div1"].size(slide, windowWidth*10)
			transitionDivs["div1"].style("background-color: black; transform-origin: 0% 50%; transform: rotate(45deg); opacity: 1")

			transitionDivs["div2"].position(0, windowHeight-windowWidth*5)
			transitionDivs["div2"].size(slide, windowWidth*10)
			transitionDivs["div2"].style("background-color: black; transform-origin: 0% 50%; transform: rotate(-45deg); opacity: 1")
			break

		case "shutter":
			let slantAng = atan2(windowWidth, windowHeight)
			transitionDivs["div1"].position(0, -windowWidth*5)
			transitionDivs["div1"].size(lerp(0, windowWidth*sin(HALF_PI-slantAng), t), windowWidth*10)
			transitionDivs["div1"].style(`background-color: black; transform-origin: 0% 50%; transform: rotate(${slantAng}rad); opacity: 1`)

			transitionDivs["div2"].position(windowWidth, windowHeight-windowWidth*5)
			transitionDivs["div2"].size(lerp(0, windowWidth*sin(HALF_PI-slantAng), t), windowWidth*10)
			transitionDivs["div2"].style(`background-color: black; transform-origin: 0% 50%; transform: rotate(${PI+slantAng}rad); opacity: 1`)

			push(); stroke(col); strokeWeight(3); if (t === 1) {line(0, windowHeight, windowWidth, 0)}; pop()
			break

		case "drop":
			transitionDivs["div1"].position(0, 0)
			transitionDivs["div1"].size(windowWidth, lerp(0, windowHeight, t))
			transitionDivs["div1"].style(`background-color: black; transform: rotate(0deg); transform-origin: center;`)

			transitionDivs["div2"].position(0, 0)
			transitionDivs["div2"].size(0, 0)
			break

		case "slide":
			transitionDivs["div1"].position(0, 0)
			transitionDivs["div1"].size(lerp(0, windowWidth, t), windowHeight)
			transitionDivs["div1"].style("background-color: black; transform: rotate(0deg); transform-origin: center; opacity: 1")

			transitionDivs["div2"].position(0, 0)
			transitionDivs["div2"].size(0, 0)
			break

		case "fadeIn":
			transitionDivs["div1"].position(0, 0)
			transitionDivs["div1"].size(windowWidth, windowHeight)
			transitionDivs["div1"].style(`background-color: black; transform: rotate(0deg); transform-origin: center; opacity: ${t}`)

			transitionDivs["div2"].position(0, 0)
			transitionDivs["div2"].size(0, 0)
			break

		////////// Transition Out //////////
		case "pull":
			transitionDivs["div1"].position(0, 0)
			transitionDivs["div1"].size(windowWidth/2, lerp(windowHeight, 0, min(t*2, 1)))
			transitionDivs["div1"].style("background-color: black; transform: rotate(0deg); transform-origin: center; opacity: 1")

			transitionDivs["div2"].position(windowWidth/2, lerp(0, windowHeight, t >= 0.5 ? (t-0.5)*2 : 0))
			transitionDivs["div2"].size(windowWidth/2, lerp(windowHeight, 0, t >= 0.5 ? (t-0.5)*2 : 0))
			transitionDivs["div2"].style("background-color: black; transform: rotate(0deg); transform-origin: center; opacity: 1")
			break

		case "fadeOut": //// NEEDS RESETTING
			transitionDivs["div1"].position(0, 0)
			transitionDivs["div1"].size(windowWidth, windowHeight)
			transitionDivs["div1"].style(`background-color: black; transform: rotate(0deg); transform-origin: center; opacity: ${1-t}`)

			transitionDivs["div2"].position(0, 0)
			transitionDivs["div2"].size(0, 0)
			break

		case "lift":
			transitionDivs["div1"].position(0, 0)
			transitionDivs["div1"].size(windowWidth, lerp(windowHeight, 0, t))
			transitionDivs["div1"].style("background-color: black; transform: rotate(0deg); transform-origin: center; opacity: 1")

			transitionDivs["div2"].position(0, 0)
			transitionDivs["div2"].size(0, 0)
			break

		case "part":
			transitionDivs["div1"].position(0, 0)
			transitionDivs["div1"].size(lerp(windowWidth/2, 0, t), windowHeight)
			transitionDivs["div1"].style("background-color: black; transform: rotate(0deg); transform-origin: center; opacity: 1")

			transitionDivs["div2"].position(lerp(windowWidth/2, windowWidth, t), 0)
			transitionDivs["div2"].size(lerp(windowWidth/2, 0, t), windowHeight)
			transitionDivs["div2"].style(`background-color: black; transform: rotate(0deg); transform-origin: center; opacity: 1`)
			break
	} pop()
}

function factor(start, duration, style="linear") {
	let x = min(1, (time - start) / duration)
	switch (style) {
		case "sine":
			return sin(HALF_PI * x)

		case "cosine":
			return cos(HALF_PI * x + PI) + 1

		case "circular":
			return sqrt(2*x - x**2)

		case "exponential":
			return 1000 ** (x-1)

		case "elastic":
			return 1 - (x - 1)**2 * cos(7*x)

		case "bounce":
			return 1 - (x - 1)**2 * abs(cos(7*x))
		
		case "linear":
			return x

		default:
			return x**style
	}
}

function getRankandFileFromMouse(x, y) {
	if (min(x,y) > decile && max(x,y) < 9 * decile) {
		let rank = floor(x/decile)
		let file = floor(y/decile)
		if (!game.flip) {rank = 9 - rank; file = 9 - file}
		return [rank, file]
	}
	return [false, false]
}

function convertAlgebraic(coord) {
    coord = coord.toLowerCase()
    let x = coord.slice(0).charCodeAt() - 96
    let y = 9 - Number(coord.slice(1))
    
    if (max(x, y) > 8 || min(x, y) < 1 || coord.length !== 2 || isNaN(y)) {
        return [false, false]
    } return [x, y]
}

function mousePressed() {
	let [rank, file] = getRankandFileFromMouse(mouseX, mouseY)
	if (!rank || !file) {mouseBuffer = [false, false, false]}
	if (mode === "game") {
		if (game.status !== "active" && rank === 7 && file === 3) {game.status = "finish"}
		if (mouseButton === LEFT) {
			if (windowHeight*0.05 <= mouseY && mouseY <= windowHeight*0.15) { // Utility buttons
				if (windowWidth*0.65 <= mouseX && mouseX <= windowWidth*0.65+decile) {
					// Restart
					game.resetBoard()
				} else if (windowWidth*0.7 <= mouseX && mouseX <= windowWidth*0.7+decile) {
					// Undo
					game.undoMove()
				} else if (windowWidth*0.75 <= mouseX && mouseX <= windowWidth*0.75+decile) {
					// Flip
					game.flip = !game.flip
				} else if (windowWidth*0.8 <= mouseX && mouseX <= windowWidth*0.8+decile) {
					game.printMoves()
					// Print
				}
			}
			game.highlightSquares = []; game.arrowSquares = []

			if (game.mode === "promo") { // Promotion
				let promoRank = floor(mouseX/decile)
				let promoFile = floor(mouseY/decile)
				if (min(promoRank, promoFile) >= 4 && max(promoRank, promoFile) <= 5) {
					let piece
					if (promoRank === 4 && promoFile === 4) {
						piece = game.turn ? "Q" : "q"
					} else if (promoRank === 5 && promoFile === 4) {
						piece = game.turn ? "R" : "r"
					} else if (promoRank === 4 && promoFile === 5) {
						piece = game.turn ? "N" : "n"
					} else if (promoRank === 5 && promoFile === 5) {
						piece = game.turn ? "B" : "b"
					}

					game.mode = "board"
					game.updateAttributes(game.handleMove(...game.promoSquare, piece, false))
				}
			}
		}

		if (rank && file) {
			if (mouseBuffer[2] === true && mouseButton === LEFT) {
				if ((mouseBuffer[0] !== rank || mouseBuffer[1] !== file) && mouseButton === LEFT && (game.turn ? game.whitePlayer : game.blackPlayer) === "Human") {
					let move = game.handleMove(mouseBuffer[0], mouseBuffer[1], rank, file)
					if (move && game.mode !== "promo") {game.updateAttributes(move)}
				} mouseBuffer = [false, false, false]
				
			} else if (mouseButton !== LEFT || game.board[file-1][rank-1] !== "#") {
				mouseBuffer = [rank, file, mouseButton]
			} else {mouseBuffer = [false, false, false]}
		} else {mouseBuffer = [false, false, false]}

		if (decile*8 <= mouseY && mouseY <= decile*9) { // Move History Buttons
			let buttonWidth = decile * 15.25 + (windowWidth - decile * 1.75)
			let _buttonWidth = decile * 15.25 - (windowWidth - decile * 1.75)
			if (buttonWidth/2 + _buttonWidth*0.7275 <= mouseX && mouseX <= buttonWidth/2 + _buttonWidth*0.3975) {
				game.move = 0
			} else if (buttonWidth/2 + _buttonWidth*0.3525 <= mouseX && mouseX <= buttonWidth/2 + _buttonWidth*0.0225) {
				game.move = max(game.move-1, 0)
			} else if (buttonWidth/2 - _buttonWidth*0.0225 <= mouseX && mouseX <= buttonWidth/2 - _buttonWidth*0.3525) {
				game.move = min(game.move+1, game.boardHistory.length-1)
			} else if (buttonWidth/2 - _buttonWidth*0.3975 <= mouseX && mouseX <= buttonWidth/2 - _buttonWidth*0.7275) {
				game.move = game.boardHistory.length - 1
			}
		} if (rank && file) {game.move = game.boardHistory.length - 1}
	
	} else if (mode === "start") {
		//rect(windowWidth*0.21, decile*9.2, decile*3.75, decile*0.5, decile/8)
		if (menuPreset[0] === "Custom" && windowWidth*0.21 - decile*1.875 <= mouseX && mouseX <= windowWidth*0.21 + decile*1.875 && decile*8.95 <= mouseY && mouseY <= decile*9.45) {customAdvanced = !customAdvanced}

		if (menuDebounce && windowWidth*0.4225 <= mouseX && mouseX <= windowWidth*0.6225 && decile*7.75 <= mouseY && mouseY <= decile*9.55) {
			menuDebounce = false // Start Button
			sfx["click3"].play()
			clickedTime = time
			transitionDuration = 1500
	
			if (menuPreset[0] === "Standard") {
				currentTransition = ["ribbon", "linear"]
			} else if (menuPreset[0] === "Chess960") {
				currentTransition = ["shutter", "bounce"]
			} else {
				currentTransition = ["slide", "sine"]
			}
	
			backButton.style("opacity: 0; background-color: #4A4A4A; width: 0vw; left: 100vw")
			for (let v of ["top", "middle", "bottom"]) {
				let newText = buttons.divs[v].html()
				buttons.divs[v].html(newText)
				buttons.divs[v].style(`opacity: 0; background-color: ${buttons.uColour[newText]}; width: 0vw`)
			}
			
			setTimeout(() => {
				mode = "game"
				for (let box in timeInputs) { // Input validation.
					if (isNaN(timeInputs[box].value())) {
						if (box.slice(0, 1) === "w") {
							timeInputs["wMins"].value("10"); timeInputs["wSecs"].value("00"); timeInputs["wIncr"].value("0")
						} else {
							timeInputs["bMins"].value("10"); timeInputs["bSecs"].value("00"); timeInputs["bIncr"].value("0")
						}
					}
				}

				clickedTime = time
				startFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"
				game.status = "killed" // kills previous game
				if (menuPreset[0] === "Standard") {
					game = new Chess(startFEN, players[wPlayer-1], players[bPlayer-1], game.timeToMs(timeInputs["wMins"].value(), timeInputs["wSecs"].value()), game.timeToMs(timeInputs["bMins"].value(), timeInputs["bSecs"].value()), timeInputs["wIncr"].value()*1000, timeInputs["bIncr"].value()*1000)
					currentTransition = ["lift", "cosine"]
				} else if (menuPreset[0] === "Chess960") {
					let startPos = generate960()
					startFEN = `${startPos.toLowerCase()}/pppppppp/8/8/8/8/PPPPPPPP/${startPos}`
					game = new Chess(startFEN, players[wPlayer-1], players[bPlayer-1], game.timeToMs(timeInputs["wMins"].value(), timeInputs["wSecs"].value()), game.timeToMs(timeInputs["bMins"].value(), timeInputs["bSecs"].value()), timeInputs["wIncr"].value()*1000, timeInputs["bIncr"].value()*1000)
					currentTransition = ["part", "sine"]
				} else {
					game = new Chess(customMenu["fen"].value(), players[wPlayer-1], players[bPlayer-1], game.timeToMs(timeInputs["wMins"].value(), timeInputs["wSecs"].value()), game.timeToMs(timeInputs["bMins"].value(), timeInputs["bSecs"].value()), timeInputs["wIncr"].value()*1000, timeInputs["bIncr"].value()*1000, !customMenu["side"].value(), [customMenu["w1"].checked(), customMenu["w2"].checked(), customMenu["b1"].checked(), customMenu["b2"].checked()], convertAlgebraic(customMenu["target"].value()), Number(customMenu["halfmoves"].value()), Number(customMenu["fullmoves"].value()))
					currentTransition = ["pull", "sine"]
				}			
				setTimeout(() => {
					menuDebounce = true
					currentTransition = [null, null]
					backButton.style("width: 14vw; left: 85vw; opacity: 0.9; background-color: #4A4A4A")
				}, 1500)
			}, 1750)
		} else if (decile*4.25 <= mouseY && mouseY <= decile*5.1) { // Switch player.
			if (windowWidth*0.065 <= mouseX && mouseX <= windowWidth*0.105) {
				wPlayer = wPlayer === 1 ? 5 : wPlayer-1
			} else if (windowWidth*0.25 <= mouseX && mouseX <= windowWidth*0.29) {
				wPlayer = wPlayer === 5 ? 1 : wPlayer+1
			} else if (windowWidth*0.405 <= mouseX && mouseX <= windowWidth*0.445) {
				bPlayer = bPlayer === 1 ? 5 : bPlayer-1
			} else if (windowWidth*0.595 <= mouseX && mouseX <= windowWidth*0.635) {
				bPlayer = bPlayer === 5 ? 1 : bPlayer+1
			}
		}
	} else if (mode === "settings") {
		if (decile*2.4 <= mouseY && mouseY <= decile*3.9) {
			if (windowWidth/2 - decile*1.75 <= mouseX && mouseX <= windowWidth/2 - decile*0.25) {
				colourPickerMode = 1
				colourSliders["red"].value(boardColours[0][0])
				colourSliders["green"].value(boardColours[0][1])
				colourSliders["blue"].value(boardColours[0][2])
			} else if (windowWidth/2 + decile*0.25 <= mouseX && mouseX <= windowWidth/2 + decile*1.75) {
				colourPickerMode = 2
				colourSliders["red"].value(boardColours[1][0])
				colourSliders["green"].value(boardColours[1][1])
				colourSliders["blue"].value(boardColours[1][2])
			}

		} else if (decile*7.725 <= mouseY && mouseY <= decile*8.575 && colourPickerMode) {
			let colourOffset = windowWidth/2 - decile*3.75
			if (windowWidth/2 + colourOffset - decile*2.25 <= mouseX && mouseX <= windowWidth/2 + colourOffset - decile*0.25) {
				if (colourPickerMode === 1) {
					boardColours[0] = [colourSliders["red"].value(), colourSliders["green"].value(), colourSliders["blue"].value()]
				} else if (colourPickerMode === 2) {
					boardColours[1] = [colourSliders["red"].value(), colourSliders["green"].value(), colourSliders["blue"].value()]
				} colourPickerMode = 0
			} else if (windowWidth/2 + colourOffset + decile*0.25 <= mouseX && mouseX <= windowWidth/2 + colourOffset + decile*2.25) {
				colourPickerMode = 0
			}
		//rect(decile*0.75, decile*6.55, decile*4.75, decile*1.8, decile/10)

		} else if (decile*0.75 <= mouseX && mouseX <= decile*5.5 && decile*6.55 <= mouseY && mouseY <= decile*8.35) {
			boardColours = [[200, 200, 200], [160, 100, 60]]
			for (let s in volumeSliders) {volumeSliders[s].value(1)}
		}


		
 	} else if (mode === "menu" && ["Play", "Standard"].includes(buttons.divs["top"].html())) {
		if (windowWidth-decile*3 <= mouseX && mouseX <= windowWidth-decile && decile*7 <= mouseY && mouseY <= decile*9) {
			mode = "settings"
			backButton.style("width: 14vw; left: 85vw; opacity: 0.9; background-color: #4A4A4A")
			for (let e of ["top", "middle", "bottom"]) {
				buttons.divs[e].style("width: 0vw; opacity: 0")
				buttons.divs[e].html("Standard")
			}
		}
	}
}

function mouseReleased() {
	[rank, file] = getRankandFileFromMouse(mouseX, mouseY)
	if (mouseBuffer.join("") === [rank, file, RIGHT].join("") && rank && file) { // Highlight Squares
		if (game.highlightSquares.every(arr => arr.join("") !== [rank, file].join(""))) {
			game.highlightSquares.push([rank, file])
		} else {
			game.highlightSquares = game.highlightSquares.filter(v => v.join("") !== [rank, file].join(""))
		}
	} else if (mouseBuffer[2] === RIGHT && mouseBuffer[0] && mouseBuffer[1] && rank && file) { // Arrow Squares
		if (game.arrowSquares.every(arr => arr.join("") !== [mouseBuffer[0]+0.5, mouseBuffer[1]+0.5, rank+0.5, file+0.5].join(""))) {
			game.arrowSquares.push([mouseBuffer[0]+0.5, mouseBuffer[1]+0.5, rank+0.5, file+0.5])
		} else {
			game.arrowSquares = game.arrowSquares.filter(v => v.join("") !== [mouseBuffer[0]+0.5, mouseBuffer[1]+0.5, rank+0.5, file+0.5].join(""))
		}
	} else if (mouseBuffer[2] === LEFT && (mouseBuffer[0] !== rank || mouseBuffer[1] !== file)) { // Handle Move
		let piece = game.board[mouseBuffer[1] - 1][mouseBuffer[0] - 1]
		if (game.getColour(piece) === game.turn && piece !== "#" && (game.turn ? game.whitePlayer : game.blackPlayer) === "Human") {
			let move = game.handleMove(mouseBuffer[0], mouseBuffer[1], rank, file)
			if (move && game.mode !== "promo") {game.updateAttributes(move)}
		} mouseBuffer = [false, false, false]
	} else if (mouseBuffer[2] === LEFT && (mouseBuffer[0] === rank && mouseBuffer[1] === file)) { // Possible Move
		let piece = game.board[file - 1][rank - 1]
		if (game.getColour(piece) === game.turn && piece !== "#") {
			mouseBuffer[2] = true
		}
	}
}

function keyPressed() {
	switch (key) {
		case "x":
			game.flip = !game.flip
			break

		case "r":
			game.resetBoard()
			break

		case "z":
			if (keyIsDown(CONTROL)) {game.undoMove()}
			break

		case "c":
			if (keyIsDown(CONTROL)) {game.printMoves()}
			break

		case "ArrowLeft":
			game.move = max(game.move-1, 0)
			break

		case "ArrowRight":
			game.move = min(game.move+1, game.boardHistory.length-1)
			break

		case "ArrowUp":
			game.move = 0
			break

		case "ArrowDown":
			game.move = game.boardHistory.length - 1
			break
	}
}

function botTest(plr1, plr2, num) {
	wPlayer = plr1; bPlayer = plr2

	if (gameCount < num) {
		if (game.status !== "active") {
			gameCount++
			if (Object.keys(results).includes(game.status[0])) {
				results[game.status[0]]++
			} else {
				results[game.status[0]] = 1
			}
			game.resetBoard()
		}
	} console.log(results)
}

class Chess { // Main Section of Code
	constructor(fen, wPlayer="Human", bPlayer="Human", wTime=600000, bTime=600000, wIncr=0, bIncr=0, activeColour=true, castleArr=[true, true, true, true], targetSquare=[false, false], halfMoves=0, fullmoves=0) {
		this.boardHistory = [this.initiateBoard(fen)]
		this.bitboards = [this.getBitboards(fen)]
		this.board = this.initiateBoard(fen)
		this.promoSquare = [false, false, false, false]
		this.canCastle = [[...castleArr]]
		this.passantHistory = [[...targetSquare]]
		this.highlightSquares = []
		this.arrowSquares = []
		this.moveHistory = activeColour ? [] : ["-"]
		this.whiteTimeHistory = [wTime]
		this.blackTimeHistory = [wTime]
		this.whiteTime = wTime
		this.blackTime = bTime
		this.whiteIncrement = wIncr
		this.blackIncrement = bIncr
		this.moveTime = new Date().getTime()
		this.whitePlayer = wPlayer
		this.blackPlayer = bPlayer
		this.mode = "board"
		this.turn = activeColour
		this.flip = activeColour
		this.move = 0
		this.status = "active"
		this.threeFold = []
		this.lastCapture = [-halfMoves]
		this.moveCount = fullmoves
		this.start = true

		// Do this for rooks too
		if (this.bitboards[0]["K"][0][0] !== 5 || this.bitboards[0]["K"][0][1] !== 8) {
			this.canCastle[0][0] = false
			this.canCastle[0][1] = false
		}
		 if (this.bitboards[0]["k"][0][0] !== 5 || this.bitboards[0]["k"][0][1] !== 1) {
			this.canCastle[0][2] = false
			this.canCastle[0][3] = false
		}
	}

	initiateBoard(fen) {
		let bufferArr = []
		let boardArr = []
		for (let char of fen) {
			if (char === "/") {
				boardArr.push([...bufferArr])
				bufferArr = []
			} else if (isNaN(Number(char))) {
				bufferArr.push(char)
			} else {
				for (let i = 0; i < Number(char); i++) {
					bufferArr.push("#")
				}
			}
		}
		boardArr.push([...bufferArr])
		return boardArr
	}

	getBitboards(fen) {
		let bitboards = Object.fromEntries(Array.from("rnbqkpRNBQKP").map(v => [v, []]))
		let x = 1; let y = 1
		for (let char of fen) {
			if (char === "/") {x = 1; y++
			} else if (isNaN(Number(char))) {
				bitboards[char].push([x, y]); x++
			} else {x += Number(char)}
		} return bitboards
	}

	convertTime(time) {return `${Math.floor(time/60)}:${(abs(time%60)).toLocaleString('en-US', {minimumIntegerDigits: 2})}`}

	timeToMs(mins, secs) {return mins*60000 + secs*1000}

	getNotation(x, y) {return `${String.fromCharCode(96+x)}${9-y}`}

	inBounds(x, y) {return max(x, y) < 9 && min(x, y) > 0}

	getColour(piece) {return piece === piece.toUpperCase()}

	convertThreefold(board) {return board.map(v => v.toString()).toString()}

	copyBoard(board) {
		let copy = []
		for (let v of board) {
			copy.push([...v])
		} return copy
	}

	copyBitboard(bitboard) {
		let copy = []
		for (let v in bitboard) {
			copy[v] = [...bitboard[v]]
		} return copy
	}

	tween(x1, y1, x2, y2) {
		let xIncre = x2-x1 ? floor((x2-x1) / abs(x2-x1)) : 0
		let yIncre = y2-y1 ? floor((y2-y1) / abs(y2-y1)) : 0
		let tweenSquares = []

		while (x1 !== x2 - xIncre || y1 !== y2 - yIncre) {
			x1 += xIncre; y1 += yIncre
			tweenSquares.push([x1, y1])
		} return tweenSquares
	}

	////////// Front End - User Interface //////////

	draw() { // Where it all happens...
		// this.highlightSquares = this.bitboards[this.bitboards.length-1]["q"]
		if (this.status === "active") {
			if (this.turn) {this.whiteTime = max(this.whiteTime - (time - this.moveTime), 0)}
			else {this.blackTime = max(this.blackTime - (time - this.moveTime), 0)}
			if ((this.turn ? this.whiteTime : this.blackTime) === 0) {
				if (this.materialCheck(this.getMatList()[this.turn ? 1 : 0])) {
					this.status = ["Game drawn: Timeout vs Insufficient Material", "Draw"]
				} else {
					this.status = ["Game won by Timeout", !this.turn]
				}
			}
		} this.moveTime = time

		if (this.whitePlayer !== "Human" && this.start) {
			this.start = false
			promiseDB = false
			let args = [this.copyBoard(this.board), this.copyBitboard(this.bitboards[this.bitboards.length-1]), [...this.canCastle[this.canCastle.length-1]], this.passantHistory[this.passantHistory.length-1], this.turn, this.move]
			botApi.postMessage([(this.turn ? this.whitePlayer : this.blackPlayer), args])
		}

		push()
		stroke(0, 0)
		this.drawShadow()
		this.drawBoard()
		this.drawHighlightSquares()
		this.drawClickedSquares()
		this.drawPosFromBoard()
		this.showLegalMoves()
		this.drawArrowSquares()

		if (puzzleCounter === false) {
			this.drawTimer()
			this.drawIcons()
			this.drawUtility()
			if ((windowWidth/windowHeight) >= 1.85) {this.drawNotation()}
			if (this.mode === "promo") {this.promotionUI()}
			if (!["active", "finish"].includes(this.status)) {this.drawEndScreen()}
		}
		pop()
	}

	drawEndScreen() {
		push()
		rectMode(CENTER)
		textAlign(CENTER, CENTER)

		stroke(25)
		strokeWeight(4)
		rect(decile*5, decile*5, decile*6, decile*4, decile/2)
		strokeWeight(0)

		fill(150, 100, 215)
		rect(decile*5, decile*5, decile*6, decile*4, decile/2)
		fill(100)
		rect(decile*5, decile*5, decile*6, decile*2)

		strokeWeight(5)
		fill(255)
		stroke(...(this.status[1] === "Draw" ? [150] : (this.status[1] ? [59, 162, 17] : [228, 8, 10])))
		rect(decile*3, decile*5, decile, decile, decile/10)
		fill(0)
		stroke(...(this.status[1] === "Draw" ? [150] : (!this.status[1] ? [59, 162, 17] : [228, 8, 10])))
		rect(decile*7, decile*5, decile, decile, decile/10)
		strokeWeight(0)

		push()
		fill(225, 50, 60)
		stroke(0)
		strokeWeight(1)
		textFont("Arial")
		textSize(decile)
		text("×", decile*7.5, decile*3.6)
		pop()
		textSize(decile/2)

		text((this.status[1] === "Draw" ? "Game Drawn" : (this.status[1] ? "White Wins" : "Black Wins")), decile*5, decile*3.5)
		textSize(decile/4)
		text(this.status[0], decile*5, decile*6.5, decile*6)

		stroke(0)
		strokeWeight(1)
		fill(255)

		push()
		textSize(decile/3)
		rotate(HALF_PI)
		text(this.blackPlayer.toUpperCase(), decile*5, -decile*6)
		rotate(PI)
		text(this.whitePlayer.toUpperCase(), -decile*5, decile*4)
		pop()

		textSize(decile)
		strokeWeight(2)
		fill(100)
		text((this.status[1] === "Draw" ? "=" : (this.status[1] ? "/" : "\\")), decile*5, decile*4.8)
		pop()
	}

	drawBoard() {
		for (let x = 1; x <= 8; x++) {
			for (let y = 1; y <= 8; y++) {
				let rgb = (x+y) % 2 !== 0 ? [...boardColours[1]] : [...boardColours[0]]
				fill(...rgb)
				square((x*decile), (y*decile), decile)
			}
		}	
	}

	drawTimer() {
		push()
		rectMode(CENTER)
		textAlign(CENTER)
		textSize(windowHeight*(12.5/100))
		let whiteTimePos = this.flip ? 6.3 : 4.6
		let blackTimePos = this.flip ? 4.6 : 6.3
		let alpha = mode === "game" ? 255 : 255 - (255 * factor(backTime, 500, "sine"))
		fill(200, alpha)
		rect(11.4*decile, 5*decile, 4*decile, 0.1*decile, decile)
		fill(...this.whiteTime >= 59000 ? [200] : [255, 51, 0], alpha)
		text(this.convertTime(Math.ceil(this.whiteTime/1000)), 11.4*decile, whiteTimePos*decile)
		fill(...this.blackTime >= 59000 ? [200] : [255, 51, 0], alpha)
		text(this.convertTime(Math.ceil(this.blackTime/1000)), 11.4*decile, blackTimePos*decile)
		pop()
	}

	drawIcons() {
		push()
		let alpha = mode === "game" ? 255 : 255 - (255 * factor(backTime, 500, "sine"))
		textAlign(CENTER)
		textSize(windowHeight/10)
		fill(200, alpha)
		tint(255, alpha)
		let whiteTextPos = this.flip ? 8.85 : 1.85
		let blackTextPos = this.flip ? 1.85 : 8.85
		let whiteIconPos = this.flip ? 8 : 1
		let blackIconPos = this.flip ? 1 : 8
		textAlign(CORNER)
		text(this.whitePlayer, decile*9.25, decile*whiteTextPos)
		text(this.blackPlayer, decile*9.25, decile*blackTextPos)
		// image(icons[this.whitePlayer], decile*12.5, decile*whiteIconPos, decile, decile)
		// image(icons[this.blackPlayer], decile*12.5, decile*blackIconPos, decile, decile)

		// text(this.whitePlayer, decile*12, decile*whiteTextPos)
		// text(this.blackPlayer, decile*12, decile*blackTextPos)
		// image(icons[this.whitePlayer], decile*9.35, decile*whiteIconPos, decile, decile)
		// image(icons[this.blackPlayer], decile*9.35, decile*blackIconPos, decile, decile)
		pop()
	}

	drawUtility() {
		push()
		let alpha = mode === "game" ? 255 : 255 - (255 * factor(backTime, 500, "sine"))
		textSize(windowHeight/10)
		fill(200, alpha)
		rectMode(CORNER)
		rect(windowWidth*0.65, windowHeight*0.05, decile, decile, decile/4)
		rect(windowWidth*0.7, windowHeight*0.05, decile, decile, decile/4)
		rect(windowWidth*0.75, windowHeight*0.05, decile, decile, decile/4)
		rect(windowWidth*0.8, windowHeight*0.05, decile, decile, decile/4)


		textFont("Arial")
		fill(50, alpha)
		textAlign(CENTER)
		text("⟳", windowWidth*0.65+decile/2, windowHeight*0.135)
		text("⮐", windowWidth*0.7+decile/2, windowHeight*0.15)
		text("⇅", windowWidth*0.75+decile/2, windowHeight*0.135)
		text("🗎", windowWidth*0.8+decile/2, windowHeight*0.135)
		pop()
	}

	drawNotation() {
		push()
		fill(200)
		rectMode(CENTER)
		textAlign(CENTER)
		textSize(windowHeight*(5/100))
		let maxDisplay = floor(((windowHeight*0.8)/decile)/0.75 - 2.5)
		let offset = max(0, ceil(this.move/2) - maxDisplay)
		let alpha = mode === "game" ? 255 : 255 - (255 * factor(backTime, 500, "sine"))
		let buttonWidth = decile * 15.25 + (windowWidth - decile * 1.75)
		let _buttonWidth = decile * 15.25 - (windowWidth - decile * 1.75)
		push()
		textStyle(BOLD)
		textSize(windowHeight*(15/100))
		fill(200, alpha)
		rect(buttonWidth/2 + _buttonWidth*0.5625, decile*(0.75*maxDisplay + 2.5), _buttonWidth*0.33, decile, decile/5)
		rect(buttonWidth/2 + _buttonWidth*0.1875, decile*(0.75*maxDisplay + 2.5), _buttonWidth*0.33, decile, decile/5)
		rect(buttonWidth/2 - _buttonWidth*0.1875, decile*(0.75*maxDisplay + 2.5), _buttonWidth*0.33, decile, decile/5)
		rect(buttonWidth/2 - _buttonWidth*0.5625, decile*(0.75*maxDisplay + 2.5), _buttonWidth*0.33, decile, decile/5)
		fill(50, alpha)
		text("«", buttonWidth/2 + _buttonWidth*0.5625, decile*(0.75*maxDisplay + 2.95))
		text("‹", buttonWidth/2 + _buttonWidth*0.1875, decile*(0.75*maxDisplay + 2.95))
		text("›", buttonWidth/2 - _buttonWidth*0.1875, decile*(0.75*maxDisplay + 2.95))
		text("»", buttonWidth/2 - _buttonWidth*0.5625, decile*(0.75*maxDisplay + 2.95))
		pop()

		let pairs = []
		for (let i = 0; i < this.moveHistory.length; i += 2) {
			pairs.push([this.moveHistory[i], this.moveHistory[i+1]])
		}

		for (let i = offset; i < min(pairs.length, offset + maxDisplay); i++) {
			let [w, b] = pairs[i]
			let isWhiteCurrentMove = this.move === 2*(i+1) - 1
			let isBlackCurrentMove = this.move === 2*(i+1)

			fill(isWhiteCurrentMove ? 225 : 200, alpha)
			textSize(windowHeight*((isWhiteCurrentMove ? 5.5 : 5)/100))
			text(w, decile * 15.25, decile * (0.75*(i-offset)+2.5))

			fill(isBlackCurrentMove ? 225 : 200, alpha)
			textSize(windowHeight*((isBlackCurrentMove ? 5.5 : 5)/100))
			text(b, windowWidth - decile * 1.75, decile * (0.75*(i-offset)+2.5))

			fill(isWhiteCurrentMove || isBlackCurrentMove ? 255 : 200, alpha)
			textSize(windowHeight*(6/100))
			text(i+1+this.moveCount, (decile * 15.25 + (windowWidth - decile * 1.75))/2, decile * (0.75*(i-offset)+2.5))
		}
		pop()
	}

	drawShadow() {
		push()
		fill(0, 200)
		rectMode(CORNER)
		square(decile*1.125, decile*1.125, decile*8)
		pop()
	}

	drawHighlightSquares() {
		fill(235, 64, 52, 200)
		for (let [x, y] of this.highlightSquares) {
			if (!this.flip) {[x, y] = [9-x, 9-y]}
			square(x*decile, y*decile, decile)
		}
	}

	drawClickedSquares() {
		fill(173, 163, 83, 200)
		if (mouseBuffer[2] === true || (mouseIsPressed === true && mouseButton === LEFT) && mouseBuffer[0]) {
			if (this.flip) {square(mouseBuffer[0] * decile, mouseBuffer[1] * decile, decile)}
			else {square((9 - mouseBuffer[0]) * decile, (9 - mouseBuffer[1]) * decile, decile)}
		}
	}

	drawPosFromBoard() {
		let board = this.boardHistory[this.move]
		let ghostX = false
		let ghostY = false
		for (let x = 1; x <= 8; x++) {
			for (let y = 1; y <= 8; y++) {
				let arrX = this.flip ? y-1 : 8-y
				let arrY = this.flip ? x-1 : 8-x
				if (board[arrX][arrY] !== "#") {
					if ([LEFT, true].includes(mouseBuffer[2]) && arrY+1 === mouseBuffer[0] && arrX+1 === mouseBuffer[1] && mouseIsPressed) {
						ghostX = arrX
						ghostY = arrY
					} else {
						image(pieces[board[arrX][arrY]], x*decile, y*decile, decile, decile)					
					}
				}
			}
		} if (ghostX !== false && ghostY !== false) {
			push()
			imageMode(CENTER)
			image(pieces[board[ghostX][ghostY]], mouseX, mouseY, decile, decile)
			pop()	
		}
	}

	drawArrow(x1, y1, x2, y2, ghost=false) {
		if (!this.flip && !ghost) {[x1, y1, x2, y2] = [10-x1, 10-y1, 10-x2, 10-y2]}
		else if (!this.flip && ghost) {[x1, y1] = [10-x1, 10-y1]}
		let hypotenuse = dist(x1, y1, x2, y2)
		let angle = atan((y1-y2) / (x1-x2))
		let xAvg = (x1+x2)/2
		let yAvg = (y1+y2)/2
	
		circle(x2 * decile, y2 * decile, decile/3)
		circle(x2 * decile, y2 * decile, decile/2)
	
		push()
		translate(xAvg * decile, yAvg * decile)
		rotate(angle)
		translate(-xAvg * decile, -yAvg * decile)
		rect(xAvg * decile, yAvg * decile, hypotenuse * decile + decile/4, decile/4, decile/8)
		pop()
	}

	drawArrowSquares() {
		fill(235, 64, 52, 200)
		rectMode(CENTER)
		for (let [x1, y1, x2, y2] of this.arrowSquares) {
			this.drawArrow(x1, y1, x2, y2)
		}
		if (mouseBuffer[2] === RIGHT && mouseIsPressed === true && mouseButton === RIGHT && mouseBuffer[0]) {
			this.drawArrow(mouseBuffer[0]+0.5, mouseBuffer[1]+0.5, mouseX/decile, mouseY/decile, true)
		}
	}

	promotionUI() {
		let queen = this.turn ? "Q" : "q"
		let rook = this.turn ? "R" : "r"
		let knight = this.turn ? "N" : "n"
		let bishop = this.turn ? "B" : "b"
		push()
		imageMode(CENTER)
		fill(66, 135, 245, 200)
		rect(5*decile, 5*decile, 2.5*decile, 2.5*decile, 0.5*decile)
		pop()
		image(pieces[queen], 4*decile, 4*decile, decile, decile)
		image(pieces[rook], 5*decile, 4*decile, decile, decile)
		image(pieces[knight], 4*decile, 5*decile, decile, decile)
		image(pieces[bishop], 5*decile, 5*decile, decile, decile)
	}

	////////// Back End - Move Validation //////////

	updateAttributes(move, puzzleBotsMove=false) {
		// move => [{0}activeBoard, {1}castleArr, {2}locator, {3}notation, {4}passantSquare]
		if (puzzleBotsMove) {puzzleBots.shift()}
		if (puzzleCounter === false || (move[3] === puzzleValid[0])) {
			if (this.turn) {this.whiteTime += this.whiteIncrement} else {this.blackTime += this.blackIncrement}
			this.board = move[0]
			this.boardHistory.push(move[0])
			this.canCastle.push(move[1])
			this.bitboards.push(move[2])
			this.moveHistory.push(move[3])
			this.threeFold.push(this.convertThreefold(move[0]))
			this.passantHistory.push(move[4])
			this.whiteTimeHistory.push(this.whiteTime)
			this.blackTimeHistory.push(this.blackTime)
			this.move = this.boardHistory.length - 1
			this.turn = !this.turn
			this.lastCapture.push(move[3].includes("x") || move[3].slice(0, 1) === move[3].slice(0, 1).toLowerCase() ? this.move : this.lastCapture[this.lastCapture.length-1])

			this.updateStatus()

			if (puzzleCounter !== false) {
				puzzleValid.shift()
				if (!puzzleValid.length) {
					sfx["correct"].play()
					if (puzzleResults[puzzleCounter] !== false) {puzzleResults[puzzleCounter] = true}
					if (puzzleCounter < puzzlesData.length-1) {
						puzzleCounter++
						this.status = "killed"
						puzzleValid = [...puzzlesData[puzzleCounter][1]]
						puzzleBots = [...puzzlesData[puzzleCounter][2]]
						game = new Chess(puzzlesData[puzzleCounter][0], "Human", "Human", Infinity, Infinity, Infinity, Infinity, puzzlesData[puzzleCounter][3])
					} else {
						puzzlesFinish = time
					}
				} else if (!puzzleBotsMove) {
					// set timeout
					setTimeout(() => {
						this.updateAttributes(this.handleMove(...puzzleBots[0], false), true)
					}, 250)
				}
			} else if (this.status === "active" && (this.turn ? this.whitePlayer : this.blackPlayer) !== "Human" && this.mode !== "promo") {
				promiseDB = false
				let args = [this.copyBoard(this.board), this.copyBitboard(this.bitboards[this.bitboards.length-1]), [...this.canCastle[this.canCastle.length-1]], this.passantHistory[this.passantHistory.length-1], this.turn, this.move]
				botApi.postMessage([(this.turn ? this.whitePlayer : this.blackPlayer), args])
			}
		} else if (puzzleCounter !== false) {
			// incorrect solution
			sfx["error"].play()
			puzzleResults[puzzleCounter] = false
		}
	}

	getMaterial(bitboard) {
		let mats = []
		for (let v in bitboard) {
			mats[v] = bitboard[v].length
		} return mats
	}

	materialCheck(matList) {
		return matList.length === 0 || (matList.length === 1 && (matList[0] === "N" || matList[0] === "B"))
	}

	getMatList() {
		let mats = this.getMaterial(this.copyBitboard(this.bitboards[this.bitboards.length-1]))
		let wPieces = [], bPieces = []

		for (let v in mats) {
			for (let _ = 0; _ < mats[v]; _++) {
				if (v.toUpperCase() !== "K") {
					if (v.toUpperCase() === v) {
						wPieces.push(v.toUpperCase())
					} else {
						bPieces.push(v.toUpperCase())
					}
				}
			}
		} return [wPieces, bPieces]
	}

	updateStatus() {
		let mats = this.getMatList()
		if (!this.getAllLegalMoves().length) {
			if (this.moveHistory[this.moveHistory.length-1].slice(-1) === "+") {
				this.status = ["Game won by Checkmate", !this.turn]
				this.moveHistory[this.moveHistory.length-1] = this.moveHistory[this.moveHistory.length-1].slice(0, -1) + "#"
			} else {
				this.status = ["Game drawn by Stalemate", "Draw"]
			}
		} else if (this.threeFold.filter((v, i) => i % 2 === (!this.turn ? 0 : 1) && v === this.threeFold[this.threeFold.length-1]).length === 3) { // Threefold
			this.status = ["Game drawn by Threefold Repetition", "Draw"]
		} else if (this.move - this.lastCapture[this.lastCapture.length-1] === 100) {
			this.status = ["Game drawn by 50-Move Rule", "Draw"]
		} else if (this.materialCheck(mats[0]) && this.materialCheck(mats[1])) {
			this.status = ["Game drawn by Insufficient Material", "Draw"]
		}
	}

	showLegalMoves() {
		if ((mouseBuffer[2] || (mouseIsPressed && mouseButton === LEFT) && mouseBuffer[0]) && this.mode === "board" && (this.turn ? this.whitePlayer : this.blackPlayer) === "Human") {
			let target = this.board[mouseBuffer[1]-1][mouseBuffer[0]-1]
			if ([LEFT, true].includes(mouseBuffer[2]) && (this.getColour(target)) === this.turn) {
				push()
				fill(66, 135, 245, 100)
				for (let [x, y] of this.getLegalMoves(mouseBuffer[0], mouseBuffer[1])) {
					if (!this.flip) {[x, y] = [9-x, 9-y]}
					circle((x + 0.5) * decile, (y + 0.5) * decile, decile/3)
				} pop()
			}
		}
	}

	getAllLegalMoves() {
		let pieces = ["P", "N", "B", "R", "Q", "K"]
		if (!this.turn) {pieces = pieces.map(v => v.toLowerCase())}
		let moves = []

		for (let p of pieces) {
			for (let [x1, y1] of this.bitboards[this.bitboards.length-1][p]) {
				for (let [x2, y2] of this.getLegalMoves(x1, y1)) {
					if (p.toUpperCase() === "P" && y2 === (this.turn ? 1 : 8)) { // Pawn Promo
						moves.push([x1, y1, x2, y2, this.turn ? "Q" : "q"])
						moves.push([x1, y1, x2, y2, this.turn ? "R" : "r"])
						moves.push([x1, y1, x2, y2, this.turn ? "B" : "b"])
						moves.push([x1, y1, x2, y2, this.turn ? "N" : "n"])
					} else {moves.push([x1, y1, x2, y2, false])}
				}
			}
		} return moves
	}

	moveTest(depth, prev="") {
		let moves = this.getAllLegalMoves()
		let positions = 0
		if (depth === 0) {return 1}

		for (let v of moves) {
			let args = this.handleMove(...v, true)
			this.updateAttributes(args)
			positions += this.moveTest(depth-1, args[3])
			this.undoMove(true)
		}

		//console.log(positions, prev)
		return positions
	}

	getHorizontalMoves(x1, y1) {
		let validMoves = []
		let colour = this.getColour(this.board[y1-1][x1-1])
		let x; let y
		for (let axis = 0; axis <= 1; axis++) {
			axis = Boolean(axis)
			for (let i = -1; i <= 1; i += 2) {
				x = axis ? i : 0
				y = !axis ? i : 0
				while (this.inBounds(x1+x, y1+y)) {
					let target = this.board[y1+y-1][x1+x-1]
					if (target === "#") {
						validMoves.push([x1+x, y1+y]) // Empty Square
					} else if (this.getColour(target) !== colour) {
						validMoves.push([x1+x, y1+y]) // Enemy Piece
						break
					} else { // Friendly Piece
						break
					}
					x += axis ? i : 0
					y += !axis ? i : 0
				}
			}
		}
		return validMoves
	}
	
	getDiagonalMoves(x1, y1) {
		let validMoves = []
		let colour = this.getColour(this.board[y1-1][x1-1])
		let x; let y
		for (let i = -1; i <= 1; i += 2) {
			for (let j = -1; j <= 1; j += 2) {
				x = i; y = j
				while (this.inBounds(x1+x, y1+y)) {
					let target = this.board[y1+y-1][x1+x-1]
					if (target === "#") {
						validMoves.push([x1+x, y1+y]) // Empty Square
					} else if (this.getColour(target) !== colour) {
						validMoves.push([x1+x, y1+y]) // Enemy Piece
						break
					} else { // Friendly Piece
						break
					}
					x += i; y += j
				}
			}
		}
		return validMoves
	}

	getLegalMoves(x1, y1) {
		let piece = this.board[y1 - 1][x1 - 1]
		let colour = this.getColour(piece)
		let pseudoLegalMoves = []
		let legalMoves = []
		switch(piece.toUpperCase()) {
			case "P":
				let double = colour ? 7 : 2
				let dir = colour ? -1 : 1
				if (this.inBounds(x1, y1 + dir) && this.board[y1+dir-1][x1-1] === "#") { // Normal Forwards Moves
					pseudoLegalMoves.push([x1, y1 + dir])
					if (y1 === double && this.board[y1+(2*dir)-1][x1-1] === "#") { // Double Move
						pseudoLegalMoves.push([x1, y1 + (2 * dir)])
					}
				}

				for (let i = -1; i <= 1; i += 2) { // Capture Moves
					let target = this.board[y1+dir-1][x1+i-1]
					let passantSquare = this.passantHistory[this.passantHistory.length-1]
					if (this.inBounds(x1+i, y1+dir) && ((this.getColour(target) !== colour && target !== "#") || (x1+i === passantSquare[0] && y1+dir === passantSquare[1]))) {
						pseudoLegalMoves.push([x1 + i, y1 + dir])
					}
				}
				break

			case "N":
				for (let [x, y] of [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]]) {
					if (this.inBounds(x1+x, y1+y)) {
						let target = this.board[y1+y-1][x1+x-1]
						if (target === "#") { // Normal move
							pseudoLegalMoves.push([x1+x, y1+y])
						} else if (this.getColour(target) !== colour) { // Capture
							pseudoLegalMoves.push([x1+x, y1+y])
						}
					}
				}
				break

			case "B":
				pseudoLegalMoves = this.getDiagonalMoves(x1, y1)
				break
			
			case "R":
				pseudoLegalMoves = this.getHorizontalMoves(x1, y1)
				break
			
			case "Q":
				pseudoLegalMoves = this.getDiagonalMoves(x1, y1).concat(this.getHorizontalMoves(x1, y1))
				break

			case "K":
				for (let i = -1; i <= 1; i++) {
					for (let j = -1; j <= 1; j++) {
						if (this.inBounds(x1+i, y1+j)) {
							let target = this.board[y1+j-1][x1+i-1]
							if ((i !== 0 || j !== 0) && (this.getColour(target) !== colour || target === "#")) {
								pseudoLegalMoves.push([x1+i, y1+j])
							}
						}
					}
				}
				if (colour && !this.isCheck(5, 8, colour, this.bitboards[this.bitboards.length-1], this.board)) { // Checks that every square between the king and rook is empty; AMEND FOR CHESS960 // || v[0] === this.rookStartX[0] || v[0] === this.bitboards["K"][0][0])) {
					if (this.canCastle[this.canCastle.length-1][0] && this.board[8-1][2-1] === "#" && [[3, 8], [4, 8]].every(v => this.board[v[1]-1][v[0]-1] === "#" && !this.isCheck(v[0], v[1], colour, this.bitboards[this.bitboards.length-1], this.board))) {
						pseudoLegalMoves.push([x1-2, y1]) // Check if the player is castling through check, NOTE THAT THE CASTLING THROUGH CHECK BIT IS HARDCODED
					}
					if (this.canCastle[this.canCastle.length-1][1] && [[6, 8], [7, 8]].every(v => this.board[v[1]-1][v[0]-1] === "#" && !this.isCheck(v[0], v[1], colour, this.bitboards[this.bitboards.length-1], this.board))) {
						pseudoLegalMoves.push([x1+2, y1])
					}
				} else if (!this.isCheck(5, 1, colour, this.bitboards[this.bitboards.length-1], this.board)) {
					if (this.canCastle[this.canCastle.length-1][2] && this.board[1-1][2-1] === "#" && [[3, 1], [4, 1]].every(v => this.board[v[1]-1][v[0]-1] === "#" && !this.isCheck(v[0], v[1], colour, this.bitboards[this.bitboards.length-1], this.board))) {
						pseudoLegalMoves.push([x1-2, y1])
					}
					if (this.canCastle[this.canCastle.length-1][3] && [[6, 1], [7, 1]].every(v => this.board[v[1]-1][v[0]-1] === "#" && !this.isCheck(v[0], v[1], colour, this.bitboards[this.bitboards.length-1], this.board))) {
						pseudoLegalMoves.push([x1+2, y1])
					}
				}
				break				
		}

		for (let v of pseudoLegalMoves) { // Final Move Validation
			let newBoard = this.handleMove(x1, y1, v[0], v[1], false, true)
			if (!this.isCheck(...newBoard[2][colour ? "K" : "k"][0], colour, newBoard[2], newBoard[0])) {
				legalMoves.push([v[0], v[1]])
			}
		} return legalMoves
	}

	handleMove(x1, y1, x2, y2, promo=false, query=false) {
		let piece = this.board[y1-1][x1-1]
		let locator = this.copyBitboard(this.bitboards[this.bitboards.length-1])
		let activeBoard = this.copyBoard(this.board)
		let castleArr = [...this.canCastle[this.canCastle.length-1]]

		let moves = query ? [[x2, y2]] : this.getLegalMoves(x1, y1)
		let colour = this.getColour(piece)
		let notation = piece.toUpperCase() === "P" ? "" : piece.toUpperCase()
		let passantSquare = [false, false]
	
		if (moves.some(v => v[0] === x2 && v[1] === y2) && this.mode === "board") { // Valid Moves
			if (!query) {
				sfx["move"].play()
				let pieceLocator = locator[piece].filter(v => v[0] !== x1 || v[1] !== y1)
				let endSquare = this.getNotation(x1, y1)
				let prevPassant = this.passantHistory[this.passantHistory.length-1]
				let disambiguateX = []
				let disambiguateY = []
				let repeat = false

				for (let [x, y] of pieceLocator) { // Notation stuff
					let perms = this.getLegalMoves(x, y)
					if (perms.some(v => v[0] === x2 && v[1] === y2)) { // If the move is possible with another piece.
						repeat = true
						disambiguateX.push(x)
						disambiguateY.push(y)
					}
				}

				if (repeat) {
					if (disambiguateX.every(v => v !== x1)) {
						notation += endSquare.slice(0, 1)
					} else if (disambiguateY.every(v => v !== y1)) {
						notation += endSquare.slice(1, 2)
					} else {
						notation += endSquare
					}
				} else if ((activeBoard[y2-1][x2-1] !== "#" || (x2 === prevPassant[0] && y2 === prevPassant[1])) && piece.toUpperCase() === "P") {
					notation += endSquare.slice(0, 1)
				}
			}

			if (piece.toUpperCase() === "P" && abs(y1-y2) === 2) { // En passant checker.
				passantSquare = [x1, (y1+y2)/2]
			}

			if (activeBoard[y2-1][x2-1] !== "#") {notation += "x"}
	
			let capturedPiece = activeBoard[y2-1][x2-1]
			if (capturedPiece !== "#") {
				locator[capturedPiece] = locator[capturedPiece].filter(v => v[0] !== x2 || v[1] !== y2)
			} locator[piece][locator[piece].findIndex(v => v[0] === x1 && v[1] === y1)] = [x2, y2]
	
			activeBoard[y2-1][x2-1] = activeBoard[y1-1][x1-1]
			activeBoard[y1-1][x1-1] = "#"
			if (piece.toUpperCase() === "P") { // Pawn Special Cases
				if (y2 === (colour ? 1 : 8)) { // Promotion
					locator[piece] = locator[piece].filter(v => v[0] !== x2 || v[1] !== y2)
					if (!query && !promo) {
						this.mode = "promo"
						activeBoard[y1-1][x1-1] = "#"
						activeBoard[y2-1][x2-1] = piece
						this.promoSquare = [x1, y1, x2, y2]
					} else if (promo) { // Bot Promo
						locator[promo].push([x2, y2])
						activeBoard[y1-1][x1-1] = "#"
						activeBoard[y2-1][x2-1] = promo
						notation += this.getNotation(x2, y2) + "=" + promo.toUpperCase()

						if (this.isCheck(...locator[this.turn ? "k" : "K"][0], !this.turn, locator, this.board)) {
							notation += "+"; if (!query) {sfx["check"].play()}
						} return [activeBoard, castleArr, locator, notation, passantSquare]
					}
				} else if (abs(x2-x1) === 1 && capturedPiece === "#") { // En Passant
					notation += "x"
					let capturedPawn = this.getColour(activeBoard[y1-1][x2-1]) ? "P" : "p"
					locator[capturedPawn] = locator[capturedPawn].filter(v => v[0] !== x2 || v[1] !== y1)
					activeBoard[y1-1][x2-1] = "#"
				}
			}
	
			notation += this.getNotation(x2, y2)
	
			if (piece.toUpperCase() === "K") { // King Special Cases
				if (colour) {
					castleArr[0] = false
					castleArr[1] = false
				} else {
					castleArr[2] = false
					castleArr[3] = false
				}
				if (abs(x1-x2) === 2) { // Castling - FIX IN CHESS960
					let rookNewX = x1-x2 > 0 ? 4 : 6
					let rookOldX = x1-x2 > 0 ? 1 : 8 // Here these vals need to be changed to rookStartX
					let rook = colour ? "R" : "r"
					let rookY = colour ? 8 : 1

					locator[rook][locator[rook].findIndex(v => v[0] === rookOldX && v[1] === rookY)] = [rookNewX, rookY]
					notation = x1-x2 > 0 ? "O-O-O" : "O-O"
					activeBoard[y2-1][rookNewX-1] = rook
					activeBoard[y2-1][rookOldX-1] = "#"
				}
			}
	
			if ((x1 === 1 && y1 === 1) || (x2 === 1 && y2 === 1)) { // Change this for chess960 too
				castleArr[2] = false
			} else if ((x1 === 1 && y1 === 8) || (x2 === 1 && y2 === 8)) {
				castleArr[0] = false
			} else if ((x1 === 8 && y1 === 1) || (x2 === 8 && y2 === 1)) {
				castleArr[3] = false
			} else if ((x1 === 8 && y1 === 8) || (x2 === 8 && y2 === 8)) {
				castleArr[1] = false
			}

			if (this.isCheck(...locator[this.turn ? "k" : "K"][0], !this.turn, locator, activeBoard)) {
				notation += "+"; if (!query) {sfx["check"].play()}
			} return [activeBoard, castleArr, locator, notation, passantSquare]
		} return false
	} // return [{0}activeBoard, {1}castleArr, {2}locator, {3}notation, {4}passantSquare]

	isCheck(x1, y1, colour, locator, activeBoard) {
		let opposingKing = locator[colour ? "k" : "K"][0]
		if (max(abs(x1-opposingKing[0]), abs(y1-opposingKing[1])) === 1) {
			return true // Check by King
		}

		for (let [x, y] of locator[colour ? "q" : "Q"]) {
			if ([x1-x, y1-y].some(v => v === 0) || abs(x1-x) === abs(y1-y)) {
				if (this.tween(x, y, x1, y1).every(v => activeBoard[v[1]-1][v[0]-1] === "#")) {
					return true // Check by Queen
				}
			}
		}

		for (let [x, y] of locator[colour ? "r" : "R"]) {
			if ([x1-x, y1-y].some(v => v === 0)) {
				if (this.tween(x, y, x1, y1).every(v => activeBoard[v[1]-1][v[0]-1] === "#")) {
					return true // Check by Rook
				}
			}
		}

		for (let [x, y] of locator[colour ? "b" : "B"]) {
			if (abs(x1-x) === abs(y1-y)) {
				if (this.tween(x, y, x1, y1).every(v => activeBoard[v[1]-1][v[0]-1] === "#")) {
					return true // Check by Bishop
				}
			}
		}

		for (let [x, y] of locator[colour ? "n" : "N"]) {
			if ([abs(x1-x), abs(y1-y)].sort().join("") === [1, 2].join("")) {
				return true // Check by Knight
			}
		}

		for (let [x, y] of locator[colour ? "p" : "P"]) {
			if (abs(x1-x) === 1 && y1 === y + (colour ? 1 : -1)) {
				return true // Check by Pawn
			}
		} return false
	}

	resetBoard() {
		this.status = "killed"; game = new Chess(startFEN, players[wPlayer-1], players[bPlayer-1], this.timeToMs(timeInputs["wMins"].value(), timeInputs["wSecs"].value()), this.timeToMs(timeInputs["bMins"].value(), timeInputs["bSecs"].value()), timeInputs["wIncr"].value()*1000, timeInputs["bIncr"].value()*1000)
	}

	undoMove(query = false) {
		if ((promiseDB || query) && this.moveHistory.length !== 0) {
			this.turn = !this.turn
			this.bitboards.pop()
			this.moveHistory.pop()
			this.boardHistory.pop()
			this.canCastle.pop()
			this.passantHistory.pop()
			this.whiteTimeHistory.pop()
			this.blackTimeHistory.pop()
			this.threeFold.pop()
			this.lastCapture.pop()
			this.status = "active"
			this.move = this.boardHistory.length-1
			this.whiteTime = this.whiteTimeHistory[this.whiteTimeHistory.length-1]
			this.blackTime = this.blackTimeHistory[this.blackTimeHistory.length-1]
			this.board = this.copyBoard(this.boardHistory[this.boardHistory.length-1])
		}
	}

	printMoves() {
		let moves = document.createElement("textarea")
		let moveList = []
		for (let i = 0; i < this.moveHistory.length; i += 2) {
			moveList.push(`${Math.floor(i/2)+1}. ${this.moveHistory.slice(i, i + 2).join(" ")}`)
		}
		document.body.appendChild(moves)
		moves.value = moveList.join(" ")
		moves.select()
		document.execCommand("copy")
		moves.remove()
	}
}
