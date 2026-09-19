import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { CanvasNode, CanvasEdge, CanvasFrame } from '../types';

export function useCanvas(
  matterId: string | null,
  initialNodes: CanvasNode[] = [],
  initialEdges: CanvasEdge[] = [],
  initialFrames: CanvasFrame[] = []
) {
  const [nodes, setNodes] = useState<CanvasNode[]>(initialNodes);
  const [edges, setEdges] = useState<CanvasEdge[]>(initialEdges);
  const [frames, setFrames] = useState<CanvasFrame[]>(initialFrames);

  // ─── Initial fetch ─────────────────────────────────────────
  const fetchCanvas = useCallback(async () => {
    if (!matterId || !isSupabaseConfigured) return;

    const [nodesRes, edgesRes, framesRes] = await Promise.all([
      supabase.from('canvas_nodes').select('*').eq('matter_id', matterId).order('created_at'),
      supabase.from('canvas_edges').select('*').eq('matter_id', matterId),
      supabase.from('canvas_frames').select('*').eq('matter_id', matterId),
    ]);

    if (nodesRes.data) {
      setNodes(
        nodesRes.data.map((n: any) => ({
          id: n.id,
          type: n.type as CanvasNode['type'],
          title: n.title,
          content: n.content,
          x: n.x,
          y: n.y,
          color: n.color,
          width: n.width ?? undefined,
          height: n.height ?? undefined,
          isLocked: n.is_locked,
          anchors: n.anchor as CanvasNode['anchors'],
          createdAt: new Date(n.created_at).getTime(),
          confidence: 1,
          verificationState: 'verified',
          origin: 'human',
        }))
      );
    }

    if (edgesRes.data) {
      setEdges(
        edgesRes.data.map((e: any) => ({
          id: e.id,
          source: e.source_id,
          target: e.target_id,
          relation: e.label ?? '',
        }))
      );
    }

    if (framesRes.data) {
      setFrames(
        framesRes.data.map((f: any) => ({
          id: f.id,
          x: f.x,
          y: f.y,
          width: f.width,
          height: f.height,
          title: f.label,
          color: f.color,
        }))
      );
    }
  }, [matterId]);

  useEffect(() => {
    fetchCanvas();
  }, [fetchCanvas]);

  // ─── Real-time subscriptions for collaboration ─────────────
  useEffect(() => {
    if (!matterId || !isSupabaseConfigured) return;

    const channel = supabase
      .channel(`canvas:${matterId}`)
      // Nodes
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'canvas_nodes', filter: `matter_id=eq.${matterId}` },
        (payload) => {
          const n = payload.new as any;
          setNodes((prev) => {
            if (prev.find((x) => x.id === n.id)) return prev;
            return [...prev, { id: n.id, type: n.type, title: n.title, content: n.content, x: n.x, y: n.y, color: n.color, isLocked: n.is_locked, anchors: n.anchor, createdAt: new Date(n.created_at).getTime(), confidence: 1, verificationState: 'verified', origin: 'human' }];
          });
        }
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'canvas_nodes', filter: `matter_id=eq.${matterId}` },
        (payload) => {
          const n = payload.new as any;
          setNodes((prev) => prev.map((x) => x.id === n.id ? { ...x, x: n.x, y: n.y, title: n.title, content: n.content, color: n.color, isLocked: n.is_locked, anchors: n.anchor } : x));
        }
      )
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'canvas_nodes', filter: `matter_id=eq.${matterId}` },
        (payload) => {
          setNodes((prev) => prev.filter((x) => x.id !== (payload.old as any).id));
        }
      )
      // Edges
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'canvas_edges', filter: `matter_id=eq.${matterId}` },
        (payload) => {
          const e = payload.new as any;
          setEdges((prev) => {
            if (prev.find((x) => x.id === e.id)) return prev;
            return [...prev, { id: e.id, source: e.source_id, target: e.target_id, relation: e.label ?? '' }];
          });
        }
      )
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'canvas_edges', filter: `matter_id=eq.${matterId}` },
        (payload) => {
          setEdges((prev) => prev.filter((x) => x.id !== (payload.old as any).id));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [matterId]);

  // ─── Node CRUD ─────────────────────────────────────────────
  const addNode = useCallback(async (node: Omit<CanvasNode, 'id' | 'createdAt'> & { id?: string }): Promise<string> => {
    const tempId = node.id ?? `node-${Date.now()}`;
    const newNode: CanvasNode = { ...node, id: tempId, createdAt: Date.now(), confidence: node.confidence || 1, verificationState: node.verificationState || 'verified', origin: node.origin || 'human' };
    setNodes((prev) => [...prev, newNode]);

    if (!matterId || !isSupabaseConfigured) return tempId;

    const { data } = await supabase.from('canvas_nodes').insert({
      id: tempId,
      matter_id: matterId,
      type: node.type,
      title: node.title,
      content: node.content ?? '',
      x: node.x,
      y: node.y,
      color: node.color ?? '#6366f1',
      is_locked: (node as any).isLocked ?? false,
      anchor: node.anchors as any,
    }).select().single();

    if (data && data.id !== tempId) {
      setNodes((prev) => prev.map((n) => n.id === tempId ? { ...n, id: data.id } : n));
      return data.id;
    }
    return tempId;
  }, [matterId]);

  const updateNode = useCallback(async (id: string, partial: Partial<CanvasNode>) => {
    setNodes((prev) => prev.map((n) => n.id === id ? { ...n, ...partial } : n));
    if (!isSupabaseConfigured) return;
    await supabase.from('canvas_nodes').update({
      title: partial.title,
      content: partial.content,
      x: partial.x,
      y: partial.y,
      color: partial.color,
      is_locked: (partial as any).isLocked,
      anchor: partial.anchors as any,
      updated_at: new Date().toISOString(),
    }).eq('id', id);
  }, []);

  const updateNodePos = useCallback(async (id: string, x: number, y: number) => {
    setNodes((prev) => prev.map((n) => n.id === id ? { ...n, x, y } : n));
    if (!isSupabaseConfigured) return;
    await supabase.from('canvas_nodes').update({ x, y, updated_at: new Date().toISOString() }).eq('id', id);
  }, []);

  const updateNodesPos = useCallback(async (updates: { id: string; x: number; y: number }[]) => {
    setNodes((prev) => prev.map((n) => {
      const u = updates.find((u) => u.id === n.id);
      return u ? { ...n, x: u.x, y: u.y } : n;
    }));
    if (!isSupabaseConfigured) return;
    await Promise.all(
      updates.map((u) =>
        supabase.from('canvas_nodes').update({ x: u.x, y: u.y, updated_at: new Date().toISOString() }).eq('id', u.id)
      )
    );
  }, []);

  const deleteNode = useCallback(async (id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
    setEdges((prev) => prev.filter((e) => e.source !== id && e.target !== id));
    if (!isSupabaseConfigured) return;
    await supabase.from('canvas_nodes').delete().eq('id', id);
  }, []);

  // ─── Edge CRUD ─────────────────────────────────────────────
  const addEdge = useCallback(async (edge: CanvasEdge) => {
    setEdges((prev) => [...prev, edge]);
    if (!matterId || !isSupabaseConfigured) return;
    await supabase.from('canvas_edges').insert({
      id: edge.id,
      matter_id: matterId,
      source_id: edge.source,
      target_id: edge.target,
      label: edge.relation,
      color: '#6366f1',
    });
  }, [matterId]);

  const updateEdge = useCallback(async (id: string, partial: Partial<CanvasEdge>) => {
    setEdges((prev) => prev.map((e) => e.id === id ? { ...e, ...partial } : e));
    if (!isSupabaseConfigured) return;
    await supabase.from('canvas_edges').update({ label: partial.relation }).eq('id', id);
  }, []);

  const deleteEdge = useCallback(async (id: string) => {
    setEdges((prev) => prev.filter((e) => e.id !== id));
    if (!isSupabaseConfigured) return;
    await supabase.from('canvas_edges').delete().eq('id', id);
  }, []);

  // ─── Frame CRUD ────────────────────────────────────────────
  const addFrame = useCallback(async (frame: CanvasFrame) => {
    setFrames((prev) => [...prev, frame]);
    if (!matterId || !isSupabaseConfigured) return;
    await supabase.from('canvas_frames').insert({
      id: frame.id,
      matter_id: matterId,
      x: frame.x,
      y: frame.y,
      width: frame.width,
      height: frame.height,
      label: frame.title,
      color: frame.color,
    });
  }, [matterId]);

  const deleteFrame = useCallback(async (id: string) => {
    setFrames((prev) => prev.filter((f) => f.id !== id));
    if (!isSupabaseConfigured) return;
    await supabase.from('canvas_frames').delete().eq('id', id);
  }, []);

  return {
    nodes, edges, frames,
    addNode, updateNode, updateNodePos, updateNodesPos, deleteNode,
    addEdge, updateEdge, deleteEdge,
    addFrame, deleteFrame,
    refetch: fetchCanvas,
  };
}
