let startFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"
let newFEN = "rn1qkb1r/pp2pppp/2p2n2/5b2/P1pP3N/2N5/1P2PPPP/R1BQKB1R"
let mouseBuffer = [false, false, false]
let flip = true
let turn = true
let whiteLeftRook = true
let whiteRightRook = true
let blackLeftRook = true
let blackRightRook = true
let highlightSquares = []
let arrowSquares = []
let moveHistory = []
let move = 0
let alpha = []
let knightOffsets = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]]
let pieces
let decile
let testText
let board

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
}

function setup() {
	board = initiateBoard(startFEN)
	boardHistory = [initiateBoard(startFEN)]
	for (let element of document.getElementsByClassName("p5Canvas")) {
		element.addEventListener("contextmenu", v => v.preventDefault());
	}
}

function draw() {
	createCanvas(windowWidth, windowHeight)
	decile = Math.min(windowWidth, windowHeight) / 10

	drawBoard()
	text(testText, mouseX, mouseY)
}

function printHistory() {
	let moves = document.createElement("textarea")
	let moveList = []
	for (let i = 0; i < moveHistory.length; i += 2) {
		moveList.push(`${Math.floor(i/2)+1}. ${moveHistory.slice(i, i + 2).join(" ")}`)
	}
	document.body.appendChild(moves)
	moves.value = moveList.join("     ")
	moves.select()
	document.execCommand("copy")
	moves.remove()
}


function drawBoard() {
	push()
	stroke(0, 0)

	for (let x = 1; x <= 8; x++) {
		for (let y = 1; y <= 8; y++) {
			let rgb = (x+y) % 2 !== 0 ? [100, 50, 175] : [200, 150, 255]
			fill(...rgb)
			square((x*decile), (y*decile), decile)
		}
	}

	drawHighlightSquares()
	drawClickedSquares()
	drawPosFromBoard(boardHistory[move])
	showLegalMoves()
	//drawPosFromFEN(newFEN)
	drawArrowSquares()

	pop()
}

function handleMove(x1, y1, x2, y2, piece) {
	let moves = getLegalMoves(x1, y1)
	let colour = getColour(piece)

	if (moves.some(v => v[0] === x2 && v[1] === y2)) {
		turn = !turn
		board[y2-1][x2-1] = board[y1-1][x1-1]
		board[y1-1][x1-1] = "#"

		if (piece.toUpperCase() === "K") {
			if (colour) {
				whiteLeftRook = false
				whiteRightRook = false
			} else {
				blackLeftRook = false
				blackRightRook = false
			}
			if (Math.abs(x1-x2) === 2) {
				board[y2-1][x1-x2 > 0 ? 3 : 5] = colour ? "R" : "r"
				board[y2-1][x1-x2 > 0 ? 0 : 7] = "#"
			}
		} else if (piece.toUpperCase() === "P" && y2 === (colour ? 1 : 8)) { 
			board[y2-1][x2-1] = colour ? "Q" : "q"
		}

		if ((x1 === 1 && y1 === 1) || (x2 === 1 && y2 === 1)) {
			blackLeftRook = false
		} else if ((x1 === 1 && y1 === 8) || (x2 === 1 && y2 === 8)) {
			whiteLeftRook = false
		} else if ((x1 === 8 && y1 === 1) || (x2 === 8 && y2 === 1)) {
			blackRightRook = false
		} else if ((x1 === 8 && y1 === 8) || (x2 === 8 && y2 === 8)) {
			whiteRightRook = false
		}
		boardHistory.push(copyBoard(board))
		move = boardHistory.length - 1
	}
}

function resetGame() {
	board = initiateBoard(startFEN)
	boardHistory = [initiateBoard(startFEN)]
	moveHistory = []
	mouseBuffer = [false, false, false]
	highlightSquares = []
	arrowSquares = []
	whiteLeftRook = true
	whiteRightRook = true
	blackLeftRook = true
	blackRightRook = true
	turn = true
	move = 0
}

function keyPressed() {
	switch (key) {
		case "x":
			flip = !flip
			break

		case "r":
			resetGame()
			break

		case "q":
			printHistory()
			break

		case "ArrowLeft":
			move--
			if (move === -1) {move = 0}
			break

		case "ArrowRight":
			move++
			if (move === boardHistory.length) {move = boardHistory.length - 1}
			break

		case "ArrowUp":
			move = 0
			break

		case "ArrowDown":
			move = boardHistory.length - 1
			break
	}
}

function inBounds(x, y) {
	return Math.max(x, y) < 9 && Math.min(x, y) > 0
}

function getColour(piece) {
	return piece === piece.toUpperCase()
}

function copyBoard(board) {
	let copy = []
	for (let v of board) {
		copy.push([...v])
	} return copy
}

