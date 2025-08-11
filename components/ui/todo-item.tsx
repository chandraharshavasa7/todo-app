"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Edit, Check, X, Calendar, AlertTriangle } from "lucide-react"
import { toggleTodo, deleteTodo, updateTodo } from "@/lib/todo-actions"
import type { Todo } from "@/lib/supabase/client"
import { useActionState } from "react"

interface TodoItemProps {
  todo: Todo
}

export default function TodoItem({ todo }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [editState, editAction] = useActionState(updateTodo, null)

  const handleToggle = () => {
    startTransition(() => {
      toggleTodo(todo.id, !todo.completed)
    })
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this todo?")) {
      startTransition(() => {
        deleteTodo(todo.id)
      })
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  const handleSaveEdit = (formData: FormData) => {
    formData.append("todoId", todo.id)
    editAction(formData)
    setIsEditing(false)
  }

  // Check if todo is overdue
  const isOverdue = todo.due_date && new Date(todo.due_date) < new Date() && !todo.completed
  const isDueSoon =
    todo.due_date && new Date(todo.due_date) <= new Date(Date.now() + 24 * 60 * 60 * 1000) && !todo.completed

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (isEditing) {
    return (
      <Card>
        <CardContent className="p-4">
          <form action={handleSaveEdit} className="space-y-3">
            <Input name="title" defaultValue={todo.title} placeholder="Todo title" required />
            <Textarea
              name="description"
              defaultValue={todo.description || ""}
              placeholder="Todo description"
              rows={2}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input name="due_date" type="date" defaultValue={todo.due_date || ""} placeholder="Due date" />
              <Select name="priority" defaultValue={todo.priority}>
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm">
                <Check className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={handleCancelEdit}>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`transition-all ${isPending ? "opacity-50" : ""} ${isOverdue ? "border-red-300 bg-red-50" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox checked={todo.completed} onCheckedChange={handleToggle} disabled={isPending} className="mt-1" />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <h3 className={`font-medium ${todo.completed ? "line-through text-muted-foreground" : ""}`}>
                {todo.title}
                {isOverdue && <AlertTriangle className="inline h-4 w-4 ml-2 text-red-500" />}
              </h3>
            </div>

            {todo.description && (
              <p className={`text-sm mt-1 ${todo.completed ? "line-through text-muted-foreground" : "text-gray-600"}`}>
                {todo.description}
              </p>
            )}

            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <Badge variant={todo.completed ? "secondary" : "default"}>
                {todo.completed ? "Completed" : "Pending"}
              </Badge>

              <Badge className={getPriorityColor(todo.priority)}>
                {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)} Priority
              </Badge>

              {todo.due_date && (
                <Badge variant={isOverdue ? "destructive" : isDueSoon ? "secondary" : "outline"}>
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(todo.due_date).toLocaleDateString()}
                  {isOverdue && " (Overdue)"}
                  {isDueSoon && !isOverdue && " (Due Soon)"}
                </Badge>
              )}

              <span className="text-xs text-muted-foreground">
                Created {new Date(todo.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={handleEdit} disabled={isPending}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDelete} disabled={isPending}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
