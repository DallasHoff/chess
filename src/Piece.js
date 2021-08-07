import React, { useState, useRef, useLayoutEffect } from 'react';
import './Piece.scss';
import { ROWS, COLS, MOVE_ANIMATION_SECS } from './config';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faChessPawn, faChessKnight, faChessBishop, faChessRook, faChessQueen, faChessKing } from '@fortawesome/free-solid-svg-icons';
import { Chess } from './App';

const PIECE_ICONS = {
  p: faChessPawn,
  n: faChessKnight,
  b: faChessBishop,
  r: faChessRook,
  q: faChessQueen,
  k: faChessKing
};


export default function Piece({pos, symbol, color, tileRef, animate, size}) {
  const pieceRef = useRef();
  const [icon, setIcon] = useState(faChessPawn);
  const [classes, setClasses] = useState('');

  // Update piece icon, color, and classes
  useLayoutEffect(() => {
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
      const historyCopy = Chess.getHistory().slice();
      const prevMove = historyCopy.reverse().find(v => v.to === pos);
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
    pieceRef.current.style.transform = `translate(${diffX}px, ${diffY}px)`;
    pieceRef.current.style.animation = `move-piece ${MOVE_ANIMATION_SECS}s forwards`;
    setTimeout(() => {
      pieceRef.current.style.transform = `translate(0px, 0px)`;
      pieceRef.current.style.animation = 'none';
    }, MOVE_ANIMATION_SECS * 1000);
  }, [pos, tileRef, color, animate]);

  return (
    <span className="Piece" ref={pieceRef} style={{fontSize: size || '1em'}}>
      <Icon icon={icon} className={classes} />
    </span>
  );
}