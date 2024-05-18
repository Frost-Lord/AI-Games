function nextGeneration() {
  console.log('Next Generation');
  calculateFitness();
  let newBalls = [];
  for (let i = 0; i < TOTAL; i++) {
    let newBall = pickOne();
    newBall.resetPosition(64, canvas.height / 2);
    newBalls.push(newBall);
  }
  balls = newBalls;

  for (let i = 0; i < savedBalls.length; i++) {
    savedBalls[i].dispose();
  }
  savedBalls = [];
  generation++;
}


function pickOne() {
  let index = 0;
  let r = Math.random();
  while (r > 0 && index < savedBalls.length) {
    r = r - savedBalls[index].fitness;
    index++;
  }
  index--;
  let ball = savedBalls[index];
  let child = new Ball(ball.brain);
  child.mutate();
  return child;
}

function calculateFitness() {
  let sum = 0;
  for (let ball of savedBalls) {
    sum += ball.score;
  }
  for (let ball of savedBalls) {
    ball.fitness = ball.score / sum;
  }
}
