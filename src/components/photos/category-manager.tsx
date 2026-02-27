'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Folder as FolderIcon, Plus, Trash2, AlertCircle, CheckCircle, Loader, Tag as CategoryIcon } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { type Category } from '@/lib/services/photo-service'

interface CategoryManagerProps {
  coupleId?: string
  className?: string
}

export function CategoryManager({ coupleId, className = '' }: CategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [newcategoryName, setNewcategoryName] = useState('')
  const [creationError, setCreationError] = useState<string | null>(null)
  const [creationSuccess, setCreationSuccess] = useState(false)
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null)
  const { toast } = useToast()

  type ToastVariant = 'default' | 'error' | 'success' | 'warning' | 'info'

  // Fetch categories on mount
  useEffect(() => {
    fetchCategorys()
  }, [coupleId])

  const fetchCategorys = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/photos/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load categories',
          variant: 'error' as ToastVariant
        })
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      toast({
        title: 'Error',
        description: 'Failed to load categories',
        variant: 'error' as ToastVariant
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreationError(null)
    setCreationSuccess(false)

    // Validate Category Name
    if (!newcategoryName.trim()) {
      setCreationError('Category Name cannot be empty')
      return
    }

    if (newcategoryName.trim().length > 100) {
      setCreationError('Category Name must be 100 characters or less')
      return
    }

    // Check if Category Name already exists
    if (categories.some(f => f.category_name.toLowerCase() === newcategoryName.trim().toLowerCase())) {
      setCreationError('A Category with this name already exists')
      return
    }

    try {
      setIsCreating(true)
      const response = await fetch('/api/photos/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          categoryName: newcategoryName.trim()
        })
      })

      if (response.ok) {
        try {
          const newCategory = await response.json()
          setCategories([...categories, newCategory])
          setNewcategoryName('')
          setCreationSuccess(true)
          toast({
            title: 'Success',
            description: `Category "${newcategoryName.trim()}" created successfully`
          })
          // Clear success message after 3 seconds
          setTimeout(() => setCreationSuccess(false), 3000)
        } catch (parseError) {
          console.error('Failed to parse response:', parseError)
          setCreationError('Failed to parse server response')
        }
      } else if (response.status === 409) {
        setCreationError('A Category with this name already exists')
      } else {
        try {
          const error = await response.json()
          setCreationError(error.error || 'Failed to create Category')
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError)
          setCreationError(`Failed to create Category (Status: ${response.status})`)
        }
      }
    } catch (error) {
      console.error('Failed to create Category:', error)
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      setCreationError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'error' as ToastVariant
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteCategory = async (CategoryId: string, categoryName: string) => {
    if (!confirm(`Are you sure you want to delete the Category "${categoryName}"?`)) {
      return
    }

    try {
      setDeletingCategoryId(CategoryId)
      const response = await fetch(`/api/photos/categories/${CategoryId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setCategories(categories.filter(f => f.id !== CategoryId))
        toast({
          title: 'Success',
          description: `Category "${categoryName}" deleted successfully`
        })
      } else if (response.status === 400) {
        toast({
          title: 'Error',
          description: 'Cannot delete default categories',
          variant: 'error' as ToastVariant
        })
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete Category',
          variant: 'error' as ToastVariant
        })
      }
    } catch (error) {
      console.error('Failed to delete Category:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete Category',
        variant: 'error' as ToastVariant
      })
    } finally {
      setDeletingCategoryId(null)
    }
  }

  const defaultCategories = categories.filter(f => f.category_type === 'default')
  const customCategories = categories.filter(f => f.category_type === 'custom')

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CategoryIcon className="h-5 w-5" />
            Category Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CategoryIcon className="h-5 w-5" />
          Category Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Create New Category Form */}
        <div className="space-y-4 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold">Create Custom Category</h3>
          <form onSubmit={handleCreateCategory} className="space-y-3">
            <div>
              <Label htmlFor="Category-name" className="text-sm">
                Category Name
              </Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="Category-name"
                  placeholder="e.g., Engagement, Rehearsal, Honeymoon"
                  value={newcategoryName}
                  onChange={(e) => {
                    setNewcategoryName(e.target.value)
                    setCreationError(null)
                  }}
                  disabled={isCreating}
                  maxLength={100}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={isCreating || !newcategoryName.trim()}
                  className="gap-2"
                >
                  {isCreating ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Create
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Creation Status Messages */}
            {creationError && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700">{creationError}</p>
              </div>
            )}

            {creationSuccess && (
              <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                <p className="text-sm text-green-700">Category created successfully!</p>
              </div>
            )}
          </form>
        </div>

        {/* Default categories */}
        {defaultCategories.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">Default Categories</h3>
              <Badge variant="secondary" className="text-xs">
                {defaultCategories.length}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {defaultCategories.map(category => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-blue-50 border-blue-200"
                >
                  <div className="flex items-center gap-3">
                    <CategoryIcon className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-sm">{category.category_name}</p>
                      <p className="text-xs text-muted-foreground">Default category</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Default
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom categories */}
        {customCategories.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">Custom Categories</h3>
              <Badge variant="secondary" className="text-xs">
                {customCategories.length}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {customCategories.map(category => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <CategoryIcon className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-sm">{category.category_name}</p>
                      <p className="text-xs text-muted-foreground">Custom category</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCategory(category.id, category.category_name)}
                    disabled={deletingCategoryId === category.id}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {deletingCategoryId === category.id ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {categories.length === 0 && (
          <div className="text-center py-8">
            <CategoryIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
            <p className="text-muted-foreground">No categories available yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create your first Custom category to get started
            </p>
          </div>
        )}

        {/* Info Box */}
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>💡 Tip:</strong> Default categories (Haldi, Sangeet, Wedding, Reception) are automatically created. You can create custom categories for other events or moments.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

