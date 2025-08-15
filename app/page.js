"use client"

import { useEffect, useRef } from "react";

export default function Home() {
  const canvasRef = useRef(null);

  // Defines global variables
  let score = 0;
  const boardWidth = 600;
  const boardHeight = 600;
  const gravityStrength = 1;
  const birdXPosition = boardWidth / 6;
  let birdYPosition = boardHeight / 2;
  let birdYVelocity = 0;
  const birdSize = 50;
  const pipeWidth = 50;
  const pipeGap = 200;
  const pipeDelay = 3000;
  const pipes = [];

  useEffect(() => {
    if (canvasRef.current === null) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    function createPipe() {
      // Generates the top and bottom pipe heights
      // Using the boardHeight and pipeGap
      const topPipeHeight = Math.floor(Math.random() * (boardHeight - pipeGap));
      const bottomPipeHeight = boardHeight - topPipeHeight - pipeGap;

      pipes.push({
        topHeight: topPipeHeight,
        bottomHeight: bottomPipeHeight,
        x: boardWidth,
        passed: false
      });
    }

    function hasCollided() {
      // Checks collision with pipes
      for (let i = 0; i < pipes.length; i++) {
        const pipe = pipes[i];

        // Checks if x and y position are in the same window of each other
        if (
          // Checks the x window
          birdXPosition + birdSize >= pipe.x && birdXPosition <= pipe.x + pipeWidth
          // Checks the y window
          && (birdYPosition <= pipe.topHeight || birdYPosition >= boardHeight - pipe.bottomHeight) 
        )
          return true;
      }
      
      // Resolve Boundary Collisions
      return birdYPosition <= 0 || birdYPosition + birdSize >= boardHeight;
    }

    function draw() {
      context.reset();

      // Draws Bird
      context.fillRect(birdXPosition, birdYPosition, birdSize, birdSize);

      // Draw Pipes
      for (let i = 0; i < pipes.length; i++) {
        const pipe = pipes[i];
        context.fillStyle = "green";
        
        // Top Pipe
        context.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);

        // Bottom Pipe
        context.fillRect(pipe.x, boardHeight - pipe.bottomHeight, pipeWidth, pipe.bottomHeight);
      }
    }

    function game() {
      const createPipInterval = setInterval(createPipe, pipeDelay);
      
      // Game Loop
      const loop = setInterval(() => {
        // Apply gavity to bird
        birdYVelocity += gravityStrength;
        birdYPosition += birdYVelocity;

        // Updates Pipes
        for (let i = 0; i < pipes.length; i++) {
          // Moves Pipes
          pipes[i].x -= 3;

          // Removes pipe if it has passed the screen
          if (pipes[i].x + pipeWidth <= 0)
            pipes.splice(i, 1);

          // Increments score if pipe has passed bird
          if (!pipes[i].passed && pipes[i].x + pipeWidth < birdXPosition) {
            pipes[i].passed = true;
            score++;
          }
        }

        // Checks if bird has collided
        if (hasCollided()) {
          clearInterval(loop);
          clearInterval(createPipInterval);
        }
        
        draw();
      }, 1000 / 30); // 30 fps
    }

    // Flappy Button "space"
    window.addEventListener("keypress", (e) => {
      // Checks if it isn't a space bar keypress
      if (e.keyCode !== 32) return;

      birdYVelocity = -12;
    });

    game();
  }, []);
  
  return <canvas ref={canvasRef} width={boardWidth} height={boardHeight} style={{ backgroundColor: "blue" }} />;
}
