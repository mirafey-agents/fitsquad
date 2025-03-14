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
      users: {
        Row: {
          id: string
          email: string
          display_name: string
          role: 'super_admin' | 'trainer' | 'member'
          experience_level: string | null
          goals: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          display_name: string
          role?: 'super_admin' | 'trainer' | 'member'
          experience_level?: string | null
          goals?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string
          role?: 'super_admin' | 'trainer' | 'member'
          experience_level?: string | null
          goals?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      squads: {
        Row: {
          id: string
          name: string
          description: string | null
          created_by: string
          is_private: boolean
          schedule: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_by: string
          is_private?: boolean
          schedule?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_by?: string
          is_private?: boolean
          schedule?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      squad_members: {
        Row: {
          id: string
          squad_id: string
          user_id: string
          role: 'super_admin' | 'trainer' | 'member'
          joined_at: string
        }
        Insert: {
          id?: string
          squad_id: string
          user_id: string
          role?: 'super_admin' | 'trainer' | 'member'
          joined_at?: string
        }
        Update: {
          id?: string
          squad_id?: string
          user_id?: string
          role?: 'super_admin' | 'trainer' | 'member'
          joined_at?: string
        }
      }
      workouts: {
        Row: {
          id: string
          squad_id: string
          title: string
          description: string | null
          scheduled_time: string
          duration: string
          intensity: string
          max_participants: number | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          squad_id: string
          title: string
          description?: string | null
          scheduled_time: string
          duration: string
          intensity: string
          max_participants?: number | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          squad_id?: string
          title?: string
          description?: string | null
          scheduled_time?: string
          duration?: string
          intensity?: string
          max_participants?: number | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      workout_participants: {
        Row: {
          id: string
          workout_id: string
          user_id: string
          attendance_status: string
          performance_score: number | null
          mvp_votes: number
          slacker_votes: number
          joined_at: string
        }
        Insert: {
          id?: string
          workout_id: string
          user_id: string
          attendance_status?: string
          performance_score?: number | null
          mvp_votes?: number
          slacker_votes?: number
          joined_at?: string
        }
        Update: {
          id?: string
          workout_id?: string
          user_id?: string
          attendance_status?: string
          performance_score?: number | null
          mvp_votes?: number
          slacker_votes?: number
          joined_at?: string
        }
      }
    }
  }
}