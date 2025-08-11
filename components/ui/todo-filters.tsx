"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Filter } from "lucide-react"
import type { TodoFilter } from "@/lib/supabase/client"

interface TodoFiltersProps {
  filter: TodoFilter
  setFilter: (filter: TodoFilter) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  stats: {
    total: number
    completed: number
    pending: number
    overdue: number
  }
}

export function TodoFilters({ filter, setFilter, searchQuery, setSearchQuery, stats }: TodoFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          All
          <Badge variant="secondary">{stats.total}</Badge>
        </Button>
        <Button
          variant={filter === "pending" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("pending")}
          className="flex items-center gap-2"
        >
          Pending
          <Badge variant="secondary">{stats.pending}</Badge>
        </Button>
        <Button
          variant={filter === "completed" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("completed")}
          className="flex items-center gap-2"
        >
          Completed
          <Badge variant="secondary">{stats.completed}</Badge>
        </Button>
        {stats.overdue > 0 && (
          <Badge variant="destructive" className="flex items-center gap-1">
            Overdue: {stats.overdue}
          </Badge>
        )}
      </div>
    </div>
  )
}

export default TodoFilters
