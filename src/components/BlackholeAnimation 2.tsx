'use client';

import { useEffect, useRef } from 'react';

interface BlackholeAnimationProps {
  isVisible: boolean;
}

export default function BlackholeAnimation({ isVisible }: BlackholeAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!isVisible || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const container = canvas.parentElement;
    if (!container) return;

    const h = container.offsetHeight;
    const w = container.offsetWidth;
    const cw = w;
    const ch = h;
    const maxorbit = 450;
    const centery = ch / 2;
    const centerx = cw / 2;

    const startTime = new Date().getTime();
    let currentTime = 0;

    const stars: Star[] = [];

    canvas.width = cw;
    canvas.height = ch;
    const context = canvas.getContext("2d");
    if (!context) return;

    function setDPI(canvas: HTMLCanvasElement, dpi: number) {
      if (!canvas.style.width)
        canvas.style.width = canvas.width + 'px';
      if (!canvas.style.height)
        canvas.style.height = canvas.height + 'px';

      const scaleFactor = dpi / 96;
      canvas.width = Math.ceil(canvas.width * scaleFactor);
      canvas.height = Math.ceil(canvas.height * scaleFactor);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(scaleFactor, scaleFactor);
      }
    }

    function rotate(cx: number, cy: number, x: number, y: number, angle: number) {
      const radians = angle;
      const cos = Math.cos(radians);
      const sin = Math.sin(radians);
      const nx = (cos * (x - cx)) + (sin * (y - cy)) + cx;
      const ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
      return [nx, ny];
    }

    setDPI(canvas, 192);

    class Star {
      orbital: number;
      x: number;
      y: number;
      yOrigin: number;
      speed: number;
      rotation: number;
      startRotation: number;
      color: string;
      prevR: number;
      prevX: number;
      prevY: number;

      constructor() {
        const rands = [];
        rands.push(Math.random() * (maxorbit / 2) + 1);
        rands.push(Math.random() * (maxorbit / 2) + maxorbit);

        this.orbital = (rands.reduce((p, c) => p + c, 0) / rands.length);

        this.x = centerx;
        this.y = centery + this.orbital;
        this.yOrigin = centery + this.orbital;

        this.speed = (Math.floor(Math.random() * 0.8) + 0.2) * Math.PI / 180;
        this.rotation = 0;
        this.startRotation = (Math.floor(Math.random() * 360) + 1) * Math.PI / 180;

        this.color = 'rgba(255,255,255,' + (1 - ((this.orbital) / 450)) + ')';

        this.prevR = this.startRotation;
        this.prevX = this.x;
        this.prevY = this.y;

        stars.push(this);
      }

      draw(context: CanvasRenderingContext2D) {
        this.rotation = this.startRotation + (currentTime * this.speed);

        if (this.y > this.yOrigin) {
          this.y -= 2.5;
        }
        if (this.y < this.yOrigin - 4) {
          this.y += (this.yOrigin - this.y) / 10;
        }

        context.save();
        context.fillStyle = this.color;
        context.strokeStyle = this.color;
        context.beginPath();
        const oldPos = rotate(centerx, centery, this.prevX, this.prevY, -this.prevR);
        context.moveTo(oldPos[0], oldPos[1]);
        context.translate(centerx, centery);
        context.rotate(this.rotation);
        context.translate(-centerx, -centery);
        context.lineTo(this.x, this.y);
        context.stroke();
        context.restore();

        this.prevR = this.rotation;
        this.prevX = this.x;
        this.prevY = this.y;
      }
    }

    function loop() {
      if (!context) return;
      
      const now = new Date().getTime();
      currentTime = (now - startTime) / 50;

      context.fillStyle = 'rgba(10,10,10,0.15)';
      context.fillRect(0, 0, cw, ch);

      for (let i = 0; i < stars.length; i++) {
        if (stars[i] !== undefined) {
          stars[i].draw(context);
        }
      }

      animationRef.current = requestAnimationFrame(loop);
    }

    function init() {
      if (!context) return;
      
      context.fillStyle = 'rgba(10,10,10,1)';
      context.fillRect(0, 0, cw, ch);
      for (let i = 0; i < 3000; i++) {
        new Star();
      }
      loop();
    }

    init();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isVisible]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute z-1 w-full h-full"
      style={{ margin: 'auto' }}
    />
  );
}
