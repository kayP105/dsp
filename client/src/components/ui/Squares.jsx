import React, { useRef, useEffect } from 'react';
import './Squares.css';


const Squares = ({
  direction = 'right',
  speed = 0.5, // Slowed it down a bit for a calmer effect
  borderColor = '#e5dbff', // A light purple to match your theme
  squareSize = 40,
  hoverFillColor = '#d0bfff', // A slightly darker purple on hover
  className = ''
}) => {
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const gridOffset = useRef({ x: 0, y: 0 });
  const hoveredSquare = useRef(null);


  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;


    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();


    const drawGrid = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);


      for (let x = -gridOffset.current.x; x < canvas.width; x += squareSize) {
        for (let y = -gridOffset.current.y; y < canvas.height; y += squareSize) {
          ctx.strokeStyle = borderColor;
          ctx.strokeRect(x, y, squareSize, squareSize);
        }
      }
     
      if (hoveredSquare.current) {
        ctx.fillStyle = hoverFillColor;
        const hx = hoveredSquare.current.x * squareSize - gridOffset.current.x;
        const hy = hoveredSquare.current.y * squareSize - gridOffset.current.y;
        ctx.fillRect(hx, hy, squareSize, squareSize);
      }
    };


    const updateAnimation = () => {
      const effectiveSpeed = Math.max(speed, 0.1);
      switch (direction) {
        case 'right': gridOffset.current.x = (gridOffset.current.x + effectiveSpeed) % squareSize; break;
        case 'left': gridOffset.current.x = (gridOffset.current.x - effectiveSpeed + squareSize) % squareSize; break;
        // ... add other directions if needed
        default: break;
      }
      drawGrid();
      animationFrameId = requestAnimationFrame(updateAnimation);
    };
   
    updateAnimation();
   
    // Mouse move logic would go here if needed...


    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [direction, speed, borderColor, hoverFillColor, squareSize]);


  return <canvas ref={canvasRef} className={`squares-canvas ${className}`}></canvas>;
};


export default Squares;