export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: 'admin' | 'researcher' | 'reviewer' | 'viewer';
          professional_field: 'legal' | 'medical' | 'business' | 'academic';
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          role?: 'admin' | 'researcher' | 'reviewer' | 'viewer';
          professional_field?: 'legal' | 'medical' | 'business' | 'academic';
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };

      matters: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          matter_number: string;
          client: string;
          field: 'legal' | 'medical' | 'business' | 'academic';
          workflow_mode: 'manual' | 'ai_assistant';
          status: 'active' | 'in_review' | 'archived' | 'urgent';
          description: string;
          tags: string[];
          document_count: number;
          node_count: number;
          collaborator_count: number;
          last_modified: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          matter_number?: string;
          client?: string;
          field: 'legal' | 'medical' | 'business' | 'academic';
          workflow_mode?: 'manual' | 'ai_assistant';
          status?: 'active' | 'in_review' | 'archived' | 'urgent';
          description?: string;
          tags?: string[];
          document_count?: number;
          node_count?: number;
          collaborator_count?: number;
          last_modified?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['matters']['Insert']>;
      };

      documents: {
        Row: {
          id: string;
          matter_id: string;
          user_id: string;
          name: string;
          file_type: 'pdf' | 'docx' | 'doc' | 'txt' | 'md' | 'image' | 'svg' | 'json' | 'csv' | 'generic';
          file_url: string | null;
          page_count: number;
          doc_content: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          matter_id: string;
          user_id: string;
          name: string;
          file_type: Database['public']['Tables']['documents']['Row']['file_type'];
          file_url?: string | null;
          page_count?: number;
          doc_content?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['documents']['Insert']>;
      };

      canvas_nodes: {
        Row: {
          id: string;
          matter_id: string;
          type: 'claim' | 'evidence' | 'question' | 'note' | 'concept';
          title: string;
          content: string;
          x: number;
          y: number;
          color: string;
          width: number | null;
          height: number | null;
          is_locked: boolean;
          anchor: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          matter_id: string;
          type: Database['public']['Tables']['canvas_nodes']['Row']['type'];
          title: string;
          content?: string;
          x: number;
          y: number;
          color?: string;
          width?: number | null;
          height?: number | null;
          is_locked?: boolean;
          anchor?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['canvas_nodes']['Insert']>;
      };

      canvas_edges: {
        Row: {
          id: string;
          matter_id: string;
          source_id: string;
          target_id: string;
          label: string | null;
          color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          matter_id: string;
          source_id: string;
          target_id: string;
          label?: string | null;
          color?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['canvas_edges']['Insert']>;
      };

      canvas_frames: {
        Row: {
          id: string;
          matter_id: string;
          x: number;
          y: number;
          width: number;
          height: number;
          label: string;
          color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          matter_id: string;
          x: number;
          y: number;
          width: number;
          height: number;
          label?: string;
          color?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['canvas_frames']['Insert']>;
      };

      collaborators: {
        Row: {
          id: string;
          matter_id: string;
          user_id: string;
          name: string;
          role: 'admin' | 'researcher' | 'reviewer' | 'viewer';
          color: string;
          is_online: boolean;
          invited_at: string;
        };
        Insert: {
          id?: string;
          matter_id: string;
          user_id: string;
          name: string;
          role?: 'admin' | 'researcher' | 'reviewer' | 'viewer';
          color?: string;
          is_online?: boolean;
          invited_at?: string;
        };
        Update: Partial<Database['public']['Tables']['collaborators']['Insert']>;
      };

      audit_logs: {
        Row: {
          id: string;
          user_id: string;
          matter_id: string | null;
          action: string;
          details: string;
          status: 'success' | 'warning' | 'error';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          matter_id?: string | null;
          action: string;
          details: string;
          status?: 'success' | 'warning' | 'error';
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['audit_logs']['Insert']>;
      };

      user_settings: {
        Row: {
          user_id: string;
          theme: 'dark' | 'sepia' | 'light' | 'midnight';
          workflow_mode: 'manual' | 'ai_assistant';
          device_mode: 'auto' | 'tablet' | 'desktop';
          ai_tone: 'beginner' | 'academic' | 'concise';
          font_family: 'sans' | 'serif' | 'dyslexic';
          density: 'comfortable' | 'compact';
          canvas_design: 'dots' | 'graph' | 'cornell' | 'minimal' | 'nebula' | 'sepia';
          active_provider: 'gemini' | 'openai' | 'anthropic' | 'ollama' | 'local-simulated';
          gemini_api_key: string | null;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          theme?: 'dark' | 'sepia' | 'light' | 'midnight';
          workflow_mode?: 'manual' | 'ai_assistant';
          device_mode?: 'auto' | 'tablet' | 'desktop';
          ai_tone?: 'beginner' | 'academic' | 'concise';
          font_family?: 'sans' | 'serif' | 'dyslexic';
          density?: 'comfortable' | 'compact';
          canvas_design?: 'dots' | 'graph' | 'cornell' | 'minimal' | 'nebula' | 'sepia';
          active_provider?: 'gemini' | 'openai' | 'anthropic' | 'ollama' | 'local-simulated';
          gemini_api_key?: string | null;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['user_settings']['Insert']>;
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
