function nextGeneration() {
  console.log('Next Generation');
  calculateFitness();
  let newSnakes = [];
  for (let i = 0; i < TOTAL; i++) {
    let newSnake = pickOne();
    newSnake.resetPosition();
    newSnakes.push(newSnake);
  }

  snakes.forEach((game, index) => {
    game.snake = newSnakes[index % newSnakes.length];
    game.fruit = new Fruit();
  });

  savedSnakes.forEach(snake => snake.dispose());
  savedSnakes = [];
  generation++;
}

function pickOne() {
  let index = 0;
  let r = Math.random();
  while (r > 0 && index < savedSnakes.length) {
    r = r - savedSnakes[index].fitness;
    index++;
  }
  index--;
  let snake = savedSnakes[index];
  let child = new Snake(snake.brain);
  child.mutate();
  return child;
}

function calculateFitness() {
  let sum = 0;
  for (let snake of savedSnakes) {
    sum += snake.Reward;
  }
  for (let snake of savedSnakes) {
    snake.fitness = snake.Reward / sum;
  }
}