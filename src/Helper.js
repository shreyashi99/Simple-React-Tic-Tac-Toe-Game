const PLAYERS = {
    X: "Player",
    O: "Bot",
  };

export function isWinRowFor(gameBoard, rowIdx, player) {
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

export function isWinColFor(gameBoard, colIdx, player) {
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

export function isWinDiagFor(gameBoard, player) {
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

export function isWinDiag2For(gameBoard, player) {
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

