import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Check if Supabase environment variables are available
export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

// Create a singleton instance of the Supabase client for Client Components
export const supabase = createClientComponentClient()

// Database types
export interface Todo {
  id: string
  user_id: string
  title: string
  description?: string
  completed: boolean
  due_date?: string
  priority: "low" | "medium" | "high"
  created_at: string
  updated_at: string
}

export type TodoFilter = "all" | "pending" | "completed"
export type TodoPriority = "low" | "medium" | "high"
