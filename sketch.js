const descHotkeys = "You can drag or click to move.\n\nRight click to highlight squares and drag right click to draw arrows.\n\nHotkeys (PC ONLY):\n\n\tX to flip board.\nR to reset board.\nU to undo move.\nLeft Arrow to move back a move.\nRight Arrow to move forward a move.\nUp Arrow to go to the start of a game.\nDown Arrow to go to the end of a game."
const descStandard = "Chess with the standard starting position and rules. Play with a friend, or one of the bots!\n\nBefore starting, you can choose who plays as white and black. You must also choose time controls for both players."
const desc960 = "Chess, but the starting position is random. Play with a friend, or one of the bots!\n\nBefore starting, you can choose who plays as white and black. You must also choose time controls for both players."
const descCustom = "Chess, but you set up the starting position. Play with a friend, or one of the bots!\n\nBefore starting, you can choose who plays as white and black. You must also choose time controls for both players."

let startFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"
let randomFEN = "bbrknnqr/pppppppp/8/8/8/8/PPPPPPPP/BBRKNNQR"
let newFEN = "rn1qkb1r/pp2pppp/2p2n2/5b2/P1pP3N/2N5/1P2PPPP/R1BQKB1R"

let backTime = 0, backStartTime = 0
let clickedTime = 0
let transitionDuration = 500
let currentTransition = [null, null]
let mouseBuffer = [false, false, false]
let menuDebounce = true, backDebounce = true
let decile, game, time
let mode = "menu"
let menuPreset = ["Standard", descStandard, [51, 153, 255], [0, 77, 153], [0, 34, 102]]

// Bugfixes completed: Promo time using opponents'; undo time

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
		"error": loadSound("SFX/error.mp3"),
		"back": loadSound("SFX/back.mp3")
	}
	songs = {
		"checkmate": loadSound("Songs/checkmate.mp3")
	}
	icons = {
		"Human": loadImage("Icons/human.png")
	}
	kodeMono = loadFont("Font/KodeMono.ttf")
}

function setup() {
	//songs["checkmate"].loop()
	createCanvas(windowWidth, windowHeight)
	textFont(kodeMono)
	game = new Chess(newFEN)

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
		}
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
	resizeCanvas(windowWidth, windowHeight)
	clear()
	time = new Date().getTime()
	decile = min(windowWidth, windowHeight) / 10
	background(50)

	buttons.divs["top"].position(0, windowHeight * 0.2)
	buttons.divs["middle"].position(0, windowHeight * 0.45)
	buttons.divs["bottom"].position(0, windowHeight * 0.7)
	game.draw()

	if (mode === "start" || time <= backStartTime + 500) {drawMenu(...menuPreset)}

	for (let div in buttons.divs) {
		buttons.divs[div].mouseOver(mouseHover)
		buttons.divs[div].mouseOut(mouseNotHover)
		buttons.divs[div].mousePressed(mouseClickedElement)
	}
	backButton.mouseOver(mouseHover)
	backButton.mouseOut(mouseNotHover)
	backButton.mousePressed(mouseClickedElement)

	transition(clickedTime, transitionDuration, ...currentTransition)
}

class Chess { // Main Section of Code
	constructor(fen) {
		this.boardHistory = [this.initiateBoard(fen)]
		this.bitboards = [this.getBitboards(fen)]
		this.board = this.initiateBoard(fen)
		this.promoSquare = [false, false]
		this.canCastle = [[true, true, true, true]]
		this.highlightSquares = []
		this.arrowSquares = []
		this.moveHistory = []
		this.whiteTimeHistory = [600000]
		this.blackTimeHistory = [600000]
		this.whiteTime = 600000
		this.blackTime = 600000
		this.moveTime = new Date().getTime()
		this.whitePlayer = "Human"
		this.blackPlayer = "Human"
		this.mode = "board"
		this.turn = true
		this.flip = true
		this.move = 0
		// this.rookStartX = [this.bitboards["R"][0][0], this.bitboards["R"][1][0]]
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

	getNotation(x, y) {return `${String.fromCharCode(96+x)}${9-y}`}

	inBounds(x, y) {return max(x, y) < 9 && min(x, y) > 0}

	getColour(piece) {return piece === piece.toUpperCase()}

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
		//this.highlightSquares = this.bitboards[this.bitboards.length-1]["P"]
		if (this.turn) {this.whiteTime = max(this.whiteTime - (time - this.moveTime), 0)}
		else {this.blackTime = max(this.blackTime - (time - this.moveTime), 0)}
		this.moveTime = time // Timer Stuff

		push()
		stroke(0, 0)
		this.drawShadow()
		this.drawBoard()
		this.drawHighlightSquares()
		this.drawClickedSquares()
		this.drawPosFromBoard()
		this.showLegalMoves()
		this.drawArrowSquares()
		this.drawTimer()
		this.drawIcons()
		this.drawUtility()
		this.drawPieceDeficit()
		if ((windowWidth/windowHeight) >= 1.95) {this.drawNotation()}
		if (this.mode === "promo") {this.promotionUI()}
		pop()
	}

