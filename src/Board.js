import React from 'react';
import './Board.scss';
import { ROWS, COLS } from './config';
import Tile from './Tile';


export default function Board() {
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