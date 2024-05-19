function nextGeneration() {
  console.log('Next Generation');
  calculateFitness();
  let newCars = [];
  for (let i = 0; i < TOTAL; i++) {
    let newCar = pickOne();
    newCar.resetPosition(600, 150);
    newCars.push(newCar);
  }
  cars = newCars;

  for (let i = 0; i < savedCars.length; i++) {
    savedCars[i].dispose();
  }
  savedCars = [];
  generation++;
}

function pickOne() {
  let index = 0;
  let r = random();
  while (r > 0 && index < savedCars.length) {
    r = r - savedCars[index].fitness;
    index++;
  }
  index--;
  let car = savedCars[index];
  let child = new Car(car.brain);
  child.mutate();
  return child;
}

function calculateFitness() {
  let sum = 0;
  for (let car of savedCars) {
    sum += car.score;
  }
  for (let car of savedCars) {
    car.fitness = car.score;
  }
}

function random() {
  return Math.random();
}

function randomGaussian() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}