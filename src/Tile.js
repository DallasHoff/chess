import React, { useState, useEffect, useContext, useRef, useLayoutEffect } from 'react';
import './Tile.scss';
import { PLAYER_COLOR, PIECE_NAMES } from './config';
import { BoardContext } from './App';
import Piece from './Piece';


export default function Tile({pos}) {
  const tileRef = useRef();
  const { board, move, movingPiece } = useContext(BoardContext);
  const [pieceSymbol, setPieceSymbol] = useState(null);
  const [pieceColor, setPieceColor] = useState(null);
  const [label, setLabel] = useState(pos);
  const [isValidMove, setIsValidMove] = useState(false);
  const [isInteractive, setIsInteractive] = useState(false);

  // Update tile's piece (null values if tile is empty) and label
  useEffect(() => {
    const newSymbol = board.pieces[pos] ?? null;
    let newLabel = pos;
    setPieceSymbol(newSymbol);
    if (newSymbol) {
      const newColor = newSymbol.toLowerCase() === newSymbol ? 'black' : 'white';
      const pieceName = PIECE_NAMES[newSymbol.toLowerCase()];
      newLabel += `: ${newColor} ${pieceName}`; 
      setPieceColor(newColor);
    } else {
      setPieceColor(null);
    }
    setLabel(newLabel);
  }, [pos, board]);

  // Show/hide valid move indicator
  useEffect(() => {
    setIsValidMove(!!board.moves?.[movingPiece]?.find(v => v === pos));
  }, [pos, board, movingPiece]);

  // Set whether tile is interactive
  useLayoutEffect(() => {
    // Tile has one of the player's pieces or 
    // tile has the valid move indicator
    if (
      (pieceSymbol && pieceColor === PLAYER_COLOR) || 
      isValidMove
    ) {
      setIsInteractive(true);
    } else {
      setIsInteractive(false);
    }
  }, [pieceSymbol, pieceColor, isValidMove]);

  const handleClick = () => move(pos, pieceColor, isValidMove);

  const handleKeyDown = (e) => {
    // Move if enter or space is pressed
    if (e.keyCode === 13 || e.keyCode === 32) {
      handleClick();
    }
  }

  return (
    <div 
    className={`Tile ${isInteractive ? 'Tile--interactive' : ''}`} 
    tabIndex={isInteractive ? '0' : ''} 
    ref={tileRef} 
    aria-label={label} 
    onClick={handleClick}
    onKeyDown={handleKeyDown}>
      {pieceSymbol && 
        <Piece pos={pos} symbol={pieceSymbol} color={pieceColor} tileRef={tileRef} animate />
      }
      {isValidMove && 
        <div className="Tile__indicator"></div>
      }
    </div>
  );
}