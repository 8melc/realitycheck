export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      content_items: {
        Row: {
          author: string | null
          cluster: string | null
          content_quality_score: number | null
          content_type: string
          created_at: string | null
          created_by_user_id: string | null
          curator_notes: string | null
          eisenhower_category: string | null
          event_date: string | null
          event_location: string | null
          format: string | null
          guide_comment: string | null
          id: string
          is_featured: boolean | null
          is_published: boolean | null
          language: string | null
          last_reviewed_at: string | null
          like_count: number | null
          perma_dimension: string | null
          person_role: string | null
          priority_score: number | null
          publication_date: string | null
          quote_text: string | null
          read_time_minutes: number | null
          related_goal_types: string[] | null
          required_credits: number | null
          skip_count: number | null
          slug: string | null
          source: string | null
          subtitle: string | null
          tags: string[] | null
          target_audience: string[] | null
          thumbnail_url: string | null
          title: string
          transparency_reason: string | null
          updated_at: string | null
          url: string | null
          view_count: number | null
        }
        Insert: {
          author?: string | null
          cluster?: string | null
          content_quality_score?: number | null
          content_type: string
          created_at?: string | null
          created_by_user_id?: string | null
          curator_notes?: string | null
          eisenhower_category?: string | null
          event_date?: string | null
          event_location?: string | null
          format?: string | null
          guide_comment?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          language?: string | null
          last_reviewed_at?: string | null
          like_count?: number | null
          perma_dimension?: string | null
          person_role?: string | null
          priority_score?: number | null
          publication_date?: string | null
          quote_text?: string | null
          read_time_minutes?: number | null
          related_goal_types?: string[] | null
          required_credits?: number | null
          skip_count?: number | null
          slug?: string | null
          source?: string | null
          subtitle?: string | null
          tags?: string[] | null
          target_audience?: string[] | null
          thumbnail_url?: string | null
          title: string
          transparency_reason?: string | null
          updated_at?: string | null
          url?: string | null
          view_count?: number | null
        }
        Update: {
          author?: string | null
          cluster?: string | null
          content_quality_score?: number | null
          content_type?: string
          created_at?: string | null
          created_by_user_id?: string | null
          curator_notes?: string | null
          eisenhower_category?: string | null
          event_date?: string | null
          event_location?: string | null
          format?: string | null
          guide_comment?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          language?: string | null
          last_reviewed_at?: string | null
          like_count?: number | null
          perma_dimension?: string | null
          person_role?: string | null
          priority_score?: number | null
          publication_date?: string | null
          quote_text?: string | null
          read_time_minutes?: number | null
          related_goal_types?: string[] | null
          required_credits?: number | null
          skip_count?: number | null
          slug?: string | null
          source?: string | null
          subtitle?: string | null
          tags?: string[] | null
          target_audience?: string[] | null
          thumbnail_url?: string | null
          title?: string
          transparency_reason?: string | null
          updated_at?: string | null
          url?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      content_preferences: {
        Row: {
          clusters: Json | null
          formats: Json | null
          max_articles_per_day: number | null
          max_events_per_week: number | null
          max_podcasts_per_day: number | null
          max_quotes_per_day: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          clusters?: Json | null
          formats?: Json | null
          max_articles_per_day?: number | null
          max_events_per_week?: number | null
          max_podcasts_per_day?: number | null
          max_quotes_per_day?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          clusters?: Json | null
          formats?: Json | null
          max_articles_per_day?: number | null
          max_events_per_week?: number | null
          max_podcasts_per_day?: number | null
          max_quotes_per_day?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      credit_packages: {
        Row: {
          created_at: string | null
          credits: number
          currency: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          price_cents: number
          stripe_price_id: string | null
        }
        Insert: {
          created_at?: string | null
          credits: number
          currency?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          price_cents: number
          stripe_price_id?: string | null
        }
        Update: {
          created_at?: string | null
          credits?: number
          currency?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          price_cents?: number
          stripe_price_id?: string | null
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          package_id: string | null
          stripe_payment_intent_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          package_id?: string | null
          stripe_payment_intent_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          package_id?: string | null
          stripe_payment_intent_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "credit_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string | null
          date: string
          external_url: string | null
          fyf_reason: string | null
          id: string
          is_active: boolean
          location: string | null
          short_description: string | null
          source: string | null
          start_time: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          external_url?: string | null
          fyf_reason?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          short_description?: string | null
          source?: string | null
          start_time?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          external_url?: string | null
          fyf_reason?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          short_description?: string | null
          source?: string | null
          start_time?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      feed_interactions: {
        Row: {
          action: string
          content_id: string
          created_at: string | null
          extra: Json | null
          id: string
          user_id: string
        }
        Insert: {
          action: string
          content_id: string
          created_at?: string | null
          extra?: Json | null
          id?: string
          user_id: string
        }
        Update: {
          action?: string
          content_id?: string
          created_at?: string | null
          extra?: Json | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_interactions_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      guide_conversations: {
        Row: {
          created_at: string | null
          id: string
          message: string
          metadata: Json | null
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          role: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      guide_feedback: {
        Row: {
          cluster: string | null
          created_at: string | null
          feedback_type: string | null
          id: string
          item_id: string | null
          message: string | null
          response: string | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          cluster?: string | null
          created_at?: string | null
          feedback_type?: string | null
          id?: string
          item_id?: string | null
          message?: string | null
          response?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          cluster?: string | null
          created_at?: string | null
          feedback_type?: string | null
          id?: string
          item_id?: string | null
          message?: string | null
          response?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guide_feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      guide_logs: {
        Row: {
          codex_version: string | null
          created_at: string | null
          feedback_tags: string[] | null
          id: string
          prompt: Json | null
          response: string | null
          session_id: string | null
          slots_post: Json | null
          slots_pre: Json | null
          user_id: string | null
        }
        Insert: {
          codex_version?: string | null
          created_at?: string | null
          feedback_tags?: string[] | null
          id?: string
          prompt?: Json | null
          response?: string | null
          session_id?: string | null
          slots_post?: Json | null
          slots_pre?: Json | null
          user_id?: string | null
        }
        Update: {
          codex_version?: string | null
          created_at?: string | null
          feedback_tags?: string[] | null
          id?: string
          prompt?: Json | null
          response?: string | null
          session_id?: string | null
          slots_post?: Json | null
          slots_pre?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guide_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_actions: {
        Row: {
          category: string | null
          created_at: string
          due_date: string | null
          id: string
          is_done: boolean
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          is_done?: boolean
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          is_done?: boolean
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          balance: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_goals: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          eisenhower_category: string | null
          id: string
          is_primary: boolean | null
          progress_percent: number | null
          status: string | null
          target_date: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          eisenhower_category?: string | null
          id?: string
          is_primary?: boolean | null
          progress_percent?: number | null
          status?: string | null
          target_date?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          eisenhower_category?: string | null
          id?: string
          is_primary?: boolean | null
          progress_percent?: number | null
          status?: string | null
          target_date?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_interests: {
        Row: {
          created_at: string | null
          id: string
          label: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          label: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          label?: string
          user_id?: string
        }
        Relationships: []
      }
      user_journey_events: {
        Row: {
          created_at: string
          id: string
          label: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          birth_date: string
          created_at: string | null
          daily_limit_enabled: boolean | null
          daily_time_limit_minutes: number | null
          display_name: string | null
          focus_topic: string | null
          guide_muted: boolean | null
          guide_nudging_frequency: string | null
          guide_personality: string | null
          guide_tone: string | null
          is_public: boolean | null
          lifestyle: string | null
          main_goal_id: string | null
          slots_article: number | null
          slots_podcast: number | null
          slots_quote: number | null
          spotify_connected: boolean | null
          spotify_user_id: string | null
          target_age: number | null
          time_philosophy: string | null
          updated_at: string | null
          user_id: string
          will_learn: string[] | null
          will_share: string[] | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          birth_date: string
          created_at?: string | null
          daily_limit_enabled?: boolean | null
          daily_time_limit_minutes?: number | null
          display_name?: string | null
          focus_topic?: string | null
          guide_muted?: boolean | null
          guide_nudging_frequency?: string | null
          guide_personality?: string | null
          guide_tone?: string | null
          is_public?: boolean | null
          lifestyle?: string | null
          main_goal_id?: string | null
          slots_article?: number | null
          slots_podcast?: number | null
          slots_quote?: number | null
          spotify_connected?: boolean | null
          spotify_user_id?: string | null
          target_age?: number | null
          time_philosophy?: string | null
          updated_at?: string | null
          user_id: string
          will_learn?: string[] | null
          will_share?: string[] | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string
          created_at?: string | null
          daily_limit_enabled?: boolean | null
          daily_time_limit_minutes?: number | null
          display_name?: string | null
          focus_topic?: string | null
          guide_muted?: boolean | null
          guide_nudging_frequency?: string | null
          guide_personality?: string | null
          guide_tone?: string | null
          is_public?: boolean | null
          lifestyle?: string | null
          main_goal_id?: string | null
          slots_article?: number | null
          slots_podcast?: number | null
          slots_quote?: number | null
          spotify_connected?: boolean | null
          spotify_user_id?: string | null
          target_age?: number | null
          time_philosophy?: string | null
          updated_at?: string | null
          user_id?: string
          will_learn?: string[] | null
          will_share?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_profiles_main_goal"
            columns: ["main_goal_id"]
            isOneToOne: false
            referencedRelation: "user_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      user_projects: {
        Row: {
          created_at: string | null
          id: string
          priority: number | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          priority?: number | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          priority?: number | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string | null
          duration_minutes: number | null
          id: string
          session_end: string | null
          session_start: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          session_end?: string | null
          session_start?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          session_end?: string | null
          session_start?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      codex_snippets: {
        Row: {
          id: string | null
          last_updated: string | null
          text: string | null
          title: string | null
        }
        Relationships: []
      }
      eval_dashboard: {
        Row: {
          avg_score: number | null
          compliant: number | null
          hour: string | null
          turns: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      export_guide_logs_to_jsonl: {
        Args: { export_date?: string }
        Returns: {
          codex_version: string
          created_at: string
          feedback_tags: string[]
          prompt: Json
          response: string
          session_id: string
          slots_post: Json
          slots_pre: Json
          uid_hash: string
        }[]
      }
      fetch_fyf_context: { Args: { p_user_id: string }; Returns: Json }
      get_user_content: {
        Args: { p_cluster?: string; p_content_type?: string; p_limit?: number }
        Returns: {
          author: string
          cluster: string
          content_type: string
          created_at: string
          eisenhower_category: string
          format: string
          guide_comment: string
          id: string
          is_featured: boolean
          language: string
          perma_dimension: string
          publication_date: string
          quote_text: string
          read_time_minutes: number
          required_credits: number
          slug: string
          source: string
          subtitle: string
          tags: string[]
          thumbnail_url: string
          title: string
          transparency_reason: string
          url: string
        }[]
      }
      run_aggressive_eval: { Args: never; Returns: Json }
      run_daily_evals: {
        Args: { eval_date?: string }
        Returns: {
          metric: string
          score: number
          turn_count: number
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
