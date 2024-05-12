import React from "react";

interface Turn {
  player: string;
  square: {
    row: number;
    col: number;
  };
}

interface LogProps {
  turns: Turn[];
}

export default function Log({ turns }: LogProps) {
  return (
    <ol id="log">
      {turns.map((turn: Turn) => (
        <li key={`${turn.square.row}${turn.square.col}`}>
          {turn.player} selected {turn.square.row},{turn.square.col}
        </li>
      ))}
    </ol>
  );
}
