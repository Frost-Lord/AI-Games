async function Evaluation(balls) {
    balls.forEach(ball => {
        const distance = ball.getDistanceToHole();
        const improvement = ball.prevPoints - distance;
        ball.points = distance - improvement * 0.5;
    });

    return await Selection(balls);
}

async function Selection(balls) {
    balls.sort((a, b) => a.points - b.points);

    // Keep the top 20% of balls
    const topBallsCount = Math.floor(balls.length * 0.2);
    const topBalls = balls.slice(0, topBallsCount);

    for (let i = topBallsCount; i < balls.length; i++) {
        const parentBall = topBalls[i % topBallsCount];
        await balls[i].copyBrainFrom(parentBall);
        await Mutate(balls[i]);
    }
    return balls;
}

async function Mutate(ball) {
    const mutationType = Math.random();
    if (mutationType < 0.25) {
        ball.addMutation('new_connection');
    } else if (mutationType < 0.5) {
        ball.addMutation('new_node');
    } else if (mutationType < 0.75) {
        ball.addMutation('weight_modification');
    } else {
        ball.addMutation('weight_randomization');
    }

    // Apply mutations to the brain
    await ball.applyMutations();
}
