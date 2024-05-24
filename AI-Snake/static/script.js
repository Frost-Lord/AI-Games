const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scale = 20;
const rows = canvas.height / scale;
const columns = canvas.width / scale;
const TOTAL = 1;
const Default_Points = 3;
let GameSpeed = 10; //10 ms
let snakes = [];
let savedSnakes = [];
let fruit;
let generation = 0;

class Fruit {
  constructor() {
    this.pickLocation();
  }

  pickLocation() {
    this.x = (Math.floor(Math.random() * columns - 1) + 1) * scale;
    this.y = (Math.floor(Math.random() * rows - 1) + 1) * scale;
  }

  draw() {
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(this.x, this.y, scale, scale);
  }
}

(function setup() {
  tf.setBackend("cpu");
  canvas.width = 400;
  canvas.height = 400;
  for (let i = 0; i < TOTAL; i++) {
    snakes[i] = new Snake(null, scale); // Pass scale to the Snake constructor
  }
  fruit = new Fruit();

  window.setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    fruit.draw();
    for (let i = snakes.length - 1; i >= 0; i--) {
      if (snakes[i] && typeof snakes[i].think === 'function') {
        snakes[i].think(fruit, { width: 400, height: 400 });
        snakes[i].update();
        snakes[i].draw(ctx);

        if (snakes[i].eat(fruit)) {
          fruit.pickLocation();
        }

        snakes[i].checkCollision();
        if (snakes[i].outsideCanvas()) {
          savedSnakes.push(snakes.splice(i, 1)[0]);
        }
      }
    }
    if (snakes.length === 0) {
      nextGeneration();
    }
  }, GameSpeed);
})();
