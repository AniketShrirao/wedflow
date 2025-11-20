import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'vendorCategory',
    title: 'Vendor Category',
    type: 'document',
    fields: [
        defineField({
            name: 'name',
            title: 'Category Name',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'slug',
            title: 'Category Slug',
            type: 'slug',
            options: {
                source: 'name',
                maxLength: 50,
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'description',
            title: 'Description',
            type: 'text',
        }),
        defineField({
            name: 'icon',
            title: 'Icon',
            type: 'string',
            description: 'Lucide icon name for this category',
        }),
        defineField({
            name: 'commonServices',
            title: 'Common Services',
            type: 'array',
            of: [{ type: 'string' }],
            description: 'List of common services provided by vendors in this category',
        }),
        defineField({
            name: 'averageCost',
            title: 'Average Cost Range',
            type: 'object',
            fields: [
                {
                    name: 'min',
                    title: 'Minimum Cost',
                    type: 'number',
                },
                {
                    name: 'max',
                    title: 'Maximum Cost',
                    type: 'number',
                },
                {
                    name: 'currency',
                    title: 'Currency',
                    type: 'string',
                    initialValue: 'INR',
                },
            ],
        }),
        defineField({
            name: 'bookingTimeframe',
            title: 'Recommended Booking Timeframe',
            type: 'string',
            description: 'When to typically book vendors in this category (e.g., "6-8 months before")',
        }),
        defineField({
            name: 'questionsToAsk',
            title: 'Questions to Ask Vendors',
            type: 'array',
            of: [{ type: 'string' }],
            description: 'Suggested questions couples should ask vendors in this category',
        }),
        defineField({
            name: 'isActive',
            title: 'Active Category',
            type: 'boolean',
            initialValue: true,
        }),
        defineField({
            name: 'order',
            title: 'Display Order',
            type: 'number',
            description: 'Order in which this category should appear',
        }),
    ],
    orderings: [
        {
            title: 'Display Order',
            name: 'displayOrder',
            by: [{ field: 'order', direction: 'asc' }],
        },
        {
            title: 'Name',
            name: 'name',
            by: [{ field: 'name', direction: 'asc' }],
        },
    ],
    preview: {
        select: {
            title: 'name',
            subtitle: 'description',
        },
    },
})