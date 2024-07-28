const {max, min, abs, floor, ceil, hypot} = Math
const dist = (x1, y1, x2, y2) => hypot(x2-x1, y2-y1)
const random = (arr) => arr[floor(Math.random()*arr.length)]
let startFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"
let promiseDB = true

onmessage = (v) => {
	let plr = v.data[0], args = v.data[1]
	switch (plr) {
		case "Fortuna":
			new Fortuna(...args).makeMove()
			break

		case "Equinox":
			new Equinox(...args).makeMove()
			break
			
		case "Astor":
			new Astor(...args).makeMove()
			break

		case "Lazaward":
			new Lazaward(...args).makeMove()
			break

		case "Aleph":
			new Aleph(...args).makeMove()
			break
	}
}

class Chess { // Main Section of Code
	constructor(fen, wPlayer="Human", bPlayer="Human", wTime=600000, bTime=600000, wIncr=0, bIncr=0, activeColour=true, castleArr=[true, true, true, true], targetSquare=[false, false], halfMoves=0) {
		this.boardHistory = [this.initiateBoard(fen)]
		this.bitboards = [this.getBitboards(fen)]
		this.board = this.initiateBoard(fen)
		this.promoSquare = [false, false, false, false]
		this.canCastle = [[...castleArr]]
		this.passantHistory = [[...targetSquare]]
		this.highlightSquares = []
		this.arrowSquares = []
		this.moveHistory = []
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
		this.flip = true
		this.move = 0
		this.status = "active"
		this.threeFold = []
		this.lastCapture = [-halfMoves]
		this.start = true
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
		this.drawTimer()
		this.drawIcons()
		this.drawUtility()
		this.drawPieceDeficit()
		if ((windowWidth/windowHeight) >= 1.85) {this.drawNotation()}
		if (this.mode === "promo") {this.promotionUI()}
		if (!["active", "finish"].includes(this.status)) {this.drawEndScreen()}
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

	drawPieceDeficit() {
		// push()
		// imageMode(CENTER)
		// image(pieces["q"], 11.4*decile, 7.25*decile, decile*1.25, decile*1.25)
		// pop()
	} // Finish later innit

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

		if (this.status === "active" && (this.turn ? this.whitePlayer : this.blackPlayer) !== "Human" && this.mode !== "promo") {
			let args = [this.copyBoard(this.board), this.copyBitboard(this.bitboards[this.bitboards.length-1]), [...this.canCastle[this.canCastle.length-1]], this.passantHistory[this.passantHistory.length-1], this.turn, this.move]
			botApi.postMessage([(this.turn ? this.whitePlayer : this.blackPlayer), args])
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
			//if(prev==="a4") {console.log(args[3])}
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
	} // FIX CHESS960 HERE <--------------------------------------!!!!!!!

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
	} // FIX CHESS960 HERE <--------------    return [{0}activeBoard, {1}castleArr, {2}locator, {3}notation, {4}passantSquare]

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

	resetBoard() {console.log("hi"); this.status = "killed"; game = new Chess(startFEN, players[wPlayer-1], players[bPlayer-1], this.timeToMs(timeInputs["wMins"].value(), timeInputs["wSecs"].value()), this.timeToMs(timeInputs["bMins"].value(), timeInputs["bSecs"].value()), timeInputs["wIncr"].value()*1000, timeInputs["bIncr"].value()*1000)}

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

class Fortuna extends Chess {
	constructor(_board, _bitboards, _canCastle, _passantHistory, _turn, _move) {
		super(startFEN)
		this.board = _board
		this.boardHistory = [_board]
		this.bitboards = [_bitboards]
		this.canCastle = [_canCastle]
		this.passantHistory = [_passantHistory]
		this.turn = _turn
		this.moveCounter = _move
	}

	makeMove() {
		setTimeout(() => {
			postMessage(random(this.getAllLegalMoves()))
		}, 300)
	}
}

class Equinox extends Fortuna {
	constructor(_board, _bitboards, _canCastle, _passantHistory, _turn, _move) {
		super(_board, _bitboards, _canCastle, _passantHistory, _turn, _move)
		this.pieceValues = {"P": 1, "N": 3, "B": 3, "R": 5, "Q": 9}
	}

	evaluate() {
		let totalDist = 0
		let pieces = ["P", "N", "B"]
		if (!this.turn) {pieces = pieces.map(v => v.toLowerCase())}
		if (this.moveCounter <= 25) {
			for (let p of pieces) {
				for (let [x1, y1] of this.bitboards[this.bitboards.length-1][p]) {
					totalDist += (this.turn ? 0.5 - dist(4.5, 4.5, x1, y1)/10: dist(4.5, 4.5, x1, y1)/10) 
				}				
			}
		}

		let [wMats, bMats] = this.getMatList()
		wMats = wMats.map(v => this.pieceValues[v.toUpperCase()]).reduce((total, v) => total + v, 0)
		bMats = bMats.map(v => this.pieceValues[v.toUpperCase()]).reduce((total, v) => total + v, 0)
		let matDiff = wMats - bMats


		return matDiff + totalDist
	}

	makeMove() {
		let moves = this.getAllLegalMoves()
		let moveEvals = []

		for (let v1 of moves) {
			let evalsTemp = []
			this.updateAttributes(this.handleMove(...v1, true))

			for (let v2 of this.getAllLegalMoves()) {
				this.updateAttributes(this.handleMove(...v2, true))
				evalsTemp.push(this.evaluate())
				this.undoMove(true)
			}

			moveEvals.push(this.turn ? max(...evalsTemp) : min(...evalsTemp))
			this.undoMove(true)
		}

		let bestEval = this.turn ? max(...moveEvals) : min(...moveEvals)
		let bestIndices = moveEvals.map((v, i) => {if (v === bestEval) {return i}}).filter(v => v !== undefined)

		postMessage(moves[random(bestIndices)])
 	}
}

class Astor extends Equinox {
	constructor(_board, _bitboards, _canCastle, _passantHistory, _turn, _move) {
		super(_board, _bitboards, _canCastle, _passantHistory, _turn, _move)
	}

	makeMove() {
		return new Promise((resolve) => {
			resolve(null)
		})
	}
}

class Lazaward extends Astor {
	constructor(_board, _bitboards, _canCastle, _passantHistory, _turn, _move) {
		super(_board, _bitboards, _canCastle, _passantHistory, _turn, _move)
	}

	makeMove() {
		return new Promise((resolve) => {
			resolve(null)
		})
	}
}

class Aleph extends Lazaward {
	constructor(_board, _bitboards, _canCastle, _passantHistory, _turn, _move) {
		super(_board, _bitboards, _canCastle, _passantHistory, _turn, _move)
	}

	makeMove() {
		return new Promise((resolve) => {
			resolve(null)
		})
	}
}
