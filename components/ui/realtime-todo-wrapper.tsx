"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import TodoList from "@/components/ui/todo-list"
import { Loader2 } from "lucide-react"

export default function RealtimeTodoWrapper() {
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUserId(user?.id || null)
      setLoading(false)
    }

    getUser()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUserId(session?.user?.id || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    )
  }

  if (!userId) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Please log in to view your todos.</p>
      </div>
    )
  }

  return <TodoList userId={userId} />
}
