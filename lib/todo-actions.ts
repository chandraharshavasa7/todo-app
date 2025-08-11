"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Create a new todo
export async function createTodo(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const title = formData.get("title")
  const description = formData.get("description")
  const due_date = formData.get("due_date")
  const priority = formData.get("priority") || "medium"

  if (!title) {
    return { error: "Title is required" }
  }

  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "You must be logged in to create todos" }
    }

    const { error } = await supabase.from("todos").insert({
      title: title.toString(),
      description: description?.toString() || null,
      due_date: due_date?.toString() || null,
      priority: priority.toString() as "low" | "medium" | "high",
      user_id: user.id,
    })

    if (error) {
      console.error("Database error:", error)
      return { error: error.message }
    }

    revalidatePath("/dashboard")
    return { success: "Todo created successfully" }
  } catch (error) {
    console.error("Create todo error:", error)
    return { error: "An unexpected error occurred" }
  }
}

// Update todo completion status
export async function toggleTodo(todoId: string, completed: boolean) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("You must be logged in")
    }

    const { error } = await supabase.from("todos").update({ completed }).eq("id", todoId).eq("user_id", user.id)

    if (error) {
      throw new Error(error.message)
    }

    revalidatePath("/dashboard")
  } catch (error) {
    console.error("Toggle todo error:", error)
    throw error
  }
}

// Update todo title and description
export async function updateTodo(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const todoId = formData.get("todoId")
  const title = formData.get("title")
  const description = formData.get("description")
  const due_date = formData.get("due_date")
  const priority = formData.get("priority")

  if (!todoId || !title) {
    return { error: "Todo ID and title are required" }
  }

  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "You must be logged in" }
    }

    const { error } = await supabase
      .from("todos")
      .update({
        title: title.toString(),
        description: description?.toString() || null,
        due_date: due_date?.toString() || null,
        priority: (priority?.toString() as "low" | "medium" | "high") || "medium",
      })
      .eq("id", todoId.toString())
      .eq("user_id", user.id)

    if (error) {
      return { error: error.message }
    }

    revalidatePath("/dashboard")
    return { success: "Todo updated successfully" }
  } catch (error) {
    console.error("Update todo error:", error)
    return { error: "An unexpected error occurred" }
  }
}

// Delete a todo
export async function deleteTodo(todoId: string) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("You must be logged in")
    }

    const { error } = await supabase.from("todos").delete().eq("id", todoId).eq("user_id", user.id)

    if (error) {
      throw new Error(error.message)
    }

    revalidatePath("/dashboard")
  } catch (error) {
    console.error("Delete todo error:", error)
    throw error
  }
}
