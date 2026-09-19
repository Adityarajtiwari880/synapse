import React, { useEffect, useRef, useState } from 'react';
import {
  Bookmark,
  Sparkles,
  ArrowUpRight,
  CheckCircle,
  Plus,
  Minus,
  Maximize,
  Bot,
  Trash2,
  PenTool,
  Highlighter,
  Eraser,
  FolderPlus,
  Link2,
  Grid,
  RotateCcw,
  Edit3,
  Check,
  X,
  Palette,
  Layers,
  Puzzle,
  LayoutGrid
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { CameraManager } from '../../engine/CameraManager';
import { CanvasNode, GhostNode, CanvasFrame, NodeType, CanvasEdge, CanvasPageDesign } from '../../types';
import { InkLayer } from '../ink/InkLayer';

// 8 Elegant, Eye-Pleasing Card Accent Colors
const CARD_PALETTE = [
  { label: 'Slate Obsidian', value: '#334155' },
  { label: 'Royal Indigo', value: '#6366f1' },
  { label: 'Emerald Forest', value: '#10b981' },
  { label: 'Amber Sun', value: '#f59e0b' },
  { label: 'Crimson Rose', value: '#f43f5e' },
  { label: 'Sky Cyan', value: '#0284c7' },
  { label: 'Violet Orchid', value: '#9333ea' },
  { label: 'Coral Sunset', value: '#ea580c' },
];

// 6 Selectable Canvas Page Designs
const CANVAS_DESIGNS: { id: CanvasPageDesign; label: string; desc: string; icon: string }[] = [
  { id: 'dots', label: 'Dot Grid', desc: 'Infinite spatial dot matrix', icon: '·' },
  { id: 'graph', label: 'Blueprint Graph', desc: 'Technical engineering grid', icon: '#' },
  { id: 'cornell', label: 'Cornell Notes', desc: 'Structured academic ruled layout', icon: '📝' },
  { id: 'minimal', label: 'Minimal Paper', desc: 'Clean distraction-free lines', icon: '📄' },
  { id: 'nebula', label: 'Midnight Nebula', desc: 'Cosmic aura starfield', icon: '🌌' },
  { id: 'sepia', label: 'Sepia Parchment', desc: 'Warm vintage scholar texture', icon: '📜' }
];

export const SpatialCanvas: React.FC = () => {
  const {
    nodes,
    edges,
    frames,
    ghosts,
    ghostLayerActive,
    addNode,
    updateNode,
    updateNodePos,
    updateNodesPos,
    deleteNode,
    addFrame,
    deleteFrame,
    addEdge,
    updateEdge,
    deleteEdge,
    acceptGhost,
    dismissGhost,
    flashAnchorInReader,
    runAgentSynthesis,
    inkStrokes,
    addInkStroke,
    deleteInkStroke,
    undoInkStroke,
    appSettings,
    updateAppSettings
  } = useWorkspace();

  const viewportRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<CameraManager | null>(null);

  // Card Inline Editing State
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editType, setEditType] = useState<NodeType>('claim');

  // Canvas Mode: 'pan' | 'ink'
  const [canvasTool, setCanvasTool] = useState<'pan' | 'pen' | 'highlighter' | 'eraser'>('pan');
  const [inkColor, setInkColor] = useState('#6366f1');
  const [currentZoom, setCurrentZoom] = useState(1.0);

  // Drag State for Nodes, Clusters & Pan
  const isDraggingCanvasRef = useRef(false);
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  const activeDraggingNodeIdRef = useRef<string | null>(null);
  const nodeDragStartPosRef = useRef({ x: 0, y: 0, initialNodeX: 0, initialNodeY: 0 });
  const activeDraggingClusterRef = useRef<{ id: string; initialX: number; initialY: number }[]>([]);

  // Puzzle Snapping State
  const [snappedTargetId, setSnappedTargetId] = useState<string | null>(null);
  const currentSnapTargetRef = useRef<string | null>(null);

  // Card Corner Resize Drag State
  const resizingNodeIdRef = useRef<string | null>(null);
  const resizeStartRef = useRef({ x: 0, y: 0, initialW: 0, initialH: 0 });

  // Card Color Picker Active Node ID
  const [activeColorPickerNodeId, setActiveColorPickerNodeId] = useState<string | null>(null);

  // Canvas Page Design Dropdown
  const [isDesignMenuOpen, setIsDesignMenuOpen] = useState(false);

  // Connection Creation State (Dragging from pin)
  const [linkingSourceId, setLinkingSourceId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const cam = new CameraManager();
    cameraRef.current = cam;

    if (worldRef.current) {
      cam.bind(worldRef.current, camState => {
        setCurrentZoom(camState.zoom);
      });
    }

    return () => {
      cam.unbind();
    };
  }, []);

  // Global key listener for Escape
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveColorPickerNodeId(null);
        setIsDesignMenuOpen(false);
        if (editingNodeId) setEditingNodeId(null);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [editingNodeId]);

  // Compute all connected nodes in a puzzle cluster (BFS)
  const getPuzzleCluster = (startId: string, allNodes: CanvasNode[]): CanvasNode[] => {
    const visited = new Set<string>();
    const queue = [startId];
    const cluster: CanvasNode[] = [];
    const nodeMap = new Map(allNodes.map(n => [n.id, n]));

    while (queue.length > 0) {
      const currId = queue.shift()!;
      if (visited.has(currId)) continue;
      visited.add(currId);
      const node = nodeMap.get(currId);
      if (!node) continue;
      cluster.push(node);
      if (node.puzzleConnections && node.puzzleConnections.length > 0) {
        for (const neighborId of node.puzzleConnections) {
          if (!visited.has(neighborId)) {
            queue.push(neighborId);
          }
        }
      }
    }
    return cluster;
  };

  // Unlink node from its puzzle cluster
  const unlinkNodeFromPuzzle = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    const connectedIds = node.puzzleConnections || [];
    connectedIds.forEach(cId => {
      const other = nodes.find(n => n.id === cId);
      if (other && other.puzzleConnections) {
        const remaining = other.puzzleConnections.filter(id => id !== nodeId);
        updateNode(cId, {
          puzzleConnections: remaining,
          puzzleLocked: remaining.length > 0
        });
      }
    });
    updateNode(nodeId, {
      puzzleLocked: false,
      puzzleConnections: []
    });
  };

  // Manually snap card to nearest card as a puzzle
  const handleManualPuzzleSnap = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    const others = nodes.filter(n => n.id !== nodeId);
    if (others.length === 0) return;

    let closest = others[0];
    let minDist = Infinity;
    for (const o of others) {
      const dist = Math.hypot(o.x - node.x, o.y - node.y);
      if (dist < minDist) {
        minDist = dist;
        closest = o;
      }
    }

    const targetX = closest.x + (closest.width || 336) + 12;
    const targetY = closest.y;
    updateNodePos(nodeId, targetX, targetY);

    updateNode(nodeId, {
      puzzleLocked: true,
      puzzleConnections: Array.from(new Set([...(node.puzzleConnections || []), closest.id]))
    });
    updateNode(closest.id, {
      puzzleLocked: true,
      puzzleConnections: Array.from(new Set([...(closest.puzzleConnections || []), nodeId]))
    });

    if (!edges.some(ed => (ed.source === nodeId && ed.target === closest.id) || (ed.source === closest.id && ed.target === nodeId))) {
      addEdge({
        id: `edge-puzzle-${Date.now()}`,
        source: closest.id,
        target: nodeId,
        relation: 'supports'
      });
    }
  };

  // Card Corner Resize Pointer Down
  const handleResizePointerDown = (e: React.PointerEvent, node: CanvasNode) => {
    e.stopPropagation();
    resizingNodeIdRef.current = node.id;
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialW: node.width || 336,
      initialH: node.height || 220
    };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (canvasTool !== 'pan') return;

    const target = e.target as HTMLElement;
    if (target === viewportRef.current || target === worldRef.current || target.id === 'canvas-svg') {
      isDraggingCanvasRef.current = true;
      dragStartPosRef.current = { x: e.clientX, y: e.clientY };
      setActiveColorPickerNodeId(null);
      setIsDesignMenuOpen(false);
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    // 1. Linking Arrow Preview
    if (linkingSourceId && cameraRef.current && viewportRef.current) {
      const rect = viewportRef.current.getBoundingClientRect();
      const world = cameraRef.current.screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
      setMousePos(world);
    }

    // 2. Canvas Pan
    if (isDraggingCanvasRef.current && cameraRef.current) {
      const dx = e.clientX - dragStartPosRef.current.x;
      const dy = e.clientY - dragStartPosRef.current.y;
      cameraRef.current.panBy(dx, dy);
      dragStartPosRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    // 3. Card Corner Resize
    if (resizingNodeIdRef.current && cameraRef.current) {
      const zoom = cameraRef.current.zoom;
      const dw = (e.clientX - resizeStartRef.current.x) / zoom;
      const dh = (e.clientY - resizeStartRef.current.y) / zoom;
      const newW = Math.max(260, Math.min(680, resizeStartRef.current.initialW + dw));
      const newH = Math.max(140, Math.min(800, resizeStartRef.current.initialH + dh));
      updateNode(resizingNodeIdRef.current, {
        width: Math.round(newW),
        height: Math.round(newH)
      });
      return;
    }

    // 4. Node & Puzzle Cluster Dragging with Magnetic Snapping
    if (activeDraggingNodeIdRef.current && cameraRef.current) {
      const zoom = cameraRef.current.zoom;
      const dx = (e.clientX - nodeDragStartPosRef.current.x) / zoom;
      const dy = (e.clientY - nodeDragStartPosRef.current.y) / zoom;

      const activeNode = nodes.find(n => n.id === activeDraggingNodeIdRef.current);
      if (!activeNode) return;

      const primaryInitial = activeDraggingClusterRef.current.find(c => c.id === activeNode.id);
      const rawX = (primaryInitial?.initialX ?? activeNode.x) + dx;
      const rawY = (primaryInitial?.initialY ?? activeNode.y) + dy;
      const activeW = activeNode.width || 336;
      const activeH = activeNode.height || 220;

      // Magnetic Snapping Detection Against Non-Cluster Nodes
      const clusterIds = new Set(activeDraggingClusterRef.current.map(c => c.id));
      const candidates = nodes.filter(n => !clusterIds.has(n.id));

      let candidateSnapTargetId: string | null = null;
      let snapOffsetX = 0;
      let snapOffsetY = 0;
      const SNAP_DIST = 32;

      for (const other of candidates) {
        const otherW = other.width || 336;
        const otherH = other.height || 220;

        // Snap to Right of other
        if (Math.abs(rawX - (other.x + otherW + 12)) < SNAP_DIST && Math.abs(rawY - other.y) < 45) {
          snapOffsetX = (other.x + otherW + 12) - rawX;
          snapOffsetY = other.y - rawY;
          candidateSnapTargetId = other.id;
          break;
        }
        // Snap to Left of other
        if (Math.abs((rawX + activeW + 12) - other.x) < SNAP_DIST && Math.abs(rawY - other.y) < 45) {
          snapOffsetX = (other.x - activeW - 12) - rawX;
          snapOffsetY = other.y - rawY;
          candidateSnapTargetId = other.id;
          break;
        }
        // Snap Below other
        if (Math.abs(rawY - (other.y + otherH + 12)) < SNAP_DIST && Math.abs(rawX - other.x) < 45) {
          snapOffsetY = (other.y + otherH + 12) - rawY;
          snapOffsetX = other.x - rawX;
          candidateSnapTargetId = other.id;
          break;
        }
        // Snap Above other
        if (Math.abs((rawY + activeH + 12) - other.y) < SNAP_DIST && Math.abs(rawX - other.x) < 45) {
          snapOffsetY = (other.y - activeH - 12) - rawY;
          snapOffsetX = other.x - rawX;
          candidateSnapTargetId = other.id;
          break;
        }
      }

      setSnappedTargetId(candidateSnapTargetId);
      currentSnapTargetRef.current = candidateSnapTargetId;

      const finalDx = dx + snapOffsetX;
      const finalDy = dy + snapOffsetY;

      // Update all nodes in the active puzzle cluster simultaneously
      if (activeDraggingClusterRef.current.length > 1) {
        const updates = activeDraggingClusterRef.current.map(c => ({
          id: c.id,
          x: Math.round(c.initialX + finalDx),
          y: Math.round(c.initialY + finalDy)
        }));
        updateNodesPos(updates);
      } else {
        updateNodePos(
          activeNode.id,
          Math.round((primaryInitial?.initialX ?? activeNode.x) + finalDx),
          Math.round((primaryInitial?.initialY ?? activeNode.y) + finalDy)
        );
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingCanvasRef.current) {
      isDraggingCanvasRef.current = false;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch (_) {}
    }

    // Connect snapped nodes into a puzzle on drop
    const snapTarget = currentSnapTargetRef.current;
    const activeId = activeDraggingNodeIdRef.current;
    if (snapTarget && activeId && snapTarget !== activeId) {
      const activeNode = nodes.find(n => n.id === activeId);
      const targetNode = nodes.find(n => n.id === snapTarget);

      if (activeNode && targetNode) {
        updateNode(activeId, {
          puzzleLocked: true,
          puzzleConnections: Array.from(new Set([...(activeNode.puzzleConnections || []), snapTarget]))
        });
        updateNode(snapTarget, {
          puzzleLocked: true,
          puzzleConnections: Array.from(new Set([...(targetNode.puzzleConnections || []), activeId]))
        });

        if (!edges.some(ed => (ed.source === activeId && ed.target === snapTarget) || (ed.source === snapTarget && ed.target === activeId))) {
          addEdge({
            id: `edge-puzzle-${Date.now()}`,
            source: snapTarget,
            target: activeId,
            relation: 'supports'
          });
        }
      }
    }

    activeDraggingNodeIdRef.current = null;
    activeDraggingClusterRef.current = [];
    currentSnapTargetRef.current = null;
    setSnappedTargetId(null);
    resizingNodeIdRef.current = null;

    if (linkingSourceId) {
      setLinkingSourceId(null);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!cameraRef.current) return;

    if (e.ctrlKey) {
      const factor = 1 - e.deltaY * 0.01;
      cameraRef.current.zoomAt(e.clientX, e.clientY, factor);
    } else {
      cameraRef.current.panBy(-e.deltaX, -e.deltaY);
    }
  };

  // Connect Pin Click / Drop
  const handlePinPointerDown = (e: React.PointerEvent, nodeId: string) => {
    e.stopPropagation();
    setLinkingSourceId(nodeId);
    if (cameraRef.current && viewportRef.current) {
      const rect = viewportRef.current.getBoundingClientRect();
      const world = cameraRef.current.screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
      setMousePos(world);
    }
  };

  const handleNodeDropTarget = (targetId: string) => {
    if (linkingSourceId && linkingSourceId !== targetId) {
      addEdge({
        id: `edge-${Date.now()}`,
        source: linkingSourceId,
        target: targetId,
        relation: 'supports'
      });
      setLinkingSourceId(null);
    }
  };

  const handleStartEdit = (node: CanvasNode, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingNodeId(node.id);
    setEditTitle(node.title);
    setEditContent(node.content);
    setEditType(node.type);
  };

  const handleSaveEdit = (nodeId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    updateNode(nodeId, {
      title: editTitle.trim() || 'Untitled Note',
      content: editContent.trim(),
      type: editType
    });
    setEditingNodeId(null);
  };

  const handleCancelEdit = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingNodeId(null);
  };

  const cycleRelation = (edgeId: string, current: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const relations: CanvasEdge['relation'][] = ['supports', 'contradicts', 'leads_to'];
    const nextIdx = (relations.indexOf(current as any) + 1) % relations.length;
    updateEdge(edgeId, { relation: relations[nextIdx] });
  };

  const createQuickNote = () => {
    if (!cameraRef.current) return;
    const center = cameraRef.current.screenToWorld(window.innerWidth / 3, window.innerHeight / 3);
    addNode({
      type: 'note',
      x: Math.round(center.x),
      y: Math.round(center.y),
      title: 'Synthesis Note',
      content: 'Compare multi-head scaling against selective state space compute complexity.',
      confidence: 1.0,
      verificationState: 'verified',
      origin: 'human',
      anchors: []
    });
  };

  const createGroupFrame = () => {
    if (!cameraRef.current) return;
    const center = cameraRef.current.screenToWorld(window.innerWidth / 3, window.innerHeight / 3);
    addFrame({
      id: `frame-${Date.now()}`,
      title: 'Theme: Attention Mechanisms',
      x: Math.round(center.x - 40),
      y: Math.round(center.y - 40),
      width: 440,
      height: 480,
      color: '#6366f1'
    });
  };

  return (
    <div
      ref={viewportRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
      className={`h-full w-full relative overflow-hidden select-none cursor-default canvas-design-${appSettings.canvasDesign || 'dots'}`}
    >
      {/* Canvas Freehand Ink Layer */}
      <InkLayer
        strokes={inkStrokes}
        onAddStroke={addInkStroke}
        onDeleteStroke={deleteInkStroke}
        tool={canvasTool === 'pan' ? 'inactive' : canvasTool}
        color={inkColor}
        penWidth={canvasTool === 'highlighter' ? 16 : 3}
        target="canvas"
      />

      {/* 60FPS HARDWARE TRANSFORM WORLD */}
      <div ref={worldRef} className="absolute inset-0 origin-top-left will-change-transform">
        {/* GROUP FRAMES (MIRRORING MIRO / APPLE FREEFORM WORKSPACE SECTIONS) */}
        {frames.map(frame => (
          <div
            key={frame.id}
            className="absolute rounded-3xl border border-indigo-500/25 bg-indigo-500/[0.03] backdrop-blur-[1px] p-3 pointer-events-none transition shadow-sm"
            style={{
              left: `${frame.x}px`,
              top: `${frame.y}px`,
              width: `${frame.width}px`,
              height: `${frame.height}px`
            }}
          >
            <div className="flex items-center justify-between text-xs font-semibold text-indigo-300/90 px-1 select-none">
              <span className="flex items-center space-x-1.5">
                <FolderPlus className="w-3.5 h-3.5 text-indigo-400" />
                <span>{frame.title}</span>
              </span>
              <button
                onClick={() => deleteFrame(frame.id)}
                className="pointer-events-auto p-1 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-white/10 transition"
                title="Remove Frame"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}

        {/* SVG BEZIER CONNECTORS */}
        <svg id="canvas-svg" className="absolute inset-0 w-[8000px] h-[8000px] pointer-events-none z-0">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#6366f1" />
            </marker>
          </defs>

          {edges.map(edge => {
            const srcNode = nodes.find(n => n.id === edge.source);
            const tgtNode = nodes.find(n => n.id === edge.target);
            if (!srcNode || !tgtNode) return null;

            // If cards are docked together as a puzzle module, avoid drawing looping redundant arrows
            const isDockedTogether =
              srcNode.puzzleConnections?.includes(tgtNode.id) ||
              tgtNode.puzzleConnections?.includes(srcNode.id);
            if (isDockedTogether) return null;

            const w1 = srcNode.width || 336;
            const h1 = srcNode.height || 180;
            const w2 = tgtNode.width || 336;
            const h2 = tgtNode.height || 180;

            const c1x = srcNode.x + w1 / 2;
            const c1y = srcNode.y + h1 / 2;
            const c2x = tgtNode.x + w2 / 2;
            const c2y = tgtNode.y + h2 / 2;

            const deltaX = c2x - c1x;
            const deltaY = c2y - c1y;

            let x1: number, y1: number, x2: number, y2: number;
            let cp1x: number, cp1y: number, cp2x: number, cp2y: number;

            if (Math.abs(deltaY) > Math.abs(deltaX)) {
              // Primarily Vertical orientation
              if (deltaY > 0) {
                // tgtNode is below srcNode
                x1 = c1x;
                y1 = srcNode.y + h1;
                x2 = c2x;
                y2 = tgtNode.y;
                const curveY = Math.max(20, Math.abs(y2 - y1) * 0.45);
                cp1x = x1;
                cp1y = y1 + curveY;
                cp2x = x2;
                cp2y = y2 - curveY;
              } else {
                // tgtNode is above srcNode
                x1 = c1x;
                y1 = srcNode.y;
                x2 = c2x;
                y2 = tgtNode.y + h2;
                const curveY = Math.max(20, Math.abs(y2 - y1) * 0.45);
                cp1x = x1;
                cp1y = y1 - curveY;
                cp2x = x2;
                cp2y = y2 + curveY;
              }
            } else {
              // Primarily Horizontal orientation
              if (deltaX >= 0) {
                // tgtNode is to the right
                x1 = srcNode.x + w1;
                y1 = c1y;
                x2 = tgtNode.x;
                y2 = c2y;
                const curveX = Math.max(20, Math.abs(x2 - x1) * 0.45);
                cp1x = x1 + curveX;
                cp1y = y1;
                cp2x = x2 - curveX;
                cp2y = y2;
              } else {
                // tgtNode is to the left
                x1 = srcNode.x;
                y1 = c1y;
                x2 = tgtNode.x + w2;
                y2 = c2y;
                const curveX = Math.max(20, Math.abs(x2 - x1) * 0.45);
                cp1x = x1 - curveX;
                cp1y = y1;
                cp2x = x2 + curveX;
                cp2y = y2;
              }
            }

            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;

            const strokeColor =
              edge.relation === 'contradicts'
                ? '#f43f5e'
                : edge.relation === 'leads_to'
                ? '#10b981'
                : '#6366f1';

            const relationLabel =
              edge.relation === 'contradicts'
                ? 'Contradicts'
                : edge.relation === 'leads_to'
                ? 'Leads To'
                : 'Supports';

            const badgeBg =
              edge.relation === 'contradicts'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : edge.relation === 'leads_to'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';

            return (
              <g key={edge.id}>
                <path
                  d={`M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth="2.5"
                  strokeDasharray={edge.relation === 'contradicts' ? '4' : 'none'}
                  markerEnd="url(#arrow)"
                  className="transition-all hover:stroke-width-[3.5px] opacity-85 hover:opacity-100"
                />

                {/* Edge control badge */}
                <foreignObject
                  x={midX - 58}
                  y={midY - 14}
                  width={116}
                  height={28}
                  className="overflow-visible pointer-events-auto select-none"
                >
                  <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full glass-panel border border-white/20 shadow-lg backdrop-blur-md text-[10px] font-semibold w-max mx-auto animate-in zoom-in-95 duration-150">
                    <button
                      onClick={e => cycleRelation(edge.id, edge.relation, e)}
                      className={`px-1.5 py-0.5 rounded border transition ${badgeBg} hover:brightness-125`}
                      title="Click to cycle relationship: Supports / Contradicts / Leads To"
                    >
                      {relationLabel}
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        deleteEdge(edge.id);
                      }}
                      className="p-0.5 text-slate-400 hover:text-rose-400 rounded transition"
                      title="Remove Connection"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </foreignObject>
              </g>
            );
          })}

          {/* Active linking line being dragged */}
          {linkingSourceId && (
            (() => {
              const src = nodes.find(n => n.id === linkingSourceId);
              if (!src) return null;
              const x1 = src.x + (src.width || 336);
              const y1 = src.y + 60;
              return (
                <path
                  d={`M ${x1} ${y1} L ${mousePos.x} ${mousePos.y}`}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeDasharray="4"
                />
              );
            })()
          )}
        </svg>

        {/* SMART NODES (WITH PUZZLE SNAPPING, CARD PALETTE, RESIZE HANDLES) */}
        {nodes.map(node => {
          const isEditing = editingNodeId === node.id;
          const isSnappedTarget = snappedTargetId === node.id;
          const isPuzzleDocked = node.puzzleLocked || (node.puzzleConnections && node.puzzleConnections.length > 0);
          const cardWidth = node.width || 336;
          const isColorPickerOpen = activeColorPickerNodeId === node.id;

          return (
            <div
              key={node.id}
              onDoubleClick={e => !isEditing && handleStartEdit(node, e)}
              onPointerUp={() => handleNodeDropTarget(node.id)}
              onPointerDown={e => {
                if (isEditing) return;
                if (canvasTool === 'pan') {
                  e.stopPropagation();
                  activeDraggingNodeIdRef.current = node.id;
                  nodeDragStartPosRef.current = {
                    x: e.clientX,
                    y: e.clientY,
                    initialNodeX: node.x,
                    initialNodeY: node.y
                  };
                  const cluster = (node.puzzleLocked || (node.puzzleConnections && node.puzzleConnections.length > 0))
                    ? getPuzzleCluster(node.id, nodes)
                    : [node];
                  activeDraggingClusterRef.current = cluster.map(n => ({
                    id: n.id,
                    initialX: n.x,
                    initialY: n.y
                  }));
                }
              }}
              className={`absolute glass-card rounded-2xl p-4 cursor-grab active:cursor-grabbing z-20 select-none animate-in fade-in duration-150 ${
                linkingSourceId === node.id ? 'ring-2 ring-cyan-400' : ''
              } ${isEditing ? 'ring-2 ring-blue-500 shadow-2xl cursor-default' : ''} ${
                isPuzzleDocked ? 'puzzle-docked' : ''
              } ${isSnappedTarget ? 'puzzle-snap-active' : ''}`}
              style={{
                transform: `translate3d(${node.x}px, ${node.y}px, 0)`,
                width: `${cardWidth}px`,
                minHeight: node.height ? `${node.height}px` : undefined,
                borderColor: node.color ? `${node.color}90` : undefined,
                boxShadow: node.color ? `0 10px 30px ${node.color}30` : undefined
              }}
            >
              {/* Colored Top Accent Bar */}
              {node.color && (
                <div
                  className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl pointer-events-none"
                  style={{ backgroundColor: node.color }}
                />
              )}

              {/* Interactive Drag-to-Connect Pin */}
              <div
                onPointerDown={e => handlePinPointerDown(e, node.id)}
                className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-blue-600 hover:bg-cyan-400 border-2 border-white shadow-apple-glow cursor-crosshair flex items-center justify-center transition z-30"
                title="Drag arrow to link cards"
              >
                <Link2 className="w-2.5 h-2.5 text-white" />
              </div>

              {isEditing ? (
                /* INLINE CARD EDITOR */
                <div
                  className="space-y-3 cursor-default"
                  onPointerDown={e => e.stopPropagation()}
                  onKeyDown={e => {
                    if (e.key === 'Escape') {
                      e.stopPropagation();
                      handleCancelEdit();
                    }
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      e.stopPropagation();
                      handleSaveEdit(node.id, e as any);
                    }
                  }}
                >
                  <div className="flex items-center justify-between pb-1 border-b border-white/10">
                    <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">
                      Edit Card
                    </span>
                    <div className="flex items-center space-x-1">
                      {(['claim', 'evidence', 'note', 'question'] as NodeType[]).map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setEditType(t)}
                          className={`px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase transition ${
                            editType === t
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'bg-white/5 text-slate-400 hover:text-white'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <input
                    type="text"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    placeholder="Card title..."
                    className="w-full px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/20 text-xs font-semibold text-white outline-none focus:border-blue-400"
                    autoFocus
                  />

                  <textarea
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    placeholder="Card content or findings..."
                    rows={3}
                    className="w-full p-2.5 rounded-lg bg-black/50 border border-white/20 text-xs text-slate-200 outline-none focus:border-blue-400 resize-none font-sans"
                  />

                  <div className="flex items-center justify-end space-x-2 pt-1">
                    <button
                      onClick={handleCancelEdit}
                      className="px-2.5 py-1 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/10 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={e => handleSaveEdit(node.id, e)}
                      className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-apple-glow flex items-center space-x-1 transition"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Card</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* REGULAR CARD VIEW */
                <>
                  {/* Header with Type, Citations, & Puzzle Dock Controls */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                    <div className="flex items-center space-x-1.5">
                      <span
                        className={`text-[11px] font-semibold tracking-wide uppercase flex items-center ${
                          node.type === 'claim'
                            ? 'text-amber-400'
                            : node.type === 'evidence'
                            ? 'text-emerald-400'
                            : node.type === 'question'
                            ? 'text-rose-400'
                            : 'text-cyan-400'
                        }`}
                      >
                        <Bookmark className="w-3 h-3 mr-1" />
                        {node.type}
                      </span>

                      {/* Puzzle Connection Badge & Lock/Unlink */}
                      {isPuzzleDocked ? (
                        <div
                          className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-semibold"
                          title="Docked in puzzle group! Dragging this moves all connected puzzle cards."
                        >
                          <Puzzle className="w-2.5 h-2.5 text-emerald-400" />
                          <span>Docked ({node.puzzleConnections?.length || 1})</span>
                          <button
                            onClick={e => unlinkNodeFromPuzzle(node.id, e)}
                            className="ml-0.5 hover:text-rose-400 transition"
                            title="Unlink from puzzle cluster"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={e => handleManualPuzzleSnap(node.id, e)}
                          className="px-1.5 py-0.5 rounded text-[9px] bg-white/5 hover:bg-emerald-600/20 text-slate-400 hover:text-emerald-300 border border-white/10 hover:border-emerald-500/30 transition flex items-center space-x-1"
                          title="Snap to nearest card as Puzzle Piece"
                        >
                          <Puzzle className="w-2.5 h-2.5 text-emerald-400" />
                          <span>Snap</span>
                        </button>
                      )}
                    </div>

                    {node.anchors[0] && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          const anchorKey =
                            node.anchors[0]?.quote?.exact ||
                            node.anchors[0]?.docId ||
                            node.title;
                          flashAnchorInReader(anchorKey);
                        }}
                        className="text-xs text-blue-400 hover:text-blue-300 hover:underline flex items-center"
                        title="Jump to cited passage in Document Reader"
                      >
                        <span>Doc, p. {node.anchors[0].pageNumber}</span>
                        <ArrowUpRight className="w-3 h-3 ml-0.5" />
                      </button>
                    )}
                  </div>

                  <h4 className="text-xs font-semibold text-white mb-1.5">{node.title}</h4>

                  {/* VISUAL CROPPED SNIPPET PREVIEW (From PDF Page or Doc) */}
                  {node.imageUrl && (
                    <div className="mb-2 rounded-xl overflow-hidden border border-white/15 bg-black/40 shadow-sm">
                      <img
                        src={node.imageUrl}
                        alt="Cropped excerpt"
                        className="w-full h-auto object-contain max-h-48 select-none pointer-events-none"
                      />
                    </div>
                  )}

                  {/* LOD: show full content if not zoomed way out */}
                  {currentZoom >= 0.35 && (
                    <p className="text-xs text-slate-300 leading-relaxed font-sans line-clamp-4">
                      {node.content}
                    </p>
                  )}

                  {/* Card Bottom Controls: Status, Color Palette, Edit, Delete, Resize */}
                  <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400 relative">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </span>

                    <div className="flex items-center space-x-1.5">
                      {/* Card Color Picker Trigger */}
                      <div className="relative">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setActiveColorPickerNodeId(isColorPickerOpen ? null : node.id);
                          }}
                          className="p-1 hover:text-amber-400 rounded transition"
                          title="Card Accent Color"
                        >
                          <Palette className="w-3 h-3" />
                        </button>

                        {/* Color Picker Flyout Menu */}
                        {isColorPickerOpen && (
                          <div
                            onPointerDown={e => e.stopPropagation()}
                            className="absolute bottom-6 right-0 z-50 p-2 rounded-xl glass-panel border border-white/20 shadow-2xl flex items-center space-x-1.5 animate-in zoom-in-95 duration-100"
                          >
                            {CARD_PALETTE.map(c => (
                              <button
                                key={c.value}
                                onClick={e => {
                                  e.stopPropagation();
                                  updateNode(node.id, { color: c.value });
                                  setActiveColorPickerNodeId(null);
                                }}
                                className="w-4 h-4 rounded-full border border-white/40 hover:scale-125 transition shadow-sm"
                                style={{ backgroundColor: c.value }}
                                title={c.label}
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={e => handleStartEdit(node, e)}
                        className="p-1 hover:text-blue-400 rounded transition"
                        title="Edit Card Title & Text"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>

                      <button
                        onClick={e => {
                          e.stopPropagation();
                          deleteNode(node.id);
                        }}
                        className="p-1 hover:text-rose-400 rounded transition"
                        title="Delete Card"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Bottom-Right Corner Resize Drag Handle */}
                    <div
                      onPointerDown={e => handleResizePointerDown(e, node)}
                      className="absolute -bottom-2 -right-2 w-4 h-4 cursor-nwse-resize text-slate-500 hover:text-blue-400 transition flex items-center justify-center pointer-events-auto"
                      title="Drag to resize card dimensions"
                    >
                      <svg viewBox="0 0 10 10" className="w-2.5 h-2.5 fill-current">
                        <path d="M 8 2 L 8 8 L 2 8 Z" />
                      </svg>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}

        {/* EPHEMERAL GHOST SUGGESTIONS */}
        {ghostLayerActive &&
          ghosts.map(ghost => (
            <div
              key={ghost.id}
              className="absolute w-84 ghost-card rounded-2xl p-4 z-20 select-none animate-in fade-in duration-300"
              style={{ transform: `translate3d(${ghost.suggestedX}px, ${ghost.suggestedY}px, 0)` }}
            >
              <div className="flex items-center justify-between border-b border-indigo-400/20 pb-2 mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-300 flex items-center">
                  <Sparkles className="w-3 h-3 mr-1 text-indigo-400" />
                  AI Proposal (Related)
                </span>
                <span className="text-[10px] text-indigo-300 font-mono">
                  {Math.round(ghost.score * 100)}% match
                </span>
              </div>

              <h4 className="text-xs font-semibold text-white mb-1">{ghost.title}</h4>
              <p className="text-xs text-indigo-100 leading-relaxed">{ghost.content}</p>

              <div className="mt-3 pt-2 border-t border-indigo-400/20 flex items-center justify-end space-x-2">
                <button
                  onClick={() => dismissGhost(ghost.id)}
                  className="px-2 py-1 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/10 transition"
                >
                  Dismiss
                </button>
                <button
                  onClick={() => acceptGhost(ghost.id)}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-apple-glow flex items-center space-x-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Accept to Canvas</span>
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* FLOATING APPLE WORKSPACE DOCK */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 glass-panel px-4 py-2 rounded-2xl flex items-center space-x-2 shadow-2xl z-40 select-none">
        {/* Navigation Pan / Zoom */}
        <button
          onClick={() => setCanvasTool('pan')}
          className={`p-2 rounded-xl transition ${canvasTool === 'pan' ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white'}`}
          title="Pan & Select Tool"
        >
          <Maximize className="w-4 h-4" />
        </button>

        {/* Freehand Canvas Inking */}
        <button
          onClick={() => setCanvasTool(canvasTool === 'pen' ? 'pan' : 'pen')}
          className={`p-2 rounded-xl transition ${canvasTool === 'pen' ? 'bg-indigo-600 text-white shadow-ghost-glow' : 'text-slate-400 hover:text-white'}`}
          title="Ink on Canvas"
        >
          <PenTool className="w-4 h-4" />
        </button>

        {canvasTool !== 'pan' && (
          <button
            onClick={() => undoInkStroke('canvas')}
            className="p-2 text-slate-400 hover:text-white rounded-xl"
            title="Undo Canvas Ink"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}

        <div className="h-4 w-px bg-white/15 mx-1"></div>

        {/* Canvas Page Design Selector */}
        <div className="relative">
          <button
            onClick={() => setIsDesignMenuOpen(!isDesignMenuOpen)}
            className={`px-2.5 py-1.5 rounded-xl transition flex items-center space-x-1 text-xs font-medium ${
              isDesignMenuOpen
                ? 'bg-blue-600 text-white shadow-apple-glow'
                : 'hover:bg-white/10 text-slate-200'
            }`}
            title="Select Canvas Page Design (Dot Grid, Graph Blueprint, Cornell Notes, Minimal, Nebula, Sepia)"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline capitalize">
              {CANVAS_DESIGNS.find(d => d.id === appSettings.canvasDesign)?.label || 'Page Design'}
            </span>
          </button>

          {/* Page Design Popover Menu */}
          {isDesignMenuOpen && (
            <div
              onPointerDown={e => e.stopPropagation()}
              className="absolute bottom-12 left-1/2 -translate-x-1/2 w-64 glass-panel border border-white/20 p-2 rounded-2xl shadow-2xl z-50 animate-in zoom-in-95 duration-100 space-y-1"
            >
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-white/10">
                Canvas Page Design
              </div>
              {CANVAS_DESIGNS.map(design => (
                <button
                  key={design.id}
                  onClick={() => {
                    updateAppSettings({ canvasDesign: design.id });
                    setIsDesignMenuOpen(false);
                  }}
                  className={`w-full p-2 rounded-xl text-left transition flex items-center space-x-2.5 ${
                    appSettings.canvasDesign === design.id
                      ? 'bg-blue-600/25 border border-blue-500/40 text-white font-semibold'
                      : 'hover:bg-white/5 text-slate-300'
                  }`}
                >
                  <span className="w-6 h-6 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center font-mono text-xs text-blue-400 shrink-0">
                    {design.icon}
                  </span>
                  <div className="truncate">
                    <div className="text-xs font-medium">{design.label}</div>
                    <div className="text-[10px] text-slate-400 truncate">{design.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={createQuickNote}
          className="px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-slate-200 text-xs font-medium flex items-center space-x-1 transition"
        >
          <Plus className="w-3.5 h-3.5 text-blue-400" />
          <span>New Card</span>
        </button>

        <button
          onClick={createGroupFrame}
          className="px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-slate-200 text-xs font-medium flex items-center space-x-1 transition"
        >
          <FolderPlus className="w-3.5 h-3.5 text-indigo-400" />
          <span>New Frame</span>
        </button>

        <div className="h-4 w-px bg-white/15 mx-1"></div>

        <button
          onClick={runAgentSynthesis}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-apple-glow transition"
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Synthesize</span>
        </button>
      </div>

      {/* MINIMAP */}
      <div className="absolute bottom-6 right-6 w-36 h-24 glass-panel rounded-xl border border-white/10 overflow-hidden pointer-events-none p-1 z-30 hidden sm:block">
        <div className="w-full h-full bg-black/40 rounded-lg relative">
          <div className="absolute w-3 h-2 bg-amber-400/80 rounded-[2px]" style={{ left: '25%', top: '30%' }}></div>
          <div className="absolute w-3 h-2 bg-emerald-400/80 rounded-[2px]" style={{ left: '30%', top: '65%' }}></div>
          <div className="absolute border border-blue-400/70 rounded inset-2"></div>
        </div>
      </div>
    </div>
  );
};
