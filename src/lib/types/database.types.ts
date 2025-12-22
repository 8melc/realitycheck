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
      user_profiles: {
        Row: {
          id: string
          user_id: string
          display_name: string | null
          birth_date: string | null
          target_age: number | null
          guide_personality: string | null
          daily_time_limit_minutes: number | null
          main_goal_id: string | null
          bio: string | null
          focus_topic: string | null
          will_learn: string[] | null
          will_share: string[] | null
          is_public: boolean
          answer_style: string | null
          guide_tone: string | null
          focus_window: string | null
          nudging_paused_until: string | null
          nudging_frequency: string | null
          avatar_type: 'initials' | 'upload' | 'generated' | null
          avatar_url: string | null
          avatar_seed: string | null
          avatar_style: 'avataaars' | 'personas' | 'bottts' | 'micah' | 'lorelei' | null
          goal_direction: 'freedom' | 'clarity' | 'growth' | 'balance' | 'meaning' | null
          slots_article: number | null
          slots_podcast: number | null
          slots_quote: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          display_name?: string | null
          birth_date?: string | null
          target_age?: number | null
          guide_personality?: string | null
          daily_time_limit_minutes?: number | null
          main_goal_id?: string | null
          bio?: string | null
          focus_topic?: string | null
          will_learn?: string[] | null
          will_share?: string[] | null
          is_public?: boolean
          answer_style?: string | null
          guide_tone?: string | null
          focus_window?: string | null
          nudging_paused_until?: string | null
          nudging_frequency?: string | null
          avatar_type?: 'initials' | 'upload' | 'generated' | null
          avatar_url?: string | null
          avatar_seed?: string | null
          avatar_style?: 'avataaars' | 'personas' | 'bottts' | 'micah' | 'lorelei' | null
          goal_direction?: 'freedom' | 'clarity' | 'growth' | 'balance' | 'meaning' | null
          slots_article?: number | null
          slots_podcast?: number | null
          slots_quote?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          display_name?: string | null
          birth_date?: string | null
          target_age?: number | null
          guide_personality?: string | null
          daily_time_limit_minutes?: number | null
          main_goal_id?: string | null
          bio?: string | null
          focus_topic?: string | null
          will_learn?: string[] | null
          will_share?: string[] | null
          is_public?: boolean
          answer_style?: string | null
          guide_tone?: string | null
          focus_window?: string | null
          nudging_paused_until?: string | null
          nudging_frequency?: string | null
          avatar_type?: 'initials' | 'upload' | 'generated' | null
          avatar_url?: string | null
          avatar_seed?: string | null
          avatar_style?: 'avataaars' | 'personas' | 'bottts' | 'micah' | 'lorelei' | null
          goal_direction?: 'freedom' | 'clarity' | 'growth' | 'balance' | 'meaning' | null
          slots_article?: number | null
          slots_podcast?: number | null
          slots_quote?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      nudges_sent: {
        Row: {
          id: string
          user_id: string
          nudge_type: string
          nudge_content: string
          shown_at: string
          dismissed_at: string | null
          action_taken: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          nudge_type: string
          nudge_content: string
          shown_at?: string
          dismissed_at?: string | null
          action_taken?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          nudge_type?: string
          nudge_content?: string
          shown_at?: string
          dismissed_at?: string | null
          action_taken?: string | null
          created_at?: string
        }
      }
      user_goals: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          category: string | null
          eisenhower_category: string | null
          status: string | null
          is_primary: boolean
          progress_percent: number | null
          target_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          category?: string | null
          eisenhower_category?: string | null
          status?: string | null
          is_primary?: boolean
          progress_percent?: number | null
          target_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          category?: string | null
          eisenhower_category?: string | null
          status?: string | null
          is_primary?: boolean
          progress_percent?: number | null
          target_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      content_items: {
        Row: {
          id: string
          slug: string | null
          title: string
          subtitle: string | null
          content_type: string
          url: string | null
          author: string | null
          source: string | null
          cluster: string | null
          format: string | null
          read_time_minutes: number | null
          quote_text: string | null
          person_role: string | null
          event_location: string | null
          event_date: string | null
          is_published: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          slug?: string | null
          title: string
          subtitle?: string | null
          content_type: string
          url?: string | null
          author?: string | null
          source?: string | null
          cluster?: string | null
          format?: string | null
          read_time_minutes?: number | null
          quote_text?: string | null
          person_role?: string | null
          event_location?: string | null
          event_date?: string | null
          is_published?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          slug?: string | null
          title?: string
          subtitle?: string | null
          content_type?: string
          url?: string | null
          author?: string | null
          source?: string | null
          cluster?: string | null
          format?: string | null
          read_time_minutes?: number | null
          quote_text?: string | null
          person_role?: string | null
          event_location?: string | null
          event_date?: string | null
          is_published?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      content_preferences: {
        Row: {
          id: string
          user_id: string
          enabled_formats: string[] | null
          enabled_clusters: string[] | null
          max_x_per_day: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          enabled_formats?: string[] | null
          enabled_clusters?: string[] | null
          max_x_per_day?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          enabled_formats?: string[] | null
          enabled_clusters?: string[] | null
          max_x_per_day?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      feed_interactions: {
        Row: {
          id: string
          user_id: string
          content_id: string
          action: 'viewed' | 'saved' | 'skipped' | 'more_like_this' | 'different_topic'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content_id: string
          action: 'viewed' | 'saved' | 'skipped' | 'more_like_this' | 'different_topic'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content_id?: string
          action?: 'viewed' | 'saved' | 'skipped' | 'more_like_this' | 'different_topic'
          created_at?: string
        }
      }
      guide_sessions: {
        Row: {
          id: string
          user_id: string
          title: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      guide_conversations: {
        Row: {
          id: string
          user_id: string
          role: 'user' | 'guide'
          message: string
          session_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: 'user' | 'guide'
          message: string
          session_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: 'user' | 'guide'
          message?: string
          session_id?: string
          created_at?: string
        }
      }
      content_interactions: {
        Row: {
          id: string
          user_id: string
          content_id: string
          interaction_type: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content_id: string
          interaction_type: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content_id?: string
          interaction_type?: string
          created_at?: string
        }
      }
      user_sessions: {
        Row: {
          id: string
          user_id: string
          session_start: string
          session_end: string | null
          duration_minutes: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_start: string
          session_end?: string | null
          duration_minutes?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_start?: string
          session_end?: string | null
          duration_minutes?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      user_credits: {
        Row: {
          id: string
          user_id: string
          balance: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          balance?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          balance?: number
          created_at?: string
          updated_at?: string
        }
      }
      credit_packages: {
        Row: {
          id: string
          name: string
          credits: number
          price_cents: number
          stripe_price_id: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          credits: number
          price_cents: number
          stripe_price_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          credits?: number
          price_cents?: number
          stripe_price_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      credit_transactions: {
        Row: {
          id: string
          user_id: string
          package_id: string | null
          amount: number
          transaction_type: 'purchase' | 'consumption'
          stripe_payment_intent_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          package_id?: string | null
          amount: number
          transaction_type: 'purchase' | 'consumption'
          stripe_payment_intent_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          package_id?: string | null
          amount?: number
          transaction_type?: 'purchase' | 'consumption'
          stripe_payment_intent_id?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types for easier access
export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type UserGoal = Database['public']['Tables']['user_goals']['Row']
export type ContentItem = Database['public']['Tables']['content_items']['Row']
export type ContentPreferences = Database['public']['Tables']['content_preferences']['Row']
export type FeedInteraction = Database['public']['Tables']['feed_interactions']['Row']
export type GuideMessage = Database['public']['Tables']['guide_conversations']['Row']
export type UserCredits = Database['public']['Tables']['user_credits']['Row']

