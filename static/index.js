const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const TOTAL = 100;
let balls = [];
let savedBalls = [];
let counter = 0;
let slider;
let generation = 0;
let hole;

function keyPressed(event) {
  if (event.key === "S") {
    let ball = balls[0];
    saveJSON(ball.brain, "ball.json");
  }
}

function setup() {
  canvas.width = 800;
  canvas.height = 800;
  slider = document.getElementById("speedSlider"); // Assuming you have a slider with this ID in your HTML
  hole = { x: Math.random() * canvas.width, y: Math.random() * canvas.height, radius: 15 };
  for (let i = 0; i < TOTAL; i++) {
    balls[i] = new Ball();
  }
  requestAnimationFrame(draw);
}

const colors = ["#98e251", "#6cbd37"];
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background Grid
  const matrixWidth = 20;
  const matrixHeight = 20;
  const cellWidth = canvas.width / matrixWidth;
  const cellHeight = canvas.height / matrixHeight;
  for (let i = 0; i < matrixWidth; i++) {
    for (let j = 0; j < matrixHeight; j++) {
      ctx.fillStyle = colors[(i + j) % 2];
      ctx.fillRect(i * cellWidth, j * cellHeight, cellWidth, cellHeight);
    }
  }

  // Hole
  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.arc(hole.x, hole.y, hole.radius, 0, Math.PI * 2, true);
  ctx.fill();

  balls.forEach(ball => {
    ball.show(ctx);
    ball.think(hole);
    if (!ball.alive || ball.movesLeft <= 0) {
      savedBalls.push(ball);
    }
  });

  balls = balls.filter(ball => ball.alive && ball.movesLeft > 0);

  if (balls.length === 0) {
    nextGeneration();
  }
  requestAnimationFrame(draw);
  displayTopBalls();
  updateGenerationNumber();
}

function displayTopBalls() {
  const topBallsContainer = document.getElementById("top-balls");
  topBallsContainer.innerHTML = "";

  savedBalls.slice(0, 0).forEach((ball, index) => {
    const ballInfo = document.createElement("div");
    ballInfo.classList.add("ball-info");
    ballInfo.innerHTML = `
            <div>Rank: ${index + 1}</div>
            <div>Position: (${ball.x.toFixed(2)}, ${ball.y.toFixed(2)})</div>
            <div>Points: ${ball.score}</div>
        `;
    topBallsContainer.appendChild(ballInfo);
  });
}

function updateGenerationNumber() {
  const generationNumberElement = document.getElementById("generation-number");
  generationNumberElement.textContent = generation;
}

tf.setBackend("webgl").then(() => {
  setup();
});

document.addEventListener("keydown", keyPressed);
