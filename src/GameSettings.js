import React, { useState, useContext } from 'react';
import './GameSettings.scss';
import { AI_DIFFICULTIES, PLAYER_COLOR } from './config';
import { Chess, BoardContext } from './App';
import ColorPicker from './ColorPicker';


export default function GameSettings() {
  const { newGame, board, updateBoard, aiLevel, setAiLevel } = useContext(BoardContext);
  const [colorPickerHidden, setColorPickerHidden] = useState(true);

  const canUndoMove = () => board.turn === PLAYER_COLOR && Chess.getHistory().length >= 2;

  const undoMove = () => {
    if (!canUndoMove()) return;
    const historyCopy = Chess.getHistory().slice();
    const prevConfig = historyCopy.reverse()[1].configuration;
    newGame(prevConfig);
    updateBoard();
  };

  const handleColorPickerToggle = () => {
    setColorPickerHidden(prev => !prev);
  };

  return (
    <div className="GameSettings">
      <button type="button" className="GameSettings__new" onClick={() => newGame()}>
        New Game
      </button>
      <button type="button" className="GameSettings__undo" onClick={undoMove} disabled={!canUndoMove()}>
        Undo Move
      </button>
      <select value={aiLevel} onChange={(e) => setAiLevel(e.target.value)} className="GameSettings__difficulty">
        {AI_DIFFICULTIES.map((name, i) => (
          <option value={i} key={i}>AI: {name}</option>
        ))}
      </select>
      <button type="button" className={`GameSettings__theme ${!colorPickerHidden ? 'GameSettings__theme--active' : ''}`} onClick={handleColorPickerToggle}>
        Theme
      </button>
      <ColorPicker hidden={colorPickerHidden} />
    </div>
  )
}