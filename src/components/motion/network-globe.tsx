"use client";

import { useEffect, useRef } from "react";

type Point3D = { x: number; y: number; z: number; px: number; py: number; scale: number };

export function NetworkGlobe({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let angleY = 0;
    let angleX = 0.35;

    const points: Point3D[] = [];
    const count = 72;
    const golden = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < count; i += 1) {
      const y = 1 - (i / (count - 1)) * 2;
      const radius = Math.sqrt(1 - y * y);
      const theta = golden * i;
      points.push({
        x: Math.cos(theta) * radius,
        y,
        z: Math.sin(theta) * radius,
        px: 0,
        py: 0,
        scale: 1,
      });
    }

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = parent.clientWidth * dpr;
      canvas.height = parent.clientHeight * dpr;
      canvas.style.width = `${parent.clientWidth}px`;
      canvas.style.height = `${parent.clientHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const project = (p: Point3D, cx: number, cy: number, r: number) => {
      let x = p.x;
      let y = p.y;
      let z = p.z;

      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const nx = x * cosY + z * sinY;
      const nz = -x * sinY + z * cosY;
      x = nx;
      z = nz;

      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const ny = y * cosX - z * sinX;
      const nz2 = y * sinX + z * cosX;
      y = ny;
      z = nz2;

      const perspective = 2.6 / (2.6 - z);
      p.px = cx + x * r * perspective;
      p.py = cy + y * r * perspective;
      p.scale = perspective;
    };

    const draw = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const cx = w / 2;
      const cy = h / 2;
      const r = Math.min(w, h) * 0.34;

      angleY += 0.003;
      angleX = 0.32 + Math.sin(angleY * 0.5) * 0.08;

      ctx.clearRect(0, 0, w, h);

      for (const p of points) project(p, cx, cy, r);

      for (let i = 0; i < points.length; i += 1) {
        for (let j = i + 1; j < points.length; j += 1) {
          const a = points[i];
          const b = points[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dz = a.z - b.z;
          const dist = dx * dx + dy * dy + dz * dz;
          if (dist > 0.55) continue;
          const alpha = (1 - dist / 0.55) * 0.35 * ((a.scale + b.scale) / 2);
          ctx.strokeStyle = `rgba(255, 107, 74, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.px, a.py);
          ctx.lineTo(b.px, b.py);
          ctx.stroke();
        }
      }

      for (const p of points) {
        const size = 2 + p.scale * 2;
        const glow = ctx.createRadialGradient(p.px, p.py, 0, p.px, p.py, size * 3);
        glow.addColorStop(0, `rgba(255, 107, 74, ${0.35 * p.scale})`);
        glow.addColorStop(1, "rgba(255, 107, 74, 0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.px, p.py, size * 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(99, 102, 241, ${0.5 + p.scale * 0.4})`;
        ctx.beginPath();
        ctx.arc(p.px, p.py, size, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}
