"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

// Warm, non-red pieces only — brass, stamp-blue, and the three
// brighter practice-type hues. Kept as plain hex here rather than
// reading CSS custom properties at runtime: canvas needs resolved
// colors, and this transient effect doesn't need light/dark-specific
// tuning to read well against either ground.
const CONFETTI_COLORS = [
  "#b8863b", // brass
  "#4a5a8c", // stamp-blue (accent)
  "#f2c36c", // act
  "#5b62a6", // sit
  "#6fa8d0", // notice
];

const PIECE_COUNT = 1000;
const DURATION_MS = 2200;
const GRAVITY = 0.32;
const DRAG = 0.992;

type Piece = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
  color: string;
  elongated: boolean;
};

type ConfettiBurstProps = {
  originX: number;
  originY: number;
  onFinished: () => void;
};

export function ConfettiBurst({
  originX,
  originY,
  onFinished,
}: ConfettiBurstProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) {
      onFinished();
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const pieces: Piece[] = Array.from({ length: PIECE_COUNT }).map(() => {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 7 + 4;

      return {
        x: originX + (Math.random() - 0.5) * 60,
        y: originY,
        vx: Math.cos(angle) * speed * 0.6,
        vy: -Math.abs(Math.sin(angle) * speed) - 3,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 14,
        size: Math.random() * 6 + 5,
        color:
          CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        elongated: Math.random() > 0.5,
      };
    });

    let start: number | null = null;
    let raf = 0;

    const tick = (now: number) => {
      if (start === null) start = now;
      const elapsed = now - start;

      ctx.clearRect(0, 0, width, height);

      for (const piece of pieces) {
        piece.vy += GRAVITY;
        piece.vx *= DRAG;
        piece.x += piece.vx;
        piece.y += piece.vy;
        piece.rotation += piece.rotationSpeed;

        ctx.save();
        ctx.translate(piece.x, piece.y);
        ctx.rotate((piece.rotation * Math.PI) / 180);
        ctx.fillStyle = piece.color;

        const w = piece.elongated ? piece.size * 0.4 : piece.size;
        const h = piece.elongated ? piece.size * 1.6 : piece.size * 0.6;
        ctx.fillRect(-w / 2, -h / 2, w, h);
        ctx.restore();
      }

      if (elapsed < DURATION_MS) {
        raf = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, width, height);
        onFinished();
      }
    };

    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
    // Runs once for the lifetime of this one-shot burst — origin and the
    // finish callback are captured from the render that mounted it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return createPortal(
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50"
    />,
    document.body
  );
}
