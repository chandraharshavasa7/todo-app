"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

type ActionResponse = { success?: string; error?: string }

// Create a new todo
export async function createTodo(prevState: any, formData: FormData): Promise<ActionResponse> {
  if (!formData) return { error: "Form data is missing" }

  const title = formData.get("title") as string | null
  const description = formData.get("description") as string | null
  const due_date = formData.get("due_date") as string | null
  const priority = (formData.get("priority") as string | null) || "medium"

  if (!title) return { error: "Title is required" }

  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "You must be logged in to create todos" }

    const { error } = await supabase.from("todos").insert({
      title,
      description: description?.trim() || null,
      due_date: due_date?.trim() || null,
      priority: priority as "low" | "medium" | "high",
      user_id: user.id,
    })

    if (error) return { error: error.message }

    revalidatePath("/dashboard")
    return { success: "Todo created successfully" }
  } catch (err) {
    console.error("Create todo error:", err)
    return { error: "An unexpected error occurred" }
  }
}

// Toggle completion
export async function toggleTodo(todoId: string, completed: boolean): Promise<ActionResponse> {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "You must be logged in" }

    const { error } = await supabase
      .from("todos")
      .update({ completed })
      .eq("id", todoId)
      .eq("user_id", user.id)

    if (error) return { error: error.message }

    revalidatePath("/dashboard")
    return { success: "Todo updated successfully" }
  } catch (err) {
    console.error("Toggle todo error:", err)
    return { error: "An unexpected error occurred" }
  }
}

// Update todo
export async function updateTodo(prevState: any, formData: FormData): Promise<ActionResponse> {
  if (!formData) return { error: "Form data is missing" }

  const todoId = formData.get("todoId") as string | null
  const title = formData.get("title") as string | null
  const description = formData.get("description") as string | null
  const due_date = formData.get("due_date") as string | null
  const priority = (formData.get("priority") as string | null) || "medium"

  if (!todoId || !title) return { error: "Todo ID and title are required" }

  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "You must be logged in" }

    const { error } = await supabase
      .from("todos")
      .update({
        title,
        description: description?.trim() || null,
        due_date: due_date?.trim() || null,
        priority: priority as "low" | "medium" | "high",
      })
      .eq("id", todoId)
      .eq("user_id", user.id)

    if (error) return { error: error.message }

    revalidatePath("/dashboard")
    return { success: "Todo updated successfully" }
  } catch (err) {
    console.error("Update todo error:", err)
    return { error: "An unexpected error occurred" }
  }
}

// Delete todo
export async function deleteTodo(todoId: string): Promise<ActionResponse> {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "You must be logged in" }

    const { error } = await supabase
      .from("todos")
      .delete()
      .eq("id", todoId)
      .eq("user_id", user.id)

    if (error) return { error: error.message }

    revalidatePath("/dashboard")
    return { success: "Todo deleted successfully" }
  } catch (err) {
    console.error("Delete todo error:", err)
    return { error: "An unexpected error occurred" }
  }
}
