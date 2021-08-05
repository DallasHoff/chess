import React, { useContext } from 'react';
import './GameSettings.scss';
import { AI_DIFFICULTIES, PLAYER_COLOR } from './config';
import { Chess, BoardContext } from './App';


export default function GameSettings() {
  const { newGame, board, updateBoard, aiLevel, setAiLevel } = useContext(BoardContext);

  const canUndoMove = () => board.turn === PLAYER_COLOR && Chess.getHistory().length >= 2;

  const undoMove = () => {
    if (!canUndoMove()) return;
    const historyCopy = Chess.getHistory().slice();
    const prevConfig = historyCopy.reverse()[1].configuration;
    newGame(prevConfig);
    updateBoard();
  }

  return (
    <div className="GameSettings">
      <button type="button" onClick={() => newGame()}>
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
    </div>
  )
}