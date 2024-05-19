class Ball {
  constructor(brain) {
    this.y = canvas.height / 2;
    this.x = canvas.width / 2;
    this.radius = 16;

    if (brain) {
      this.brain = brain.copy();
    } else {
      this.brain = new NeuralNetwork(4, 8, 2);
    }
  }

  show(ctx) {
    ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
    ctx.fill();
  }

  move(output) {
    const directionRad = output[0] * 2 * Math.PI; // Scale output[0] to 0 -> 2π
    const power = output[1]; // Power should be normalized between 0 and 1

    const velocityX = Math.cos(directionRad) * power * 10; // Scale power appropriately
    const velocityY = Math.sin(directionRad) * power * 10;

    console.log(`Moving with direction: ${directionRad} radians, power: ${power}`);
    console.log(`Velocity X: ${velocityX}, Velocity Y: ${velocityY}`);

    this.x += velocityX;
    this.y += velocityY;

    // Prevent the ball from going off the screen
    this.x = Math.max(this.radius, Math.min(this.x, canvas.width - this.radius));
    this.y = Math.max(this.radius, Math.min(this.y, canvas.height - this.radius));
  }

  getDistanceToHole() {
    return Math.sqrt((this.x - hole.x) ** 2 + (this.y - hole.y) ** 2);
  }

  offScreen() {
    return this.y > canvas.height || this.y < 0 || this.x > canvas.width || this.x < 0;
  }

  think(hole) {
    let inputs = [];
    inputs[0] = hole.x / canvas.width;
    inputs[1] = this.x / canvas.width;
    inputs[2] = this.y / canvas.height;
    inputs[3] = hole.y / canvas.height;

    let output = this.brain.predict(inputs);
    console.log(`Neural Network Output: [${output[0]}, ${output[1]}]`);
    this.move(output);
  }

  calculateOptimalMove(hole, ball) {
    let dx = hole.x - ball.x;
    let dy = hole.y - ball.y;
    const distance = Math.sqrt(dx ** 2 + dy ** 2);
    const angle = (Math.atan2(dy, dx) + Math.PI) / (2 * Math.PI); // Normalize angle to [0, 1]
    const power = Math.min(distance / 100, 25); // Normalize power and cap it at 1

    console.log(`Calculated Optimal Move - Angle: ${angle}, Power: ${power}`);
    return {
      angle: angle,
      power: power
    };
  }

  resetPosition() {
    this.y = canvas.height / 2;
    this.x = canvas.width / 2;
  }
}
