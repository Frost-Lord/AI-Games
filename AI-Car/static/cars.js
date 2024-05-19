class Car {
  constructor(brain) {
    this.y = canvas.height / 2;
    this.x = canvas.width / 2;
    this.radius = 16;
    this.gravity = 0.6;

    this.score = 0;
    this.fitness = 0;
    this.movesLeft = 2;
    this.alive = true;

    this.direction = 0;
    this.power = 0;

    this.previousDirection = 0;
    this.previousPower = 0;

    this.spawnToHoleDistance = 0;

    if (brain) {
      this.brain = brain.copy();
    } else {
      this.brain = new NeuralNetwork(9, 10, 2);
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

  map(value, start1, stop1, start2, stop2) {
    return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
  }
  
  move(output) {
    if (!this.alive || this.movesLeft <= 0) return;

    const direction = this.map(output[0], 0, 1, 0, 360); // 0 -> 360
    const power = this.map(output[1], 0, 1, 0, 25); // Adjusted power scaling to be smaller

    console.log(`Direction: ${direction}, Power: ${power}`);
    
    const directionRad = Math.abs(direction) * (Math.PI / 180);
    const velocityX = Math.cos(directionRad) * power;
    const velocityY = Math.sin(directionRad) * power;

    this.x += velocityX;
    this.y += velocityY;

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

    let percentToHole = this.getDistanceToHole() / this.spawnToHoleDistance;
    this.score = Math.max(0, percentToHole);

    let inputs = [];
    inputs[0] = this.map(hole.x, 0, canvas.width, 0, 1);
    inputs[1] = this.map(this.x, 0, canvas.width, 0, 1);
    inputs[2] = this.map(this.y, 0, canvas.height, 0, 1);
    inputs[3] = this.map(hole.y, 0, canvas.height, 0, 1);
    inputs[4] = this.map(percentToHole, 0, 1, 0, 1);

    const angleToHole = Math.atan2(hole.y - this.y, hole.x - this.x) / (2 * Math.PI);
    inputs[5] = this.map(angleToHole, -1, 1, 0, 1);

    inputs[6] = this.map(this.previousDirection, 0, 360, 0, 1);
    inputs[7] = this.map(this.previousPower, 0, 100, 0, 1);
    inputs[8] = this.map(this.score, 0, 1, 0, 1);

    let output = this.brain.predict(inputs);
    this.move(output);

    // Store the current move information
    this.previousDirection = this.map(output[0], 0, 1, 0, 360);
    this.previousPower = this.map(output[1], 0, 1, 0, 25); // Adjusted power scaling
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

  calculateOptimalMove(hole) {
    const dx = hole.x - this.x;
    const dy = hole.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    const power = distance / 25;

    return {
      angle: angle,
      power: power
    };
  }
}
