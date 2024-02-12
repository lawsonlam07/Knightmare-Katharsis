let startFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"
let newFEN = "rn1qkb1r/pp2pppp/2p2n2/5b2/P1pP3N/2N5/1P2PPPP/R1BQKB1R"
let randomFEN = "bbrknnqr/pppppppp/8/8/8/8/PPPPPPPP/BBRKNNQR"
let mouseBuffer = [false, false, false]
let flip = true

let mode = "game"
let decile
let game

let testText

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
		"boom": loadSound("SFX/boom.mp3")
	}
	songs = {
		"checkmate": loadSound("Songs/checkmate.mp3")
	}
}

function setup() {
	//songs["checkmate"].loop()
	game = new Chess(startFEN)
	for (let element of document.getElementsByClassName("p5Canvas")) {
		element.addEventListener("contextmenu", v => v.preventDefault())
	}
}

function draw() {
	createCanvas(windowWidth, windowHeight)
	decile = Math.min(windowWidth, windowHeight) / 10

	game.draw()
	text(testText, mouseX, mouseY)
}

class Chess {
	constructor(fen) {
		this.boardHistory = [this.initiateBoard(fen)]
		this.bitboards = this.getBitboards(fen)
		this.board = this.initiateBoard(fen)
		this.promoSquare = [false, false]
		this.whiteLeftRook = true
		this.whiteRightRook = true
		this.blackLeftRook = true
		this.blackRightRook = true
		this.highlightSquares = []
		this.arrowSquares = []
		this.moveHistory = []
		this.mode = "board"
		this.turn = true
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
		let bitboards = {}
		let x = 1; let y = 1
		for (let char of fen) {
			if (char === "/") {
				x = 1; y++
			} else if (isNaN(Number(char))) {
				if (bitboards.hasOwnProperty(char)) {
					bitboards[char].push([x, y])
				} else {
					bitboards[char] = [[x, y]]
				} x++
			} else {x += Number(char)}
		}
		return bitboards
	}

	getNotation(x, y) {return `${String.fromCharCode(96+x)}${9-y}`}

	inBounds(x, y) {return Math.max(x, y) < 9 && Math.min(x, y) > 0}

	getColour(piece) {return piece === piece.toUpperCase()}

	copyBoard(board) {
		let copy = []
		for (let v of board) {
			copy.push([...v])
		} return copy
	}

	tween(x1, y1, x2, y2) {
		let xIncre = x2-x1 ? Math.floor((x2-x1) / Math.abs(x2-x1)) : 0
		let yIncre = y2-y1 ? Math.floor((y2-y1) / Math.abs(y2-y1)) : 0
		let tweenSquares = []

		while (x1 !== x2 - xIncre || y1 !== y2 - yIncre) {
			x1 += xIncre; y1 += yIncre
			tweenSquares.push([x1, y1])
		} return tweenSquares
	}

	////////// Front End - User Interface //////////

