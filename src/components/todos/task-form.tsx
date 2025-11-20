'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { DEFAULT_TODO_CATEGORIES } from '@/lib/types/todos'
import { TodoTask } from '@/lib/types/database'

interface TaskFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: TaskFormData) => Promise<void>
    task?: TodoTask | null
    customCategories?: string[]
}

export interface TaskFormData {
    title: string
    description: string
    category: string
    due_date: string
}

export function TaskForm({ 
    open, 
    onOpenChange, 
    onSubmit, 
    task = null,
    customCategories = []
}: TaskFormProps) {
    const [formData, setFormData] = useState<TaskFormData>({
        title: task?.title || '',
        description: task?.description || '',
        category: task?.category || '',
        due_date: task?.due_date || ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Combine default categories with custom ones
    const allCategories = [...DEFAULT_TODO_CATEGORIES, ...customCategories.filter(cat => 
        !DEFAULT_TODO_CATEGORIES.includes(cat as any)
    )]

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!formData.title.trim() || !formData.category) {
            return
        }

        setIsSubmitting(true)
        try {
            await onSubmit(formData)
            if (!task) {
                // Reset form for new tasks
                setFormData({
                    title: '',
                    description: '',
                    category: '',
                    due_date: ''
                })
            }
            onOpenChange(false)
        } catch (error) {
            console.error('Error submitting task:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen && !isSubmitting) {
            // Reset form when closing
            setFormData({
                title: task?.title || '',
                description: task?.description || '',
                category: task?.category || '',
                due_date: task?.due_date || ''
            })
        }
        onOpenChange(newOpen)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {task ? 'Edit Task' : 'Add New Task'}
                    </DialogTitle>
                    <DialogDescription>
                        {task 
                            ? 'Update your wedding planning task details.'
                            : 'Create a new task for your wedding planning checklist.'
                        }
                    </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Task Title *</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Enter task title"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Add task description (optional)"
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select
                            value={formData.category}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                            required
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                {allCategories.map((category) => (
                                    <SelectItem key={category} value={category}>
                                        {category}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="due_date">Due Date</Label>
                        <Input
                            id="due_date"
                            type="date"
                            value={formData.due_date}
                            onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting || !formData.title.trim() || !formData.category}>
                            {isSubmitting ? 'Saving...' : (task ? 'Update Task' : 'Add Task')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}