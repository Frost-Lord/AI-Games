document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("gameCanvas");
  const car = document.querySelector(".car");
  const ctx = canvas.getContext("2d");

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const objects = [
    { x: 300, y: 200, width: 100, height: 100 },
    { x: 500, y: 400, width: 150, height: 150 },
  ];

  function getLineLength(startX, startY, angle, maxLength) {
    for (let length = 0; length <= maxLength; length++) {
      const endX = startX + length * Math.cos((angle * Math.PI) / 180);
      const endY = startY + length * Math.sin((angle * Math.PI) / 180);

      for (const obj of objects) {
        if (
          endX >= obj.x &&
          endX <= obj.x + obj.width &&
          endY >= obj.y &&
          endY <= obj.y + obj.height
        ) {
          return length;
        }
      }
    }
    return maxLength;
  }

  function drawLine(startX, startY, angle, maxLength) {
    const length = getLineLength(startX, startY, angle, maxLength);
    const endX = startX + length * Math.cos((angle * Math.PI) / 180);
    const endY = startY + length * Math.sin((angle * Math.PI) / 180);

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.stroke();

    console.log(`line: a:${startX}, b:${startY}, c:${length}`);
  }

  function drawObjects() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const obj of objects) {
      ctx.fillStyle = "gray";
      ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
    }
  }

  function updateCarPosition(e) {
    if (car) {
      car.style.left = `${e.clientX - car.offsetWidth / 2}px`;
      car.style.top = `${e.clientY - car.offsetHeight / 2}px`;
      const carRect = car.getBoundingClientRect();
      const carFrontX = carRect.left + carRect.width / 2;
      const carFrontY = carRect.top;

      drawObjects();
      drawLine(carFrontX+20, carFrontY + 20, -115, 100);
      drawLine(carFrontX+20, carFrontY + 20, -90, 95);
      drawLine(carFrontX+20, carFrontY + 20, -65, 100);
    }
  }

  window.addEventListener("mousemove", updateCarPosition);
});
