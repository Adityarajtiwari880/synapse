import React, { useRef, useEffect, useState } from 'react';
import { InkStroke, InkPoint } from '../../types';

interface InkLayerProps {
  strokes: InkStroke[];
  onAddStroke: (stroke: InkStroke) => void;
  onDeleteStroke?: (strokeId: string) => void;
  tool: 'pen' | 'highlighter' | 'eraser' | 'inactive';
  color?: string;
  penWidth?: number;
  target: 'canvas' | 'reader';
  enablePalmRejection?: boolean;
}

export const InkLayer: React.FC<InkLayerProps> = ({
  strokes,
  onAddStroke,
  onDeleteStroke,
  tool,
  color = '#0071e3',
  penWidth = 3,
  target,
  enablePalmRejection = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const currentPointsRef = useRef<InkPoint[]>([]);

  // Repaint all saved strokes whenever strokes change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI (Retina / OLED iPads)
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    }
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    strokes.forEach(stroke => {
      if (stroke.target !== target || stroke.points.length < 2) return;

      ctx.beginPath();
      ctx.strokeStyle = stroke.isHighlighter ? `${stroke.color}66` : stroke.color;
      ctx.lineWidth = stroke.width;

      const pts = stroke.points;
      ctx.moveTo(pts[0].x, pts[0].y);

      for (let i = 1; i < pts.length - 1; i++) {
        const xc = (pts[i].x + pts[i + 1].x) / 2;
        const yc = (pts[i].y + pts[i + 1].y) / 2;
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
      }
      if (pts.length > 1) {
        ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
      }
      ctx.stroke();
    });

    ctx.setTransform(1, 0, 0, 1, 0, 0); // reset scale
  }, [strokes, target]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (tool === 'inactive') return;

    // Palm rejection on tablet
    if (enablePalmRejection && e.pointerType === 'touch' && (e.width > 28 || e.height > 28)) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pressure = e.pressure || 0.5;

    if (tool === 'eraser') {
      // Find and delete stroke near pointer
      if (onDeleteStroke) {
        const hit = strokes.find(s =>
          s.target === target &&
          s.points.some(pt => Math.hypot(pt.x - x, pt.y - y) < 20)
        );
        if (hit) onDeleteStroke(hit.id);
      }
      return;
    }

    isDrawingRef.current = true;
    currentPointsRef.current = [{ x, y, pressure }];
    canvas.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawingRef.current || tool === 'inactive') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Support hardware coalesced points for Apple Pencil / stylus low latency
    const nativeEvt = e.nativeEvent as any;
    const events: Array<{ clientX: number; clientY: number; pressure?: number }> = 
      nativeEvt && typeof nativeEvt.getCoalescedEvents === 'function'
        ? nativeEvt.getCoalescedEvents()
        : [e];

    events.forEach(pt => {
      const x = pt.clientX - rect.left;
      const y = pt.clientY - rect.top;
      const pressure = pt.pressure || 0.5;
      currentPointsRef.current.push({ x, y, pressure });
    });

    // Draw live stroke segment
    const pts = currentPointsRef.current;
    if (pts.length >= 2) {
      ctx.save();
      const dpr = window.devicePixelRatio || 1;
      ctx.scale(dpr, dpr);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = tool === 'highlighter' ? `${color}55` : color;
      
      // Scale line width by stylus pressure
      const lastPt = pts[pts.length - 1];
      const dynamicWidth = tool === 'highlighter' ? penWidth * 3 : penWidth * (0.6 + lastPt.pressure! * 0.8);
      ctx.lineWidth = dynamicWidth;

      const p1 = pts[pts.length - 2];
      const p2 = pts[pts.length - 1];
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      ctx.restore();
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    try {
      canvasRef.current?.releasePointerCapture(e.pointerId);
    } catch (_) {}

    if (currentPointsRef.current.length > 1) {
      const newStroke: InkStroke = {
        id: `stroke-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        points: [...currentPointsRef.current],
        color,
        width: tool === 'highlighter' ? penWidth * 3 : penWidth,
        isHighlighter: tool === 'highlighter',
        target
      };
      onAddStroke(newStroke);
    }
    currentPointsRef.current = [];
  };

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`absolute inset-0 w-full h-full ${
        tool !== 'inactive' ? 'pointer-events-auto cursor-crosshair z-30' : 'pointer-events-none z-10'
      }`}
    />
  );
};
