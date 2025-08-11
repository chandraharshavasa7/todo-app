"use client"

import { useState, useMemo } from "react"
import { useTodos } from "@/hooks/use-todos"
import TodoItem from "@/components/ui/todo-item"
import TodoFilters from "@/components/ui/todo-filters"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, CheckCircle, Clock, AlertTriangle } from "lucide-react"
import type { TodoFilter, TodoPriority } from "@/lib/supabase/client"

interface TodoListProps {
  userId: string
}

export default function TodoList({ userId }: TodoListProps) {
  const { todos, loading, error } = useTodos(userId)
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<TodoFilter>("all")
  const [priorityFilter, setPriorityFilter] = useState<TodoPriority | "all">("all")
  const [showOverdue, setShowOverdue] = useState(false)

  const filteredTodos = useMemo(() => {
    if (!todos) return []

    return todos.filter((todo) => {
      const matchesSearch =
        todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (todo.description && todo.description.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesStatus =
        filter === "all" || (filter === "completed" && todo.completed) || (filter === "pending" && !todo.completed)

      const matchesPriority = priorityFilter === "all" || todo.priority === priorityFilter

      const isOverdue = todo.due_date && new Date(todo.due_date) < new Date() && !todo.completed
      const matchesOverdue = !showOverdue || isOverdue

      return matchesSearch && matchesStatus && matchesPriority && matchesOverdue
    })
  }, [todos, searchQuery, filter, priorityFilter, showOverdue])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading todos...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        <p>Error loading todos: {error}</p>
      </div>
    )
  }

  const pendingTodos = filteredTodos.filter((todo) => !todo.completed)
  const completedTodos = filteredTodos.filter((todo) => todo.completed)
  const overdueTodos =
    todos?.filter((todo) => todo.due_date && new Date(todo.due_date) < new Date() && !todo.completed) || []

  const totalTodos = todos?.length || 0
  const completedCount = todos?.filter((todo) => todo.completed).length || 0
  const pendingCount = totalTodos - completedCount
  const overdueCount = overdueTodos.length

  const stats = {
    total: totalTodos,
    completed: completedCount,
    pending: pendingCount,
    overdue: overdueCount,
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold">{totalTodos}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-5 w-5 text-orange-500" />
            </div>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold">{completedCount}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div className="text-2xl font-bold">{overdueCount}</div>
            <div className="text-sm text-muted-foreground">Overdue</div>
          </CardContent>
        </Card>
      </div>

      <TodoFilters
        filter={filter}
        setFilter={setFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        stats={stats}
      />

      {filteredTodos.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>
            {todos?.length === 0
              ? "No todos yet. Create your first todo above!"
              : "No todos match your current filters."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingTodos.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                Pending ({pendingTodos.length})
                <span
                  className="inline-flex h-2 w-2 rounded-full bg-green-500 animate-pulse"
                  title="Real-time updates active"
                />
              </h2>
              <div className="space-y-3">
                {pendingTodos.map((todo) => (
                  <TodoItem key={todo.id} todo={todo} />
                ))}
              </div>
            </div>
          )}

          {completedTodos.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Completed ({completedTodos.length})</h2>
              <div className="space-y-3">
                {completedTodos.map((todo) => (
                  <TodoItem key={todo.id} todo={todo} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
