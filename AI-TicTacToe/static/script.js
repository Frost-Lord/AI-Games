const scale = 20;
const canvasSize = 400;
const GameSpeed = 10; // 10 ms
let board = [0, 0, 0, 0, 0, 0, 0, 0, 0]; // 0 = empty, 1 = X, 2 = O
const Games = [];
let currentGame = [];

(function setup() {
  tf.setBackend("cpu");

  const canvasContainer = document.getElementById('canvasContainer');
  const canvas = document.createElement('canvas');
  canvas.width = canvasSize;
  canvas.height = canvasSize;
  canvasContainer.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  canvas.addEventListener('click', handleCanvasClick);

  window.setInterval(() => {
    drawBoard(ctx);
  }, GameSpeed);

  document.getElementById('train').addEventListener('click', () => {
    const trainingBlock = document.getElementById("training-modal");
    trainingBlock.classList.add("active");
    if (Games.length > 1) {
      Train().then(() => {
        trainingBlock.classList.remove("active");
      });
    }
  });
})();

function handleCanvasClick(event) {
  const rect = event.target.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const row = Math.floor(y / (canvasSize / 3));
  const col = Math.floor(x / (canvasSize / 3));
  const index = row * 3 + col;

  if (board[index] === 0) {
    board[index] = 1; // User's move
    currentGame.push([...board]);
    if (checkWin(board, 1)) {
      alert("User wins!");
      saveGame(1);
      resetBoard();
    } else if (board.includes(0)) {
      aiMove();
    } else {
      alert("It's a draw!");
      saveGame(0); // Save draw games too
      resetBoard();
    }
  }
}

async function aiMove() {
  const prediction = await Predict(board);
  const availableMoves = board.map((val, idx) => (val === 0 ? prediction[idx] : -Infinity));
  const maxPrediction = Math.max(...availableMoves);
  const index = availableMoves.indexOf(maxPrediction);

  if (index !== -1 && board[index] === 0) {
    board[index] = 2; // AI's move
    currentGame.push([...board]);
    if (checkWin(board, 2)) {
      alert("AI wins!");
      saveGame(2);
      resetBoard();
    } else if (!board.includes(0)) {
      alert("It's a draw!");
      saveGame(0); // Save draw games too
      resetBoard();
    }
  } else {
    console.error('AI move failed: No valid moves available');
  }
}

function saveGame(winner) {
  Games.push({ moves: currentGame });
  currentGame = [];
}

function resetBoard() {
  board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  currentGame = [];
}

function checkWin(board, player) {
  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
  ];
  return winPatterns.some(pattern => pattern.every(index => board[index] === player));
}

function drawBoard(ctx) {
  ctx.clearRect(0, 0, canvasSize, canvasSize);
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;

  for (let i = 1; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo((canvasSize / 3) * i, 0);
    ctx.lineTo((canvasSize / 3) * i, canvasSize);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, (canvasSize / 3) * i);
    ctx.lineTo(canvasSize, (canvasSize / 3) * i);
    ctx.stroke();
  }

  for (let i = 0; i < board.length; i++) {
    const x = (i % 3) * (canvasSize / 3) + (canvasSize / 6);
    const y = Math.floor(i / 3) * (canvasSize / 3) + (canvasSize / 6);

    if (board[i] === 1) {
      drawX(ctx, x, y);
    } else if (board[i] === 2) {
      drawO(ctx, x, y);
    }
  }
}

function drawX(ctx, x, y) {
  const offset = canvasSize / 12;
  ctx.beginPath();
  ctx.moveTo(x - offset, y - offset);
  ctx.lineTo(x + offset, y + offset);
  ctx.moveTo(x + offset, y - offset);
  ctx.lineTo(x - offset, y + offset);
  ctx.stroke();
}

function drawO(ctx, x, y) {
  const radius = canvasSize / 12;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.stroke();
}
