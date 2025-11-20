'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Filter } from 'lucide-react'
import { useState } from 'react'
import { TodoCategory } from '@/lib/types/todos'

interface CategoryFilterProps {
    categories: TodoCategory[]
    selectedCategory: string
    onCategoryChange: (category: string) => void
    completedFilter: string
    onCompletedFilterChange: (filter: string) => void
    onAddCustomCategory?: (category: string) => void
}

export function CategoryFilter({
    categories,
    selectedCategory,
    onCategoryChange,
    completedFilter,
    onCompletedFilterChange,
    onAddCustomCategory
}: CategoryFilterProps) {
    const [showAddCategory, setShowAddCategory] = useState(false)
    const [newCategoryName, setNewCategoryName] = useState('')

    const handleAddCategory = () => {
        if (newCategoryName.trim() && onAddCustomCategory) {
            onAddCustomCategory(newCategoryName.trim())
            setNewCategoryName('')
            setShowAddCategory(false)
        }
    }

    const totalTasks = categories.reduce((sum, cat) => sum + cat.count, 0)
    const completedTasks = categories.reduce((sum, cat) => sum + cat.completedCount, 0)

    return (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-2 items-center">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Filter by:</span>
                
                {/* Category Filter */}
                <div className="flex flex-wrap gap-1">
                    <Button
                        variant={selectedCategory === '' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => onCategoryChange('')}
                        className="h-8"
                    >
                        All
                        <Badge variant="secondary" className="ml-1 text-xs">
                            {totalTasks}
                        </Badge>
                    </Button>
                    
                    {categories.map((category) => (
                        <Button
                            key={category.name}
                            variant={selectedCategory === category.name ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => onCategoryChange(category.name)}
                            className="h-8"
                        >
                            {category.name}
                            <Badge variant="secondary" className="ml-1 text-xs">
                                {category.count}
                            </Badge>
                        </Button>
                    ))}
                </div>

                {/* Add Custom Category */}
                {onAddCustomCategory && (
                    <Dialog open={showAddCategory} onOpenChange={setShowAddCategory}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8">
                                <Plus className="h-3 w-3 mr-1" />
                                Add Category
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Add Custom Category</DialogTitle>
                                <DialogDescription>
                                    Create a new category for organizing your wedding tasks.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="category-name">Category Name</Label>
                                    <Input
                                        id="category-name"
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        placeholder="Enter category name"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault()
                                                handleAddCategory()
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowAddCategory(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleAddCategory}
                                    disabled={!newCategoryName.trim()}
                                >
                                    Add Category
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {/* Completion Status Filter */}
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Status:</span>
                <Select value={completedFilter} onValueChange={onCompletedFilterChange}>
                    <SelectTrigger className="w-32 h-8">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Tasks</SelectItem>
                        <SelectItem value="false">Pending</SelectItem>
                        <SelectItem value="true">Completed</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}