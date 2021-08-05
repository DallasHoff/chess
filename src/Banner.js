import React, { useContext } from 'react';
import './Banner.scss';
import { PLAYER_COLOR } from './config';
import { BoardContext } from './App';


export default function Banner() {
  const { board } = useContext(BoardContext);

  return (
    <div className="Banner">
      {(
        (board.checkMate && 'Checkmate!') || 
        (board.isFinished && 'Stalemate!') || 
        (board.check && 'Check!') || 
        (board.turn !== PLAYER_COLOR && 'AI\'s Turn') || 
        (board.turn === PLAYER_COLOR && 'Your Turn')
      )}
    </div>
  );
}