function getHorizontalMoves(x1, y1) {
	let validMoves = []
	let colour = getColour(board[y1-1][x1-1])
	let x; let y
	for (let axis = 0; axis <= 1; axis++) {
		axis = Boolean(axis)
		for (let i = -1; i <= 1; i += 2) {
			x = axis ? i : 0
			y = !axis ? i : 0
			while (inBounds(x1+x, y1+y)) {
				let target = board[y1+y-1][x1+x-1]
				if (target === "#") {
					validMoves.push([x1+x, y1+y]) // Empty Square
				} else if (getColour(target) !== colour) {
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

function getDiagonalMoves(x1, y1) {
	let validMoves = []
	let colour = getColour(board[y1-1][x1-1])
	let x; let y
	for (let i = -1; i <= 1; i += 2) {
		for (let j = -1; j <= 1; j += 2) {
			x = i; y = j
			while (inBounds(x1+x, y1+y)) {
				let target = board[y1+y-1][x1+x-1]
				if (target === "#") {
					validMoves.push([x1+x, y1+y]) // Empty Square
				} else if (getColour(target) !== colour) {
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

function getLegalMoves(x1, y1) {
	let piece = board[y1 - 1][x1 - 1]
	let colour = getColour(piece)
	let validMoves = []
	switch(piece.toUpperCase()) {
		// Check Check
		case "P":
			let double = colour ? 7 : 2
			let dir = colour ? -1 : 1
			if (inBounds(x1, y1 + dir) && board[y1+dir-1][x1-1] === "#") { // Normal Forwards Moves
				validMoves.push([x1, y1 + dir])
				if (y1 === double && board[y1+(2*dir)-1][x1-1] === "#") { // Double Move
					validMoves.push([x1, y1 + (2 * dir)])
				}
			}

			for (let i = -1; i <= 1; i += 2) { // Capture Moves
				let target = board[y1+dir-1][x1+i-1]
				if (inBounds(x1+i, y1+dir) && getColour(target) !== colour && target !== "#") {
					validMoves.push([x1 + i, y1 + dir])	
				}
			}
			break

		case "N":
			for (let [x, y] of knightOffsets) {
				if (inBounds(x1+x, y1+y)) {
					let target = board[y1+y-1][x1+x-1]
					if (target === "#") { // Normal move
						validMoves.push([x1+x, y1+y])
					} else if (getColour(target) !== colour) { // Capture
						validMoves.push([x1+x, y1+y])
					}
				}
			}
			break

		case "B":
			validMoves = getDiagonalMoves(x1, y1)
			break
		
		case "R":
			validMoves = getHorizontalMoves(x1, y1)
			break
		
		case "Q":
			validMoves = getDiagonalMoves(x1, y1).concat(getHorizontalMoves(x1, y1))
			break

		case "K":
			for (let i = -1; i <= 1; i++) {
				for (let j = -1; j <= 1; j++) {
					if (inBounds(x1+i, y1+j)) {
						let target = board[y1+j-1][x1+i-1]
						if ((i !== 0 || j !== 0) && (getColour(target) !== colour || target === "#")) {
							validMoves.push([x1+i, y1+j])
						}
					}
				}
			}
			// check castling here
			if (colour) { // Checks that every square between the king and rook is empty
				if (whiteLeftRook && [board[7][1], board[7][2], board[7][3]].every(v => v === "#")) {
					validMoves.push([x1-2, y1])
				}
				if (whiteRightRook && [board[7][5], board[7][6]].every(v => v === "#")) {
					validMoves.push([x1+2, y1])
				}
			} else {
				if (blackLeftRook && [board[0][1], board[0][2], board[0][3]].every(v => v === "#")) {
					validMoves.push([x1-2, y1])
				}
				if (blackRightRook && [board[0][5], board[0][6]].every(v => v === "#")) {
					validMoves.push([x1+2, y1])
				}
			}
			break
	}
	return validMoves
}

function showLegalMoves() {
	if (mouseBuffer[0] !== false) {
		let target = board[mouseBuffer[1]-1][mouseBuffer[0]-1]
		if ([CENTER, LEFT].includes(mouseBuffer[2]) && (getColour(target)) === turn) {
			push()
			fill(66, 135, 245, 100)
			for (let [x, y] of getLegalMoves(mouseBuffer[0], mouseBuffer[1])) {
				if (!flip) {[x, y] = [9-x, 9-y]}
				circle((x + 0.5) * decile, (y + 0.5) * decile, decile/3)
			} pop()
		}
	}
}

function mousePressed() {
	[rank, file] = getRankandFileFromMouse(mouseX, mouseY)
	if (mouseButton === LEFT) {highlightSquares = []; arrowSquares = []; move = boardHistory.length - 1}

	if (rank && file) {
		if (mouseBuffer[2] === CENTER && mouseButton === LEFT) {
			if ((mouseBuffer[0] !== rank || mouseBuffer[1] !== file) && mouseButton === LEFT) {
				let piece = board[mouseBuffer[1] - 1][mouseBuffer[0] - 1]
				handleMove(mouseBuffer[0], mouseBuffer[1], rank, file, piece)
			} mouseBuffer = [false, false, false]
			
		} else if (mouseButton !== LEFT || board[file-1][rank-1] !== "#") {
			mouseBuffer = [rank, file, mouseButton]
		} else {mouseBuffer = [false, false, false]}
	} else {mouseBuffer = [false, false, false]}
}

function mouseReleased() {
	[rank, file] = getRankandFileFromMouse(mouseX, mouseY)
	if (mouseBuffer.join("") === [rank, file, RIGHT].join("") && rank && file) {
		handleHighlightSquares()

	} else if (mouseBuffer[2] === RIGHT && mouseBuffer[0] && mouseBuffer[1] && rank && file) {
		handleArrowSquares()

	} else if (mouseBuffer[2] === LEFT && (mouseBuffer[0] !== rank || mouseBuffer[1] !== file)) {
		let piece = board[mouseBuffer[1] - 1][mouseBuffer[0] - 1]
		if (getColour(piece) === turn && piece !== "#") {
			handleMove(mouseBuffer[0], mouseBuffer[1], rank, file, piece)
		}

	} else if (mouseBuffer[2] === LEFT && (mouseBuffer[0] === rank && mouseBuffer[1] === file)) {
		let piece = board[file - 1][rank - 1]
		if (getColour(piece) === turn && piece !== "#") {
			mouseBuffer[2] = CENTER
		}
	}
}

function drawArrow(x1, y1, x2, y2, ghost=false) {
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

function drawHighlightSquares() {
	fill(235, 64, 52, 200)
	for (let [x, y] of highlightSquares) {
		if (!flip) {[x, y] = [9-x, 9-y]}
		square(x*decile, y*decile, decile)
	}
}

function drawArrowSquares() {
	fill(235, 64, 52, 200)
	rectMode(CENTER)
	for (let [x1, y1, x2, y2] of arrowSquares) {
		drawArrow(x1, y1, x2, y2)
	}
	if (mouseBuffer[2] === RIGHT && mouseIsPressed === true && mouseButton === RIGHT && mouseBuffer[0]) {
		drawArrow(mouseBuffer[0]+0.5, mouseBuffer[1]+0.5, mouseX/decile, mouseY/decile, true)
	}
}

function drawClickedSquares() {
	fill(173, 163, 83, 200)
	if (mouseBuffer[2] === CENTER || (mouseIsPressed === true && mouseButton === LEFT) && mouseBuffer[0]) {
		if (flip) {square(mouseBuffer[0] * decile, mouseBuffer[1] * decile, decile)}
		else {square((9 - mouseBuffer[0]) * decile, (9 - mouseBuffer[1]) * decile, decile)}
	}
}

function drawPosFromFEN(fen) {
	let x = flip ? 1 : 8
	let y = flip ? 1 : 8

	for (let char of fen) {
		if (char === "/") {
			x = flip ? 1 : 8
			flip ? y++ : y--
		} else if (isNaN(Number(char))) {
			image(pieces[char], x*decile, y*decile, decile, decile)
			flip ? x++ : x--
		} else {
			flip ? x += Number(char) : x -= Number(char)
		}
	}
}

function initiateBoard(fen) {
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

function drawPosFromBoard(board) {
	let ghostX = false
	let ghostY = false
	for (let x = 1; x <= 8; x++) {
		for (let y = 1; y <= 8; y++) {
			arrX = flip ? y-1 : 8-y
			arrY = flip ? x-1 : 8-x
			if (board[arrX][arrY] !== "#") {
				if ([LEFT, CENTER].includes(mouseBuffer[2]) && arrY+1 === mouseBuffer[0] && arrX+1 === mouseBuffer[1] && mouseIsPressed) {
					ghostX = arrX
					ghostY = arrY
				} else {
					image(pieces[board[arrX][arrY]], x*decile, y*decile, decile, decile)					
				}
			}
		}
	}
	if (ghostX !== false && ghostY !== false) {
		push()
		imageMode(CENTER)
		image(pieces[board[ghostX][ghostY]], mouseX, mouseY, decile, decile)
		pop()	
	}	
}

function handleHighlightSquares() {
	if (highlightSquares.every(arr => arr.join("") !== [rank, file].join(""))) {
		highlightSquares.push([rank, file])
	} else {
		highlightSquares = highlightSquares.filter(v => v.join("") !== [rank, file].join(""))
	}
}

function handleArrowSquares() {
	if (arrowSquares.every(arr => arr.join("") !== [mouseBuffer[0]+0.5, mouseBuffer[1]+0.5, rank+0.5, file+0.5].join(""))) {
		arrowSquares.push([mouseBuffer[0]+0.5, mouseBuffer[1]+0.5, rank+0.5, file+0.5])
	} else {
		arrowSquares = arrowSquares.filter(v => v.join("") !== [mouseBuffer[0]+0.5, mouseBuffer[1]+0.5, rank+0.5, file+0.5].join(""))
	}
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
