'use client';

import { useEffect, useRef } from 'react';

interface Heart {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  wobble: number;
  wobbleSpeed: number;
}

export default function FloatingHeartsBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let hearts: Heart[] = [];
    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initHearts();
    };

    const initHearts = () => {
      const heartCount = Math.floor((width * height) / 25000); // Density based on screen size
      hearts = [];
      for (let i = 0; i < heartCount; i++) {
        hearts.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 15 + 5, // Size between 5 and 20
          speed: Math.random() * 0.5 + 0.2, // Slow upward speed
          opacity: Math.random() * 0.3 + 0.1, // Low opacity for subtlety
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: Math.random() * 0.02 + 0.01,
        });
      }
    };

    const drawHeart = (x: number, y: number, size: number, opacity: number) => {
      ctx.globalAlpha = opacity;
      ctx.fillStyle = '#FFB6C1'; // Brand pink color
      
      ctx.beginPath();
      const topCurveHeight = size * 0.3;
      ctx.moveTo(x, y + topCurveHeight);
      // top left curve
      ctx.bezierCurveTo(
        x, y, 
        x - size / 2, y, 
        x - size / 2, y + topCurveHeight
      );
      // bottom left curve
      ctx.bezierCurveTo(
        x - size / 2, y + (size + topCurveHeight) / 2, 
        x, y + (size + topCurveHeight) / 2, 
        x, y + size
      );
      // bottom right curve
      ctx.bezierCurveTo(
        x, y + (size + topCurveHeight) / 2, 
        x + size / 2, y + (size + topCurveHeight) / 2, 
        x + size / 2, y + topCurveHeight
      );
      // top right curve
      ctx.bezierCurveTo(
        x + size / 2, y, 
        x, y, 
        x, y + topCurveHeight
      );
      ctx.fill();
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      hearts.forEach(heart => {
        // Update position
        heart.y -= heart.speed;
        heart.wobble += heart.wobbleSpeed;
        const wobbleX = Math.sin(heart.wobble) * 0.5;

        // Reset if out of view
        if (heart.y < -50) {
          heart.y = height + 50;
          heart.x = Math.random() * width;
        }

        drawHeart(heart.x + wobbleX, heart.y, heart.size, heart.opacity);
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[-1] bg-slate-50"
      style={{ opacity: 1 }} // Canvas drawing is transparent, bg is opaque
    />
  );
}
