class Car {
  constructor(brain) {
    this.y = 150;
    this.x = 600;
    this.radius = 16;
    this.rotation = 0; // The Left of the car is facing down (180) | Right is facing up (0) | Front is facing (270) | Back is facing (90) ... Degrees

    this.score = 0;
    this.fitness = 0;
    this.alive = true;

    this.previousX = this.x;
    this.previousY = this.y;
    this.distanceTraveled = 0;

    this.trackWidth = 100;
    this.outerTrack = {
      left: 50,
      right: 1150,
      top: 100,
      bottom: 700,
    };
    this.innerTrack = {
      left: this.outerTrack.left + this.trackWidth,
      right: this.outerTrack.right - this.trackWidth,
      top: this.outerTrack.top + this.trackWidth,
      bottom: this.outerTrack.bottom - this.trackWidth,
    };

    if (brain) {
      this.brain = brain.copy();
    } else {
      this.brain = new NeuralNetwork(3, 10, 2);
    }
  }

  dispose() {
    this.brain.dispose();
  }

  show(ctx) {
    if (!this.alive) return;

    const carWidth = this.radius * 3;
    const carHeight = this.radius;

    // Car body
    ctx.fillStyle = "blue";
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.beginPath();
    ctx.rect(-carWidth / 2, -carHeight / 2, carWidth, carHeight);
    ctx.fill();

    // Front of the car
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.rect(-carWidth / 2, -carHeight / 2, carHeight, carHeight);
    ctx.fill();
    ctx.restore();
  }

  move(output) {
    if (!this.alive) return;

    const left = output[0];
    const right = output[1];

    this.x += (right - left) * 5;
    this.y += (1 - Math.abs(right - left)) * 5;

    const distance = Math.sqrt(
      (this.x - this.previousX) ** 2 + (this.y - this.previousY) ** 2
    );

    this.distanceTraveled += distance;

    this.previousX = this.x;
    this.previousY = this.y;

    if (this.offScreen() || this.touchingTrackEdges()) {
      this.alive = false;
    }
  }

  mutate() {
    this.brain.mutate(0.1);
  }

  think() {
    if (!this.alive) return;
    this.score = this.distanceTraveled;
    let inputs = [];
    inputs[0] = this.distanceLeft();
    inputs[1] = this.distanceRight();
    inputs[2] = this.score;

    let output = this.brain.predict(inputs);
    this.move(output);
  }

  offScreen() {
    return (
      this.y > canvas.height ||
      this.y < 0 ||
      this.x > canvas.width ||
      this.x < 0
    );
  }

  touchingTrackEdges() {
    return (
      this.x - this.radius < this.outerTrack.left ||
      this.x + this.radius > this.outerTrack.right ||
      this.y - this.radius < this.outerTrack.top ||
      this.y + this.radius > this.outerTrack.bottom ||
      (this.x + this.radius > this.innerTrack.left &&
        this.x - this.radius < this.innerTrack.right &&
        this.y + this.radius > this.innerTrack.top &&
        this.y - this.radius < this.innerTrack.bottom)
    );
  }

  resetPosition(x, y) {
    this.x = x;
    this.y = y;
    this.previousX = x;
    this.previousY = y;
    this.alive = true;
    this.score = 0;
    this.distanceTraveled = 0;
  }

  distanceLeft() {
    return 1;
  }

  distanceRight() {
    return 1;
  }

  updateDistanceFromEdges() {
    this.leftDistance = this.distanceLeft();
    this.rightDistance = this.distanceRight();
  }
}
