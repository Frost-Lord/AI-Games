const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const TOTAL = 50;
let cars = [];
let savedCars = [];
let counter = 0;
let slider;
let generation = 0;

function keyPressed(event) {
  if (event.key === "S") {
    let car = cars[0];
    saveJSON(car.brain, "car.json");
  }
}

function setup() {
  canvas.width = 1200;
  canvas.height = 800;
  slider = document.getElementById("speedSlider");
  for (let i = 0; i < TOTAL; i++) {
    cars[i] = new Car();
  }
  requestAnimationFrame(draw);
}

const colors = ["#98e251", "#6cbd37"];
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawTrack();

  cars.forEach((car) => {
    car.show(ctx);
    car.think();
    car.updateDistanceFromEdges();
    if (!car.alive) {
      savedCars.push(car);
    }
  });

  cars = cars.filter((car) => car.alive);

  if (cars.length === 0) {
    nextGeneration();
  }
  requestAnimationFrame(draw);
  displayTopCars();
  updateGenerationNumber();
}

function drawTrack() {
  const trackWidth = 100;

  // Draw outer track
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(100, 100);
  ctx.lineTo(1100, 100);
  ctx.quadraticCurveTo(1150, 100, 1150, 150);
  ctx.lineTo(1150, 650);
  ctx.quadraticCurveTo(1150, 700, 1100, 700);
  ctx.lineTo(100, 700);
  ctx.quadraticCurveTo(50, 700, 50, 650);
  ctx.lineTo(50, 150);
  ctx.quadraticCurveTo(50, 100, 100, 100);
  ctx.closePath();
  ctx.stroke();

  // Draw inner track
  ctx.beginPath();
  ctx.moveTo(100 + trackWidth, 100 + trackWidth);
  ctx.lineTo(1100 - trackWidth, 100 + trackWidth);
  ctx.quadraticCurveTo(1150 - trackWidth, 100 + trackWidth, 1150 - trackWidth, 150 + trackWidth);
  ctx.lineTo(1150 - trackWidth, 650 - trackWidth);
  ctx.quadraticCurveTo(1150 - trackWidth, 700 - trackWidth, 1100 - trackWidth, 700 - trackWidth);
  ctx.lineTo(100 + trackWidth, 700 - trackWidth);
  ctx.quadraticCurveTo(50 + trackWidth, 700 - trackWidth, 50 + trackWidth, 650 - trackWidth);
  ctx.lineTo(50 + trackWidth, 150 + trackWidth);
  ctx.quadraticCurveTo(50 + trackWidth, 100 + trackWidth, 100 + trackWidth, 100 + trackWidth);
  ctx.closePath();
  ctx.stroke();

  // Draw starting line
  ctx.strokeStyle = "green";
  ctx.lineWidth = 4;
  const startX = 1200 / 2;
  const startY1 = 100;
  const startY2 = 200;
  ctx.beginPath();
  ctx.moveTo(startX, startY1);
  ctx.lineTo(startX, startY2);
  ctx.stroke();
}

function displayTopCars() {
  const topCarsContainer = document.getElementById("top-cars");
  topCarsContainer.innerHTML = "";

  savedCars.slice(0, 5).forEach((car, index) => {
    const carInfo = document.createElement("div");
    carInfo.classList.add("car-info");
    carInfo.innerHTML = `
      <div>Rank: ${index + 1}</div>
      <div>Position: (${car.x.toFixed(2)}, ${car.y.toFixed(2)})</div>
      <div>Left Distance: ${car.leftDistance.toFixed(2)}</div>
      <div>Right Distance: ${car.rightDistance.toFixed(2)})</div>
      <div>Points: ${car.score}</div>
    `;
    topCarsContainer.appendChild(carInfo);
  });
}

function updateGenerationNumber() {
  const generationNumberElement = document.getElementById("generation-number");
  generationNumberElement.textContent = `Generation: ${generation}`;
}

tf.setBackend("webgl").then(() => {
  setup();
});

document.addEventListener("keydown", keyPressed);
