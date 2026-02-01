// render.js
export function drawMenu(ctx, canvas) {
  ctx.fillStyle = "#004400";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.textAlign = "center";

  ctx.font = "36px Arial";
  ctx.fillText("OTHELLO", canvas.width / 2, canvas.height * 0.3);

  ctx.font = "24px Arial";
  ctx.fillText("SELECT MODE", canvas.width / 2, canvas.height * 0.4);

  drawButton(ctx, canvas, "対人戦", canvas.height * 0.55);
  drawButton(ctx, canvas, "CPU戦", canvas.height * 0.7);
  drawButton(ctx, canvas, "通信対戦", canvas.height * 0.85);

  ctx.textAlign = "left";
}

function drawButton(ctx, canvas, text, y) {
  const w = canvas.width * 0.6;
  const h = 50;
  const x = (canvas.width - w) / 2;

  ctx.fillStyle = "#006600";
  ctx.fillRect(x, y - h, w, h);

  ctx.strokeStyle = "white";
  ctx.strokeRect(x, y - h, w, h);

  ctx.fillStyle = "white";
  ctx.font = "22px Arial";
  ctx.textAlign = "center";
  ctx.fillText(text, canvas.width / 2, y - 15);
}

export function drawGame(ctx, canvas, state) {
  const {
    board,
    size,
    cell,
    boardOffsetY,
    boardX,
    currentPlayer,
    validMoves,
    stones,
    gameOver,
    passMessage,
    passTimer,
    isThinking
  } = state;

  // 背景
  ctx.fillStyle = "#006600";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // UI
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText(
    currentPlayer === 1 ? "TURN: BLACK" : "TURN: WHITE",
    10,
    30
  );
  ctx.fillText(`BLACK: ${stones.black}`, 180, 30);
  ctx.fillText(`WHITE: ${stones.white}`, 280, 30);

  if (isThinking) {
    ctx.fillText("THINKING...", canvas.width - 140, 30);
  }

  // グリッド
  ctx.strokeStyle = "#003300";
  for (let i = 0; i <= size; i++) {
    ctx.beginPath();
    ctx.moveTo(boardX + i * cell, boardOffsetY);
    ctx.lineTo(boardX + i * cell, boardOffsetY + size * cell);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(boardX, boardOffsetY + i * cell);
    ctx.lineTo(boardX + size * cell, boardOffsetY + i * cell);
    ctx.stroke();
  }

  // 合法手
  ctx.fillStyle = "rgba(255,255,0,0.3)";
  validMoves.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(
      boardX + x * cell + cell / 2,
      boardOffsetY + y * cell + cell / 2,
      cell * 0.15,
      0,
      Math.PI * 2
    );
    ctx.fill();
  });

  // 石
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!board[y][x]) continue;
      ctx.beginPath();
      ctx.arc(
        boardX + x * cell + cell / 2,
        boardOffsetY + y * cell + cell / 2,
        cell * 0.4,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = board[y][x] === 1 ? "black" : "white";
      ctx.fill();
    }
  }

  // PASS 表示
  if (passTimer > 0) {
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, canvas.height / 2 - 40, canvas.width, 80);

    ctx.fillStyle = "yellow";
    ctx.font = "28px Arial";
    ctx.textAlign = "center";
    ctx.fillText(passMessage, canvas.width / 2, canvas.height / 2 + 10);
    ctx.textAlign = "left";
  }

  if (gameOver) {
    ctx.fillStyle = "yellow";
    ctx.font = "28px Arial";
    ctx.fillText("GAME OVER", canvas.width / 2 - 90, canvas.height / 2);
  }
}