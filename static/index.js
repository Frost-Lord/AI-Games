let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

function generateLevelID() {
    return Math.random().toString(36).substring(2, 8);
}

let ball = { x: Math.random() * canvas.width, y: Math.random() * canvas.height, radius: 10 };
let hole = { x: Math.random() * canvas.width, y: Math.random() * canvas.height, radius: 15 };

let matrixWidth = 20;
let matrixHeight = 20;
let trail = [];

let matrix = new Array(matrixHeight).fill(0).map(() => new Array(matrixWidth).fill('#'));


let gameStates = [];
let levelID = generateLevelID();
let currentGameID = levelID;

function updateMatrix() {

    matrix.forEach((row, i) => {
        row.forEach((cell, j) => {
            matrix[i][j] = -1;
        });
    });

    // Set ball position
    let ballMatrixPos = {
        x: Math.floor(ball.x / (canvas.width / matrixWidth)),
        y: Math.floor(ball.y / (canvas.height / matrixHeight))
    };

    // Check if the ball matrix position is within the valid range
    if (ballMatrixPos.x >= 0 && ballMatrixPos.x < matrixWidth && ballMatrixPos.y >= 0 && ballMatrixPos.y < matrixHeight) {
        matrix[ballMatrixPos.y][ballMatrixPos.x] = 0;
    }

    // Set hole position
    let holeMatrixPos = {
        x: Math.floor(hole.x / (canvas.width / matrixWidth)),
        y: Math.floor(hole.y / (canvas.height / matrixHeight))
    };
    matrix[holeMatrixPos.y][holeMatrixPos.x] = 1;
}


function printMatrix() {
    console.log(matrix.map(row => row.join(' ')).join('\n'));
}

let power = 0;
let angle = 0;
let dragging = false;
let direction = { x: 0, y: 0 };

canvas.addEventListener("mousedown", (e) => {
    let rect = canvas.getBoundingClientRect();
    let mouseX = e.clientX - rect.left;
    let mouseY = e.clientY - rect.top;
    if (Math.hypot(ball.x - mouseX, ball.y - mouseY) < ball.radius) {
        dragging = true;
    }
});

canvas.addEventListener("mousemove", (e) => {
    if (dragging) {
        let rect = canvas.getBoundingClientRect();
        let mouseX = e.clientX - rect.left;
        let mouseY = e.clientY - rect.top;
        angle = Math.atan2(ball.y - mouseY, ball.x - mouseX);
        power = Math.min(100, Math.hypot(ball.x - mouseX, ball.y - mouseY));
    }
});

canvas.addEventListener("mouseup", () => {
    if (dragging) {
        direction = { x: Math.cos(angle) * power * 0.2, y: Math.sin(angle) * power * 0.2 };
        dragging = false;

        const gameState = gameStates.find(state => state.gameID === currentGameID);

        if (gameState) {
            gameState.moves.push({
                degree: angle,
                power: power,
                direction: { ...direction },
                ball: { ...ball },
                matrix: matrix.flat(),
                points: calculatePoints(ball, hole, power)
            });
        } else {
            gameStates.push({
                gameID: currentGameID,
                hole: { ...hole },
                moves: [{
                    degree: angle,
                    power: power,
                    direction: { ...direction },
                    ball: { ...ball },
                    matrix: matrix.flat(),
                    points: calculatePoints(ball, hole, power)
                }]
            });
        }        

        gameStates.forEach(state => {
            state.gameID = currentGameID;
        });

        console.log(gameStates)
    }
});

function calculatePoints(ball, hole, power) {
    const distanceToHole = Math.hypot(hole.x - ball.x, hole.y - ball.y);
    const normalizedDistance = distanceToHole / Math.sqrt(canvas.width**2 + canvas.height**2);
    const normalizedPower = power / 100;
    return Math.round((1 - normalizedDistance) * 1000 + normalizedPower * 500);
}


