class Car {
  constructor(brain) {
    this.y = 150;
    this.x = 600;
    this.radius = 16;

    this.score = 0;
    this.fitness = 0;
    this.alive = true;

    this.previousX = this.x;
    this.previousY = this.y;
    this.distanceTraveled = 0;

    this.outerTrack = {
      left: 50,
      right: 1150,
      top: 100,
      bottom: 700
    };
    this.trackWidth = 100;
    this.innerTrack = {
      left: this.outerTrack.left + this.trackWidth,
      right: this.outerTrack.right - this.trackWidth,
      top: this.outerTrack.top + this.trackWidth,
      bottom: this.outerTrack.bottom - this.trackWidth
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
    ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.rect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
    ctx.fill();
  }

  move(output) {
    if (!this.alive) return;

    const left = output[0];
    const right = output[1];

    this.x += (right - left) * 100;
    this.y += (1 - Math.abs(right - left)) * 100;

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
    
    let inputs = [];
    inputs[0] = this.distanceFromLeftEdge();
    inputs[1] = this.distanceFromRightEdge();
    inputs[2] = this.score;

    let output = this.brain.predict(inputs);
    this.move(output);
    this.score = Math.floor(this.distanceTraveled / 100);
  }

  offScreen() {
    return this.y > canvas.height || this.y < 0 || this.x > canvas.width || this.x < 0;
  }

  touchingTrackEdges() {
    return this.x - this.radius < this.outerTrack.left ||
           this.x + this.radius > this.outerTrack.right ||
           this.y - this.radius < this.outerTrack.top ||
           this.y + this.radius > this.outerTrack.bottom ||
           (this.x + this.radius > this.innerTrack.left && this.x - this.radius < this.innerTrack.right &&
            this.y + this.radius > this.innerTrack.top && this.y - this.radius < this.innerTrack.bottom);
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

  distanceFromLeftEdge() {
    const leftOuterDistance = this.x - this.outerTrack.left;
    const leftInnerDistance = this.x - this.innerTrack.left;
    return this.x < this.innerTrack.left ? leftOuterDistance : leftInnerDistance;
  }

  distanceFromRightEdge() {
    const rightOuterDistance = this.outerTrack.right - this.x;
    const rightInnerDistance = this.innerTrack.right - this.x;
    return this.x > this.innerTrack.right ? rightOuterDistance : rightInnerDistance;
  }

  updateDistanceFromEdges() {
    this.leftDistance = this.distanceFromLeftEdge();
    this.rightDistance = this.distanceFromRightEdge();
  }
}