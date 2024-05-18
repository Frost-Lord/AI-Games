async function GenerateModel() {
    const model = tf.sequential();

    // Input: position x, y of the ball, position x, y of the hole, distance from the hole
    model.add(tf.layers.dense({
        inputShape: [5],
        units: 512,
        activation: "relu"
    }));

    model.add(tf.layers.dense({
        units: 512,
        activation: "relu"
    }));

    model.add(tf.layers.dense({
        units: 256,
        activation: "relu"
    }));

    model.add(tf.layers.dense({
        units: 128,
        activation: "relu"
    }));

    model.add(tf.layers.dense({
        units: 64,
        activation: "relu"
    }));

    model.add(tf.layers.dense({
        units: 2, // Direction and power
        activation: "linear"
    }));

    model.compile({
        optimizer: tf.train.adam(0.001),
        loss: tf.losses.meanSquaredError
    });

    return model;
}
