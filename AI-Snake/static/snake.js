class Snake {
  constructor(brain) {
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.xSpeed = scale;
    this.ySpeed = 0;
    this.total = 0;
    this.fitness = 0;
    this.tail = [];

    this.brain = brain ? brain.copy() : new NeuralNetwork(8, 16, 4);
  }

  dispose() {
    this.brain.dispose();
  }

  mutate() {
    this.brain.mutate(0.1);
  }

  think(fruit, canvas) {
    let inputs = [];

    // Normalized distances to the walls
    inputs[0] = this.x / canvas.width;
    inputs[1] = this.y / canvas.height;
    inputs[2] = (canvas.width - this.x) / canvas.width;
    inputs[3] = (canvas.height - this.y) / canvas.height;

    // Normalized distances to the fruit
    inputs[4] = (fruit.x - this.x) / canvas.width;
    inputs[5] = (fruit.y - this.y) / canvas.height;

    // Normalized speed
    inputs[6] = this.xSpeed / scale;
    inputs[7] = this.ySpeed / scale;

    let output = this.brain.predict(inputs);
    let directions = ["Up", "Down", "Left", "Right"];
    let maxIndex = output.indexOf(Math.max(...output));
    this.changeDirection(directions[maxIndex]);
  }

  changeDirection(direction) {
    if (direction === "Up" && this.ySpeed === 0) {
      this.xSpeed = 0;
      this.ySpeed = -scale;
    } else if (direction === "Down" && this.ySpeed === 0) {
      this.xSpeed = 0;
      this.ySpeed = scale;
    } else if (direction === "Left" && this.xSpeed === 0) {
      this.xSpeed = -scale;
      this.ySpeed = 0;
    } else if (direction === "Right" && this.xSpeed === 0) {
      this.xSpeed = scale;
      this.ySpeed = 0;
    }
  }

  draw(ctx) {
    ctx.fillStyle = "#FFFFFF";

    for (let segment of this.tail) {
      ctx.fillRect(segment.x, segment.y, scale, scale);
    }

    ctx.fillRect(this.x, this.y, scale, scale);
  }

  update() {
    for (let i = 0; i < this.tail.length - 1; i++) {
      this.tail[i] = this.tail[i + 1];
    }

    if (this.total > 0) {
      this.tail[this.total - 1] = { x: this.x, y: this.y };
    }

    this.x += this.xSpeed;
    this.y += this.ySpeed;
  }

  outsideCanvas() {
    return (
      this.x >= canvas.width ||
      this.x < 0 ||
      this.y >= canvas.height ||
      this.y < 0
    );
  }

  checkCollision() {
    for (let segment of this.tail) {
      if (this.x === segment.x && this.y === segment.y) {
        this.total = 0;
        this.tail = [];
        break;
      }
    }
  }

  eat(fruit) {
    if (this.x === fruit.x && this.y === fruit.y) {
      this.total++;
      return true;
    }

    return false;
  }

  resetPosition(x, y) {
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
  }
}
