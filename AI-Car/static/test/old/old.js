const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let nodes = [];
const maxOverlap = 3;
const nodeRadius = 20;

function setup() {
  canvas.width = 1200;
  canvas.height = 800;

  ctx.fillStyle = "#259b5a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  createRandomNodes(10);
}

function loop() {
  ctx.fillStyle = "#259b5a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawNetwork();
}

function createRandomNodes(count) {
  for (let i = 0; i < count; i++) {
    let x, y, overlapCount;
    do {
      x = Math.random() * canvas.width;
      y = Math.random() * canvas.height;
      overlapCount = checkOverlap(x, y);
    } while (overlapCount >= maxOverlap);

    nodes.push({ x: x, y: y });
  }
}

function checkOverlap(x, y) {
  let count = 0;
  for (let node of nodes) {
    let dx = node.x - x;
    let dy = node.y - y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < nodeRadius * 2) {
      count++;
    }
  }
  return count;
}

function drawNetwork() {
  for (let i = 0; i < nodes.length; i++) {
    let node = nodes[i];

    if (i > 0) {
      let prevNode = nodes[i - 1];
      connectNodes(prevNode, node);
    }
  }

  if (nodes.length > 1) {
    connectNodes(nodes[nodes.length - 1], nodes[0]);
  }
}

function connectNodes(node1, node2) {
  // Draw the road background
  ctx.strokeStyle = "#bababa";
  ctx.lineWidth = 20;
  ctx.beginPath();
  ctx.moveTo(node1.x, node1.y);
  ctx.lineTo(node2.x, node2.y);
  ctx.stroke();

  // Draw the white dotted lines
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 10]); // 10px dash, 10px gap
  ctx.beginPath();
  ctx.moveTo(node1.x, node1.y);
  ctx.lineTo(node2.x, node2.y);
  ctx.stroke();
  ctx.setLineDash([]); // Reset line dash
}

setup();
setInterval(loop, 1000 / 60);
