import { useState } from "react";

import Player from "./components/Player.tsx";
import GameBoard from "./components/GameBoard.tsx";
import Log from "./components/Log.tsx";
import GameOver from "./components/GameOver.tsx";

const PLAYERS = {
  X: "Player",
  O: "Bot",
};

const initialGameBoard = [
  [null, null, null],
  [null, null, null],
  [null, null, null],
];

function deriveActivePlayer(gameTurns) {
  let currentPlayer = "X";

  if (gameTurns.length > 0 && gameTurns[0].player === "X") {
    currentPlayer = "O";
  }

  return currentPlayer;
}

function deriveGameBoard(gameTurns) {
  let gameBoard = [...initialGameBoard.map((array) => [...array])];

  for (const turn of gameTurns) {
    const { square, player } = turn;
    const { row, col } = square;

    gameBoard[row][col] = player;
  }

  return gameBoard;
}

function isWinRowFor(gameBoard, rowIdx, player) {
  if (player === PLAYERS.X) {
    return (
      gameBoard[rowIdx][0] === "X" &&
      gameBoard[rowIdx][1] === "X" &&
      gameBoard[rowIdx][2] === "X"
    );
  }
  return (
    gameBoard[rowIdx][0] === "O" &&
    gameBoard[rowIdx][1] === "O" &&
    gameBoard[rowIdx][2] === "O"
  );
}

function isWinColFor(gameBoard, colIdx, player) {
  if (player === PLAYERS.X) {
    return (
      gameBoard[0][colIdx] === "X" &&
      gameBoard[1][colIdx] === "X" &&
      gameBoard[2][colIdx] === "X"
    );
  }
  return (
    gameBoard[0][colIdx] === "O" &&
    gameBoard[1][colIdx] === "O" &&
    gameBoard[2][colIdx] === "O"
  );
}
function isWinDiagFor(gameBoard, player) {
  if (player === PLAYERS.X) {
    return (
      gameBoard[0][0] === "X" &&
      gameBoard[1][1] === "X" &&
      gameBoard[2][2] === "X"
    );
  }
  return (
    gameBoard[0][0] === "O" &&
    gameBoard[1][1] === "O" &&
    gameBoard[2][2] === "O"
  );
}

function isWinDiag2For(gameBoard, player) {
  if (player === PLAYERS.X) {
    return (
      gameBoard[0][2] === "X" &&
      gameBoard[1][1] === "X" &&
      gameBoard[2][0] === "X"
    );
  }
  return (
    gameBoard[0][2] === "O" &&
    gameBoard[1][1] === "O" &&
    gameBoard[2][0] === "O"
  );
}

function deriveWinner(gameBoard, players) {
  // check all rows
  for (let i = 0; i < gameBoard.length; ++i) {
    if (isWinRowFor(gameBoard, i, PLAYERS.X)) return PLAYERS.X;
    if (isWinRowFor(gameBoard, i, PLAYERS.O)) return PLAYERS.O;
  }

  // check all cols
  for (let j = 0; j < gameBoard[0].length; ++j) {
    if (isWinColFor(gameBoard, j, PLAYERS.X)) return PLAYERS.X;
    if (isWinColFor(gameBoard, j, PLAYERS.O)) return PLAYERS.O;
  }

  // check primary diag
  if (isWinDiagFor(gameBoard, PLAYERS.X)) return PLAYERS.X;
  if (isWinDiagFor(gameBoard, PLAYERS.O)) return PLAYERS.O;

  // check secondary diag
  if (isWinDiag2For(gameBoard, PLAYERS.X)) return PLAYERS.X;
  if (isWinDiag2For(gameBoard, PLAYERS.O)) return PLAYERS.O;
}

// ignore square at [rowIdx][colIdx]
// example returns = [[0,0], [0,2]]
function getAllAvailableSquares(gameBoard, rowIdx, colIdx) {
  let availbleSquares = [];
  for (let i = 0; i < gameBoard.length; ++i) {
    for (let j = 0; j < gameBoard[i].length; ++j) {
      if (i === rowIdx && j === colIdx) continue;
      const sym = gameBoard[i][j];
      if (sym !== "O" && sym !== "X") {
        availbleSquares.push([i, j]);
      }
    }
  }

  return availbleSquares;
}

function App() {
  const [players, setPlayers] = useState(PLAYERS);
  const [gameTurns, setGameTurns] = useState([]);

  const activePlayer = deriveActivePlayer(gameTurns);
  const gameBoard = deriveGameBoard(gameTurns);
  const winner = deriveWinner(gameBoard, players);
  const hasDraw = gameTurns.length === 9 && !winner;

  function handleSelectSquare(rowIndex, colIndex) {
    setGameTurns((prevTurns) => {
      const currentPlayer = deriveActivePlayer(prevTurns);

      if (currentPlayer === "X" && prevTurns.length !== 8) {
        // if it's bot's turn
        const squares = getAllAvailableSquares(gameBoard, rowIndex, colIndex);
        const randSq = squares[Math.floor(Math.random() * squares.length)];

        // mark it as O
        return [
          { square: { row: randSq[0], col: randSq[1] }, player: "O" },
          { square: { row: rowIndex, col: colIndex }, player: currentPlayer },
          ...prevTurns,
        ];
      }

      const updatedTurns = [
        { square: { row: rowIndex, col: colIndex }, player: currentPlayer },
        ...prevTurns,
      ];

      return updatedTurns;
    });
  }

  function handleRestart() {
    setGameTurns([]);
  }

  function handlePlayerNameChange(symbol, newName) {
    setPlayers((prevPlayers) => {
      return {
        ...prevPlayers,
        [symbol]: newName,
      };
    });
  }

  return (
    <main>
      <div id="game-container">
        <ol id="players" className="highlight-player">
          <Player
            initialName={PLAYERS.X}
            symbol="X"
            isActive={activePlayer === "X"}
            onChangeName={handlePlayerNameChange}
          />
          <Player
            initialName={PLAYERS.O}
            symbol="O"
            isActive={activePlayer === "O"}
            onChangeName={handlePlayerNameChange}
          />
        </ol>
        {(winner || hasDraw) && (
          <GameOver winner={winner} onRestart={handleRestart} />
        )}
        <GameBoard onSelectSquare={handleSelectSquare} board={gameBoard} />
      </div>
      <Log turns={gameTurns} />
    </main>
  );
}

export default App;
