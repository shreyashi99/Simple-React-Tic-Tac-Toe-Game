import React from "react";

interface GameOverProps {
  winner: string | null;
  onRestart: () => void;
}

export default function GameOver({ winner, onRestart }: GameOverProps): JSX.Element {
  return (
    <div id="game-over">
      <h2>Game Over!</h2>
      {winner && <p>{winner} won!</p>}
      {!winner && <p>It&apos;s a draw!</p>}
      <p>
        <button onClick={onRestart}>Rematch!</button>
      </p>
    </div>
  );
}
