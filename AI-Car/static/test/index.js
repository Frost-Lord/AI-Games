const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const carWidth = 50;
const carHeight = 100;
let generation = 1;

const TOTAL = 20;
let cars = Array.from({ length: TOTAL }, () => new Car());
let savedCars = [];

let obstacles = [];
const obstacleWidth = 50;
const obstacleHeight = 100;
const obstacleSpeed = 2;
const obstacleSpawnInterval = 1500;

let fps = 60;
let lastFrameTimeMs = 0;
let maxFPS = 60;
let delta = 0;

function setup() {
  canvas.width = 500;
  canvas.height = 800;

  ctx.fillStyle = "#259b5a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  cars.forEach((car) => car.draw(ctx));
}

function drawObstacles() {
  ctx.fillStyle = "red";
  obstacles.forEach((obstacle) => {
    ctx.fillRect(obstacle.x, obstacle.y, obstacleWidth, obstacleHeight);
  });
}

function updateObstacles() {
  obstacles = obstacles
    .map((obstacle) => ({
      x: obstacle.x,
      y: obstacle.y + obstacleSpeed,
    }))
    .filter((obstacle) => obstacle.y < canvas.height);
}

function spawnObstacle() {
  const x = Math.random() * (canvas.width - obstacleWidth);
  obstacles.push({ x, y: -obstacleHeight });
}

function loop(timestamp) {
  if (timestamp < lastFrameTimeMs + (1000 / maxFPS)) {
    requestAnimationFrame(loop);
    return;
  }
  delta += timestamp - lastFrameTimeMs;
  lastFrameTimeMs = timestamp;

  while (delta >= (1000 / fps)) {
    ctx.fillStyle = "#259b5a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    updateObstacles();
    drawObstacles();
    cars.forEach((car) => car.draw(ctx));

    if (cars.every((car) => !car.alive)) {
      console.log("All cars are dead");
      obstacles = [];
      nextGeneration();
    }

    delta -= 1000 / fps;
  }

  requestAnimationFrame(loop);
}

function changeFPS(newFPS) {
  fps = newFPS;
}

function nextGeneration() {
  calculateFitness();
  for (let i = 0; i < TOTAL; i++) {
    cars[i] = pickOne();
  }
  savedCars = [];
  generation++;
}

function calculateFitness() {
  let sum = 0;
  savedCars.forEach(car => {
    sum += car.score;
  });

  savedCars.forEach(car => {
    car.fitness = car.score / sum;
  });
}

function pickOne() {
  let index = 0;
  let r = Math.random();

  while (r > 0) {
    r -= savedCars[index].fitness;
    index++;
  }
  index--;

  let car = savedCars[index];
  let child = new Car(car.brain);
  child.mutate();
  return child;
}

setup();
requestAnimationFrame(loop);
setInterval(spawnObstacle, obstacleSpawnInterval);

changeFPS(60);
