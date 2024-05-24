class Snake {
  constructor(brain) {
    this.x = 200 / 2;
    this.y = 200 / 2;
    this.xSpeed = scale;
    this.ySpeed = 0;
    this.Reward = Default_Points;
    this.fitness = 0;
    this.tail = [];
    this.alive = true;
    this.direction = "East";
    this.brain = brain ? brain.copy() : new NeuralNetwork(12, 16, 3);
  }

  dispose() {
    if (this.brain) {
      this.brain.dispose();
      this.brain = null;
    }
  }

  mutate() {
    this.brain.mutate(0.1);
  }

  generateData(fruit) {
    let Danger_Right = 0,
      Danger_Left = 0,
      Danger_Up = 0,
      Danger_Down = 0;
    let Direction_West = 0,
      Direction_East = 0,
      Direction_North = 0,
      Direction_South = 0;
    let Food_West = 0,
      Food_East = 0,
      Food_North = 0,
      Food_South = 0;

    // Check for danger - is it 1 step away from the wall
    if (this.x + scale >= 200) Danger_Right = 1;
    if (this.x - scale < 0) Danger_Left = 1;
    if (this.y + scale >= 200) Danger_Down = 1;
    if (this.y - scale < 0) Danger_Up = 1;

    // Check for food - is it <direction> from the snake
    if (fruit.x < this.x) Food_West = 1;
    if (fruit.x > this.x) Food_East = 1;
    if (fruit.y < this.y) Food_North = 1;
    if (fruit.y > this.y) Food_South = 1;

    // Check for direction - is the snake moving <direction>
    if (this.direction === "North") {
      Direction_North = 1;
    } else if (this.direction === "South") {
      Direction_South = 1;
    } else if (this.direction === "East") {
      Direction_East = 1;
    } else if (this.direction === "West") {
      Direction_West = 1;
    }

    return {
      Danger_Right,
      Danger_Left,
      Danger_Up,
      Danger_Down,
      Direction_West,
      Direction_East,
      Direction_North,
      Direction_South,
      Food_West,
      Food_East,
      Food_North,
      Food_South,
    };
  }

  think(fruit) {
    let inputs = [];

    let data = this.generateData(fruit);

    inputs[0] = data.Food_West;
    inputs[1] = data.Food_East;
    inputs[2] = data.Food_North;
    inputs[3] = data.Food_South;
    inputs[4] = data.Direction_West;
    inputs[5] = data.Direction_East;
    inputs[6] = data.Direction_North;
    inputs[7] = data.Direction_South;
    inputs[8] = data.Danger_Right;
    inputs[9] = data.Danger_Left;
    inputs[10] = data.Danger_Up;
    inputs[11] = data.Danger_Down;

    let output = this.brain.predict(inputs);
    let directions = ["Straight", "Left", "Right"];
    let maxIndex = output.indexOf(Math.max(...output));
    this.changeDirection(directions[maxIndex]);
  }

  changeDirection(direction) {
    if (direction === "Straight") return;

    if (this.direction === "North") {
      if (direction === "Left") {
        this.xSpeed = -scale;
        this.ySpeed = 0;
        this.direction = "West";
      } else if (direction === "Right") {
        this.xSpeed = scale;
        this.ySpeed = 0;
        this.direction = "East";
      }
    } else if (this.direction === "South") {
      if (direction === "Left") {
        this.xSpeed = scale;
        this.ySpeed = 0;
        this.direction = "East";
      } else if (direction === "Right") {
        this.xSpeed = -scale;
        this.ySpeed = 0;
        this.direction = "West";
      }
    } else if (this.direction === "East") {
      if (direction === "Left") {
        this.xSpeed = 0;
        this.ySpeed = -scale;
        this.direction = "North";
      } else if (direction === "Right") {
        this.xSpeed = 0;
        this.ySpeed = scale;
        this.direction = "South";
      }
    } else if (this.direction === "West") {
      if (direction === "Left") {
        this.xSpeed = 0;
        this.ySpeed = scale;
        this.direction = "South";
      } else if (direction === "Right") {
        this.xSpeed = 0;
        this.ySpeed = -scale;
        this.direction = "North";
      }
    }
  }

  draw(ctx) {
    ctx.fillStyle = "#FFFFFF";
    for (let segment of this.tail) {
      if (segment) {
        ctx.fillRect(segment.x, segment.y, scale, scale);
      }
    }
    ctx.fillRect(this.x, this.y, scale, scale);
    this.update();
  }

  update() { 
    for (let i = 0; i < this.tail.length - 1; i++) {
      this.tail[i] = this.tail[i + 1];
    }

    if (this.Reward > 0) {
      this.tail[this.Reward - 1] = { x: this.x, y: this.y };
    }

    this.x += this.xSpeed;
    this.y += this.ySpeed;

    this.detectLoop();
  }

  outsideCanvas() {
    let result =
      this.x >= 200 ||
      this.x < 0 ||
      this.y >= 200 ||
      this.y < 0;
    if (result) {
      this.Reward -= 1;
      this.alive = false;
      return true;
    }
    return false;
  }

  detectLoop() {
    for (let i = 0; i < this.tail.length - 1; i++) {
      if (
        this.tail[i] &&
        this.x === this.tail[i].x &&
        this.y === this.tail[i].y
      ) {
        this.alive = false;
      }
    }
  }

  checkCollision() {
    let result = this.outsideCanvas() || !this.alive;
    for (let segment of this.tail) {
      if (segment && this.x === segment.x && this.y === segment.y) {
        this.Reward = Default_Points;
        this.tail = [];
        result = true;
      }
    }
    return result;
  }

  eat(fruit) {
    if (this.x === fruit.x && this.y === fruit.y) {
      this.Reward += 100;
      return true;
    }
    return false;
  }

  resetPosition() {
    this.x = 200 / 2;
    this.y = 200 / 2;
    this.Reward = Default_Points;
    this.xSpeed = scale;
    this.ySpeed = 0;
    this.alive = true;
    this.direction = "East";
  }
}
