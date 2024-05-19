const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const TOTAL = 100;
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
  canvas.width = 800;
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

  // Background Grid - create car map with boarders


  cars.forEach((car) => {
    car.show(ctx);
    car.think(hole);
    if (!car.alive || car.movesLeft <= 0) {
      savedCars.push(car);
    }
  });

  cars = cars.filter((car) => car.alive && car.movesLeft > 0);

  if (cars.length === 0) {
    nextGeneration(distanceToHole);
  }
  requestAnimationFrame(draw);
  displayTopBalls();
  updateGenerationNumber();
}

function displayTopBalls() {
  const topBallsContainer = document.getElementById("top-cars");
  topBallsContainer.innerHTML = "";

  savedCars.slice(0, 0).forEach((car, index) => {
    const ballInfo = document.createElement("div");
    ballInfo.classList.add("car-info");
    ballInfo.innerHTML = `
            <div>Rank: ${index + 1}</div>
            <div>Position: (${car.x.toFixed(2)}, ${car.y.toFixed(2)})</div>
            <div>Points: ${car.score}</div>
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
