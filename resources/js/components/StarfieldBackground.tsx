import React, { useEffect, useRef } from 'react';

const StarfieldBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    // Resize canvas
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    // Star properties
    const stars: { x: number; y: number; size: number; velocity: number; opacity: number }[] = [];
    const numStars = 200;

    for (let i = 0; i < numStars; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2,
            velocity: Math.random() * 0.5 + 0.1,
            opacity: Math.random()
        });
    }

    const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#0a0a0a'; // Deep space black
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        stars.forEach(star => {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
            ctx.fill();

            // Update position
            star.y += star.velocity;
            
            // Subtle twinkling
            star.opacity += (Math.random() - 0.5) * 0.05;
            if (star.opacity < 0.1) star.opacity = 0.1;
            if (star.opacity > 0.8) star.opacity = 0.8;

            // Loop stars
            if (star.y > canvas.height) {
                star.y = -star.size;
                star.x = Math.random() * canvas.width;
            }
        });

        animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
        window.removeEventListener('resize', resize);
        cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
    />
  );
};

export default StarfieldBackground;
