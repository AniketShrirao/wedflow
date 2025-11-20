'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { MoreHorizontal, Edit, Trash2, Calendar, Clock } from 'lucide-react'
import { TodoTask } from '@/lib/types/database'
import { cn } from '@/lib/utils'

interface TaskListProps {
    tasks: TodoTask[]
    onToggleComplete: (taskId: string, completed: boolean) => Promise<void>
    onEditTask: (task: TodoTask) => void
    onDeleteTask: (taskId: string) => Promise<void>
    loading?: boolean
}

export function TaskList({ 
    tasks, 
    onToggleComplete, 
    onEditTask, 
    onDeleteTask,
    loading = false 
}: TaskListProps) {
    const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null)
    const [togglingTaskId, setTogglingTaskId] = useState<string | null>(null)

    const handleToggleComplete = async (task: TodoTask) => {
        setTogglingTaskId(task.id)
        try {
            await onToggleComplete(task.id, !task.completed)
        } finally {
            setTogglingTaskId(null)
        }
    }

    const handleDeleteTask = async (taskId: string) => {
        try {
            await onDeleteTask(taskId)
        } finally {
            setDeletingTaskId(null)
        }
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return null
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
        })
    }

    const isOverdue = (task: TodoTask) => {
        if (!task.due_date || task.completed) return false
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const dueDate = new Date(task.due_date)
        dueDate.setHours(0, 0, 0, 0)
        return dueDate < today
    }

    const isDueSoon = (task: TodoTask) => {
        if (!task.due_date || task.completed) return false
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const dueDate = new Date(task.due_date)
        dueDate.setHours(0, 0, 0, 0)
        const diffTime = dueDate.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays >= 0 && diffDays <= 3
    }

    if (loading) {
        return (
            <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-3 p-4 border rounded-lg">
                        <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (tasks.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Clock className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
                <p className="text-gray-500">Add your first wedding planning task to get started.</p>
            </div>
        )
    }

    return (
        <>
            <div className="space-y-3">
                {tasks.map((task) => (
                    <div
                        key={task.id}
                        className={cn(
                            "flex items-start space-x-3 p-4 border rounded-lg transition-colors",
                            task.completed ? "bg-gray-50 border-gray-200" : "bg-white border-gray-200 hover:border-gray-300",
                            isOverdue(task) && "border-red-200 bg-red-50"
                        )}
                    >
                        <Checkbox
                            checked={task.completed}
                            onCheckedChange={() => handleToggleComplete(task)}
                            disabled={togglingTaskId === task.id}
                            className="mt-1"
                        />
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <h3 className={cn(
                                        "text-sm font-medium",
                                        task.completed ? "text-gray-500 line-through" : "text-gray-900"
                                    )}>
                                        {task.title}
                                    </h3>
                                    
                                    {task.description && (
                                        <p className={cn(
                                            "mt-1 text-sm",
                                            task.completed ? "text-gray-400" : "text-gray-600"
                                        )}>
                                            {task.description}
                                        </p>
                                    )}
                                    
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge variant="secondary" className="text-xs">
                                            {task.category}
                                        </Badge>
                                        
                                        {task.due_date && (
                                            <div className={cn(
                                                "flex items-center gap-1 text-xs",
                                                isOverdue(task) ? "text-red-600" : 
                                                isDueSoon(task) ? "text-orange-600" : "text-gray-500"
                                            )}>
                                                <Calendar className="w-3 h-3" />
                                                <span>{formatDate(task.due_date)}</span>
                                                {isOverdue(task) && (
                                                    <Badge variant="destructive" className="text-xs ml-1">
                                                        Overdue
                                                    </Badge>
                                                )}
                                                {isDueSoon(task) && !isOverdue(task) && (
                                                    <Badge variant="outline" className="text-xs ml-1 border-orange-200 text-orange-600">
                                                        Due Soon
                                                    </Badge>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onEditTask(task)}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                            onClick={() => setDeletingTaskId(task.id)}
                                            className="text-red-600"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <AlertDialog open={!!deletingTaskId} onOpenChange={() => setDeletingTaskId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Task</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this task? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deletingTaskId && handleDeleteTask(deletingTaskId)}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}