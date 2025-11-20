'use client'

import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, AlertTriangle, ListTodo } from 'lucide-react'
import { TodoStats, TodoCategory } from '@/lib/types/todos'

interface ProgressTrackerProps {
    stats: TodoStats
    categories: TodoCategory[]
    loading?: boolean
}

export function ProgressTracker({ stats, categories, loading = false }: ProgressTrackerProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="pb-2">
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 bg-gray-200 rounded animate-pulse w-12 mb-2" />
                            <div className="h-2 bg-gray-200 rounded animate-pulse w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    const statCards = [
        {
            title: 'Total Tasks',
            value: stats.total,
            icon: ListTodo,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
        {
            title: 'Completed',
            value: stats.completed,
            icon: CheckCircle,
            color: 'text-green-600',
            bgColor: 'bg-green-50'
        },
        {
            title: 'Pending',
            value: stats.pending,
            icon: Clock,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50'
        },
        {
            title: 'Overdue',
            value: stats.overdue,
            icon: AlertTriangle,
            color: 'text-red-600',
            bgColor: 'bg-red-50'
        }
    ]

    return (
        <div className="space-y-6">
            {/* Overall Progress */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Wedding Planning Progress</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Overall Completion</span>
                            <span className="font-medium">{stats.completionPercentage}%</span>
                        </div>
                        <Progress value={stats.completionPercentage} className="h-2" />
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>{stats.completed} of {stats.total} tasks completed</span>
                            {stats.overdue > 0 && (
                                <span className="text-red-600">{stats.overdue} overdue</span>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat) => (
                    <Card key={stat.title}>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">{stat.title}</p>
                                    <p className="text-lg font-semibold">{stat.value}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Category Progress */}
            {categories.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Progress by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {categories.map((category) => {
                                const percentage = category.count > 0 
                                    ? Math.round((category.completedCount / category.count) * 100) 
                                    : 0
                                
                                return (
                                    <div key={category.name} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm font-medium">{category.name}</span>
                                                <Badge variant="secondary" className="text-xs">
                                                    {category.completedCount}/{category.count}
                                                </Badge>
                                            </div>
                                            <span className="text-xs text-gray-500">{percentage}%</span>
                                        </div>
                                        <Progress value={percentage} className="h-1.5" />
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}