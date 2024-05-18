async function TrainModel(model, xs, ys) {
    const xsTensor = tf.tensor2d(xs);
    const ysTensor = tf.tensor2d(ys);

    await model.fit(xsTensor, ysTensor, {
        epochs: 100, // Reduced epochs for faster training
        batchSize: 32, // Adjusted batch size
        callbacks: {
            onEpochEnd: (epoch, log) => console.log(`Epoch ${epoch}: loss = ${log.loss}`)
        }
    });

    xsTensor.dispose();
    ysTensor.dispose();
}
