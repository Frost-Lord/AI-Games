const scale = 20;
const canvasSize = 400;
const Default_Points = 5;
const GameSpeed = 10; // 10 ms
const TOTAL = 1;
let snakes = [];
let savedSnakes = [];
let generation = 0;
let topScore = 0;
let averageScore = 0;

class Fruit {
  constructor() {
    this.pickLocation();
  }

  pickLocation() {
    this.x = (Math.floor(Math.random() * (canvasSize / scale - 1)) + 1) * scale;
    this.y = (Math.floor(Math.random() * (canvasSize / scale - 1)) + 1) * scale;
  }

  draw(ctx) {
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(this.x, this.y, scale, scale);
  }
}

(function setup() {
  tf.setBackend("cpu");
  const canvasContainer = document.getElementById('canvasContainer');
  const topScoreElement = document.getElementById('topScore');
  const averageScoreElement = document.getElementById('averageScore');
  const generationCountElement = document.getElementById('generationCount');

  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const cols = Math.floor(screenWidth / canvasSize);
  const rows = Math.floor(screenHeight / canvasSize);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const canvas = document.createElement('canvas');
      canvas.width = canvasSize;
      canvas.height = canvasSize;
      canvasContainer.appendChild(canvas);

      const ctx = canvas.getContext('2d');
      const snake = new Snake(null, scale);
      if (ctx) {
        snakes.push({ snake, ctx, fruit: new Fruit() });
      }
    }
  }

  window.setInterval(() => {
    let allSnakesDead = true;
    let totalScore = 0;
    let aliveSnakes = 0;

    snakes.forEach((game) => {
      const { snake, ctx, fruit } = game;
      if (ctx && snake) {
        ctx.clearRect(0, 0, canvasSize, canvasSize);
        fruit.draw(ctx);
        if (typeof snake.think === 'function') {
          snake.think(fruit);
          snake.draw(ctx);

          if (snake.eat(fruit)) {
            fruit.pickLocation();
          }

          if (snake.checkCollision()) {
            savedSnakes.push(snake);
          }
        }

        if (snake.alive) {
          allSnakesDead = false;
          totalScore += snake.Reward;
          aliveSnakes++;
        }
      }
    });

    if (aliveSnakes > 0) {
      averageScore = totalScore / aliveSnakes;
    }

    if (allSnakesDead) {
      nextGeneration();
    }

    // Update stats
    topScore = Math.max(topScore, ...snakes.map(game => game.snake.Reward));
    topScoreElement.textContent = `Top Score: ${topScore}`;
    averageScoreElement.textContent = `Average Score: ${averageScore.toFixed(2)}`;
    generationCountElement.textContent = `Generation: ${generation}`;
  }, GameSpeed);
})();
