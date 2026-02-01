// board.js

export const SIZE = 8;

// 0:空, 1:黒, -1:白
export const board = Array.from(
  { length: SIZE },
  () => Array(SIZE).fill(0)
);

const dirs = [
  [1, 0], [-1, 0], [0, 1], [0, -1],
  [1, 1], [1, -1], [-1, 1], [-1, -1]
];

// ===== 初期化 =====
export function resetBoard() {
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      board[y][x] = 0;
    }
  }
  board[3][3] = -1;
  board[3][4] = 1;
  board[4][3] = 1;
  board[4][4] = -1;
}

// ===== 裏返し判定 =====
export function getFlips(x, y, player) {
  if (board[y][x] !== 0) return [];

  let flips = [];

  for (const [dx, dy] of dirs) {
    let nx = x + dx;
    let ny = y + dy;
    let temp = [];

    while (
      nx >= 0 && nx < SIZE &&
      ny >= 0 && ny < SIZE &&
      board[ny][nx] === -player
    ) {
      temp.push([nx, ny]);
      nx += dx;
      ny += dy;
    }

    if (
      temp.length &&
      nx >= 0 && nx < SIZE &&
      ny >= 0 && ny < SIZE &&
      board[ny][nx] === player
    ) {
      flips.push(...temp);
    }
  }

  return flips;
}

// ===== 合法手 =====
export function getValidMoves(player) {
  const moves = [];
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      if (getFlips(x, y, player).length) {
        moves.push([x, y]);
      }
    }
  }
  return moves;
}

// ===== 終了判定 =====
export function isGameOver() {
  return (
    getValidMoves(1).length === 0 &&
    getValidMoves(-1).length === 0
  );
}

// ===== 石数 =====
export function countStones() {
  let black = 0;
  let white = 0;

  for (let row of board) {
    for (let v of row) {
      if (v === 1) black++;
      if (v === -1) white++;
    }
  }

  return { black, white };
}