	draw() {
		// this.highlightSquares = this.bitboards["N"]
		push()
		stroke(0, 0)
		this.drawBoard()
		this.drawHighlightSquares()
		this.drawClickedSquares()
		this.drawPosFromBoard()
		this.showLegalMoves()
		this.drawArrowSquares()
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

	drawHighlightSquares() {
		fill(235, 64, 52, 200)
		for (let [x, y] of this.highlightSquares) {
			if (!flip) {[x, y] = [9-x, 9-y]}
			square(x*decile, y*decile, decile)
		}
	}

	drawClickedSquares() {
		fill(173, 163, 83, 200)
		if (mouseBuffer[2] === CENTER || (mouseIsPressed === true && mouseButton === LEFT) && mouseBuffer[0]) {
			if (flip) {square(mouseBuffer[0] * decile, mouseBuffer[1] * decile, decile)}
			else {square((9 - mouseBuffer[0]) * decile, (9 - mouseBuffer[1]) * decile, decile)}
		}
	}

	drawPosFromBoard() {
		let board = this.boardHistory[this.move]
		let ghostX = false
		let ghostY = false
		for (let x = 1; x <= 8; x++) {
			for (let y = 1; y <= 8; y++) {
				let arrX = flip ? y-1 : 8-y
				let arrY = flip ? x-1 : 8-x
				if (board[arrX][arrY] !== "#") {
					if ([LEFT, CENTER].includes(mouseBuffer[2]) && arrY+1 === mouseBuffer[0] && arrX+1 === mouseBuffer[1] && mouseIsPressed) {
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
		if (!flip && !ghost) {[x1, y1, x2, y2] = [10-x1, 10-y1, 10-x2, 10-y2]}
		else if (!flip && ghost) {[x1, y1] = [10-x1, 10-y1]}
		let hypotenuse = Math.sqrt(Math.abs(x1-x2)**2 + Math.abs(y1-y2)**2)
		let angle = Math.atan((y1-y2) / (x1-x2))
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
		let queen = !this.turn ? "Q" : "q"
		let rook = !this.turn ? "R" : "r"
		let knight = !this.turn ? "N" : "n"
		let bishop = !this.turn ? "B" : "b"
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

	showLegalMoves() {
		if ((mouseBuffer[2] === CENTER || (mouseIsPressed === true && mouseButton === LEFT) && mouseBuffer[0]) && this.mode === "board") {
			let target = this.board[mouseBuffer[1]-1][mouseBuffer[0]-1]
			if ([CENTER, LEFT].includes(mouseBuffer[2]) && (this.getColour(target)) === this.turn) {
				push()
				fill(66, 135, 245, 100)
				for (let [x, y] of this.getLegalMoves(mouseBuffer[0], mouseBuffer[1])) {
					if (!flip) {[x, y] = [9-x, 9-y]}
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
			// Check Check here
			// this.isCheck(...this.bitboards[this.turn ? "K" : "k"][0])

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
				if (colour) { // Checks that every square between the king and rook is empty; AMEND FOR CHESS960
					if (this.whiteLeftRook && this.tween(5, 8, 1, 8).every(v => this.board[v[1]-1][v[0]-1] === "#")) {// || v[0] === this.rookStartX[0] || v[0] === this.bitboards["K"][0][0])) {
						pseudoLegalMoves.push([x1-2, y1])
					}
					if (this.whiteRightRook && this.tween(5, 8, 8, 8).every(v => this.board[v[1]-1][v[0]-1] === "#")) {
						pseudoLegalMoves.push([x1+2, y1])
					}
				} else {
					if (this.blackLeftRook && this.tween(5, 1, 1, 1).every(v => this.board[v[1]-1][v[0]-1] === "#")) {
						pseudoLegalMoves.push([x1-2, y1])
					}
					if (this.blackRightRook && this.tween(5, 1, 8, 1).every(v => this.board[v[1]-1][v[0]-1] === "#")) {
						pseudoLegalMoves.push([x1+2, y1])
					}
				}
				break
		}

		for (let v in pseudoLegalMoves) {
			// v[0] => x2, v[1] => y2
		}

		return pseudoLegalMoves
	}

	handleMove(x1, y1, x2, y2, piece, activeBoard) {
		let moves = this.getLegalMoves(x1, y1)
		let colour = this.getColour(piece)
		let notation = piece.toUpperCase() === "P" ? "" : piece.toUpperCase()
	
		if (moves.some(v => v[0] === x2 && v[1] === y2) && this.mode === "board") {
			move = moves.filter(v => v[0] === x2 && v[1] === y2)[0]
			notation += this.getNotation(x1, y1)
			if (activeBoard[y2-1][x2-1] !== "#") {notation += "x"}
	
			let capturedPiece = activeBoard[y2-1][x2-1]
			if (capturedPiece !== "#") {
				this.bitboards[capturedPiece] = this.bitboards[capturedPiece].filter(v => v[0] !== x2 || v[1] !== y2)
			} this.bitboards[piece][this.bitboards[piece].findIndex(v => v[0] === x1 && v[1] === y1)] = [x2, y2]
	
			activeBoard[y2-1][x2-1] = activeBoard[y1-1][x1-1]
			activeBoard[y1-1][x1-1] = "#"
			if (piece.toUpperCase() === "P") { 
				if (y2 === (colour ? 1 : 8)) { // Promotion
					this.mode = "promo"
					this.promoSquare = [x2, y2]
					this.bitboards[piece] = this.bitboards[piece].filter(v => v[0] !== x2 || v[1] !== y2)
				} else if (move[2] === true) { // En Passant
					notation += "x"
					let capturedPawn = this.getColour(activeBoard[y1-1][x2-1]) ? "P" : "p"
					this.bitboards[capturedPawn] = this.bitboards[capturedPawn].filter(v => v[0] !== x2 || v[1] !== y1)
					activeBoard[y1-1][x2-1] = "#"
				}
			}
	
			notation += this.getNotation(x2, y2)
	
			if (piece.toUpperCase() === "K") {
				if (colour) {
					this.whiteLeftRook = false
					this.whiteRightRook = false
				} else {
					this.blackLeftRook = false
					this.blackRightRook = false
				}
				if (Math.abs(x1-x2) === 2) { // Castling FIX CHESS960
					let rookNewX = x1-x2 > 0 ? 4 : 6
					let rookOldX = x1-x2 > 0 ? 1 : 8 // Here these vals need to be changed to rookStartX
					let rook = colour ? "R" : "r"
					let rookY = colour ? 8 : 1

					this.bitboards[rook][this.bitboards[rook].findIndex(v => v[0] === rookOldX && v[1] === rookY)] = [rookNewX, rookY]
					notation = x1-x2 > 0 ? "O-O-O" : "O-O"
					activeBoard[y2-1][rookNewX-1] = rook
					activeBoard[y2-1][rookOldX-1] = "#"
				}
			}
	
			if ((x1 === 1 && y1 === 1) || (x2 === 1 && y2 === 1)) { // Change this for chess960 too
				this.blackLeftRook = false
			} else if ((x1 === 1 && y1 === 8) || (x2 === 1 && y2 === 8)) {
				this.whiteLeftRook = false
			} else if ((x1 === 8 && y1 === 1) || (x2 === 8 && y2 === 1)) {
				this.blackRightRook = false
			} else if ((x1 === 8 && y1 === 8) || (x2 === 8 && y2 === 8)) {
				this.whiteRightRook = false
			}
			if (this.isCheck(...this.bitboards[this.turn ? "k" : "K"][0], !this.turn)) {
				notation += "+"
			}
			return [activeBoard, notation]
		}
		return false
	}

	isCheck(x1, y1, colour) {
		let opposingKing = this.bitboards[colour ? "k" : "K"][0]
		if (Math.max(Math.abs(x1-opposingKing[0]), Math.abs(y1-opposingKing[1])) === 1) {
			return true // Check by King
		}

		for (let [x, y] of this.bitboards[colour ? "q" : "Q"]) {
			if ([x1-x, y1-y].some(v => v === 0) || Math.abs(x1-x) === Math.abs(y1-y)) {
				if (this.tween(x, y, x1, y1).every(v => this.board[v[1]-1][v[0]-1] === "#")) {
					return true // Check by Queen
				}
			}
		}

		for (let [x, y] of this.bitboards[colour ? "r" : "R"]) {
			if ([x1-x, y1-y].some(v => v === 0)) {
				if (this.tween(x, y, x1, y1).every(v => this.board[v[1]-1][v[0]-1] === "#")) {
					return true // Check by Rook
				}
			}
		}

		for (let [x, y] of this.bitboards[colour ? "b" : "B"]) {
			if (Math.abs(x1-x) === Math.abs(y1-y)) {
				if (this.tween(x, y, x1, y1).every(v => this.board[v[1]-1][v[0]-1] === "#")) {
					return true // Check by Bishop
				}
			}
		}

		for (let [x, y] of this.bitboards[colour ? "n" : "N"]) {
			if ([Math.abs(x1-x), Math.abs(y1-y)].sort().join("") === [1, 2].join("")) {
				return true // Check by Knight
			}
		}

		for (let [x, y] of this.bitboards[colour ? "p" : "P"]) {
			if (Math.abs(x1-x) === 1 && y1 === y + (colour ? 1 : -1)) {
				return true // Check by Pawn
			}
		} return false
	}
}

function printHistory() {
	let moves = document.createElement("textarea")
	let moveList = []
	for (let i = 0; i < game.moveHistory.length; i += 2) {
		moveList.push(`${Math.floor(i/2)+1}. ${game.moveHistory.slice(i, i + 2).join(" ")}`)
	}
	document.body.appendChild(moves)
	testText = moveList.join("     ")
	moves.value = moveList.join("     ")
	moves.select()
	document.execCommand("copy")
	moves.remove()
}

function getRankandFileFromMouse(x, y) {
	if (Math.min(x,y) > decile && Math.max(x,y) < 9 * decile) {
		let rank = Math.floor(x/decile)
		let file = Math.floor(y/decile)
		if (!flip) {rank = 9 - rank; file = 9 - file}
		return [rank, file]
	}
	return [false, false]
}

function mousePressed() {
	[rank, file] = getRankandFileFromMouse(mouseX, mouseY)
	if (mouseButton === LEFT) {
		game.highlightSquares = []; game.arrowSquares = []; move = game.boardHistory.length - 1
		if (game.mode === "promo") { // Promotion
			if (Math.min(rank, file) >= 4 && Math.max(rank, file) <= 5) {
				let piece
				if (rank === 4 && file === 4) {
					piece = !game.turn ? "Q" : "q"
				} else if (rank === 5 && file === 4) {
					piece = !game.turn ? "R" : "r"
				} else if (rank === 4 && file === 5) {
					piece = !game.turn ? "N" : "n"
				} else if (rank === 5 && file === 5) {
					piece = !game.turn ? "B" : "b"
				} // Add promotion check here
				game.bitboards[piece].push([game.promoSquare[0], game.promoSquare[1]])
				game.board[game.promoSquare[1]-1][game.promoSquare[0]-1] = piece
				game.boardHistory[game.boardHistory.length-1][game.promoSquare[1]-1][game.promoSquare[0]-1] = piece
				game.moveHistory[game.moveHistory.length-1] += "=" + piece.toUpperCase()
				if (game.isCheck(...game.bitboards[!game.turn ? "k" : "K"][0], game.turn)) {
					game.moveHistory[game.moveHistory.length-1] += "+"
				} game.mode = "board"
			}
		}
	}

	if (rank && file && mode === "game") {
		if (mouseBuffer[2] === CENTER && mouseButton === LEFT) {
			if ((mouseBuffer[0] !== rank || mouseBuffer[1] !== file) && mouseButton === LEFT) {
				let piece = game.board[mouseBuffer[1] - 1][mouseBuffer[0] - 1]
				let move = game.handleMove(mouseBuffer[0], mouseBuffer[1], rank, file, piece, game.copyBoard(game.board))
				if (move) {
					game.board = move[0] // if success
					game.boardHistory.push(move[0])
					game.move = game.boardHistory.length - 1
					game.turn = !game.turn
					game.moveHistory.push(move[1])
				}

			} mouseBuffer = [false, false, false]
			
		} else if (mouseButton !== LEFT || game.board[file-1][rank-1] !== "#") {
			mouseBuffer = [rank, file, mouseButton]
		} else {mouseBuffer = [false, false, false]}
	} else {mouseBuffer = [false, false, false]}
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
			let move = game.handleMove(mouseBuffer[0], mouseBuffer[1], rank, file, piece, game.copyBoard(game.board))
			if (move) {
				game.board = move[0] // if success
				game.boardHistory.push(move[0])
				game.move = game.boardHistory.length - 1
				game.turn = !game.turn
				game.moveHistory.push(move[1])
			}
		}

	} else if (mouseBuffer[2] === LEFT && (mouseBuffer[0] === rank && mouseBuffer[1] === file)) { // Possible Move
		let piece = game.board[file - 1][rank - 1]
		if (game.getColour(piece) === game.turn && piece !== "#") {
			mouseBuffer[2] = CENTER
		}
	}
}

function keyPressed() {
	switch (key) {
		case "x":
			flip = !flip
			break

		case "r":
			game = new Chess(startFEN)
			break

		case "q":
			printHistory()
			break

		case "ArrowLeft":
			game.move = Math.max(game.move-1, 0)
			break

		case "ArrowRight":
			game.move = Math.min(game.move+1, game.boardHistory.length-1)
			break

		case "ArrowUp":
			game.move = 0
			break

		case "ArrowDown":
			game.move = game.boardHistory.length - 1
			break
	}
}

class Bot {
	constructor() {

	}
}

class BogoBot extends Bot {
	constructor() {

	}
}

class JankBot extends Bot {
	constructor() {
		
	}
}

class Astranaught extends Bot {
	constructor() {
		
	}
}

class Lazaward extends Bot {
	constructor() {
		
	}
}

class AlephInfinity extends Bot {
	constructor() {
		
	}
}

