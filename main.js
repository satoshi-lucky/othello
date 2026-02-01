import { drawMenu, drawGame } from "./render.js";
import {
  board,
  SIZE,
  resetBoard,
  getFlips,
  getValidMoves,
  isGameOver,
  countStones
} from "./board.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// ===== 定数 =====
const BOARD_OFFSET_Y = 70;

// ===== レイアウト =====
let CELL = 0;
let boardX = 0;

// ===== 通信（仮）=====
let ws = null;
let myColor = null;

function startOnline() {
  ws = new WebSocket("wss://othello-ws-server.onrender.com"); // ← 後でURL差し替え

  ws.onmessage = e => {
    const data = JSON.parse(e.data);

    if (data.type === "start") {
      myColor = data.color;
      gameMode = "online";
      gameState = "play";
      resetGame();
      currentPlayer = 1;
    }
    
    if (data.type === "move") {
      const { x, y } = data;
      const enemy = myColor * -1;
      
      const flips = getFlips(x, y, enemy);
      board[y][x] = enemy;
      flips.forEach(([fx, fy]) => board[fy][fx] = enemy);
      
      currentPlayer = myColor;
    }
  };
}

// ===== 画面 =====
function resize() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  const boardSize = Math.min(
    canvas.width,
    canvas.height - BOARD_OFFSET_Y
  );

  CELL = boardSize / SIZE;
  boardX = (canvas.width - CELL * SIZE) / 2;
}
resize();
window.addEventListener("resize", resize);

// ===== ゲーム状態 =====
let gameState = "menu";   // "menu" | "play"
let gameMode = null;     // "pvp" | "cpu"
let currentPlayer = 1;   // 黒先手

// ===== 表示用ステート =====
let passMessage = "";
let passTimer = 0;
let isThinking = false;

// ===== 初期化 =====
function resetGame() {
  resetBoard();
  currentPlayer = 1;
  passMessage = "";
  passTimer = 0;
  isThinking = false;
}

function startGame(mode) {
  gameMode = mode;
  gameState = "play";
  resetGame();
}

// ===== PASS表示 =====
function showPass(player) {
  passMessage = player === 1 ? "BLACK PASS" : "WHITE PASS";
  passTimer = 60; // 約1秒
}

// ===== CPU（ランダム） =====
function cpuMove() {
  const moves = getValidMoves(-1);
  if (!moves.length) return;

  const [x, y] = moves[Math.floor(Math.random() * moves.length)];
  const flips = getFlips(x, y, -1);

  board[y][x] = -1;
  flips.forEach(([fx, fy]) => {
    board[fy][fx] = -1;
  });
}

// ===== 入力 =====
canvas.addEventListener("click", e => {
  const rect = canvas.getBoundingClientRect();

  // --- メニュー ---
  if (gameState === "menu") {
    const y = e.clientY - rect.top;
    if (y > canvas.height * 0.55 - 50 && y < canvas.height * 0.55) {
      startGame("pvp");
    }
    if (y > canvas.height * 0.7 - 50 && y < canvas.height * 0.7) {
      startGame("cpu");
    }
    if (y > canvas.height * 0.85 - 50 && y < canvas.height * 0.85) {
      startOnline();
    }
    return;
  }

  // --- 終了 → メニュー ---
  if (isGameOver()) {
    gameState = "menu";
    return;
  }

  // --- CPU中は操作不可 ---
  if (gameMode === "cpu" && currentPlayer === -1) return;
  // --- 通信対戦：自分の番じゃなければ操作不可 ---
  if (gameMode === "online" && currentPlayer !== myColor) return;

  const x = Math.floor(
    (e.clientX - rect.left - boardX) / CELL
  );
  const y = Math.floor(
    (e.clientY - rect.top - BOARD_OFFSET_Y) / CELL
  );

  if (x < 0 || x >= SIZE || y < 0 || y >= SIZE) return;

  const flips = getFlips(x, y, currentPlayer);
  if (!flips.length) return;

  board[y][x] = currentPlayer;
  flips.forEach(([fx, fy]) => {
    board[fy][fx] = currentPlayer;
  });
  
  // 自分の手を相手に送信
  if (gameMode === "online") {
    ws.send(JSON.stringify({
      type: "move",x,y
    }));
  }

  currentPlayer *= -1;
  
  // --- パス or 終了判定 ---
  if (!getValidMoves(currentPlayer).length) {
    // 両者打てない → ゲーム終了（PASS出さない）
    if (isGameOver()) {
      return;
    }
    // 片方だけ打てない → PASS
    showPass(currentPlayer);
    currentPlayer *= -1;
  }
  
  // --- CPU手番 ---
  if (gameMode === "cpu" && currentPlayer === -1 && !isGameOver()) {
    isThinking = true;
    setTimeout(() => {
      cpuMove();
      isThinking = false;

      currentPlayer = 1;
      if (!getValidMoves(currentPlayer).length) {
        if (!isGameOver()) {
          showPass(currentPlayer);
          currentPlayer = -1;
        }
      }
    }, 600);
  }
});

// ===== メインループ =====
function loop() {
  if (passTimer > 0) passTimer--;

  if (gameState === "menu") {
    drawMenu(ctx, canvas);
  } else {
    drawGame(ctx, canvas, {
      board,
      size: SIZE,
      cell: CELL,
      boardOffsetY: BOARD_OFFSET_Y,
      boardX,
      currentPlayer,
      validMoves: getValidMoves(currentPlayer),
      stones: countStones(),
      gameOver: isGameOver(),
      passMessage,
      passTimer,
      isThinking
    });
  }

  requestAnimationFrame(loop);
}

loop();