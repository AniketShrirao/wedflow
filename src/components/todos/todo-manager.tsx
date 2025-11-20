'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, RefreshCw, BookOpen } from 'lucide-react'
import { TaskForm, TaskFormData } from './task-form'
import { TaskList } from './task-list'
import { ProgressTracker } from './progress-tracker'
import { CategoryFilter } from './category-filter'
import { TemplateSelector } from './template-selector'
import { TodoTask } from '@/lib/types/database'
import { TodoStats, TodoCategory } from '@/lib/types/todos'
import { useToast } from '@/hooks/use-toast'

export function TodoManager() {
    const [tasks, setTasks] = useState<TodoTask[]>([])
    const [stats, setStats] = useState<TodoStats>({
        total: 0,
        completed: 0,
        pending: 0,
        overdue: 0,
        completionPercentage: 0
    })
    const [categories, setCategories] = useState<TodoCategory[]>([])
    const [loading, setLoading] = useState(true)
    const [showTaskForm, setShowTaskForm] = useState(false)
    const [showTemplateSelector, setShowTemplateSelector] = useState(false)
    const [editingTask, setEditingTask] = useState<TodoTask | null>(null)
    const [selectedCategory, setSelectedCategory] = useState('')
    const [completedFilter, setCompletedFilter] = useState('all')
    const { toast } = useToast()

    const fetchTasks = useCallback(async () => {
        try {
            const params = new URLSearchParams()
            if (selectedCategory) params.append('category', selectedCategory)
            if (completedFilter && completedFilter !== 'all') params.append('completed', completedFilter)

            const response = await fetch(`/api/todos?${params}`)
            if (!response.ok) throw new Error('Failed to fetch tasks')
            
            const data = await response.json()
            setTasks(data.tasks || [])
        } catch (error) {
            console.error('Error fetching tasks:', error)
            toast({
                title: 'Error',
                description: 'Failed to load tasks. Please try again.',
                variant: 'destructive'
            })
        }
    }, [selectedCategory, completedFilter])

    const fetchStats = useCallback(async () => {
        try {
            const response = await fetch('/api/todos/stats')
            if (!response.ok) throw new Error('Failed to fetch stats')
            
            const data = await response.json()
            setStats(data.stats || {
                total: 0,
                completed: 0,
                pending: 0,
                overdue: 0,
                completionPercentage: 0
            })
            setCategories(data.categories || [])
        } catch (error) {
            console.error('Error fetching stats:', error)
            toast({
                title: 'Error',
                description: 'Failed to load statistics. Please try again.',
                variant: 'destructive'
            })
        }
    }, [])

    const loadData = useCallback(async () => {
        setLoading(true)
        await Promise.all([fetchTasks(), fetchStats()])
        setLoading(false)
    }, [fetchTasks, fetchStats])

    // Initial load
    useEffect(() => {
        const initialLoad = async () => {
            setLoading(true)
            await Promise.all([fetchTasks(), fetchStats()])
            setLoading(false)
        }
        initialLoad()
    }, [])

    // Reload tasks when filters change
    useEffect(() => {
        fetchTasks()
    }, [fetchTasks])

    const handleCreateTask = async (data: TaskFormData) => {
        try {
            const response = await fetch('/api/todos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })

            if (!response.ok) throw new Error('Failed to create task')

            toast({
                title: 'Success',
                description: 'Task created successfully!'
            })

            await loadData()
        } catch (error) {
            console.error('Error creating task:', error)
            toast({
                title: 'Error',
                description: 'Failed to create task. Please try again.',
                variant: 'destructive'
            })
            throw error
        }
    }

    const handleUpdateTask = async (data: TaskFormData) => {
        if (!editingTask) return

        try {
            const response = await fetch(`/api/todos/${editingTask.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })

            if (!response.ok) throw new Error('Failed to update task')

            toast({
                title: 'Success',
                description: 'Task updated successfully!'
            })

            setEditingTask(null)
            await loadData()
        } catch (error) {
            console.error('Error updating task:', error)
            toast({
                title: 'Error',
                description: 'Failed to update task. Please try again.',
                variant: 'destructive'
            })
            throw error
        }
    }

    const handleToggleComplete = async (taskId: string, completed: boolean) => {
        try {
            const response = await fetch(`/api/todos/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed })
            })

            if (!response.ok) throw new Error('Failed to update task')

            // Update local state immediately for better UX
            setTasks(prev => prev.map(task => 
                task.id === taskId ? { ...task, completed } : task
            ))

            // Refresh stats
            await fetchStats()

            toast({
                title: 'Success',
                description: completed ? 'Task marked as completed!' : 'Task marked as pending.'
            })
        } catch (error) {
            console.error('Error toggling task completion:', error)
            toast({
                title: 'Error',
                description: 'Failed to update task. Please try again.',
                variant: 'destructive'
            })
            throw error
        }
    }

    const handleDeleteTask = async (taskId: string) => {
        try {
            const response = await fetch(`/api/todos/${taskId}`, {
                method: 'DELETE'
            })

            if (!response.ok) throw new Error('Failed to delete task')

            toast({
                title: 'Success',
                description: 'Task deleted successfully!'
            })

            await loadData()
        } catch (error) {
            console.error('Error deleting task:', error)
            toast({
                title: 'Error',
                description: 'Failed to delete task. Please try again.',
                variant: 'destructive'
            })
            throw error
        }
    }

    const handleEditTask = (task: TodoTask) => {
        setEditingTask(task)
        setShowTaskForm(true)
    }

    const handleCloseTaskForm = () => {
        setShowTaskForm(false)
        setEditingTask(null)
    }

    const handleAddTasksFromTemplates = async (tasks: any[]) => {
        try {
            // Add each task via API
            const promises = tasks.map(task => 
                fetch('/api/todos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(task)
                })
            )

            const responses = await Promise.all(promises)
            const failedRequests = responses.filter(r => !r.ok)
            
            if (failedRequests.length > 0) {
                throw new Error(`Failed to create ${failedRequests.length} tasks`)
            }

            await loadData()
        } catch (error) {
            console.error('Error adding tasks from templates:', error)
            throw error
        }
    }

    const customCategories = categories
        .map(cat => cat.name)
        .filter(name => !['Venue & Catering', 'Photography & Videography', 'Decorations & Flowers', 
                         'Music & Entertainment', 'Invitations & Stationery', 'Attire & Beauty', 
                         'Transportation', 'Legal & Documentation', 'Honeymoon Planning', 'Miscellaneous'].includes(name))

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Wedding Todo Planner</h1>
                    <p className="text-gray-600">Keep track of your wedding planning tasks and progress</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={loadData}
                        disabled={loading}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setShowTemplateSelector(true)}
                    >
                        <BookOpen className="h-4 w-4 mr-2" />
                        Add from Templates
                    </Button>
                    <Button onClick={() => setShowTaskForm(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Task
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="tasks" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="tasks">Tasks</TabsTrigger>
                    <TabsTrigger value="progress">Progress</TabsTrigger>
                </TabsList>

                <TabsContent value="tasks" className="space-y-6">
                    <CategoryFilter
                        categories={categories}
                        selectedCategory={selectedCategory}
                        onCategoryChange={setSelectedCategory}
                        completedFilter={completedFilter}
                        onCompletedFilterChange={setCompletedFilter}
                    />

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>
                                    {selectedCategory ? `${selectedCategory} Tasks` : 'All Tasks'}
                                    {!loading && (
                                        <span className="ml-2 text-sm font-normal text-gray-500">
                                            ({tasks.length} {tasks.length === 1 ? 'task' : 'tasks'})
                                        </span>
                                    )}
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <TaskList
                                tasks={tasks}
                                onToggleComplete={handleToggleComplete}
                                onEditTask={handleEditTask}
                                onDeleteTask={handleDeleteTask}
                                loading={loading}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="progress" className="space-y-6">
                    <ProgressTracker
                        stats={stats}
                        categories={categories}
                        loading={loading}
                    />
                </TabsContent>
            </Tabs>

            <TaskForm
                open={showTaskForm}
                onOpenChange={handleCloseTaskForm}
                onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
                task={editingTask}
                customCategories={customCategories}
            />

            <TemplateSelector
                isOpen={showTemplateSelector}
                onClose={() => setShowTemplateSelector(false)}
                onAddTasks={handleAddTasksFromTemplates}
            />
        </div>
    )
}