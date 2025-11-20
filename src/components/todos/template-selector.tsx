'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSanityTodos } from '@/hooks/use-sanity-todos'
import { TodoTemplate } from '@/lib/sanity/service'
import { Loader2, Clock, AlertCircle, CheckCircle2, Plus, Lightbulb } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface TemplateSelectorProps {
  isOpen: boolean
  onClose: () => void
  onAddTasks: (tasks: any[]) => Promise<void>
}

export function TemplateSelector({ isOpen, onClose, onAddTasks }: TemplateSelectorProps) {
  const { templates, loading, error, getCategories, getTemplatesByCategory, createTaskFromTemplate } = useSanityTodos()
  const [selectedTemplates, setSelectedTemplates] = useState<Set<string>>(new Set())
  const [addingTasks, setAddingTasks] = useState(false)
  const { toast } = useToast()

  const categories = getCategories()

  const handleTemplateToggle = (templateId: string) => {
    const newSelected = new Set(selectedTemplates)
    if (newSelected.has(templateId)) {
      newSelected.delete(templateId)
    } else {
      newSelected.add(templateId)
    }
    setSelectedTemplates(newSelected)
  }

  const handleAddSelectedTasks = async () => {
    if (selectedTemplates.size === 0) {
      toast({
        title: 'No templates selected',
        description: 'Please select at least one template to add tasks.',
        variant: 'destructive'
      })
      return
    }

    setAddingTasks(true)
    try {
      const selectedTemplateObjects = templates.filter(t => selectedTemplates.has(t._id))
      const tasksToAdd = selectedTemplateObjects.map(createTaskFromTemplate)
      
      await onAddTasks(tasksToAdd)
      
      toast({
        title: 'Success',
        description: `Added ${tasksToAdd.length} tasks from templates!`
      })
      
      setSelectedTemplates(new Set())
      onClose()
    } catch (error) {
      console.error('Error adding tasks from templates:', error)
      toast({
        title: 'Error',
        description: 'Failed to add tasks from templates. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setAddingTasks(false)
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'low':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive'
      case 'medium':
        return 'secondary'
      case 'low':
        return 'outline'
      default:
        return 'outline'
    }
  }

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Tasks from Templates</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading templates...</span>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Tasks from Templates</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{error}</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Tasks from Templates
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Choose from pre-made wedding planning tasks to add to your todo list.
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Selected Count */}
          {selectedTemplates.size > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                {selectedTemplates.size} template{selectedTemplates.size !== 1 ? 's' : ''} selected
              </p>
            </div>
          )}

          {/* Category Tabs */}
          <Tabs defaultValue={categories[0]} className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6">
              {categories.slice(0, 6).map((category) => (
                <TabsTrigger key={category} value={category} className="text-xs">
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category} value={category} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getTemplatesByCategory(category).map((template) => (
                    <Card 
                      key={template._id} 
                      className={`cursor-pointer transition-all ${
                        selectedTemplates.has(template._id) 
                          ? 'ring-2 ring-blue-500 bg-blue-50' 
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => handleTemplateToggle(template._id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-base leading-tight">
                              {template.title}
                            </CardTitle>
                            {template.description && (
                              <CardDescription className="text-sm mt-1">
                                {template.description}
                              </CardDescription>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-2">
                            {getPriorityIcon(template.priority)}
                            <input
                              type="checkbox"
                              checked={selectedTemplates.has(template._id)}
                              onChange={() => handleTemplateToggle(template._id)}
                              className="rounded"
                            />
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0 space-y-3">
                        {/* Priority and Timeframe */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={getPriorityColor(template.priority) as any}>
                            {template.priority} priority
                          </Badge>
                          {template.timeframe && (
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {template.timeframe}
                            </Badge>
                          )}
                          {template.estimatedDuration && (
                            <Badge variant="outline" className="text-xs">
                              {template.estimatedDuration}
                            </Badge>
                          )}
                        </div>

                        {/* Tips */}
                        {template.tips && template.tips.length > 0 && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Lightbulb className="h-3 w-3" />
                              <span>Tips:</span>
                            </div>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {template.tips.slice(0, 2).map((tip, index) => (
                                <li key={index} className="flex items-start gap-1">
                                  <span className="text-blue-500 mt-0.5">•</span>
                                  <span>{tip}</span>
                                </li>
                              ))}
                              {template.tips.length > 2 && (
                                <li className="text-blue-600">
                                  +{template.tips.length - 2} more tips
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {getTemplatesByCategory(category).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No templates available for {category}</p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddSelectedTasks}
              disabled={selectedTemplates.size === 0 || addingTasks}
            >
              {addingTasks ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Adding Tasks...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add {selectedTemplates.size} Task{selectedTemplates.size !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}