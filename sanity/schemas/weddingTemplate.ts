import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'weddingTemplate',
    title: 'Wedding Template',
    type: 'document',
    fields: [
        defineField({
            name: 'name',
            title: 'Template Name',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'description',
            title: 'Description',
            type: 'text',
        }),
        defineField({
            name: 'preview',
            title: 'Preview Image',
            type: 'image',
            options: {
                hotspot: true,
            },
        }),
        defineField({
            name: 'colorScheme',
            title: 'Color Scheme',
            type: 'object',
            fields: [
                {
                    name: 'primary',
                    title: 'Primary Color',
                    type: 'string',
                    validation: (Rule) => Rule.regex(/^#[0-9A-Fa-f]{6}$/),
                },
                {
                    name: 'secondary',
                    title: 'Secondary Color',
                    type: 'string',
                    validation: (Rule) => Rule.regex(/^#[0-9A-Fa-f]{6}$/),
                },
                {
                    name: 'accent',
                    title: 'Accent Color',
                    type: 'string',
                    validation: (Rule) => Rule.regex(/^#[0-9A-Fa-f]{6}$/),
                },
                {
                    name: 'background',
                    title: 'Background Color',
                    type: 'string',
                    validation: (Rule) => Rule.regex(/^#[0-9A-Fa-f]{6}$/),
                },
            ],
        }),
        defineField({
            name: 'fonts',
            title: 'Font Settings',
            type: 'object',
            fields: [
                {
                    name: 'heading',
                    title: 'Heading Font',
                    type: 'string',
                    options: {
                        list: [
                            { title: 'Playfair Display', value: 'Playfair Display' },
                            { title: 'Montserrat', value: 'Montserrat' },
                            { title: 'Dancing Script', value: 'Dancing Script' },
                            { title: 'Great Vibes', value: 'Great Vibes' },
                            { title: 'Cinzel', value: 'Cinzel' },
                        ],
                    },
                },
                {
                    name: 'body',
                    title: 'Body Font',
                    type: 'string',
                    options: {
                        list: [
                            { title: 'Open Sans', value: 'Open Sans' },
                            { title: 'Lato', value: 'Lato' },
                            { title: 'Roboto', value: 'Roboto' },
                            { title: 'Source Sans Pro', value: 'Source Sans Pro' },
                        ],
                    },
                },
            ],
        }),
        defineField({
            name: 'layout',
            title: 'Layout Configuration',
            type: 'object',
            fields: [
                {
                    name: 'style',
                    title: 'Layout Style',
                    type: 'string',
                    options: {
                        list: [
                            { title: 'Classic', value: 'classic' },
                            { title: 'Modern', value: 'modern' },
                            { title: 'Elegant', value: 'elegant' },
                            { title: 'Rustic', value: 'rustic' },
                            { title: 'Minimalist', value: 'minimalist' },
                        ],
                    },
                },
                {
                    name: 'headerStyle',
                    title: 'Header Style',
                    type: 'string',
                    options: {
                        list: [
                            { title: 'Centered', value: 'centered' },
                            { title: 'Left Aligned', value: 'left' },
                            { title: 'Split', value: 'split' },
                        ],
                    },
                },
            ],
        }),
        defineField({
            name: 'isActive',
            title: 'Active Template',
            type: 'boolean',
            initialValue: true,
        }),
    ],
    preview: {
        select: {
            title: 'name',
            subtitle: 'description',
            media: 'preview',
        },
    },
})