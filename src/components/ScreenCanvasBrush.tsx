import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Pen, Highlighter, ArrowRight, Square, Undo, Trash2, X, Check } from 'lucide-react';

interface ScreenCanvasBrushProps {
  onClose: () => void;
}

type ToolMode = 'pen' | 'highlighter' | 'arrow' | 'rect';

interface DrawAction {
  mode: ToolMode;
  color: string;
  size: number;
  points: Array<{ x: number; y: number }>;
}

export const ScreenCanvasBrush: React.FC<ScreenCanvasBrushProps> = ({ onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tool, setTool] = useState<ToolMode>('pen');
  const [color, setColor] = useState<string>('#EA4335'); // Default Play Store recorder red
  const [size, setSize] = useState<number>(5);
  const [history, setHistory] = useState<DrawAction[]>([]);
  const isDrawing = useRef(false);
  const currentAction = useRef<DrawAction | null>(null);

  const colors = [
    '#EA4335', // Google Red
    '#1A73E8', // Google Blue
    '#34A853', // Google Green
    '#FBBC04', // Google Yellow
    '#9333EA', // Purple
    '#FFFFFF', // White
    '#0F172A', // Black
  ];

  // Resize canvas to full screen
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      redraw();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const renderAction = (action: DrawAction) => {
      if (action.points.length === 0) return;

      ctx.save();
      ctx.strokeStyle = action.color;
      ctx.lineWidth = action.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (action.mode === 'highlighter') {
        ctx.globalAlpha = 0.35;
        ctx.lineWidth = action.size * 3;
      } else {
        ctx.globalAlpha = 1.0;
      }

      if (action.mode === 'pen' || action.mode === 'highlighter') {
        ctx.beginPath();
        ctx.moveTo(action.points[0].x, action.points[0].y);
        for (let i = 1; i < action.points.length; i++) {
          ctx.lineTo(action.points[i].x, action.points[i].y);
        }
        ctx.stroke();
      } else if (action.mode === 'rect') {
        const p1 = action.points[0];
        const p2 = action.points[action.points.length - 1];
        ctx.strokeRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
      } else if (action.mode === 'arrow') {
        const from = action.points[0];
        const to = action.points[action.points.length - 1];
        const headLen = action.size * 3;
        const angle = Math.atan2(to.y - from.y, to.x - from.x);

        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(to.x, to.y);
        ctx.lineTo(
          to.x - headLen * Math.cos(angle - Math.PI / 6),
          to.y - headLen * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          to.x - headLen * Math.cos(angle + Math.PI / 6),
          to.y - headLen * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fillStyle = action.color;
        ctx.fill();
      }

      ctx.restore();
    };

    history.forEach(renderAction);
    if (currentAction.current) {
      renderAction(currentAction.current);
    }
  }, [history]);

  useEffect(() => {
    redraw();
  }, [history, redraw]);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDrawing.current = true;
    const pt = { x: e.clientX, y: e.clientY };
    currentAction.current = {
      mode: tool,
      color,
      size,
      points: [pt],
    };
    redraw();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing.current || !currentAction.current) return;
    const pt = { x: e.clientX, y: e.clientY };
    if (tool === 'pen' || tool === 'highlighter') {
      currentAction.current.points.push(pt);
    } else {
      // Rect or Arrow: just replace endpoint
      if (currentAction.current.points.length === 1) {
        currentAction.current.points.push(pt);
      } else {
        currentAction.current.points[1] = pt;
      }
    }
    redraw();
  };

  const handlePointerUp = () => {
    if (!isDrawing.current || !currentAction.current) return;
    isDrawing.current = false;
    setHistory((prev) => [...prev, currentAction.current!]);
    currentAction.current = null;
  };

  const handleUndo = () => {
    setHistory((prev) => prev.slice(0, prev.length - 1));
  };

  const handleClear = () => {
    setHistory([]);
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto touch-none select-none">
      {/* Drawing canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="w-full h-full cursor-crosshair"
      />

      {/* Floating Brush Tool Palette (Google Stitch style pill card) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-2xl shadow-slate-900/20 rounded-2xl p-2.5 flex flex-wrap items-center gap-2 max-w-[95vw] pointer-events-auto">
        {/* Tool selector */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setTool('pen')}
            className={`p-2 rounded-lg transition-colors ${
              tool === 'pen' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Pen"
          >
            <Pen className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTool('highlighter')}
            className={`p-2 rounded-lg transition-colors ${
              tool === 'highlighter' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Highlighter"
          >
            <Highlighter className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTool('arrow')}
            className={`p-2 rounded-lg transition-colors ${
              tool === 'arrow' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Arrow"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTool('rect')}
            className={`p-2 rounded-lg transition-colors ${
              tool === 'rect' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Rectangle"
          >
            <Square className="w-4 h-4" />
          </button>
        </div>

        {/* Color swatches */}
        <div className="flex items-center gap-1.5 px-1 border-x border-slate-200">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              style={{ backgroundColor: c }}
              className={`w-6 h-6 rounded-full border border-slate-300 transition-transform ${
                color === c ? 'scale-125 ring-2 ring-blue-500 ring-offset-2' : 'hover:scale-110'
              }`}
              title={c}
            />
          ))}
        </div>

        {/* Thickness selector */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {[3, 6, 12].map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`w-7 h-7 flex items-center justify-center rounded-lg ${
                size === s ? 'bg-white shadow-sm' : ''
              }`}
            >
              <div
                style={{ width: `${s + 2}px`, height: `${s + 2}px` }}
                className="rounded-full bg-slate-800"
              />
            </button>
          ))}
        </div>

        {/* Actions: Undo, Clear, Done, Close */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleUndo}
            disabled={history.length === 0}
            className="p-2 text-slate-600 hover:text-slate-900 disabled:opacity-30 rounded-lg hover:bg-slate-100"
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={handleClear}
            disabled={history.length === 0}
            className="p-2 text-rose-600 hover:text-rose-700 disabled:opacity-30 rounded-lg hover:bg-rose-50"
            title="Clear all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 ml-1"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};