let cellWidth = canvas.width / matrixWidth;
let cellHeight = canvas.height / matrixHeight;

let colors = ["#98e251", "#6cbd37"];

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw checkered background
    for (let i = 0; i < matrixWidth; i++) {
        for (let j = 0; j < matrixHeight; j++) {
            ctx.fillStyle = colors[(i + j) % 2];
            ctx.fillRect(i * cellWidth, j * cellHeight, cellWidth, cellHeight);
        }
    }

    // Draw the trail behind the ball
    ctx.strokeStyle = 'lightblue';
    ctx.lineWidth = 3;
    ctx.beginPath();
    trail.forEach((position, index) => {
        if (index === 0) {
            ctx.moveTo(position.x, position.y);
        } else {
            ctx.lineTo(position.x, position.y);
        }
    });
    ctx.stroke();

    // Draw hole
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(hole.x, hole.y, hole.radius, 0, Math.PI * 2, true);
    ctx.fill();

    // Draw ball
    ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2, true);
    ctx.fill();

    if (dragging) {
        let redComponent = Math.floor((power / 100) * 255);
        ctx.strokeStyle = `rgb(${redComponent}, ${255 - redComponent}, ${255 - redComponent})`;

        // Draw direction line
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(ball.x + Math.cos(angle) * ball.radius, ball.y + Math.sin(angle) * ball.radius);
        ctx.lineTo(ball.x + Math.cos(angle) * (ball.radius + power), ball.y + Math.sin(angle) * (ball.radius + power));
        ctx.stroke();
    }
}

let targetX = ball.x;
let targetY = ball.y;
let animationStep = 0;

function update() {
    trail.push({ x: ball.x, y: ball.y });

    if (trail.length > 20) {
        trail.shift();
    }
    if (!dragging) {
        if (animationStep > 0) {
            ball.x += (targetX - ball.x) / animationStep;
            ball.y += (targetY - ball.y) / animationStep;
            animationStep--;
        } else {
            ball.x += direction.x;
            ball.y += direction.y;
            direction.x *= 0.98; // Friction
            direction.y *= 0.98;

            if (ball.x < ball.radius || ball.x > canvas.width - ball.radius) direction.x = -direction.x;
            if (ball.y < ball.radius || ball.y > canvas.height - ball.radius) direction.y = -direction.y;
        }
    }

    if (isBallInHole(ball, hole) && Math.hypot(direction.x, direction.y) < 0.5) {
        alert("You have won!");

        levelID = generateLevelID();

        ball = { x: Math.random() * canvas.width, y: Math.random() * canvas.height, radius: 10 };
        hole = { x: Math.random() * canvas.width, y: Math.random() * canvas.height, radius: 15 };
        direction = { x: 0, y: 0 };

        currentGameID = levelID;
    }

    draw();
    updateMatrix();
    //printMatrix();
}

function isBallInHole(ball, hole) {
    const ballTop = ball.y - ball.radius;
    const ballBottom = ball.y + ball.radius;
    const ballLeft = ball.x - ball.radius;
    const ballRight = ball.x + ball.radius;

    const holeTop = hole.y - hole.radius;
    const holeBottom = hole.y + hole.radius;
    const holeLeft = hole.x - hole.radius;
    const holeRight = hole.x + hole.radius;

    return ballTop >= holeTop && ballBottom <= holeBottom && ballLeft >= holeLeft && ballRight <= holeRight;
}


document.getElementById("train").addEventListener("click", async () => {
    const trainingBlock = document.getElementById("training-modal");
    trainingBlock.classList.add("active");
  
    let response = await axios.post('/train', { games: gameStates });

    trainingBlock.classList.remove("active");
});  

document.getElementById("evaluate").addEventListener("click", async () => {
    let currentState = matrix.flat();

    let response = await axios.post('/predict', { state: currentState });
    direction = response.data.move;
});

setInterval(update, 1000 / 60);
