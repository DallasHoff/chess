import React, { useState, useEffect, useContext, useRef, useLayoutEffect } from 'react';
import './Tile.scss';
import { PLAYER_COLOR } from './config';
import { BoardContext } from './App';
import Piece from './Piece';


export default function Tile({pos}) {
  const tileRef = useRef();
  const { board, move, movingPiece } = useContext(BoardContext);
  const [pieceSymbol, setPieceSymbol] = useState(null);
  const [pieceColor, setPieceColor] = useState(null);
  const [isValidMove, setIsValidMove] = useState(false);
  const [classes, setClasses] = useState('Tile');

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

  // Set tile classes
  useLayoutEffect(() => {
    let newClasses = 'Tile';
    // Tile has one of the player's pieces
    if (pieceSymbol && pieceColor === PLAYER_COLOR) {
      newClasses += ' Tile--player-piece';
    }
    // Tile has the valid move indicator
    if (isValidMove) {
      newClasses += ' Tile--indicated';
    }
    setClasses(newClasses);
  }, [pieceSymbol, pieceColor, isValidMove]);

  return (
    <div className={classes} ref={tileRef} data-pos={pos} onClick={() => move(pos, pieceColor, isValidMove)}>
      {pieceSymbol && 
        <Piece pos={pos} symbol={pieceSymbol} color={pieceColor} tileRef={tileRef} animate />
      }
      {isValidMove && 
        <div className="Tile__indicator"></div>
      }
    </div>
  );
}