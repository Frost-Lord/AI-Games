let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

function generateLevelID() {
    return Math.random().toString(36).substring(2, 8);
}

let balls = [];
const spawnX = canvas.width / 2 - 350;
const spawnY = canvas.height / 2;

if (balls.length === 0) {
    for (let i = 0; i < 100; i++) {
        const ball = new Ball(spawnX, spawnY, 10);
        ball.initializeBrain();
        balls.push(ball);
    }
}

let hole = { x: 700, y: Math.random() * canvas.height, radius: 15 };

let matrixWidth = 20;
let matrixHeight = 20;

let matrix = new Array(matrixHeight).fill(0).map(() => new Array(matrixWidth).fill('#'));

let gameStates = [];
let levelID = generateLevelID();
let currentGameID = levelID;

let generation = 0;
let log = [];

function updateMatrix() {
    matrix.forEach((row, i) => {
        row.forEach((cell, j) => {
            matrix[i][j] = -1;
        });
    });

    balls.forEach(ball => {
        let ballMatrixPos = {
            x: Math.floor(ball.x / (canvas.width / matrixWidth)),
            y: Math.floor(ball.y / (canvas.height / matrixHeight))
        };

        if (ballMatrixPos.x >= 0 && ballMatrixPos.x < matrixWidth && ballMatrixPos.y >= 0 && ballMatrixPos.y < matrixHeight) {
            matrix[ballMatrixPos.y][ballMatrixPos.x] = 0;
        }
    });

    let holeMatrixPos = {
        x: Math.floor(hole.x / (canvas.width / matrixWidth)),
        y: Math.floor(hole.y / (canvas.height / matrixHeight))
    };
    matrix[holeMatrixPos.y][holeMatrixPos.x] = 1;
}

let colors = ["#98e251", "#6cbd37"];

function draw() {
    let cellWidth = canvas.width / matrixWidth;
    let cellHeight = canvas.height / matrixHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < matrixWidth; i++) {
        for (let j = 0; j < matrixHeight; j++) {
            ctx.fillStyle = colors[(i + j) % 2];
            ctx.fillRect(i * cellWidth, j * cellHeight, cellWidth, cellHeight);
        }
    }

    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(hole.x, hole.y, hole.radius, 0, Math.PI * 2, true);
    ctx.fill();

    balls.forEach(ball => {
        ctx.fillStyle = 'blue';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2, true);
        ctx.fill();
    });
}

async function update() {
    for (let ball of balls) {
        await ball.move();
        ball.updatePosition();
    }

    draw();
    updateMatrix();
}

async function nextGeneration() {
    await Evaluation();
    balls = await Selection(balls);
    balls.forEach(ball => ball.resetPosition(spawnX, spawnY));
    logGeneration();
    generation++;
}

function logGeneration() {
    const topBalls = balls.slice(0, 20).map(ball => ({
        x: ball.x,
        y: ball.y,
        points: ball.points,
        mutations: ball.mutations
    }));

    const mutatedBalls = balls.slice(20).map(ball => ({
        x: ball.x,
        y: ball.y,
        points: ball.points,
        mutations: ball.mutations
    }));

    log.push({
        generation: generation,
        topBalls: topBalls,
        mutatedBalls: mutatedBalls
    });

    console.log('--------------------------------------');
    console.log(`Generation ${generation}`, log[log.length - 1]);
    console.log('--------------------------------------');
    hole = { x: 700, y: Math.random() * canvas.height, radius: 15 };
}

tf.setBackend('webgl').then(() => {
    setInterval(update, 1000 / 60);
    setInterval(nextGeneration, 5000);
});
