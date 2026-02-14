export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          done_criteria: string
          time_block_mins: number
          deadline: string
          status: 'queued' | 'active' | 'completed' | 'blocked'
          blocked_reason: string | null
          micro_actions: string[] | null
          skipped_qc: boolean | null
          created_at: string
          started_at: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          done_criteria: string
          time_block_mins: number
          deadline: string
          status?: 'queued' | 'active' | 'completed' | 'blocked'
          blocked_reason?: string | null
          micro_actions?: string[] | null
          skipped_qc?: boolean | null
          created_at?: string
          started_at?: string | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          done_criteria?: string
          time_block_mins?: number
          deadline?: string
          status?: 'queued' | 'active' | 'completed' | 'blocked'
          blocked_reason?: string | null
          micro_actions?: string[] | null
          skipped_qc?: boolean | null
          created_at?: string
          started_at?: string | null
          completed_at?: string | null
        }
        Relationships: []
      }
      error_logs: {
        Row: {
          id: string
          user_id: string
          task_id: string
          error_type: string
          description: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          task_id: string
          error_type: string
          description: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          task_id?: string
          error_type?: string
          description?: string
          created_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          peak_focus_windows: string[] | null
          task_templates: Json | null
        }
        Insert: {
          id: string
          email: string
          created_at?: string
          peak_focus_windows?: string[] | null
          task_templates?: Json | null
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          peak_focus_windows?: string[] | null
          task_templates?: Json | null
        }
        Relationships: []
      }
      ai_usage_logs: {
        Row: {
          id: string
          user_id: string
          route: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          route: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          route?: string
          created_at?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          id: string
          user_id: string
          event_name: string
          properties: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          event_name: string
          properties?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          event_name?: string
          properties?: Json | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      consume_ai_rate_limit_slot: {
        Args: {
          p_route: string
          p_window_seconds: number
          p_max_requests: number
        }
        Returns: {
          allowed: boolean
          retry_after_seconds: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
