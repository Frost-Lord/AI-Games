const express = require("express");
const app = express();
const path = require("path");
const tf = require('@tensorflow/tfjs-node-gpu');
const bodyParser = require("body-parser");

app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json({ limit: '500mb' }));
app.use(bodyParser.urlencoded({ limit: '500mb', extended: true }));
app.use(express.static(path.join(__dirname, "/static")));
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.get('/', (req, res) => {
    res.render("index", {
        title: "Home",
    });
});

app.post('/train', async (req, res) => {
    let games = req.body.games;

    const model = await constructModel();
    await trainOnGames(model, games);
    await model.save('file://./model');
    res.json({ status: 'Training completed' });
});

app.post('/predict', async (req, res) => {
    let state = req.body.state;
    let model = await tf.loadLayersModel('file://./model/model.json');

    const inputTensor = tf.tensor(state);
    let prediction = model.predict(inputTensor.expandDims(0));
    prediction = prediction.arraySync()[0];

    let angle = prediction[0];
    let power = prediction[1];
    let points = prediction[2];
    
    console.log(`Predicted angle: ${angle}, predicted power: ${power}, predicted points: ${points}`);    
    let direction = { x: Math.cos(angle) * power * 0.2, y: Math.sin(angle) * power * 0.2 };

    res.json({ move: direction, points: points });
});


app.listen(8080, function () {
    console.log("Listening on port 8080");
});

async function constructModel() {
    const model = tf.sequential();

    model.add(
        tf.layers.dense({
            inputShape: [400],
            units: 256,
            activation: "relu"
        })
    );

    model.add(
        tf.layers.dense({
            units: 256,
            activation: "relu"
        })
    );

    model.add(
        tf.layers.dense({
            units: 3,
            activation: "linear"
        })
    );

    model.compile({
        optimizer: tf.train.adam(0.001),
        loss: tf.losses.meanSquaredError
    });

    return model;
}


async function trainOnGames(model, games) {
    let xs = [];
    let ys = [];

    let matrixWidth = 20;
    let matrixHeight = 20;
    games.forEach(game => {
        game.moves.forEach(move => {
            let matrix2D = [...Array(matrixHeight)].map((_, i) => move.matrix.slice(i*matrixWidth, i*matrixWidth + matrixWidth).map(cell => Number(cell)));
            xs.push(matrix2D.flat());
            ys.push([move.power, move.degree, move.points]);
        });
    });

    const xsTensor = tf.tensor(xs);
    const ysTensor = tf.tensor(ys);

    await model.fit(xsTensor, ysTensor, {
        epochs: 500,
        batchSize: 62,
        callbacks: {
            onEpochEnd: (epoch, log) => console.log(`Epoch ${epoch}: loss = ${log.loss}`)
        }
    });
}

