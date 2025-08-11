"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import type { Todo } from "@/lib/supabase/client"
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js"

export function useTodos(userId: string | undefined) {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    // Initial fetch
    const fetchTodos = async () => {
      try {
        const { data, error } = await supabase
          .from("todos")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })

        if (error) {
          setError(error.message)
        } else {
          setTodos(data || [])
        }
      } catch (err) {
        setError("Failed to fetch todos")
      } finally {
        setLoading(false)
      }
    }

    fetchTodos()

    // Set up real-time subscription
    const channel = supabase
      .channel("todos-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "todos",
          filter: `user_id=eq.${userId}`,
        },
        (payload: RealtimePostgresChangesPayload<Todo>) => {
          console.log("Real-time update:", payload)

          if (payload.eventType === "INSERT") {
            setTodos((current) => [payload.new, ...current])
          } else if (payload.eventType === "UPDATE") {
            setTodos((current) => current.map((todo) => (todo.id === payload.new.id ? payload.new : todo)))
          } else if (payload.eventType === "DELETE") {
            setTodos((current) => current.filter((todo) => todo.id !== payload.old.id))
          }
        },
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  return { todos, loading, error }
}
