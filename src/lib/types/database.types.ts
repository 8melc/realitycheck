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
          created_at?: string
          updated_at?: string
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
          content_type: 'article' | 'podcast' | 'quote' | 'event' | 'person'
          cluster: string | null
          format: string | null
          read_time_minutes: number | null
          title: string | null
          description: string | null
          url: string | null
          image_url: string | null
          author: string | null
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          content_type: 'article' | 'podcast' | 'quote' | 'event' | 'person'
          cluster?: string | null
          format?: string | null
          read_time_minutes?: number | null
          title?: string | null
          description?: string | null
          url?: string | null
          image_url?: string | null
          author?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          content_type?: 'article' | 'podcast' | 'quote' | 'event' | 'person'
          cluster?: string | null
          format?: string | null
          read_time_minutes?: number | null
          title?: string | null
          description?: string | null
          url?: string | null
          image_url?: string | null
          author?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
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
      guide_conversations: {
        Row: {
          id: string
          user_id: string
          role: 'user' | 'guide'
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: 'user' | 'guide'
          message: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: 'user' | 'guide'
          message?: string
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

