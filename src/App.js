import React, { useState, useEffect, useContext, useRef, useLayoutEffect } from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faChessPawn, faChessKnight, faChessBishop, faChessRook, faChessQueen, faChessKing } from '@fortawesome/free-solid-svg-icons';
import { Game } from 'js-chess-engine';
import './App.scss';


const ROWS = ['8', '7', '6', '5', '4', '3', '2', '1'];
const COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const PIECES = {
  black: ['k', 'q', 'r', 'r', 'b', 'b', 'n', 'n', 'p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
  white: ['K', 'Q', 'R', 'R', 'B', 'B', 'N', 'N', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P']
};
const PLAYER_COLOR = 'white';
const AI_DIFFICULTIES = ['Beginner', 'Easy', 'Intermediate', 'Advanced', 'Experienced'];
const MOVE_DELAY_SECS = 1;
const PIECE_ICONS = {
  p: faChessPawn,
  n: faChessKnight,
  b: faChessBishop,
  r: faChessRook,
  q: faChessQueen,
  k: faChessKing
};

let Chess = new Game();
const BoardContext = React.createContext();


export default function App() {
  const [board, setBoard] = useState(Chess.exportJson());
  const [movingPiece, setMovingPiece] = useState(null);
  const [aiLevel, setAiLevel] = useState(1);

  const updateBoard = () => setBoard(Chess.exportJson());

  const move = (tile, color, isValid) => {
    // Check if piece is being picked up or moved
    if (!movingPiece) {
      // Check if it is the player's turn and the piece belongs to them
      if (board.turn === PLAYER_COLOR && color === board.turn) {
        // Pick up piece
        setMovingPiece(tile);
      }
    } else if (movingPiece && isValid) {
      // Move piece to the tile
      Chess.move(movingPiece, tile);
      setMovingPiece(null);
      updateBoard();
    } else if (movingPiece && color === board.turn) {
      // Pick up different piece
      setMovingPiece(tile);
    }
  }

  // After player moves, do AI's move if the player did not just win
  useEffect(() => {
    if (board.turn !== PLAYER_COLOR && !board.isFinished) {
      setTimeout(() => {
        Chess.aiMove(aiLevel);
        updateBoard();
      }, MOVE_DELAY_SECS * 1000);
    }
  }, [board, aiLevel]);

  return (
    <div className="App">
      <BoardContext.Provider value={{ board, updateBoard, movingPiece, move, aiLevel, setAiLevel }}>
        <Board />
        <GameSettings />
        <TakenPieces color="black" />
        <TakenPieces color="white" />
      </BoardContext.Provider>
    </div>
  );
}


function GameSettings() {
  const { board, updateBoard, aiLevel, setAiLevel } = useContext(BoardContext);

  const newGame = () => {
    Chess = new Game();
    updateBoard();
  }

  const canUndoMove = () => board.turn === PLAYER_COLOR && Chess.getHistory().length >= 2;

  const undoMove = () => {
    if (!canUndoMove()) return;
    const prevConfig = Chess.getHistory().slice().reverse()[1].configuration;
    Chess = new Game(prevConfig);
    updateBoard();
  }

  return (
    <div>
      <button type="button" onClick={newGame}>
        New Game
      </button>
      <button type="button" onClick={undoMove} disabled={!canUndoMove()}>
        Undo Move
      </button>
      <select value={aiLevel} onChange={(e) => setAiLevel(e.target.value)}>
        {AI_DIFFICULTIES.map((name, i) => (
          <option value={i} key={i}>{name}</option>
        ))}
      </select>
      {(board.checkMate && 'Checkmate!') || (board.check && 'Check!')}
    </div>
  )
}


function Board() {
  return (
    <div className="Board">
      <div className="Board__inner">
        {ROWS.map(r => (
            COLS.map(c => (
              <Tile key={c + r} pos={c + r} />
            ))
        ))}
      </div>
    </div>
  );
}


function Tile({pos}) {
  const { board, move, movingPiece } = useContext(BoardContext);
  const tileRef = useRef();
  const [pieceSymbol, setPieceSymbol] = useState(null);
  const [pieceColor, setPieceColor] = useState(null);
  const [isValidMove, setIsValidMove] = useState(false);

  // Update tile's piece (null values if tile is empty)
  useEffect(() => {
    const newSymbol = board.pieces[pos] ?? null;
    setPieceSymbol(newSymbol);
    if (newSymbol) {
      setPieceColor(newSymbol.toLowerCase() === newSymbol ? 'black' : 'white');
    } else {
      setPieceColor(null);
    }
  }, [pos, board]);

  // Show/hide valid move indicator
  useEffect(() => {
    setIsValidMove(!!board.moves?.[movingPiece]?.find(v => v === pos));
  }, [pos, board, movingPiece]);

  return (
    <div className="Tile" ref={tileRef} data-pos={pos} onClick={() => move(pos, pieceColor, isValidMove)}>
      {pieceSymbol && 
        <Piece pos={pos} symbol={pieceSymbol} color={pieceColor} tileRef={tileRef} animate />
      }
      {isValidMove && 
        <div className="Tile__indicator"></div>
      }
    </div>
  );
}


function Piece({pos, symbol, color, tileRef, animate, size}) {
  const pieceRef = useRef();
  const [icon, setIcon] = useState(faChessPawn);
  const [classes, setClasses] = useState('');

  // Update piece icon, color, and classes
  useEffect(() => {
    setIcon(PIECE_ICONS[symbol.toLowerCase()]);
    setClasses(`Piece__icon Piece__icon--${color} fa-fw`);
  }, [symbol, color]);

  // Get numeric coordinates from tile position
  const tileCoors = (tile) => {
    const [tileCol, tileRow] = tile.split('');
    const tileCoorX = COLS.indexOf(tileCol);
    const tileCoorY = ROWS.indexOf(tileRow);
    return [tileCoorX, tileCoorY];
  }

  // Animate when position changes
  useLayoutEffect(() => {
    if (!animate) return;
    // Determine piece's previous position
    let from = null;
    if (Chess.getHistory().length) {
      const reversedHistory = Chess.getHistory().slice().reverse();
      const prevMove = reversedHistory.find(v => v.to === pos);
      from = prevMove?.from;
    }
    if (!from) return;
    // Calculate pixel counts to translate piece by
    const tileSize = tileRef.current.offsetWidth;
    const [fromX, fromY] = tileCoors(from);
    const [toX, toY] = tileCoors(pos);
    const diffX = (fromX - toX) * tileSize;
    const diffY = (fromY - toY) * tileSize;
    // Do animation
    pieceRef.current.style.animation = 'none';
    void(pieceRef.current.offsetWidth); // trigger reflow to reset animation
    pieceRef.current.style.animation = null;
    pieceRef.current.style.transform = `translate(${diffX}px, ${diffY}px)`;
  }, [pos, tileRef, color, animate]);

  return (
    <span className="Piece" ref={pieceRef} style={{fontSize: size || '1em'}}>
      <Icon icon={icon} className={classes} />
    </span>
  );
}


function TakenPieces({color}) {
  const { board } = useContext(BoardContext);
  const [pieces, setPieces] = useState([]);

  // Determine which pieces are not on the board
  useEffect(() => {
    const taken = [];
    const colorPieces = PIECES[color];
    const boardPieces = Object.values(board.pieces);
    colorPieces.forEach((piece, index) => {
      const pieceIndex = boardPieces.indexOf(piece);
      if (pieceIndex < 0) {
        // Taken: add to list (with index for key)
        taken.push({piece, index});
      } else {
        // Still on board: remove from search
        boardPieces.splice(pieceIndex, 1);
      }
    });
    setPieces(taken);
  }, [board, color]);

  return (
    <div className={`TakenPieces TakenPieces--${color}`}>
      {pieces.map(({piece, index}) => (
        <Piece key={piece + index} symbol={piece} color={color} />
      ))}
    </div>
  );
}
