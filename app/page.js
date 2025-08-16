"use client"

import { useEffect, useRef } from "react";

export default function Home() {
  const canvasRef = useRef(null);

  // Defines global variables
  const fps = 30;
  let score = 0;
  const boardWidth = 600;
  const boardHeight = 600;
  const gravityStrength = 1;
  let speed = 3;
  let speedupDelay = 10000;
  const birdXPosition = boardWidth / 6;
  let birdYPosition = boardHeight / 2;
  let birdYVelocity = 0;
  const pipeGap = 150;
  const pipeMin = 50;
  const pipeDistance = 250;
  // distance = speed * fps * pipeDelay
  // pipeDelay = distance / (speed * fps)
  let pipeDelay = (pipeDistance / (speed * fps)) * 1000; // Converts to milliseconds
  const pipes = [];
  const groundYPosition = boardHeight - boardHeight / 6;
  const grounds = [];

  useEffect(() => {
    if (canvasRef.current === null) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Defines Images
    const ground = new Image();
    ground.src = "/images/base.png";
    const bird = new Image();
    const pipe = new Image();
    pipe.src = "/images/pipe-green.png";

    // Defines Audio
    const hitAudio = new Audio("/audio/hit.wav");
    const pointAudio = new Audio("/audio/point.wav");
    const wingAudio = new Audio("/audio/wing.wav");

    function createGround() {
      if (grounds.length === 0) {
        for (let i = 0; ground.width * i <= boardWidth; i++) {
          grounds.push(ground.width * i);
        }
      }

      // Checks the current grounds fulfill the board width
      // Gets last ground x position plus ground width and checks if greater or equal to board width
      const groundEnd = grounds[grounds.length - 1] + ground.width;
      if (groundEnd >= boardWidth) return;

      // Creates ground
      grounds.push(groundEnd);
    }

    function createPipe() {
      // Generates the top and bottom pipe heights
      // Using the boardHeight and pipeGap
      let topPipeHeight = Math.max(pipeMin, Math.floor(Math.random() * (boardHeight - pipeGap)));
      const bottomPipeHeight = boardHeight - topPipeHeight - pipeGap;
      // Ensures bottom pipe fulfills pipe min
      const cappedBottomPipeHeight = Math.max(pipeMin + ground.height, bottomPipeHeight);
      
      // Shifts top pipe height if bottom pipe height was capped
      topPipeHeight -= cappedBottomPipeHeight - bottomPipeHeight;

      pipes.push({
        topHeight: topPipeHeight,
        bottomHeight: cappedBottomPipeHeight,
        x: boardWidth,
        passed: false
      });
    }

    function handleFlap(e) {
      // Checks if it isn't a space bar keypress
      if (e.keyCode !== 32) return;

      wingAudio.play();
      birdYVelocity = -12;
    }

    function hasCollided() {
      // Checks collision with pipes
      for (let i = 0; i < pipes.length; i++) {
        const pipeEl = pipes[i];

        // Checks if x and y position are in the same window of each other
        if (
          // Checks the x window
          birdXPosition + bird.width >= pipeEl.x && birdXPosition <= pipeEl.x + pipe.width
          // Checks the y window
          && (birdYPosition <= pipeEl.topHeight || birdYPosition >= boardHeight - pipeEl.bottomHeight) 
        )
          return true;
      }
      
      // Resolve Boundary Collisions
      return birdYPosition <= 0 || birdYPosition + bird.width >= groundYPosition;
    }

    function draw() {
      context.reset();

      // Draw Pipes
      for (let i = 0; i < pipes.length; i++) {
        const pipeEl = pipes[i];

        // Saves context state
        context.save();

        // Flips on y axis (x, y)
        context.scale(1, -1);
        
        // Top Pipe
        context.drawImage(pipe, pipeEl.x, -pipeEl.topHeight);

        // Restores context state
        context.restore()

        // Bottom Pipe
        context.drawImage(pipe, pipeEl.x, boardHeight - pipeEl.bottomHeight);
      }

      // Draws Ground
      for (let i = 0; i < grounds.length; i++) {
        context.drawImage(ground, grounds[i], groundYPosition);
      }

      // Draws Bird
      context.drawImage(bird, birdXPosition, birdYPosition);

      // Draws Score
      context.fillStyle = "#fff";
      context.font = "50px Arial";
      context.fillText(score, 10, 40);
    }

    function game() {
      // Defines create pipe interval
      let createPipInterval = setInterval(createPipe, pipeDelay);

      // Defines interval that increases speed
      const speedupInterval = setInterval(() => {
        // Note: The calculation may be off as the distances grows or it can be due to the load time
        // TODO: Change createPipe from an interval to a condition in the game loop
        // distance = speed * fps * pipeDelay
        // pipeDelay = distance / (speed * fps)
        speed += 0.25;
        speed = Math.min(5, speed);

        pipeDelay = (pipeDistance / (speed * fps)) * 1000; // Converts to milliseconds
        //pipeDelay = Math.max(250, pipeDelay);

        // Refreshed create pipe interval delay
        createPipInterval = setInterval(createPipe, pipeDelay);
        clearInterval(createPipInterval);
      }, speedupDelay);
      
      // Game Loop
      const loop = setInterval(() => {
        // Apply gavity to bird
        birdYVelocity += gravityStrength;
        birdYPosition += birdYVelocity;

        // Changes bird image based of if it is flapping
        // Checks if bird is ascending
        if (birdYVelocity < 0)
          bird.src = "/images/redbird-downflap.png";

        else
          bird.src = "/images/redbird-upflap.png";

        // Updates Pipes
        for (let i = 0; i < pipes.length; i++) {
          // Moves Pipes
          pipes[i].x -= speed;

          // Removes pipe if it has passed the screen
          if (pipes[i].x + pipe.width <= 0)
            pipes.splice(i, 1);

          // Increments score if pipe has passed bird
          if (!pipes[i].passed && pipes[i].x + pipe.width < birdXPosition) {
            pipes[i].passed = true;
            score++;
            pointAudio.play();
          }
        }

        // Updates Grounds
        for (let i = 0; i < grounds.length; i++) {
          // Moves ground
          grounds[i] -= speed;

          // Removes ground once passed screen
          if (grounds[i] + ground.width <= 0) 
            grounds.splice(i, 1);
        }

        // Creates ground
        createGround();

        // Checks if bird has collided
        if (hasCollided()) {
          hitAudio.play();
          clearInterval(loop);
          clearInterval(createPipInterval);
          clearInterval(speedupInterval);
          window.removeEventListener("keypress", handleFlap);
        }
        
        draw();
      }, 1000 / fps);
    }

    // Flappy Button "space"
    window.addEventListener("keypress", handleFlap);

    game();
  }, []);
  
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <canvas 
        ref={canvasRef}
        width={boardWidth} 
        height={boardHeight} 
        style={{ backgroundImage: "url(/images/background-day.png)" }} 
      />
    </div>
  );
}
