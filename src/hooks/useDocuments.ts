import { useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { DocumentItem } from '../types';
import { parseDocumentFile, type ParsedDocumentResult } from '../services/pdfService';

export function useDocuments(matterId: string | null, userId: string | null) {
  /**
   * Upload a file to Supabase Storage, parse it locally, and
   * save metadata to the documents table.
   */
  const uploadDocument = useCallback(
    async (file: File): Promise<(ParsedDocumentResult & { storageUrl?: string; fileType?: string }) | null> => {
      // Always parse locally first (works offline too)
      const parsed = await parseDocumentFile(file);
      const parsedWithExtras = parsed as ParsedDocumentResult & { storageUrl?: string; fileType?: string };

      if (!matterId || !userId || !isSupabaseConfigured) {
        return parsedWithExtras;
      }

      try {
        const storagePath = `${userId}/${matterId}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(storagePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.warn('[Synapse] Storage upload failed, using local mode:', uploadError.message);
          return parsedWithExtras;
        }

        const { data: urlData } = supabase.storage
          .from('documents')
          .getPublicUrl(storagePath);

        await supabase.from('documents').insert({
          matter_id: matterId,
          user_id: userId,
          name: file.name,
          file_type: (parsed as any).fileType || 'generic',
          file_url: urlData?.publicUrl ?? null,
          page_count: parsed.pages?.length ?? 1,
          doc_content: (parsed as any).docContent ?? null,
        });

        await supabase.rpc('increment_matter_doc_count', { matter_id: matterId });

        parsedWithExtras.storageUrl = urlData?.publicUrl;
        return parsedWithExtras;
      } catch (err) {
        console.warn('[Synapse] Document upload error:', err);
        return parsedWithExtras;
      }
    },
    [matterId, userId]
  );

  /**
   * Fetch all documents for the current matter from Supabase.
   */
  const fetchDocuments = useCallback(async (): Promise<DocumentItem[]> => {
    if (!matterId || !isSupabaseConfigured) return [];

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('matter_id', matterId)
      .order('created_at');

    if (error || !data) return [];

    return data.map((d: any) => ({
      id: d.id,
      name: d.name,
      title: d.name,
      authors: 'Imported via Supabase',
      year: new Date(d.created_at).getFullYear(),
      pages: d.page_count ?? 1,
      highlightsCount: 0,
      fileSize: 'Cloud',
      fileType: d.file_type as DocumentItem['fileType'],
      storageUrl: d.file_url ?? undefined,
      docContent: d.doc_content ?? undefined,
      ingestStatus: 'ready',
      abstract: `Cloud document (${d.file_type})`,
      parsedPdf: undefined,
    }));
  }, [matterId]);

  /**
   * Delete a document from storage + database.
   */
  const deleteDocument = useCallback(
    async (documentId: string, storagePath?: string) => {
      if (!isSupabaseConfigured) return;

      if (storagePath) {
        await supabase.storage.from('documents').remove([storagePath]);
      }
      await supabase.from('documents').delete().eq('id', documentId);
    },
    []
  );

  return { uploadDocument, fetchDocuments, deleteDocument };
}
