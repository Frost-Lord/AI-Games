class Ball {
  constructor(brain) {
    this.y = canvas.height / 2;
    this.x = canvas.width / 2;
    this.radius = 16;
    this.gravity = 0.6;

    this.score = 0;
    this.fitness = 0;
    this.movesLeft = 4;
    this.alive = true;

    this.direction = 0;
    this.power = 0;

    this.spawnToHoleDistance = 0;

    if (brain) {
      this.brain = brain.copy();
    } else {
      this.brain = new NeuralNetwork(7, 10, 2);
    }
  }

  dispose() {
    this.brain.dispose();
  }

  show(ctx) {
    if (!this.alive) return;
    ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
    ctx.fill();
  }

  move(output) {
    if (!this.alive || this.movesLeft <= 0) return;

    const direction = output[0] * 360; // 0 -> 360 
    const power = output[1] * 50;
    //const Rpower = Math.min(100, distanceToHoleFromBall * power);
    const directionRad = direction * Math.PI / 180;

    const velocityX = Math.cos(directionRad) * power;
    const velocityY = Math.sin(directionRad) * power;

    this.x += velocityX;
    this.y += velocityY;

    const distanceToHoleFromBall = this.getDistanceToHole();

    console.log(`Direction: ${direction}, Power: ${power}`);

    console.log(distanceToHoleFromBall, this.spawnToHoleDistance);
    let percentToHole = (1 - distanceToHoleFromBall / this.spawnToHoleDistance);
    this.score = percentToHole;
    if (this.score < 0) {
      this.score = 0;
    }
    console.log(this.score);

    this.movesLeft--;
    if (this.offScreen()) {
      this.alive = false;
    }
  }

  mutate() {
    this.brain.mutate(0.1);
  }

  getDistanceToHole() {
    return Math.sqrt(Math.abs(this.x - hole.x)**2 + Math.abs(this.y - hole.y)**2);
  }

  think(hole) {
    if (!this.alive || this.movesLeft <= 0) return;
    let inputs = [];
    inputs[0] = hole.x;
    inputs[1] = hole.y;
    inputs[2] = this.x;
    inputs[3] = this.y;
    inputs[4] = this.score;
    inputs[5] = this.direction;
    inputs[6] = this.power;

    let output = this.brain.predict(inputs);
    this.move(output);
  }

  offScreen() {
    return this.y > canvas.height || this.y < 0 || this.x > canvas.width || this.x < 0;
  }

  resetPosition(x, y) {
    this.x = x;
    this.y = y;
    this.movesLeft = 4;
    this.alive = true;
  }
}
