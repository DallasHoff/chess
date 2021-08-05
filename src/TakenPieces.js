import React, { useState, useEffect, useContext } from 'react';
import './TakenPieces.scss';
import { PIECES } from './config';
import { BoardContext } from './App';
import Piece from './Piece';


export default function TakenPieces({color}) {
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