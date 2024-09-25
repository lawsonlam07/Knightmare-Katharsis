const {max, min, abs, floor, ceil, hypot} = Math
const dist = (x1, y1, x2, y2) => hypot(x2-x1, y2-y1)
const random = (arr) => arr[floor(Math.random()*arr.length)]

let startFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"
let promiseDB = true
let mode = "Standard"


const book = [
	["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6", "Be3", "e5", "Nb3", "Be6", "f3"],
	["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6", "Be3", "e5", "Nb3", "Be6", "f3", "h5", "Qd2", "Nbd7", "Nd5", "Bxd5", "exd5", "g6", "Be2"],
	["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Ba4", "Nf6", "O-O", "Be7", "Re1", "b5", "Bb3", "d6", "c3", "O-O"],
	["e4", "e5", "Nf3", "Nc6", "Bb5", "Nf6", "O-O", "Nxe4", "d4", "Nd6", "Bxc6", "dxc6", "dxe5", "Nf5", "Qxd8+", "Kxd8"],
	["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6", "Bg5", "e6", "f4", "Qb6", "Qd2", "Qxb2", "Rb1"],
	["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6", "Be2", "e5", "Nb3", "Be7", "Qd3", "O-O", "O-O", "Be6"],
	["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Ba4", "Nf6", "O-O", "Be7", "Re1", "b5", "Bb3", "d6", "c3", "O-O", "h3", "Nb8", "d4", "Nbd7", "Nbd2", "Bb7", "Bc2"],
	["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6", "Bg5", "e6", "f4", "Qb6", "Qd2", "Qxb2", "Rb1", "Qa3", "e5", "h6", "Bh4", "dxe5", "fxe5", "g5", "exf6", "gxh4", "Be2"],
	["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6", "Bg5", "Nc6", "Qd2", "e6", "O-O-O", "Bd7"],
	["e4", "c5", "Nf3", "Nc6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "e5", "Ndb5", "d6", "Bg5", "a6", "Na3"],
	["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Ba4", "Nf6", "O-O", "b5", "Bb3", "Bb7", "d3", "Be7", "Nc3", "d6"],
	["e4", "e5", "Nf3", "Nc6", "Bb5", "Nf6", "O-O", "Nxe4", "d4", "Nd6", "Bxc6", "dxc6", "dxe5", "Nf5", "Qxd8+", "Kxd8", "Nc3", "Ke8", "Rd1", "Ne7", "h3", "Bf5", "Nd4", "Bg6"],
	["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6", "Be3", "e5", "Nb3", "Be6", "Be2", "Be7", "Nd5"],
	["d4", "Nf6", "c4", "e6", "Nf3", "d5", "Nc3", "c6", "e3", "Nbd7", "Qc2", "Bd6", "Bd3", "O-O", "O-O", "dxc4"],
	["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Ba4", "Nf6", "O-O", "Be7", "Re1", "b5", "Bb3", "d6", "c3", "O-O", "h3", "Re8", "d4", "Bb7", "Nbd2", "exd4", "cxd4", "Nd7", "Nf1", "Na5", "Bc2"],
	["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6", "Be3", "Ng4", "Bg5", "h6", "Bh4", "g5", "Bg3"],
	["e4", "c6", "d4", "d5", "Nc3", "dxe4", "Nxe4", "Bf5", "Ng3", "Bg6", "h4", "h6", "Nf3", "Nd7", "h5", "Bh7"],
	["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6", "f3", "e5", "Nb3", "Be6", "Be3", "h5", "Qd2", "Nbd7", "Be2"],
	["d4", "Nf6", "c4", "e6", "Nf3", "d5", "Nc3", "c6", "e3", "Nbd7", "Bd3", "dxc4", "Bxc4", "b5", "Bd3", "Bb7"],
	["d4", "Nf6", "c4", "e6", "Nf3", "d5", "Nc3", "c6", "Bg5", "h6", "Bh4", "dxc4", "e4", "g5", "Bg3", "b5"],
	["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6", "Be3", "e5", "Nb3", "Be6", "f3", "h5", "Qd2", "Nbd7", "Nd5", "Nxd5", "exd5", "Bf5", "Be2", "Qh4+", "Bf2", "Qf6", "Bd3", "Be7", "O-O"],
	["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6", "Be3", "e5", "Nb3", "Be7", "Be2", "Be6", "Nd5", "Nxd5", "exd5", "Bf5", "Qd2", "O-O", "O-O"],
	["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6", "Be3", "e5", "Nb3", "Be6", "f3", "Be7", "Qd2", "O-O", "O-O-O", "Nbd7", "g4", "b5", "g5", "Nh5", "Kb1", "Nb6", "Nd5", "Nxd5", "exd5", "Bf5", "Na5", "f6"],
	["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "g6", "Be3", "Bg7", "f3", "O-O", "Qd2", "Nc6"],
	["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6", "h3", "e6", "g4", "h6", "Bg2", "Be7", "Be3", "Nc6"],
	["d4", "Nf6", "c4", "e6", "Nf3", "d5", "Nc3", "c6", "e3", "Nbd7", "Qc2", "Bd6", "Bd3", "O-O", "O-O", "dxc4", "Bxc4", "a6", "Rd1", "b5", "Bd3", "Bb7", "Ng5"],
	["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Ba4", "b5", "Bb3", "Nf6", "O-O", "Bb7", "d3", "Be7", "c4", "O-O", "Nc3", "bxc4", "Bxc4", "d6"],
	["e4", "c5", "Nf3", "e6", "d4", "cxd4", "Nxd4", "Nc6", "Nc3", "Qc7", "Be2", "a6", "O-O", "Nf6", "Be3", "Bb4"],
	["e4", "e6", "d4", "d5", "Nc3", "dxe4", "Nxe4", "Nf6", "Bg5", "Be7", "Bxf6", "gxf6", "Nf3", "f5", "Nc3", "a6"],
	["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6", "Be3", "e6", "f3", "b5", "Qd2", "Nbd7", "g4", "b4"],
	["e4", "c5", "Nf3", "Nc6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "e5", "Ndb5", "d6", "Bg5", "a6", "Na3", "b5", "Nd5", "Be7", "Bxf6", "Bxf6", "c3", "O-O", "Nc2", "Bg5", "a4", "bxa4", "Rxa4"],
	["e4", "c5", "Nf3", "e6", "d4", "cxd4", "Nxd4", "Nc6", "Nc3", "Qc7", "Be2", "a6", "Be3", "Nf6", "O-O", "Bb4", "Na4", "Be7"],
	["e4", "c6", "d4", "d5", "e5", "Bf5", "Nf3", "e6", "Be2", "Nd7", "O-O", "Ne7", "c3", "h6", "Nbd2", "Qc7"],
	["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6", "Be3", "e5", "Nb3", "Be6", "Be2", "Be7", "Qd3", "Nbd7", "Nd5", "O-O", "O-O", "Bxd5", "exd5", "Rc8"],
	["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6", "Bg5", "Nbd7", "f4", "e5", "Nf5", "Qb6", "Qd2"],
	["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Ba4", "b5", "Bb3", "Nf6", "O-O", "Bb7", "Re1", "Bc5", "c3", "Bb6"],
	["e4", "c5", "Nf3", "e6", "d4", "cxd4", "Nxd4", "Nc6", "Nc3", "Nf6", "Ndb5", "d6", "Bf4", "e5", "Bg5", "a6"],
	["e4", "e6", "d4", "d5", "Nc3", "Nf6", "e5", "Nfd7", "f4", "c5", "Nf3", "Nc6", "Be3", "a6", "Qd2", "b5"],
	["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6", "Be3", "e5", "Nb3", "Be6", "f3", "h5", "Qd2", "Nbd7", "a3", "Be7", "O-O-O", "b5", "Kb1", "Rc8", "h4", "O-O", "Bg5"],
	["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6", "Be3", "e5", "Nb3", "Be6", "f3", "Nbd7", "Qd2", "b5", "O-O-O", "Be7", "g4", "b4", "Nd5"],
	["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6", "Be3", "e5", "Nb3", "Be6", "f3", "h5", "Be2", "Nbd7", "Nd5", "Nxd5", "exd5", "Bf5"],
	["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6", "f3", "e5", "Nb3", "Be6", "Be3", "h5", "Qd2", "Nbd7", "Nd5", "Bxd5", "exd5", "g6", "Be2", "Bg7", "Na5", "Qc7", "O-O"],
	["e4", "c6", "d4", "d5", "Nc3", "dxe4", "Nxe4", "Bf5", "Ng3", "Bg6", "h4", "h6", "Nf3", "Nd7", "h5", "Bh7", "Bd3", "Bxd3", "Qxd3", "e6", "Bf4", "Qa5+", "Bd2"],
	["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "Nc6", "Bg5", "e6", "Qd2", "a6", "O-O-O", "Bd7", "f4", "b5"],
	["e4", "e5", "Nf3", "Nc6", "Bb5", "Bc5", "c3", "Nf6", "O-O", "O-O", "d4", "Bb6", "Bg5", "h6", "Bh4", "d6"],
	["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6", "Be3", "e6", "f3", "b5", "Qd2", "Nbd7", "g4", "b4", "Na4", "h6", "O-O-O", "Ne5", "Qxb4", "Bd7", "Bf4", "g5", "Bd2"],
	["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Ba4", "Nf6", "O-O", "Nxe4", "d4", "b5", "Bb3", "d5", "dxe5", "Be6"],
	["e4", "e5", "Nf3", "Nf6", "Nxe5", "d6", "Nf3", "Nxe4", "d4", "d5", "Bd3", "Nc6", "O-O", "Be7", "c4", "Nb4"],
	["e4", "c5", "Nf3", "Nc6", "d4", "cxd4", "Nxd4", "e5", "Nb5", "d6", "N1c3", "a6", "Na3", "b5", "Nd5", "Nf6"],
	["d4", "Nf6", "c4", "e6", "Nf3", "d5", "Nc3", "c6", "Bg5", "h6", "Bxf6", "Qxf6", "e3", "Nd7", "Bd3", "dxc4"],
	["d4", "Nf6", "Bf4", "d5", "e3", "c5", "Nd2", "e6", "Ngf3", "Nc6", "c3", "Bd6", "Bg3", "O-O", "Bd3", "b6", "Ne5", "Bb7", "f4"],
	["d4", "Nf6", "c4", "e6", "Nf3", "b6", "g3", "Ba6", "b3", "Bb4+", "Bd2", "Be7", "Bg2", "c6", "Bc3", "d5"],
	["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Ba4", "Nf6", "O-O", "b5", "Bb3", "Bb7", "d3", "Be7", "Nc3", "d6", "a4", "Na5", "Ba2", "b4", "Ne2", "Rb8", "Ng3"],
	["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6", "Be2", "e5", "Nb3", "Be7", "Qd3", "O-O", "O-O", "Be6", "Be3", "Nbd7", "Nd5", "Bxd5", "exd5", "Rc8", "c4", "Ne8", "Qd2", "f5", "g3"],
	["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Ba4", "Nf6", "O-O", "b5", "Bb3", "Be7", "d4", "d6", "dxe5", "dxe5", "Qxd8+", "Bxd8", "a4", "b4"],
	["c4", "e5", "Nc3", "Nf6", "g3", "d5", "cxd5", "Nxd5", "Bg2", "Nb6", "Nf3", "Nc6", "O-O", "Be7", "d3", "O-O"],
	["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Ba4", "Nf6", "O-O", "Be7", "Bxc6", "dxc6", "Nc3", "Bg4", "h3", "Bh5"],
	["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6", "Bg5", "Nc6", "Qd2", "e6", "O-O-O", "Bd7", "f4", "h6", "Bh4", "b5", "Bxf6", "gxf6", "Kb1", "Qb6"],
	["e4", "e5", "Nf3", "Nc6", "Bb5", "Nf6", "O-O", "Nxe4", "Re1", "Nd6", "Bf1", "Be7", "Nxe5", "Nxe5", "Rxe5", "O-O"],
	["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6", "Be3", "e5", "Nb3", "Be6", "f3", "Be7", "Qd2", "h5", "Nd5", "Nxd5", "exd5", "Bf5", "Be2", "Bh4+", "g3", "Be7", "O-O-O", "Nd7"],
	["e4", "e5", "Nf3", "Nc6", "Bb5", "Nf6", "d3", "Bc5", "c3", "O-O", "O-O", "d6", "Nbd2", "h6", "h3", "a6", "Bxc6", "bxc6"],
	["e4", "e6", "d4", "d5", "Nc3", "Bb4", "e5", "Ne7", "a3", "Bxc3+", "bxc3", "c5", "Qg4", "O-O", "Bd3", "Nbc6"],
	["e4", "c5", "Nf3", "e6", "d4", "cxd4", "Nxd4", "Nc6", "Nc3", "Qc7", "Be2", "a6", "Be3", "Nf6", "O-O", "Bb4", "Na4", "Be7", "Nxc6", "bxc6", "Nb6", "Rb8", "Nxc8", "Qxc8", "Bd4", "c5", "Be5"],
	["c4", "e5", "Nc3", "Nf6", "Nf3", "Nc6", "g3", "d5", "cxd5", "Nxd5", "Bg2", "Nb6", "O-O", "Be7", "a3", "O-O"],
	["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Ba4", "Nf6", "O-O", "Be7", "Re1", "b5", "Bb3", "O-O", "a4", "Bb7", "d3"],
	["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6", "Be3", "e5", "Nb3", "Be6", "f3", "h5", "Nd5", "Nxd5", "exd5", "Bf5", "Bd3", "Bxd3", "Qxd3"],
	["e4", "e6", "d4", "d5", "Nc3", "Nf6", "e5", "Nfd7", "f4", "c5", "Nf3", "Nc6", "Be3", "cxd4", "Nxd4", "Bc5", "Qd2", "O-O", "O-O-O"],
	["d4", "Nf6", "c4", "e6", "Nf3", "d5", "Nc3", "c6", "e3", "Nbd7", "Bd3", "dxc4", "Bxc4", "b5", "Bd3", "Bb7", "O-O", "a6", "e4", "c5", "d5", "Qc7", "dxe6", "fxe6"],
	["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Bxc6", "dxc6", "O-O", "Bg4", "h3", "h5", "d3", "Qf6", "Nbd2", "Ne7"],
	["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6", "Be3", "Ng4", "Bg5", "h6", "Bh4", "g5", "Bg3", "Bg7", "h3", "Ne5", "f3", "Nbc6", "Bf2", "Ng6", "Qd2", "Nxd4", "Bxd4", "Bxd4", "Qxd4"],
	["e4", "e5", "Nf3", "Nc6", "Bb5", "f5", "d3", "fxe4", "dxe4", "Nf6", "O-O", "Bc5", "Nc3", "d6", "Bg5", "O-O"],
	["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Ba4", "Nf6", "O-O", "b5", "Bb3", "Be7", "Re1", "O-O", "c3", "d5", "exd5", "Nxd5", "Nxe5", "Nxe5", "Rxe5", "c6", "d4", "Bd6", "Re1", "Qh4", "g3", "Qh3", "Qe2"],
	["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6", "Bg5", "Nbd7", "f4", "e5", "Nf5", "Qb6", "Qd2", "Qxb2", "Rb1", "Qa3", "fxe5", "dxe5", "Bc4", "Qa5", "O-O", "Qc5+", "Ne3"],
	["d4", "Nf6", "c4", "g6", "Nc3", "d5", "cxd5", "Nxd5", "e4", "Nxc3", "bxc3", "Bg7", "Nf3", "c5", "Rb1", "O-O"],
	["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6", "f3", "e6", "Be3", "b5", "Qd2", "Nbd7", "O-O-O", "Bb7", "a3"],
	["d4", "Nf6", "c4", "e6", "Nf3", "d5", "g3", "dxc4", "Bg2", "Nc6", "Qa4", "Bb4+", "Bd2", "Nd5", "Bxb4", "Ndxb4"],
	["d4", "Nf6", "c4", "e6", "Nf3", "b6", "g3", "Ba6", "b3", "Bb4+", "Bd2", "Be7", "Bg2", "c6", "Bc3", "d5", "Ne5", "Nfd7", "Nxd7", "Nxd7", "Nd2", "O-O", "O-O"],
	["d4", "Nf6", "Nf3", "d5", "c4", "e6", "Nc3", "c6", "Bg5", "h6", "Bh4", "dxc4", "e4", "g5", "Bg3", "b5", "Be2", "Bb7", "O-O"],
	["e4", "c5", "Nf3", "e6", "d4", "cxd4", "Nxd4", "Nc6", "Nc3", "Qc7", "Be3", "a6", "Qd2", "Nf6", "O-O-O", "Bb4", "f3"],
	["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6", "Be3", "e5", "Nb3", "Be6", "Be2", "Be7", "Nd5", "Nxd5", "exd5", "Bf5", "Qd2", "O-O", "O-O", "Nd7", "Na5", "Qc7", "c4"],
	["e4", "c5", "Nf3", "Nc6", "d4", "cxd4", "Nxd4", "g6", "Nc3", "Bg7", "Be3", "Nf6", "Bc4", "O-O", "Bb3", "d6"],
	["e4", "c6", "c3", "d5", "e5", "Bf5", "d4", "e6", "Bd3", "Ne7", "Ne2", "Nd7", "O-O", "Bxd3", "Qxd3", "c5"],
	["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6", "Be3", "e5", "Nb3", "Be6", "Be2", "Nbd7", "Qd3", "Rc8", "a4", "Be7", "O-O", "O-O", "a5"],
	["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6", "Be2", "e5", "Nb3", "Be7", "Be3", "Be6", "Nd5", "Nxd5", "exd5", "Bf5", "O-O"],
	["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6", "h3", "e6", "g4", "b5", "Bg2", "Bb7", "O-O", "Nfd7"],
	["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6", "Be3", "Ng4", "Bg5", "h6", "Bh4", "g5", "Bg3", "Bg7", "h3", "Ne5", "Nf5", "Bxf5", "exf5", "Nbc6", "Nd5", "O-O", "Be2", "e6", "fxe6", "fxe6", "Ne3", "d5"],
	["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6", "Be2", "e5", "Nb3", "Be7", "Qd3", "O-O", "O-O", "Be6", "Nd5", "Nxd5", "exd5", "Bc8", "Be3", "Nd7", "a4", "f5", "c4"],
	["d4", "d5", "c4", "c6", "Nf3", "Nf6", "Nc3", "e6", "Bg5", "h6", "Bh4", "dxc4", "e4", "g5", "Bg3", "b5", "Be2", "Bb7", "O-O", "Nbd7"],
	["e4", "c5", "Nf3", "Nc6", "d4", "cxd4", "Nxd4", "e5", "Nb5", "d6", "N1c3", "a6", "Na3", "b5", "Nd5", "Nf6", "Bg5", "Be7", "Bxf6", "Bxf6", "c3", "Rb8", "Nc2", "Bg5"],
	["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6", "Be3", "e5", "Nf3", "Be7", "Bc4", "O-O", "O-O", "Be6", "Bxe6"],
	["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6", "Bg5", "Nbd7", "f4", "Qb6", "Qd2", "e5", "Nf5", "Qxb2", "Rb1", "Qa3", "fxe5", "dxe5", "Bc4", "Qa5", "O-O", "Qc5+", "Ne3", "b5"],
	["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6", "Bc4", "e6", "O-O", "b5", "Bb3", "Be7", "Qf3", "Qb6"],
	["e4", "g6", "d4", "Bg7", "Nc3", "d5", "Nxd5", "c6", "Nf4", "Qxd4", "Qxd4", "Bxd4", "Bc4", "Nf6", "Nf3", "Bb6"],
	["d4", "d5", "c4", "c6", "Nf3", "Nf6", "Nc3", "dxc4", "a4", "Bf5", "Ne5", "Nbd7", "Nxc4", "Qc7", "g3", "e5"],
	["d4", "d5", "c4", "c6", "Nf3", "Nf6", "Nc3", "e6", "Bg5", "h6", "Bh4", "dxc4", "e4", "g5", "Bg3", "b5", "Be2", "Bb7", "h4", "g4", "Ne5", "Nbd7", "Bxg4", "Nxe5", "Bxe5", "Rg8", "Bf3"],
	["d4", "d5", "c4", "c6", "Nf3", "e6", "Nc3", "dxc4", "a4", "Bb4", "e3", "b5", "Bd2", "a5", "axb5", "Bxc3"],
	["e4", "g6", "d4", "Bg7", "Nc3", "d6", "f4", "Nf6", "Nf3", "O-O", "Bd3", "Na6", "O-O", "c5", "d5", "Rb8"],
	["d4", "d5", "c4", "c6", "Nf3", "Nf6", "Nc3", "dxc4", "a4", "Bf5", "Ne5", "Nbd7", "Nxc4", "Qc7", "g3", "e5", "dxe5", "Nxe5", "Bf4", "Nfd7", "Bg2", "f6", "O-O"],
	["Nf3", "Nf6", "c4", "e6", "Nc3", "c5", "g3", "b6", "Bg2", "Bb7", "O-O", "Be7", "d4", "cxd4", "Qxd4", "d6", "Bg5"],
	["Nf3", "Nf6", "c4", "c5", "Nc3", "e6", "g3", "d5", "cxd5", "exd5", "d4", "Nc6", "Bg2", "Be7", "O-O", "c4"]
]


onmessage = (v) => {
	let plr = v.data[0], args = v.data[1]
	mode = v.data[2]


	switch (plr) {
		case "Fortuna":
			new Fortuna(...args).makeMove()
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

class Chess { // Like Chess in sketch.js, but cut down.
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

	getAllLegalMoves() {
		let pieces = ["P", "N", "B", "R", "Q", "K"]
		if (!this.turn) {pieces = pieces.map(v => v.toLowerCase())}
		let moves = []

		for (let p of pieces) {
			for (let [x1, y1] of this.bitboards[this.bitboards.length-1][p]) {
				for (let [x2, y2] of this.getLegalMoves(x1, y1)[0]) {
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
		let moveNotations = []
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
				moveNotations.push(newBoard[3])
			}
		} return [legalMoves, moveNotations]
	}

	handleMove(x1, y1, x2, y2, promo=false, query=false) {
		let piece = this.board[y1-1][x1-1]
		let locator = this.copyBitboard(this.bitboards[this.bitboards.length-1])
		let activeBoard = this.copyBoard(this.board)
		let castleArr = [...this.canCastle[this.canCastle.length-1]]

		let moves = query ? [[x2, y2]] : this.getLegalMoves(x1, y1)[0]
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
					let perms = this.getLegalMoves(x, y)[0]
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

class Astor extends Fortuna {
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

class Lazaward extends Astor {
	constructor(_board, _bitboards, _canCastle, _passantHistory, _turn, _move) {
		super(_board, _bitboards, _canCastle, _passantHistory, _turn, _move)
		this.pieceSquareBoards = {
			"P": [
				[   0,   0,   0,   0,   0,   0,   0,   0],
				[   0,   0,   0,   0,   0,   0,   0,   0],
				[   0,   0,   0,   0,   0,   0,   0,   0],
				[   0,   0,   0,   0,   0,   0,   0,   0],
				[   0,   0,   0, 0.5, 0.5,   0,   0,   0],
				[ 0.4, 0.4,   0, 0.2, 0.2,   0, 0.4, 0.4],
				[ 0.5, 0.5, 0.5,   0,   0, 0.5, 0.5, 0.5],			
				[   0,   0,   0,   0,   0,   0,   0,   0]
			],
			
			"N": [
				[   0,   0,   0,   0,   0,   0,   0,   0],
				[   0,   0,   0,   0,   0,   0,   0,   0],
				[   0,   0,   0,   0,   0,   0,   0,   0],
				[   0,   0,   0,   0,   0,   0,   0,   0],
				[   0,   0,   0,   0,   0,   0,   0,   0],
				[   0, 0.5,0.45,   0,   0, 0.5, 0.5,   0],
				[   0,   0,   0,   0,   0,   0,   0,   0],
				[   0,   0,   0,   0,   0,   0,   0,   0]
			],

			"B": [
				[   0,   0,   0,   0,   0,   0,   0,   0],
				[   0,   0,   0,   0,   0,   0,   0,   0],
				[   0,   0,   0,   0,   0,   0,   0,   0],
				[   0,0.65,   0,   0,   0,   0,0.65,   0],
				[   0,   0, 0.6,   0,   0, 0.6,   0,   0],
				[   0,   0,-0.5,-0.2,-0.2,-0.5,   0,   0],
				[   0, 0.6, 0.2, 0.1, 0.1, 0.2, 0.6,   0],
				[   0,   0,   0,   0,   0,   0,   0,   0]
			],

			"R": [
				[   0,   0,   0,   0,   0,   0,   0,   0],
				[   0,   0,   0,   0,   0,   0,   0,   0],
				[   0,   0,   0,   0,   0,   0,   0,   0],
				[   0,   0,   0,   0,   0,   0,   0,   0],
				[   0,   0,   0,   0,   0,   0,   0,   0],
				[   0,   0,   0,   0,   0,   0,   0,   0],
				[   0,   0,   0,   0,   0,   0,   0,   0],
				[   0,   0,   0, 0.5, 0.5, 0.5,   0,   0]
			],

			"Q": [
				[   0,   0,   0,   0,   0,   0,   0,   0],
				[   0,   0,   0,   0,   0,   0,   0,   0],
				[   0,   0,   0,   0,   0,   0,   0,   0],
				[   0,   0,   0,   0,   0,   0,   0,   0],
				[   0,   0,   0,   0,   0,   0,   0,   0],
				[   0,   0,   0,   0,   0,-0.2,   0,   0],
				[   0,   0,   0,   0,   0,   0,   0,   0],
				[   0,   0,   0,   0,   0,   0,   0,   0]
			],

			"K": [
				[-0.5,-0.5,-0.5,-0.5,-0.5,-0.5,-0.5,-0.5],
				[-0.4,-0.4,-0.4,-0.4,-0.4,-0.4,-0.4,-0.4],
				[-0.3,-0.3,-0.3,-0.3,-0.3,-0.3,-0.3,-0.3],
				[-0.2,-0.2,-0.2,-0.2,-0.2,-0.2,-0.2,-0.2],
				[-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1],
				[   0,   0,   0,   0,   0,   0,   0,   0],
				[ 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1],
				[ 0.2, 0.9,0.75,0.25, 0.5, 0.2, 0.9, 0.2]
			]
		}
	}

	evaluate() {
		let totalDist = 0
		let pieces = ["P", "N", "B", "R", "Q", "K"]
		if (this.moveCounter <= 25) {
			for (let p of pieces) {
				for (let [x1, y1] of this.bitboards[this.bitboards.length-1][p]) {
					totalDist += this.pieceSquareBoards[p][x1-1][y1-1]
				}				
			}
			for (let p of pieces.map(v => v.toLowerCase())) {
				for (let [x1, y1] of this.bitboards[this.bitboards.length-1][p]) {
					totalDist -= this.pieceSquareBoards[p.toUpperCase()][8-x1][8-y1]
				}
			}
		}

		let [wMats, bMats] = this.getMatList()
		wMats = wMats.map(v => this.pieceValues[v.toUpperCase()]).reduce((total, v) => total + v, 0)
		bMats = bMats.map(v => this.pieceValues[v.toUpperCase()]).reduce((total, v) => total + v, 0)
		let matDiff = wMats - bMats

		return (matDiff + totalDist) * (this.turn ? 1 : -1)
	}

	search(depth, alpha=-Infinity, beta=Infinity) {
		if (depth === 0) {return this.evaluate()}

		let moves = this.getAllLegalMoves()
		let kingPos = this.bitboards[this.bitboards.length-1][this.turn ? "K" : "k"][0]
		if (moves.length === 0) {
			if (this.isCheck(...kingPos, this.turn, this.bitboards[this.bitboards.length-1], this.board)) {
				return -Infinity // Checkmate
			} return 0 // Stalemate
		}

		for (let move of moves) {
			this.updateAttributes(this.handleMove(...move, true))
			let evaluation = -this.search(depth-1, -beta, -alpha)
			this.undoMove(true)
			if (evaluation >= beta) {
				return beta
			} alpha = max(alpha, evaluation)
		}

		return alpha
	}

	makeMove() {
		return new Promise((resolve) => {
			let moves = this.getAllLegalMoves()
			let moveEvals = []
	
			for (let move of moves) {
				this.updateAttributes(this.handleMove(...move, true))
				moveEvals.push(-this.search(2))
				this.undoMove(true)
			}
	
			let bestEval = max(...moveEvals)
			let bestIndices = moveEvals.map((v, i) => {if (v === bestEval) {return i}}).filter(v => v !== undefined)
	
			postMessage(moves[random(bestIndices)])
		})
	}
}

class Aleph extends Lazaward {
	constructor(_board, _bitboards, _canCastle, _passantHistory, _turn, _move, _moveHistory, _timeRemaining) {
		super(_board, _bitboards, _canCastle, _passantHistory, _turn, _move)
		this.moveHistory = [..._moveHistory]
		this.timeRemaining = _timeRemaining
	}

	getAllLegalMoves(notation=false) { // Redo to get move notation.
		let pieces = ["P", "N", "B", "R", "Q", "K"]
		if (!this.turn) {pieces = pieces.map(v => v.toLowerCase())}
		let moves = []
		let notations = []

		for (let p of pieces) {
			for (let [x1, y1] of this.bitboards[this.bitboards.length-1][p]) {
				let pieceMoves = this.getLegalMoves(x1, y1)
				notations = notations.concat(pieceMoves[1])
				for (let [x2, y2] of pieceMoves[0]) {
					if (p.toUpperCase() === "P" && y2 === (this.turn ? 1 : 8)) { // Pawn Promo
						moves.push([x1, y1, x2, y2, this.turn ? "Q" : "q"])
						moves.push([x1, y1, x2, y2, this.turn ? "R" : "r"])
						moves.push([x1, y1, x2, y2, this.turn ? "B" : "b"])
						moves.push([x1, y1, x2, y2, this.turn ? "N" : "n"])
					} else {moves.push([x1, y1, x2, y2, false])}
				}
			}
		} if (notation) {return [moves, notations]}; return moves
	}

	evaluate() {
		let totalDist = 0
		let pieces = ["P", "N", "B", "R", "Q", "K"]
		if (this.moveCounter <= 40) {
			for (let p of pieces) {
				for (let [x1, y1] of this.bitboards[this.bitboards.length-1][p]) {
					totalDist += this.pieceSquareBoards[p][x1-1][y1-1]
				}				
			}

			for (let p of pieces.map(v => v.toLowerCase())) {
				for (let [x1, y1] of this.bitboards[this.bitboards.length-1][p]) {
					totalDist -= this.pieceSquareBoards[p.toUpperCase()][8-x1][8-y1]
				}
			}
		}

		let [wMats, bMats] = this.getMatList()
		let pieceCount = wMats.concat(bMats).length
		wMats = wMats.map(v => this.pieceValues[v.toUpperCase()]).reduce((total, v) => total + v, 0)
		bMats = bMats.map(v => this.pieceValues[v.toUpperCase()]).reduce((total, v) => total + v, 0)
		let matDiff = wMats - bMats


		if (pieceCount <= 5) { // King distance
			let wKpos = this.bitboards[this.bitboards.length-1]["K"][0]
			let bKpos = this.bitboards[this.bitboards.length-1]["k"][0]
			if (matDiff * (this.turn ? 1 : -1) > 0) {
				totalDist -= dist(...wKpos, ...bKpos)
			} else {
				totalDist += dist(...wKpos, ...bKpos)
			}
		}

		return (matDiff + totalDist) * (this.turn ? 1 : -1)
	}

	makeMove() {
		return new Promise((resolve) => {
			let [moves, notations] = this.getAllLegalMoves(true)
			let moveEvals = []
			let order = [[], [], [], []]
			let bookIndex = -1
			let target

			let validBook = JSON.parse(JSON.stringify(book))
			for (let i = 0; i < this.moveHistory.length; i++) {
				let e = this.moveHistory[i]
				validBook = validBook.filter(v => v[i] === e)
			}

			if (validBook.length) {
				target = random(validBook)[this.moveHistory.length]
				bookIndex = notations.indexOf(target)
			}

			if (validBook.length && mode === "Standard" && bookIndex !== -1) {
				setTimeout(() => {
					postMessage(moves[bookIndex])
				}, 300)
			} else {
				for (let i = 0; i < moves.length; i++) { // Move ordering
					let v = moves[i]
					if (v.includes("+") && v.includes("x")) {
						order[0].push(i)
					} else if (v.includes("x")) {
						order[1].push(i)
					} else if (v.includes("+")) {
						order[2].push(i)
					} else {
						order[3].push(i)
					}
				}
				
				order = order[0].concat(order[1].concat(order[2].concat(order[3])))

				for (let v of order) {
					let move = moves[v]
					this.updateAttributes(this.handleMove(...move, true))
					moveEvals.push(-this.search(this.timeRemaining >= 180000 ? 3 : 2))
					this.undoMove(true)
				}
		
				let bestEval = max(...moveEvals)
				let bestIndices = moveEvals.map((v, i) => {if (v === bestEval) {return i}}).filter(v => v !== undefined)
		
				postMessage(moves[random(bestIndices)])
			}
		})
	}
}
