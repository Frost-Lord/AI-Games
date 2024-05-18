async function Evaluation() {
    // Calculate points for each ball based on their distance to the hole
    balls.forEach(ball => {
        ball.points = ball.getDistanceToHole();
    });
}

async function Selection(balls) {
    // Sort balls by their points (ascending order, the less the better)
    balls.sort((a, b) => a.points - b.points);
    // Keep the top 20 balls without mutating
    const topBalls = balls.slice(0, 20);
    // Copy brains of top 20 balls to the rest and mutate
    for (let i = 20; i < balls.length; i++) {
        const parentBall = topBalls[i % 20];
        await balls[i].copyBrainFrom(parentBall);
        await Mutate(balls[i]);
    }
    return balls;
}

async function Mutate(ball) {
    const mutationType = Math.random();
    if (mutationType < 0.33) {
        // New connection
        ball.addMutation('new_connection');
    } else if (mutationType < 0.66) {
        // New node
        ball.addMutation('new_node');
    } else {
        // Weight modification
        ball.addMutation('weight_modification');
    }

    // Apply mutations to the brain
    await ball.applyMutations();
}