	drawBoard() {
		for (let x = 1; x <= 8; x++) {
			for (let y = 1; y <= 8; y++) {
				let rgb = (x+y) % 2 !== 0 ? [100, 50, 175] : [200, 150, 255]
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
		text(this.whitePlayer, decile*10.85, decile*whiteTextPos)
		text(this.blackPlayer, decile*10.85, decile*blackTextPos)
		image(icons[this.whitePlayer], decile*12.5, decile*whiteIconPos, decile, decile)
		image(icons[this.blackPlayer], decile*12.5, decile*blackIconPos, decile, decile)

		// text(this.whitePlayer, decile*12, decile*whiteTextPos)
		// text(this.blackPlayer, decile*12, decile*blackTextPos)
		// image(icons[this.whitePlayer], decile*9.35, decile*whiteIconPos, decile, decile)
		// image(icons[this.blackPlayer], decile*9.35, decile*blackIconPos, decile, decile)
		pop()
	}

	drawPieceDeficit() {
		// push()
		// imageMode(CENTER)
		// image(pieces["q"], 11.4*decile, 7.25*decile, decile*1.25, decile*1.25)
		// pop()
	}

	drawUtility() {
		"⟳"
		"⮐"
		"⇅"
		"🗎"// settings?
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
			text(i+1, (decile * 15.25 + (windowWidth - decile * 1.75))/2, decile * (0.75*(i-offset)+2.5))
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

	updateAttributes(move) {
		this.board = move[0]
		this.boardHistory.push(move[0])
		this.canCastle.push(move[1])
		this.bitboards.push(move[2])
		this.moveHistory.push(move[3])
		this.whiteTimeHistory.push(this.whiteTime)
		this.blackTimeHistory.push(this.blackTime)
		this.move = this.boardHistory.length - 1
		this.turn = !this.turn
	}

	showLegalMoves() {
		if ((mouseBuffer[2] === true || (mouseIsPressed === true && mouseButton === LEFT) && mouseBuffer[0]) && this.mode === "board") {
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
					pseudoLegalMoves.push([x1, y1 + dir, false])
					if (y1 === double && this.board[y1+(2*dir)-1][x1-1] === "#") { // Double Move
						pseudoLegalMoves.push([x1, y1 + (2 * dir), false])
					}
				}

				for (let i = -1; i <= 1; i += 2) { // Capture Moves
					let target = this.board[y1+dir-1][x1+i-1]
					let enPassant = this.getNotation(x1+i, 9-(double)) + this.getNotation(x1+i, 9-(double+2*dir))
					if (this.inBounds(x1+i, y1+dir) && this.getColour(target) !== colour && target !== "#") {
						pseudoLegalMoves.push([x1 + i, y1 + dir, false])
					} else if (this.moveHistory[this.moveHistory.length-1] === enPassant && y1 === double+(3*dir)) {
						pseudoLegalMoves.push([x1 + i, y1 + dir, true])
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
				if (colour && (this.moveHistory.length === 0 || this.moveHistory[this.moveHistory.length-1].slice(-1) !== "+")) { // Checks that every square between the king and rook is empty; AMEND FOR CHESS960 // || v[0] === this.rookStartX[0] || v[0] === this.bitboards["K"][0][0])) {
					if (this.canCastle[this.canCastle.length-1][0] && this.tween(5, 8, 1, 8).every(v => this.board[v[1]-1][v[0]-1] === "#" && !this.isCheck(v[0], v[1], colour, this.bitboards[this.bitboards.length-1], this.board))) {
						pseudoLegalMoves.push([x1-2, y1]) // Check if the player is castling through check, NOTE THAT THE CASTLING THROUGH CHECK BIT IS HARDCODED
					}
					if (this.canCastle[this.canCastle.length-1][1] && this.tween(5, 8, 8, 8).every(v => this.board[v[1]-1][v[0]-1] === "#" && !this.isCheck(v[0], v[1], colour, this.bitboards[this.bitboards.length-1], this.board))) {
						pseudoLegalMoves.push([x1+2, y1])
					}
				} else {
					if (this.canCastle[this.canCastle.length-1][2] && this.tween(5, 1, 1, 1).every(v => this.board[v[1]-1][v[0]-1] === "#" && !this.isCheck(v[0], v[1], colour, this.bitboards[this.bitboards.length-1], this.board))) {
						pseudoLegalMoves.push([x1-2, y1])
					}
					if (this.canCastle[this.canCastle.length-1][3] && this.tween(5, 1, 8, 1).every(v => this.board[v[1]-1][v[0]-1] === "#" && !this.isCheck(v[0], v[1], colour, this.bitboards[this.bitboards.length-1], this.board))) {
						pseudoLegalMoves.push([x1+2, y1])
					}
				}
				break
		}

		for (let v of pseudoLegalMoves) { // Final Move Validation
			let newBoard = this.handleMove(x1, y1, v[0], v[1], piece, this.copyBitboard(this.bitboards[this.bitboards.length-1]), this.copyBoard(this.board), [...this.canCastle], true)
			if (!this.isCheck(...newBoard[2][this.turn ? "K" : "k"][0], colour, newBoard[2], newBoard[0])) {
				legalMoves.push([v[0], v[1]])
			}
		} return legalMoves
	}

	handleMove(x1, y1, x2, y2, piece, locator, activeBoard, castleArr, query=false) {
		let moves = query ? [[x2, y2]] : this.getLegalMoves(x1, y1)
		let colour = this.getColour(piece)
		let notation = piece.toUpperCase() === "P" ? "" : piece.toUpperCase()
	
		if (moves.some(v => v[0] === x2 && v[1] === y2) && this.mode === "board") { // Valid Moves
			if (!query) {sfx["move"].play()}
			notation += this.getNotation(x1, y1)
			if (activeBoard[y2-1][x2-1] !== "#") {notation += "x"}
	
			let capturedPiece = activeBoard[y2-1][x2-1]
			if (capturedPiece !== "#") {
				locator[capturedPiece] = locator[capturedPiece].filter(v => v[0] !== x2 || v[1] !== y2)
			} locator[piece][locator[piece].findIndex(v => v[0] === x1 && v[1] === y1)] = [x2, y2]
	
			activeBoard[y2-1][x2-1] = activeBoard[y1-1][x1-1]
			activeBoard[y1-1][x1-1] = "#"
			if (piece.toUpperCase() === "P") { // Pawn Special Cases
				if (y2 === (colour ? 1 : 8)) { // Promotion
					if (!query) {
						this.mode = "promo" // change piece promotion later or smth bozo <---------------- Important; temporary fix
						this.turn = !this.turn
						this.promoSquare = [x2, y2]
						locator[piece] = locator[piece].filter(v => v[0] !== x2 || v[1] !== y2)
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
			if (this.isCheck(...locator[this.turn ? "k" : "K"][0], !this.turn, locator, this.board)) {
				notation += "+"; if (!query) {sfx["check"].play()}
			} return [activeBoard, castleArr, locator, notation]
		} return false
	}

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
}

function drawMenu(title, desc, colour1, colour2, colour3) {
	let offset = decile/10
	let alpha = (mode === "start") ? 255 : 255 - (255 * factor(backStartTime, 500, "sine"))

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
	text(desc + "\n\n\n" + descHotkeys, windowWidth*0.7+decile/4, 2.5*decile, windowWidth*0.3-decile/4, decile*7.5)

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
	text("(1/6)", windowWidth*0.305, decile*4)
	text("?", windowWidth*0.305, decile*5.7)
	fill(0, alpha)
	push()
	textSize(decile*0.6)
	text(">", windowWidth*0.625, decile*4.9)
	pop()
	text("(1/6)", windowWidth*0.65, decile*4)
	text("?", windowWidth*0.65, decile*5.7) // Experiment with inverting colours in white-black outline?

	textAlign(CENTER)
	textSize(decile*0.6)
	fill(255, alpha)
	text("Human", windowWidth*0.1775, decile*4.9)
	text("10:00+0", windowWidth*0.1775, decile*6.6)
	fill(0, alpha)
	text("Human", windowWidth*0.5225, decile*4.9)
	text("10:00+0", windowWidth*0.5225, decile*6.6)

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
		strokeWeight(1) // No, there isnt an easier way to colour everything... I looked...
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
		// text("Time is given in the format:\n\nmm:ss+i\n\nm = minutes\ns = seconds\ni = increment\n\nNote that increment is given   \nin seconds and it refers to    \nthe time added after each move.", mouseX+windowWidth*0.155-decile*0.25, mouseY-decile*2.25)
	}
	pop()
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
		if (mode === "game") {backTime = time}
		else if (mode === "start") {backStartTime = time}
		mode = "menu"
		backDebounce = false
		sfx["back"].play()
		if (buttons.divs["top"].html() !== "Play") {
			let prevButtons
			for (let div in buttons.divs) {
				buttons.divs[div].style("opacity: 0; width: 0vw")
			}

			switch (buttons.divs["top"].html()) {
				case "Standard":
				case "Classic": // Remove back button
					backButton.style("opacity: 0; background-color: #4A4A4A; width: 0vw; left: 100vw")
					prevButtons = {
						"top": "Play",
						"middle": "Puzzles",
						"bottom": "Credits"
					}; break
			}


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

  		if (["Play", "Puzzles"].includes(clickedButton)) { // every other button
			for (let div in buttons.divs) {
				buttons.divs[div].style("opacity: 0; width: 0vw")

				setTimeout(() => {
					menuDebounce = true // Bring back back button
					backButton.style("width: 14vw; left: 85vw; opacity: 0.9; background-color: #4A4A4A")
					for (let v of ["top", "middle", "bottom"]) {
						let newText = buttons[clickedButton][v]
						buttons.divs[v].html(newText)
						buttons.divs[v].style(`opacity: 0.9; background-color: ${buttons.uColour[newText]}; width: ${buttons.width[newText]}vw`)
					}			
				}, 750)
			}
		} else if (["Standard", "Chess960", "Custom"].includes(clickedButton)) { ///// Standard Gamemode /////
			clickedTime = time
			transitionDuration = 250
			currentTransition = ["fadeIn", "sine"]

			if (clickedButton === "Standard") {
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
			
			setTimeout(() => { // Fade out | part, sine
				mode = "start"
				//game = new Chess(startFEN)
				clickedTime = time
				currentTransition = ["fadeOut", "cosine"]
				
				setTimeout(() => {
					menuDebounce = true
					currentTransition = [null, null]
					backButton.style("width: 14vw; left: 85vw; opacity: 0.9; background-color: #4A4A4A")
				}, 250)
			}, 250)
		} else { // In progress gamemodes
			menuDebounce = true
			sfx["error"].play()
		}
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
			let slide = lerp(0, max(windowWidth, windowHeight) + min(windowWidth, windowHeight)/2, t)
			triangle(0, 0, 0, slide, slide, 0)
			triangle(0, windowHeight, 0, windowHeight - slide, slide, windowHeight)
			break

		case "shutter":
			triangle(0, 0, lerp(0, windowWidth, t), 0, 0, lerp(0, windowHeight, t))
			triangle(windowWidth, windowHeight, windowWidth, lerp(windowHeight, 0, t), lerp(windowWidth, 0, t), windowHeight)
			push(); stroke(col)
			if (t === 1) {line(0, windowHeight, windowWidth, 0)}
			pop()
			break

		case "drop":
			rect(0, 0, windowWidth, lerp(0, windowHeight, t))
			break

		case "slide":
			rect(0, 0, lerp(0, windowWidth, t), windowHeight)
			break

		case "fadeIn":
			push()
			rectMode(CORNER)
			fill(col, t*255)
			rect(0, 0, windowWidth, windowHeight)
			pop()
			break

		////////// Transition Out //////////
		case "pull":
			triangle(lerp(0, windowWidth, t), lerp(0, windowHeight, t), 0, windowHeight, windowWidth, windowHeight)
			triangle(windowWidth, windowHeight, windowWidth, 0, lerp(0, windowWidth, t), lerp(0, windowHeight, t))
			push()
			stroke(col)
			line(lerp(0, windowWidth, t), lerp(0, windowHeight, t), windowWidth, windowHeight)
			pop()
			break

		case "fadeOut":
			push()
			rectMode(CORNER)
			fill(col, (1-t)*255)
			rect(0, 0, windowWidth, windowHeight)
			pop()
			break

		case "lift":
			rect(0, 0, windowWidth, lerp(windowHeight, 0, t))
			break

		case "part":
			rect(0, 0, lerp(windowWidth/2, 0, t), windowHeight)
			rect(windowWidth, 0, lerp(-windowWidth/2, 0, t), windowHeight)
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

function mousePressed() {
	[rank, file] = getRankandFileFromMouse(mouseX, mouseY)
	if (mode === "game") {
		if (mouseButton === LEFT) {
			game.highlightSquares = []; game.arrowSquares = []
			if (game.mode === "promo") { // Promotion
				if (min(rank, file) >= 4 && max(rank, file) <= 5) {
					let piece
					if (rank === 4 && file === 4) {
						piece = game.turn ? "Q" : "q"
					} else if (rank === 5 && file === 4) {
						piece = game.turn ? "R" : "r"
					} else if (rank === 4 && file === 5) {
						piece = game.turn ? "N" : "n"
					} else if (rank === 5 && file === 5) {
						piece = game.turn ? "B" : "b"
					} // Add promotion check here
					game.turn = !game.turn
					game.bitboards[game.bitboards.length-1][piece].push([game.promoSquare[0], game.promoSquare[1]])
					game.board[game.promoSquare[1]-1][game.promoSquare[0]-1] = piece
					game.boardHistory[game.boardHistory.length-1][game.promoSquare[1]-1][game.promoSquare[0]-1] = piece
					game.moveHistory[game.moveHistory.length-1] += "=" + piece.toUpperCase()
					if (game.isCheck(...game.bitboards[game.bitboards.length-1][!game.turn ? "k" : "K"][0], game.turn, game.bitboards[game.bitboards.length-1], game.board)) {
						game.moveHistory[game.moveHistory.length-1] += "+"
					} game.mode = "board"
				}
			}
		}

		if (rank && file) {
			if (mouseBuffer[2] === true && mouseButton === LEFT) {
				if ((mouseBuffer[0] !== rank || mouseBuffer[1] !== file) && mouseButton === LEFT) {
					let piece = game.board[mouseBuffer[1] - 1][mouseBuffer[0] - 1]
					let move = game.handleMove(mouseBuffer[0], mouseBuffer[1], rank, file, piece, game.copyBitboard(game.bitboards[game.bitboards.length-1]), game.copyBoard(game.board), [...game.canCastle[game.canCastle.length-1]])
					if (move) {game.updateAttributes(move)}
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
	
	} else if (mode === "start" && menuDebounce && windowWidth*0.4225 <= mouseX && mouseX <= windowWidth*0.6225 && decile*7.75 <= mouseY && mouseY <= decile*9.55) {
		menuDebounce = false
		sfx["click3"].play()
		clickedTime = time
		transitionDuration = 1500

		if (menuPreset[0] === "Standard") {
			currentTransition = ["ribbon", "linear"]
		} else if (menuPreset[0] === "Chess960") {
			currentTransition = ["shutter", "bounce"]
		} else { // do the tidal wave thing
			currentTransition = ["drop", "sine"]
		}

		backButton.style("opacity: 0; background-color: #4A4A4A; width: 0vw; left: 100vw")
		for (let v of ["top", "middle", "bottom"]) {
			let newText = buttons.divs[v].html()
			buttons.divs[v].html(newText)
			buttons.divs[v].style(`opacity: 0; background-color: ${buttons.uColour[newText]}; width: 0vw`)
		}
		
		setTimeout(() => {
			mode = "game"
			game = new Chess(startFEN)
			clickedTime = time
			if (menuPreset[0] === "Standard") {
				currentTransition = ["lift", "cosine"]
			} else if (menuPreset[0] === "Chess960") {
				currentTransition = ["pull", "sine"]
			} else { // do the tidal wave thing
				currentTransition = ["part", "sine"]
			}			
			setTimeout(() => {
				menuDebounce = true
				currentTransition = [null, null]
				backButton.style("width: 14vw; left: 85vw; opacity: 0.9; background-color: #4A4A4A")
			}, 1500)
		}, 1750)
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
		if (game.getColour(piece) === game.turn && piece !== "#") {
			let move = game.handleMove(mouseBuffer[0], mouseBuffer[1], rank, file, piece, game.copyBitboard(game.bitboards[game.bitboards.length-1]), game.copyBoard(game.board), [...game.canCastle[game.canCastle.length-1]])
			if (move) {game.updateAttributes(move)}
		}
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
			game = new Chess(startFEN)
			break

		case "u":
			if (game.moveHistory.length !== 0) {
				game.turn = !game.turn
				game.bitboards.pop()
				game.moveHistory.pop()
				game.boardHistory.pop()
				game.canCastle.pop()
				game.whiteTimeHistory.pop()
				game.blackTimeHistory.pop()
				game.move = game.boardHistory.length
				game.whiteTime = game.whiteTimeHistory[game.whiteTimeHistory.length-1]
				game.blackTime = game.blackTimeHistory[game.blackTimeHistory.length-1]
				game.board = game.copyBoard(game.boardHistory[game.boardHistory.length-1])
			}

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

class Fortuna extends Chess {
	constructor() {

	}
}

class Parallax extends Fortuna {
	constructor() {
		
	}
}

class Astranaught extends Parallax {
	constructor() {
		
	}
}

class Lazaward extends Astranaught {
	constructor() {
		
	}
}

class AlephInfinity extends Lazaward {
	constructor() {
		
	}
}
