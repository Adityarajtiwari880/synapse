import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { EnterpriseMatter, ProfessionalField } from '../types';

function generateMatterNumber(field: string): string {
  const prefix = { legal: 'LEG', medical: 'MED', business: 'BUS', academic: 'ACR' }[field] ?? 'GEN';
  return `${prefix}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export function useMatters(userId: string | null, initialMatters: EnterpriseMatter[] = []) {
  const [matters, setMatters] = useState<EnterpriseMatter[]>(initialMatters);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Fetch all matters for the user ───────────────────────
  const fetchMatters = useCallback(async () => {
    if (!userId || !isSupabaseConfigured) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('matters')
      .select('*')
      .eq('user_id', userId)
      .order('last_modified', { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setMatters(
        (data ?? []).map((m) => ({
          id: m.id,
          title: m.title,
          matterNumber: m.matter_number,
          client: m.client,
          field: m.field as ProfessionalField,
          workflowMode: m.workflow_mode as 'manual' | 'ai_assistant',
          status: m.status as EnterpriseMatter['status'],
          lastModified: m.last_modified,
          documentCount: m.document_count,
          nodeCount: m.node_count,
          collaboratorCount: m.collaborator_count,
          description: m.description,
          tags: m.tags ?? [],
        }))
      );
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchMatters();
  }, [fetchMatters]);

  // ─── Real-time subscription ────────────────────────────────
  useEffect(() => {
    if (!userId || !isSupabaseConfigured) return;
    const channel = supabase
      .channel(`matters:${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'matters', filter: `user_id=eq.${userId}` },
        () => fetchMatters()
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId, fetchMatters]);

  // ─── Create matter ─────────────────────────────────────────
  const createMatter = useCallback(
    async (input: Omit<EnterpriseMatter, 'id' | 'matterNumber' | 'lastModified'>) => {
      if (!userId) return null;

      // Optimistic update
      const tempId = `temp-${Date.now()}`;
      const optimistic: EnterpriseMatter = {
        ...input,
        id: tempId,
        matterNumber: generateMatterNumber(input.field),
        lastModified: new Date().toISOString(),
      };
      setMatters((prev) => [optimistic, ...prev]);

      if (!isSupabaseConfigured) return optimistic;

      const { data, error } = await supabase
        .from('matters')
        .insert({
          user_id: userId,
          title: input.title,
          matter_number: optimistic.matterNumber,
          client: input.client,
          field: input.field,
          workflow_mode: input.workflowMode ?? 'ai_assistant',
          status: input.status ?? 'active',
          description: input.description,
          tags: input.tags ?? [],
          document_count: input.documentCount ?? 0,
          node_count: input.nodeCount ?? 0,
          collaborator_count: input.collaboratorCount ?? 1,
        })
        .select()
        .single();

      if (error) {
        setError(error.message);
        setMatters((prev) => prev.filter((m) => m.id !== tempId));
        return null;
      }

      // Replace optimistic with real
      setMatters((prev) =>
        prev.map((m) => (m.id === tempId ? { ...optimistic, id: data.id } : m))
      );
      return { ...optimistic, id: data.id };
    },
    [userId]
  );

  // ─── Update matter ─────────────────────────────────────────
  const updateMatter = useCallback(
    async (id: string, partial: Partial<EnterpriseMatter>) => {
      setMatters((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...partial, lastModified: new Date().toISOString() } : m))
      );
      if (!isSupabaseConfigured) return;
      await supabase.from('matters').update({
        title: partial.title,
        client: partial.client,
        status: partial.status,
        workflow_mode: partial.workflowMode,
        description: partial.description,
        tags: partial.tags,
        document_count: partial.documentCount,
        node_count: partial.nodeCount,
        last_modified: new Date().toISOString(),
      }).eq('id', id);
    },
    []
  );

  // ─── Delete matter ─────────────────────────────────────────
  const deleteMatter = useCallback(async (id: string) => {
    setMatters((prev) => prev.filter((m) => m.id !== id));
    if (!isSupabaseConfigured) return;
    await supabase.from('matters').delete().eq('id', id);
  }, []);

  return { matters, loading, error, createMatter, updateMatter, deleteMatter, refetch: fetchMatters };
}
