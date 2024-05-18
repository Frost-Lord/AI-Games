class Ball {
  constructor(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.mutations = [];
    this.points = 0;
    this.brain = null;
    this.vx = 0;
    this.vy = 0;
    this.speed = 0.5;
  }

  addMutation(mutation) {
    this.mutations.push(mutation);
  }

  clearMutations() {
    this.mutations = [];
    this.initializeBrain();
  }

  async initializeBrain() {
    this.brain = await GenerateModel();
  }

  async applyMutations() {
    if (!this.brain) return;

    const weights = this.brain.getWeights();

    for (let mutation of this.mutations) {
      if (mutation === "new_connection") {
        // Add new connection logic (example: adding noise to weights)
        weights.forEach((weight, i) => {
          let values = weight.arraySync();
          for (let j = 0; j < values.length; j++) {
            for (let k = 0; k < values[j].length; k++) {
              values[j][k] += Math.random() * 0.1 - 0.05; // Adding small random values
            }
          }
          weights[i] = tf.variable(tf.tensor(values));
        });
      } else if (mutation === "new_node") {
        tf.tidy(() => {
          // Add new node logic
          if (weights.length > 1) {
            // Avoid trying to add nodes to the last layer
            let lastWeight = weights[weights.length - 2]; // Get the second last layer's weight
            let lastBias = weights[weights.length - 1]; // Get the second last layer's bias
            let newWeightShape = [lastWeight.shape[0] + 1, lastWeight.shape[1]]; // Increase input nodes by 1
            let newBiasShape = [lastBias.shape[0] + 1]; // Increase nodes by 1

            // Create new weight and bias tensors with the updated shape
            let newWeight = tf.randomNormal(newWeightShape, 0, 0.1);
            let newBias = tf.randomNormal(newBiasShape, 0, 0.1);

            // Copy the original weights and biases into the new tensors
            newWeight = newWeight
              .slice([0, 0], [lastWeight.shape[0], lastWeight.shape[1]])
              .add(lastWeight);
            newBias = newBias.slice([0], [lastBias.shape[0]]).add(lastBias);

            weights[weights.length - 2] = tf.variable(newWeight);
            weights[weights.length - 1] = tf.variable(newBias);
          }
        });
      } else if (mutation === "weight_modification") {
        // Modify weights logic
        tf.tidy(() => {
          weights.forEach((weight, i) => {
            let values = weight.arraySync();
            for (let j = 0; j < values.length; j++) {
              for (let k = 0; k < values[j].length; k++) {
                values[j][k] *= Math.random() * 1.1; // Scale weights randomly
              }
            }
            weights[i] = tf.variable(tf.tensor(values));
          });
        });
      }
    }

    this.brain.setWeights(weights);
    this.mutations = [];
  }

  async copyBrainFrom(parentBall) {
    if (!parentBall.brain) return;
    const parentWeights = parentBall.brain.getWeights();
    this.brain.setWeights(parentWeights.map((w) => w.clone()));
  }

  async move() {
    if (!this.brain) return;
    tf.tidy(() => {
      const input = tf.tensor2d([
        [this.x, this.y, hole.x, hole.y, this.getDistanceToHole()],
      ]);
      const prediction = this.brain.predict(input);
      const predictionData = prediction.dataSync();
      input.dispose();
      prediction.dispose();

      const [direction, power] = predictionData;
      const angle = direction * 2 * Math.PI;
      this.vx = Math.cos(angle) * power * this.speed;
      this.vy = Math.sin(angle) * power * this.speed;
    });
  }

  updatePosition() {
    this.x += this.vx;
    this.y += this.vy;

    this.vx *= 0.95;
    this.vy *= 0.95;

    // Ensure the ball stays within the canvas
    if (this.x < this.radius) {
      this.x = this.radius;
      this.vx = -this.vx;
    } else if (this.x > canvas.width - this.radius) {
      this.x = canvas.width - this.radius;
      this.vx = -this.vx;
    }

    if (this.y < this.radius) {
      this.y = this.radius;
      this.vy = -this.vy;
    } else if (this.y > canvas.height - this.radius) {
      this.y = canvas.height - this.radius;
      this.vy = -this.vy;
    }
  }

  resetPosition(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
  }

  getDistanceToHole() {
    return Math.sqrt((this.x - hole.x) ** 2 + (this.y - hole.y) ** 2);
  }
}
