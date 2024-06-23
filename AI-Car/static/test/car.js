class Car {
  constructor(brain) {
      this.y = 700 - carHeight + 10;
      this.x = 250 - (carWidth / 2);
      this.angle = 0;

      this.sensors = [
          { angle: 0, length: 200 },
          { angle: 45, length: 200 },
          { angle: -45, length: 200 },
      ];

      if (brain) {
          this.brain = brain.copy();
      } else {
          this.brain = new NeuralNetwork(3, 10, 2);
      }

      this.score = 0;
      this.alive = true;
  }

  dispose() {
      this.brain.dispose();
  }

  mutate() {
      this.brain.mutate(0.1);
  }

  think() {
      if (!this.alive) return;
      const inputs = this.sensors.map(sensor => sensor.length / 200);
      const output = this.brain.predict(inputs);
      this.move(output);
  }

  move(output) {
    if (!this.alive) return;
    const left = output[0] > 0.5;
    const right = output[1] > 0.5;
    this.score += 1;

    for (let i = 0; i < this.sensors.length; i++) {
      this.sensors[i].length = this.getSensorLength(this.x + carWidth / 2, this.y, this.sensors[i].angle, obstacles);
    }

    if (left) {
      this.x -= 1;
    } else if (right) {
      this.x += 1;
    }

    this.checkCollision();
  }

  checkCollision() {
    if (this.x <= 0 || this.x + carWidth >= 500 || this.y <= 0 || this.y + carHeight >= 800) {
        this.alive = false;
        this.score -= 50; // Penalize for dying
    }

    for (const obstacle of obstacles) {
        if (
            this.x < obstacle.x + obstacleWidth &&
            this.x + carWidth > obstacle.x &&
            this.y < obstacle.y + obstacleHeight &&
            this.y + carHeight > obstacle.y
        ) {
            this.alive = false;
            this.score -= 50; // Penalize for dying
        }
    }
}

draw(ctx) {
    this.think();
    if (!this.alive) return;
    ctx.fillStyle = "blue";
    ctx.fillRect(this.x, this.y, carWidth, carHeight);
    this.drawSensors(ctx);
}

getSensorLength(x, y, angle, obstacles) {
    const radians = (Math.PI / 180) * angle;
    for (let length = 0; length < 200; length++) {
        const endX = x + length * Math.sin(radians);
        const endY = y - length * Math.cos(radians);

        for (const obstacle of obstacles) {
            if (
                endX > obstacle.x &&
                endX < obstacle.x + obstacleWidth &&
                endY > obstacle.y &&
                endY < obstacle.y + obstacleHeight
            ) {
                return length;
            }
        }
    }
    return 200;
}

drawSensors(ctx) {
    if (!this.alive) return;
    const carCenterX = this.x + carWidth / 2;
    const carFrontY = this.y;

    this.sensors.forEach(sensor => {
        const length = this.getSensorLength(carCenterX, carFrontY, sensor.angle, obstacles);
        const radians = (Math.PI / 180) * sensor.angle;
        const endX = carCenterX + length * Math.sin(radians);
        const endY = carFrontY - length * Math.cos(radians);

        ctx.strokeStyle = "white";
        ctx.beginPath();
        ctx.moveTo(carCenterX, carFrontY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
    });
}

reset() {
    this.y = 700 - carHeight + 10;
    this.x = 250 - (carWidth / 2);
    this.angle = 0;
    this.score = 0;
    this.alive = true;
}
}