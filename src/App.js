import './App.scss';
import React, { useState, useEffect, useContext, useRef, useLayoutEffect } from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faChessPawn, faChessKnight, faChessBishop, faChessRook, faChessQueen, faChessKing } from '@fortawesome/free-solid-svg-icons';
import { Game } from 'js-chess-engine';

const ROWS = ['8', '7', '6', '5', '4', '3', '2', '1'];
const COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const PLAYER_COLOR = 'white';
const MOVE_DELAY_SECS = 1;

const Chess = new Game();
const BoardContext = React.createContext();


export default function App() {
  const [board, setBoard] = useState(Chess.exportJson());
  const updateBoard = () => setBoard(Chess.exportJson());
  const [movingPiece, setMovingPiece] = useState(null);
  const [aiLevel] = useState(1);

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
      // Do computer's move
      if (!board.isFinished) {
        setTimeout(() => {
          Chess.aiMove(aiLevel);
          updateBoard();
        }, MOVE_DELAY_SECS * 1000);
      }
    } else if (movingPiece && color === board.turn) {
      // Pick up different piece
      setMovingPiece(tile);
    }
  }

  return (
    <div className="App">
      <BoardContext.Provider value={{ board, move, movingPiece }}>
        <Board />
        {(board.checkMate && 'Checkmate!') || (board.check && 'Check!')}
      </BoardContext.Provider>
    </div>
  );
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
        <Piece pos={pos} symbol={pieceSymbol} color={pieceColor} tileRef={tileRef} />
      }
      {isValidMove && 
        <div className="Tile__indicator"></div>
      }
    </div>
  );
}


function Piece({pos, symbol, color, tileRef}) {
  const pieceRef = useRef();
  const [icon, setIcon] = useState(faChessPawn);
  const [classes, setClasses] = useState('');

  // Update piece icon, color, and classes
  useEffect(() => {
    const ICONS = {
      p: faChessPawn,
      n: faChessKnight,
      b: faChessBishop,
      r: faChessRook,
      q: faChessQueen,
      k: faChessKing
    };
    setIcon(ICONS[symbol.toLowerCase()]);
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
  }, [pos, tileRef, color]);

  return (
    <div className="Piece" ref={pieceRef}>
      <Icon icon={icon} className={classes} />
    </div>
  );
}
