class NeuralNetwork {
  constructor(a, b, c, d) {
    if (a instanceof tf.Sequential) {
      this.model = a;
      this.input_nodes = b;
      this.hidden_nodes = c;
      this.output_nodes = d;
    } else {
      this.input_nodes = a;
      this.hidden_nodes = b;
      this.output_nodes = c;
      this.model = this.createModel();
    }
  }

  copy() {
    return tf.tidy(() => {
      const modelCopy = this.createModel();
      const weights = this.model.getWeights();
      const weightCopies = [];
      for (let i = 0; i < weights.length; i++) {
        weightCopies[i] = weights[i].clone();
      }
      modelCopy.setWeights(weightCopies);
      return new NeuralNetwork(
        modelCopy,
        this.input_nodes,
        this.hidden_nodes,
        this.output_nodes
      );
    });
  }

  mutate(rate) {
    tf.tidy(() => {
      const weights = this.model.getWeights();
      const mutatedWeights = [];
      for (let i = 0; i < weights.length; i++) {
        let tensor = weights[i];
        let shape = weights[i].shape;
        let values = tensor.dataSync().slice();
        for (let j = 0; j < values.length; j++) {
          if (random() < rate) {
            let w = values[j];
            values[j] = w + randomGaussian();
          }
        }
        let newTensor = tf.tensor(values, shape);
        mutatedWeights[i] = newTensor;
      }
      this.model.setWeights(mutatedWeights);
    });
  }

  dispose() {
    this.model.dispose();
  }

  predict(inputs) {
    return tf.tidy(() => {
      const xs = tf.tensor2d([inputs]);
      const ys = this.model.predict(xs);
      const outputs = ys.dataSync();
      return outputs;
    });
  }

  createModel() {
    const model = tf.sequential();
    model.add(
      tf.layers.dense({
        units: this.hidden_nodes,
        inputShape: [this.input_nodes],
        activation: "sigmoid",
      })
    );
    model.add(
      tf.layers.dense({
        units: this.output_nodes,
        activation: "linear",
      })
    );
    model.compile({
      optimizer: 'adam',
      loss: 'meanSquaredError'
    });
    return model;
  }
}

async function createModel() {
  const model = tf.sequential();

  // Input layer
  model.add(
    tf.layers.dense({
      units: 16,
      inputShape: [4],
      activation: "relu",
    })
  );

  model.add(
    tf.layers.dense({
      units: 32,
      activation: "relu",
    })
  );

  model.add(
    tf.layers.dense({
      units: 16,
      activation: "relu",
    })
  );

  model.add(
    tf.layers.dense({
      units: 2,
      activation: "linear",
    })
  );

  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: 'meanSquaredError'
  });

  return model;
}


async function trainModel(inputs, outputs) {
  const model = await createModel();
  const xs = tf.tensor2d(inputs);
  const ys = tf.tensor2d(outputs); 
  const allCallbacks = {
    // onTrainBegin: log => console.log(log),
    // onTrainEnd: log => console.log(log),
    // onEpochBegin: (epoch, log) => console.log(epoch, log),
    onEpochEnd: (epoch, log) => console.log(epoch, log)
    // onBatchBegin: (batch, log) => console.log(batch, log),
    // onBatchEnd: (batch, log) => console.log(batch, log)
  };
  await model.fit(xs, ys, { 
    epochs: 100,
    shuffle: true,
    batchSize: 32,
    callbacks: allCallbacks
  });
  await model.save("localstorage://model");
}

async function loadModel() {
  const model = await tf.loadLayersModel("localstorage://model");
  return model;
}

function random() {
  return Math.random();
}

function randomGaussian() {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}
