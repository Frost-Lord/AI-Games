const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let savedCars = [];
let cars = [];
let obstacles = [];
const TOTAL = 1;
let generation = 0;

function setup() {
  canvas.width = 400;
  canvas.height = 850;

  ctx.fillStyle = "#259b5a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < TOTAL; i++) {
    savedCars.push(new Car());
  }

  nextGeneration();
}

function drawObstacle(x, y) {
    ctx.fillStyle = "#000";
    ctx.fillRect(x, y, 20, 20);
}

function spawnObstacle() {
  let x = Math.random() * (canvas.width - 20);
  obstacles.push({ x: x, y: 0 });
}

function loop() {
  ctx.fillStyle = "#259b5a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let obstacle of obstacles) {
    obstacle.y += 1;
    drawObstacle(obstacle.x, obstacle.y);
  }

  for (let car of cars) {
    if (car.alive) {
      car.show(ctx);

      if (car.x < 0 || car.x > canvas.width || car.y < 0 || car.y > canvas.height) {
        car.alive = false;
        savedCars.push(car);
      } else {
        car.score++;
      }

      for (let obstacle of obstacles) {
        if (car.x < obstacle.x + 20 &&
            car.x + 20 > obstacle.x &&
            car.y < obstacle.y + 20 &&
            car.y + 20 > obstacle.y) {
          car.alive = false;
          savedCars.push(car);
        }
      }
    }
  }

  cars = cars.filter(car => car.alive);

  if (cars.length === 0) {
    nextGeneration();
  }
}

setup();
setInterval(spawnObstacle, 2000);
setInterval(loop, 1000 / 60);
