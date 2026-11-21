import { defineStore } from "pinia"
import { ref } from "vue"

export interface Task {
  id: number
  title: string
  completed: boolean
}

const API_BASE = ""

export const useTaskStore = defineStore("tasks", () => {
  const tasks = ref<Task[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchTasks() {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(`${API_BASE}/api/tasks`)
      if (!response.ok) throw new Error("Failed to fetch tasks")
      tasks.value = await response.json()
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Unknown error"
    } finally {
      loading.value = false
    }
  }

  async function addTask(title: string) {
    error.value = null
    try {
      const response = await fetch(`${API_BASE}/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      })
      if (!response.ok) throw new Error("Failed to add task")
      const newTask = await response.json()
      tasks.value.unshift(newTask)
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Unknown error"
    }
  }

  async function toggleTask(id: number) {
    const task = tasks.value.find((t) => t.id === id)
    if (!task) return

    error.value = null
    try {
      const response = await fetch(`${API_BASE}/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !task.completed }),
      })
      if (!response.ok) throw new Error("Failed to update task")
      const updated = await response.json()
      const index = tasks.value.findIndex((t) => t.id === id)
      if (index !== -1) tasks.value[index] = updated
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Unknown error"
    }
  }

  async function deleteTask(id: number) {
    error.value = null
    try {
      const response = await fetch(`${API_BASE}/api/tasks/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete task")
      tasks.value = tasks.value.filter((t) => t.id !== id)
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Unknown error"
    }
  }

  return { tasks, loading, error, fetchTasks, addTask, toggleTask, deleteTask }
})
