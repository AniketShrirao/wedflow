import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'todoTemplate',
    title: 'Todo Template',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Task Title',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'description',
            title: 'Task Description',
            type: 'text',
        }),
        defineField({
            name: 'category',
            title: 'Category',
            type: 'string',
            options: {
                list: [
                    { title: 'Venue', value: 'venue' },
                    { title: 'Catering', value: 'catering' },
                    { title: 'Photography', value: 'photography' },
                    { title: 'Decorations', value: 'decorations' },
                    { title: 'Invitations', value: 'invitations' },
                    { title: 'Attire', value: 'attire' },
                    { title: 'Transportation', value: 'transportation' },
                    { title: 'Music & Entertainment', value: 'entertainment' },
                    { title: 'Legal & Documentation', value: 'legal' },
                    { title: 'Beauty & Wellness', value: 'beauty' },
                    { title: 'Gifts & Registry', value: 'gifts' },
                    { title: 'Honeymoon', value: 'honeymoon' },
                    { title: 'General', value: 'general' },
                ],
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'timeframe',
            title: 'Recommended Timeframe',
            type: 'string',
            description: 'When this task should typically be completed (e.g., "6-8 months before", "1 week before")',
        }),
        defineField({
            name: 'priority',
            title: 'Priority Level',
            type: 'string',
            options: {
                list: [
                    { title: 'High', value: 'high' },
                    { title: 'Medium', value: 'medium' },
                    { title: 'Low', value: 'low' },
                ],
            },
            initialValue: 'medium',
        }),
        defineField({
            name: 'estimatedDuration',
            title: 'Estimated Duration',
            type: 'string',
            description: 'How long this task typically takes (e.g., "2-3 hours", "1 day")',
        }),
        defineField({
            name: 'tips',
            title: 'Tips & Notes',
            type: 'array',
            of: [{ type: 'string' }],
            description: 'Helpful tips or notes for completing this task',
        }),
        defineField({
            name: 'isActive',
            title: 'Active Template',
            type: 'boolean',
            initialValue: true,
        }),
        defineField({
            name: 'order',
            title: 'Display Order',
            type: 'number',
            description: 'Order in which this task should appear in the list',
        }),
    ],
    orderings: [
        {
            title: 'Category, Priority',
            name: 'categoryPriority',
            by: [
                { field: 'category', direction: 'asc' },
                { field: 'priority', direction: 'desc' },
            ],
        },
        {
            title: 'Display Order',
            name: 'displayOrder',
            by: [{ field: 'order', direction: 'asc' }],
        },
    ],
    preview: {
        select: {
            title: 'title',
            subtitle: 'category',
            description: 'timeframe',
        },
        prepare(selection) {
            const { title, subtitle, description } = selection
            return {
                title,
                subtitle: `${subtitle} ${description ? `• ${description}` : ''}`,
            }
        },
    },
})