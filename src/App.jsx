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

const BOT_LEVEL = {
  EASY: "EASY", // 25% of win chance
  MEDIUM: "MEDIUM", // 50% of win chance
  HARD: "HARD", // 90% of win chance
};

let isBotThinking = false;

const curr_bot_diff = BOT_LEVEL.MEDIUM;

const initialGameBoard = [
  [null, null, null],
  [null, null, null],
  [null, null, null],
];

// gameTurns stores turns in a stack, where [0] means latest
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
    if (isBotThinking) return; // SAFETY: when bot is thinking then don't allow player to make any move.

    setGameTurns((prevTurns) => {
      const currentPlayer = deriveActivePlayer(prevTurns);

      // NOTE: we mark player's selection in the gameBoard only for bot simulations
      gameBoard[rowIndex][colIndex] = "X";

      // NOTE: check if player WILL win by this move. Then bot should not work
      const willPlayerWin = deriveWinner(gameBoard) === PLAYERS.X;
      const willBotPlay =
        currentPlayer === "X" && prevTurns.length !== 8 && !willPlayerWin;
      let selectSq = null;

      if (willBotPlay) {
        // if it's bot's turn
        const squares = getAllAvailableSquares(gameBoard, rowIndex, colIndex);
        isBotThinking = true;

        // 1. select the square that -> makes bot win
        for (const sq of squares) {
          gameBoard[sq[0]][sq[1]] = "O";
          const winner = deriveWinner(gameBoard);
          gameBoard[sq[0]][sq[1]] = "";

          if (winner === PLAYERS.O) selectSq = sq;
        }

        // 2. block a triplet of player
        if (selectSq === null) {
          for (const sq of squares) {
            gameBoard[sq[0]][sq[1]] = "X"; // LOGIC: we assume that bot moved somewhere else. Then the player can WIN by playing at this position.
            const winner = deriveWinner(gameBoard);
            gameBoard[sq[0]][sq[1]] = "";

            if (winner === PLAYERS.X) selectSq = sq;
          }
        }

        const lim =
          curr_bot_diff === BOT_LEVEL.EASY
            ? 0.25
            : curr_bot_diff === BOT_LEVEL.MEDIUM
            ? 0.5
            : 1;
        const shouldWin = Math.random() <= lim;

        console.log(`patt :: bot trying to = ${shouldWin ? "WIN" : "LOSE"}`);

        if (!shouldWin) selectSq = null;

        // 3. random index
        if (selectSq === null)
          selectSq = squares[Math.floor(Math.random() * squares.length)];
      }

      // NOTE: back-tracking back player's selection
      gameBoard[rowIndex][colIndex] = "";

      const updatedTurns = [
        { square: { row: rowIndex, col: colIndex }, player: currentPlayer },
        ...prevTurns,
      ];

      if (willBotPlay) {
        console.log("patt :: bot thinking " + (selectSq));
        setTimeout(() => {
          setGameTurnBot(selectSq);
          isBotThinking = false;
          console.log("patt :: bot made a move");
        }, 1000);
      }

      return updatedTurns;
    });

    function setGameTurnBot(selectSq) {
      setGameTurns((uptoPlayerTurns) => {
        return [
          { square: { row: selectSq[0], col: selectSq[1] }, player: "O" },
          ...uptoPlayerTurns,
        ];
      });
    }
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
