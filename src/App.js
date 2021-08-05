import React, { useState, useEffect } from 'react';
import './App.scss';
import { PLAYER_COLOR, MOVE_DELAY_SECS } from './config';
import { Game } from 'js-chess-engine';
import Board from './Board';
import GameSettings from './GameSettings';
import TakenPieces from './TakenPieces';

export const BoardContext = React.createContext();

export let Chess = new Game();


export default function App() {
  const [board, setBoard] = useState(Chess.exportJson());
  const [movingPiece, setMovingPiece] = useState(null);
  const [aiLevel, setAiLevel] = useState(1);

  const updateBoard = () => setBoard(Chess.exportJson());

  const newGame = (config) => {
    Chess = config ? new Game(config) : new Game();
    updateBoard();
  }

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
      <BoardContext.Provider value={{ newGame, board, updateBoard, movingPiece, move, aiLevel, setAiLevel }}>
        <Board />
        <GameSettings />
        <TakenPieces color="black" />
        <TakenPieces color="white" />
      </BoardContext.Provider>
    </div>
  );
}
