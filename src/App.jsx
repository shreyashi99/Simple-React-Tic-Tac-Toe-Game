import { useState } from "react";

import Player from "./components/Player.tsx";
import GameBoard from "./components/GameBoard.tsx";
import Log from "./components/Log.tsx";
import GameOver from "./components/GameOver.tsx";

import {
  isWinRowFor,
  isWinColFor,
  isWinDiagFor,
  isWinDiag2For,
} from "./Helper.js";

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

      // NOTE: we mark player's selection in the gameBoard only for bot simulations
      gameBoard[rowIndex][colIndex] = "X";
      
      if (currentPlayer === "X" && prevTurns.length !== 8) {
        // if it's bot's turn
        const squares = getAllAvailableSquares(gameBoard, rowIndex, colIndex);
        let selectSq = null;
        
        // 1. select the square that -> makes bot win
        for (const sq of squares) {
          gameBoard[sq[0]][sq[1]] = "O";
          const winner = deriveWinner(gameBoard);
          gameBoard[sq[0]][sq[1]] = "";
          
          if (winner === PLAYERS.O) 
            selectSq = sq;
        }
        
        // 2. block a triplet of player
        if (selectSq === null) {
          for (const sq of squares) {
            gameBoard[sq[0]][sq[1]] = "X"; // LOGIC: we assume that bot moved somewhere else. Then the player can WIN by playing at this position.
            const winner = deriveWinner(gameBoard);
            gameBoard[sq[0]][sq[1]] = "";

            if (winner === PLAYERS.X) 
              selectSq = sq;
          }
        }

        // NOTE: backtrack player's position
        gameBoard[rowIndex][colIndex] = "";

        // 3. random index
        if (selectSq === null)
          selectSq = squares[Math.floor(Math.random() * squares.length)];

        // mark it as O
        return [
          { square: { row: selectSq[0], col: selectSq[1] }, player: "O" },
          { square: { row: rowIndex, col: colIndex }, player: currentPlayer },
          ...prevTurns,
        ];
      }

      // NOTE: back-tracking back player's selection
      gameBoard[rowIndex][colIndex] = "";

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
