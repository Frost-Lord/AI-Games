class Ball {
  constructor(brain) {
    this.y = canvas.height / 2;
    this.x = 64;
    this.radius = 16;
    this.gravity = 0.6;

    this.score = 0;
    this.fitness = 0;
    this.movesLeft = 3;
    this.alive = true;

    if (brain) {
      this.brain = brain.copy();
    } else {
      this.brain = new NeuralNetwork(4, 8, 2);
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

    const direction = (output[0] * 360) % 360;
    const power = output[1] * 100;
    const angleInRadians = direction * (Math.PI / 180);

    const velocityX = Math.cos(angleInRadians) * power;
    const velocityY = Math.sin(angleInRadians) * power;

    console.log(`Direction: ${direction}, Power: ${power}, VelocityX: ${velocityX}, VelocityY: ${velocityY}`);

    if (this.x === undefined) this.x = 0;
    if (this.y === undefined) this.y = 0;
    if (this.velocityX === undefined) this.velocityX = 0;
    if (this.velocityY === undefined) this.velocityY = 0;

    this.velocityX += velocityX;
    this.velocityY += velocityY;

    if (this.gravity !== undefined) {
      this.velocityY += this.gravity;
    }

    this.x += this.velocityX;
    this.y += this.velocityY;

    this.score = Math.max(this.score, 1 / this.getDistanceToHole());

    this.movesLeft--;
    if (this.offScreen()) {
      this.alive = false;
    }
  }

  mutate() {
    this.brain.mutate(0.1);
  }

  getDistanceToHole() {
    return Math.sqrt((this.x - hole.x) ** 2 + (this.y - hole.y) ** 2);
  }

  think(hole) {
    if (!this.alive || this.movesLeft <= 0) return;
    let inputs = [];
    inputs[0] = this.y / canvas.height;
    inputs[1] = this.x / canvas.width;
    inputs[2] = hole.x / canvas.width;
    inputs[3] = hole.y / canvas.height;
    let output = this.brain.predict(inputs);
    this.move(output);
  }

  offScreen() {
    return this.y > canvas.height || this.y < 0 || this.x > canvas.width || this.x < 0;
  }

  resetPosition(x, y) {
    this.x = x;
    this.y = y;
    this.movesLeft = 3;
    this.alive = true;
  }
}
