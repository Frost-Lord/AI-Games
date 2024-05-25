let currentModel;

function flipX(arr) {
  return [arr.slice(6), arr.slice(3, 6), arr.slice(0, 3)].flat();
}

function flipY(arr) {
  return flipX(arr.slice().reverse());
}

function showMove(first, second) {
  let result = [];
  first.forEach((move, i) => {
    result.push(Math.abs(move - second[i]));
  });
  return result;
}

function getMoves(block) {
  let x = [];
  let y = [];
  for (let i = 0; i < block.length - 1; i++) {
    const theMove = showMove(block[i], block[i + 1]);
    x.push(block[i]);
    y.push(theMove);
    x.push(flipX(block[i]));
    y.push(flipX(theMove));
    x.push(block[i].slice().reverse());
    y.push(theMove.slice().reverse());
    x.push(flipY(block[i]));
    y.push(flipY(theMove));
  }
  return { x, y };
}

function CreateModel() {
  tf.disposeVariables();
  const model = tf.sequential();

  model.add(
    tf.layers.dense({
      inputShape: 9,
      units: 64,
      activation: "relu"
    })
  );

  model.add(
    tf.layers.dense({
      units: 64,
      activation: "relu"
    })
  );

  model.add(
    tf.layers.dense({
      units: 9,
      activation: "softmax"
    })
  );

  const learningRate = 0.005;
  model.compile({
    optimizer: tf.train.adam(learningRate),
    loss: "categoricalCrossentropy",
    metrics: ["accuracy"]
  });

  return model;
}

async function GetModel() {
  if (!currentModel) {
    currentModel = await CreateModel();
  }
  return currentModel;
}

async function Train() {
  const model = await GetModel();

  let AllX = [];
  let AllY = [];

  Games.forEach(game => {
    const moves = getMoves(game.moves);
    AllX = AllX.concat(moves.x);
    AllY = AllY.concat(moves.y);
  });

  const stackedX = tf.stack(AllX);
  const stackedY = tf.stack(AllY);

  const allCallbacks = {
    onEpochEnd: (epoch, log) => console.log(`Epoch: ${epoch}, Loss: ${log.loss}, Accuracy: ${log.acc}`)
  };

  await model.fit(stackedX, stackedY, {
    epochs: 100,
    shuffle: true,
    batchSize: 32,
    callbacks: allCallbacks
  });

  stackedX.dispose();
  stackedY.dispose();

  currentModel = model;
  return true;
}

async function Predict(game) {
  const model = await GetModel();
  const prediction = model.predict(tf.tensor2d([game])).dataSync();
  return prediction;
}
