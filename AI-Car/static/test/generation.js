function nextGeneration() {
    console.log('Next Generation');
    calculateFitness();
    for (let i = 0; i < TOTAL; i++) {
        cars[i] = pickOne();
        cars[i].reset();
    }
    for (let i = 0; i < TOTAL; i++) {
        if (savedCars[i]) {
            savedCars[i].dispose();
        }
    }
    savedCars = [];
    generation++;
}

function pickOne() {
    let index = 0;
    let r = Math.random();
    while (r > 0 && index < savedCars.length) {
        r = r - savedCars[index].fitness;
        index++;
    }
    index--;
    let car = savedCars[index];
    if (car) {
        let child = new Car(car.brain);
        child.mutate();
        return child;
    } else {
        return new Car();
    }
}

function calculateFitness() {
    let sum = 0;
    for (let car of savedCars) {
        sum += car.score;
    }
    if (sum === 0) {
        return;
    }
    for (let car of savedCars) {
        car.fitness = car.score / sum;
    }
}