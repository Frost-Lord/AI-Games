class Ball {
  constructor(x, y, radius) {
    this.x = x;
    this.y = y;
    this.UUID = Math.random().toString(36).substring(2, 8);
    this.radius = radius;
    this.mutations = [];
    this.points = 0;
    this.prevPoints = 0;
    this.brain = null;
    this.vx = 0;
    this.vy = 0;
    this.speed = 1.5;
    this.moveCounter = 0;
    this.targetX = x;
    this.targetY = y;
    this.moveProgress = 0;
    this.isMoving = false;
  }

  addMutation(mutation) {
    this.mutations.push(mutation);
  }

  clearMutations() {
    this.mutations.length = 0;
    this.initializeBrain();
  }

  async initializeBrain() {
    this.brain = await GenerateModel();
  }

  async applyMutations() {
    if (!this.brain) return;

    const weights = this.brain.getWeights();
    const randomInRange = (range) => Math.random() * range - range / 2;

    for (const mutation of this.mutations) {
      switch (mutation) {
        case "new_connection":
          weights.forEach((weight, i) => {
            const values = weight.arraySync();
            for (let j = 0; j < values.length; j++) {
              for (let k = 0; k < values[j].length; k++) {
                values[j][k] += randomInRange(0.1);
              }
            }
            weights[i] = tf.variable(tf.tensor(values));
          });
          break;
        case "new_node":
          tf.tidy(() => {
            if (weights.length > 1) {
              const lastWeight = weights[weights.length - 2];
              const lastBias = weights[weights.length - 1];
              const newWeightShape = [
                lastWeight.shape[0] + 1,
                lastWeight.shape[1],
              ];
              const newBiasShape = [lastBias.shape[0] + 1];

              let newWeight = tf.randomNormal(newWeightShape, 0, 0.1);
              let newBias = tf.randomNormal(newBiasShape, 0, 0.1);

              newWeight = newWeight
                .slice([0, 0], [lastWeight.shape[0], lastWeight.shape[1]])
                .add(lastWeight);
              newBias = newBias.slice([0], [lastBias.shape[0]]).add(lastBias);

              weights[weights.length - 2] = tf.variable(newWeight);
              weights[weights.length - 1] = tf.variable(newBias);
            }
          });
          break;
        case "weight_modification":
          tf.tidy(() => {
            weights.forEach((weight, i) => {
              const values = weight.arraySync();
              for (let j = 0; j < values.length; j++) {
                for (let k = 0; k < values[j].length; k++) {
                  values[j][k] *= Math.random() * 1.1;
                }
              }
              weights[i] = tf.variable(tf.tensor(values));
            });
          });
          break;
        case "weight_randomization":
          weights.forEach((weight, i) => {
            const values = weight.arraySync();
            for (let j = 0; j < values.length; j++) {
              for (let k = 0; k < values[j].length; k++) {
                values[j][k] = Math.random() * 2 - 1; // randomize weights
              }
            }
            weights[i] = tf.variable(tf.tensor(values));
          });
          break;
      }
    }

    this.brain.setWeights(weights);
    this.mutations.length = 0;
  }

  async copyBrainFrom(parentBall) {
    if (!parentBall.brain) return;
    const parentWeights = parentBall.brain.getWeights();
    this.brain.setWeights(parentWeights.map((w) => w.clone()));
  }

  async move() {
    if (!this.brain || this.moveCounter >= 3) return;

    tf.tidy(() => {
      const input = tf.tensor2d([
        [this.x, this.y, hole.x, hole.y, this.getDistanceToHole()],
      ]);
      const [direction, power] = this.brain.predict(input).dataSync();

      const angle = direction * 2 * Math.PI;
      this.vx = Math.cos(angle) * power * this.speed;
      this.vy = Math.sin(angle) * power * this.speed;

      this.targetX = this.x + this.vx;
      this.targetY = this.y + this.vy;
      this.moveProgress = 0;
    });

    this.moveCounter++;
  }

  updatePosition() {
    if (this.moveProgress < 1) {
      this.x += (this.targetX - this.x) * this.moveProgress;
      this.y += (this.targetY - this.y) * this.moveProgress;
      this.moveProgress += 0.05;
    } else {
      this.x = this.targetX;
      this.y = this.targetY;
    }

    if (this.x < this.radius || this.x > canvas.width - this.radius) {
      this.x = Math.max(
        this.radius,
        Math.min(canvas.width - this.radius, this.x)
      );
      this.vx = -this.vx;
      this.points -= 100;
    }

    if (this.y < this.radius || this.y > canvas.height - this.radius) {
      this.y = Math.max(
        this.radius,
        Math.min(canvas.height - this.radius, this.y)
      );
      this.vy = -this.vy;
      this.points -= 100;
    }
  }

  resetPosition(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.prevPoints = this.points;
    this.points = 0;
    this.moveCounter = 0;
  }

  getDistanceToHole() {
    return Math.hypot(this.x - hole.x, this.y - hole.y);
  }
}