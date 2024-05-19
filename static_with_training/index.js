const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let ball;
let hole;

document.getElementById("train").addEventListener("click", trainAI);
document.getElementById("evaluate").addEventListener("click", evaluateAI);

function setup() {
  canvas.width = 800;
  canvas.height = 800;

  hole = {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: 15,
  };

  ball = new Ball();

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

  ball.show(ctx);
  ball.think(hole);

  if (ball.offScreen()) {
    ball.resetPosition();
  }

  requestAnimationFrame(draw);
}

async function trainAI() {
  const inputs = [];
  const outputs = [];

  // Generate 1000 random training data points
  for (let i = 0; i < 1000; i++) {
    let Tball = {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
    };
    const Thole = {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
    };
    const optimalMove = ball.calculateOptimalMove(Thole, Tball);
    inputs.push([Thole.x / canvas.width, Tball.x / canvas.width, Tball.y / canvas.height, Thole.y / canvas.height]);
    outputs.push([optimalMove.angle, optimalMove.power]);
  }

  await trainModel(inputs, outputs);
  alert("Training complete!");
  evaluateAI();
}

async function evaluateAI() {
  const model = await loadModel();
  ball.brain.model = model;
  alert("Evaluation complete!");
}

tf.setBackend("webgl").then(() => {
  setup();
});
