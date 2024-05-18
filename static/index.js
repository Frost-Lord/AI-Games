const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function generateLevelID() {
    return Math.random().toString(36).substring(2, 8);
}

let balls = [];
const spawnX = canvas.width / 2 - 350;
const spawnY = canvas.height / 2;

if (balls.length === 0) {
    for (let i = 0; i < 50; i++) {
        const ball = new Ball(spawnX, spawnY, 10);
        ball.initializeBrain();
        balls.push(ball);
    }
}

let hole = { x: Math.random() * canvas.width, y: Math.random() * canvas.height, radius: 15 };

const matrixWidth = 20;
const matrixHeight = 20;

let matrix = Array.from({ length: matrixHeight }, () => Array(matrixWidth).fill('#'));

const gameStates = [];
const levelID = generateLevelID();
let currentGameID = levelID;

let generation = 0;
const log = [];

const colors = ["#98e251", "#6cbd37"];

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cellWidth = canvas.width / matrixWidth;
    const cellHeight = canvas.height / matrixHeight;
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

    ctx.fillStyle = 'blue';
    balls.forEach(ball => {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2, true);
        ctx.fill();
    });

    displayTopBalls();
    updateGenerationNumber();
}

function displayTopBalls() {
    const topBallsContainer = document.getElementById('top-balls');
    topBallsContainer.innerHTML = '';

    balls.slice(0, 5).forEach((ball, index) => {
        const ballInfo = document.createElement('div');
        ballInfo.classList.add('ball-info');
        ballInfo.innerHTML = `
            <div>Rank: ${index + 1}</div>
            <div>UUID: ${ball.UUID}</div>
            <div>Position: (${ball.x.toFixed(2)}, ${ball.y.toFixed(2)})</div>
            <div>Points: ${parseFloat(ball.points).toFixed(2)}</div>
        `;
        topBallsContainer.appendChild(ballInfo);
    });
}

function updateGenerationNumber() {
    const generationNumberElement = document.getElementById('generation-number');
    generationNumberElement.textContent = generation;
}

async function update() {
    let ballsMoved = false;

    for (const ball of balls) {
        await ball.move();
        ball.updatePosition();
        if (ball.vx !== 0 || ball.vy !== 0) {
            ballsMoved = true;
        }
    }

    if (ballsMoved) {
        draw();
    }
    requestAnimationFrame(update);
}

async function nextGeneration() {
    balls = await Evaluation(balls);
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
    hole = { x: Math.random() * canvas.width, y: Math.random() * canvas.height, radius: 15 };

}

tf.setBackend('webgl').then(() => {
    requestAnimationFrame(update);
    setInterval(nextGeneration, 5000);
});
