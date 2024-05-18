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

        const newWeights = this.brain.getWeights().map((weight) => {
            return tf.tidy(() => {
                let values = weight.arraySync();
                if (this.mutations.includes('new_connection')) {
                    for (let j = 0; j < values.length; j++) {
                        for (let k = 0; k < values[j].length; k++) {
                            values[j][k] += Math.random() * 0.1 - 0.05; // Adding small random values
                        }
                    }
                }
                if (this.mutations.includes('weight_modification')) {
                    for (let j = 0; j < values.length; j++) {
                        for (let k = 0; k < values[j].length; k++) {
                            values[j][k] *= Math.random() * 1.1; // Scale weights randomly
                        }
                    }
                }
                return tf.tensor(values);
            });
        });

        this.brain.setWeights(newWeights);

        if (this.mutations.includes('new_node')) {
            const weights = this.brain.getWeights();
            if (weights.length > 1) { // Avoid trying to add nodes to the last layer
                tf.tidy(() => {
                    let lastWeight = weights[weights.length - 2];
                    let lastBias = weights[weights.length - 1];
                    let newWeightShape = [lastWeight.shape[0] + 1, lastWeight.shape[1]];
                    let newBiasShape = [lastBias.shape[0] + 1];

                    let newWeight = tf.randomNormal(newWeightShape, 0, 0.1);
                    let newBias = tf.randomNormal(newBiasShape, 0, 0.1);

                    let oldWeightData = lastWeight.arraySync();
                    let oldBiasData = lastBias.arraySync();
                    let newWeightData = newWeight.arraySync();
                    let newBiasData = newBias.arraySync();

                    for (let j = 0; j < oldWeightData.length; j++) {
                        for (let k = 0; k < oldWeightData[j].length; k++) {
                            newWeightData[j][k] = oldWeightData[j][k];
                        }
                    }

                    for (let j = 0; j < oldBiasData.length; j++) {
                        newBiasData[j] = oldBiasData[j];
                    }

                    newWeight.dispose();
                    newBias.dispose();

                    weights[weights.length - 2].dispose();
                    weights[weights.length - 1].dispose();

                    weights[weights.length - 2] = tf.tensor(newWeightData);
                    weights[weights.length - 1] = tf.tensor(newBiasData);

                    this.brain.setWeights(weights);
                });
            }
        }

        this.mutations = []; // Clear mutations after applying
    }

    async copyBrainFrom(parentBall) {
        if (!parentBall.brain) return;
        const parentWeights = parentBall.brain.getWeights();
        const clonedWeights = parentWeights.map(w => tf.tidy(() => w.clone()));
        this.brain.setWeights(clonedWeights);
    }

    async move() {
        if (!this.brain) return;

        tf.tidy(() => {
            const input = tf.tensor2d([[this.x, this.y, hole.x, hole.y, this.getDistanceToHole()]]);
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
