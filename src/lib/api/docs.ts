/**
 * API Documentation and Testing Utilities
 * 
 * This file provides documentation and testing utilities for the Wedflow API.
 * It includes endpoint documentation, example requests/responses, and testing helpers.
 */

export interface ApiEndpoint {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE'
    path: string
    description: string
    auth: boolean
    parameters?: {
        path?: Record<string, string>
        query?: Record<string, string>
        body?: Record<string, any>
    }
    responses: {
        [statusCode: number]: {
            description: string
            example: any
        }
    }
}

export const API_ENDPOINTS: Record<string, ApiEndpoint[]> = {
    guests: [
        {
            method: 'GET',
            path: '/api/guests',
            description: 'Get paginated list of guests with optional filtering',
            auth: true,
            parameters: {
                query: {
                    page: 'Page number (default: 1)',
                    limit: 'Items per page (default: 10, max: 100)',
                    search: 'Search by name, phone, or email',
                    group: 'Filter by group name',
                    status: 'Filter by invitation status (pending, sent, viewed)'
                }
            },
            responses: {
                200: {
                    description: 'List of guests with pagination',
                    example: {
                        guests: [
                            {
                                id: 'uuid',
                                name: 'John Doe',
                                phone: '+1234567890',
                                email: 'john@example.com',
                                group_name: 'Family',
                                invite_status: 'sent',
                                created_at: '2024-01-01T00:00:00Z'
                            }
                        ],
                        pagination: {
                            page: 1,
                            limit: 10,
                            total: 25,
                            totalPages: 3
                        }
                    }
                },
                401: {
                    description: 'Unauthorized',
                    example: { error: 'Unauthorized' }
                }
            }
        },
        {
            method: 'POST',
            path: '/api/guests',
            description: 'Create a new guest',
            auth: true,
            parameters: {
                body: {
                    name: 'Guest name (required)',
                    phone: 'Phone number (required)',
                    email: 'Email address (optional)',
                    group_name: 'Group name (optional)'
                }
            },
            responses: {
                201: {
                    description: 'Guest created successfully',
                    example: {
                        id: 'uuid',
                        name: 'John Doe',
                        phone: '+1234567890',
                        email: 'john@example.com',
                        group_name: 'Family',
                        invite_status: 'pending',
                        created_at: '2024-01-01T00:00:00Z'
                    }
                },
                400: {
                    description: 'Validation error',
                    example: { error: 'Name and phone are required' }
                }
            }
        },
        {
            method: 'PUT',
            path: '/api/guests/[id]',
            description: 'Update an existing guest',
            auth: true,
            parameters: {
                path: { id: 'Guest ID' },
                body: {
                    name: 'Guest name',
                    phone: 'Phone number',
                    email: 'Email address',
                    group_name: 'Group name',
                    invite_status: 'Invitation status'
                }
            },
            responses: {
                200: {
                    description: 'Guest updated successfully',
                    example: {
                        id: 'uuid',
                        name: 'John Doe Updated',
                        phone: '+1234567890',
                        email: 'john.updated@example.com'
                    }
                },
                404: {
                    description: 'Guest not found',
                    example: { error: 'Guest not found' }
                }
            }
        },
        {
            method: 'DELETE',
            path: '/api/guests/[id]',
            description: 'Delete a guest',
            auth: true,
            parameters: {
                path: { id: 'Guest ID' }
            },
            responses: {
                200: {
                    description: 'Guest deleted successfully',
                    example: { message: 'Guest deleted successfully' }
                },
                404: {
                    description: 'Guest not found',
                    example: { error: 'Guest not found' }
                }
            }
        }
    ],
    contacts: [
        {
            method: 'GET',
            path: '/api/contacts',
            description: 'Get paginated list of vendor contacts with optional filtering',
            auth: true,
            parameters: {
                query: {
                    page: 'Page number (default: 1)',
                    limit: 'Items per page (default: 10, max: 100)',
                    search: 'Search by name, phone, or email',
                    category: 'Filter by vendor category'
                }
            },
            responses: {
                200: {
                    description: 'List of vendor contacts with pagination',
                    example: {
                        contacts: [
                            {
                                id: 'uuid',
                                name: 'ABC Decorators',
                                phone: '+1234567890',
                                email: 'contact@abcdecorators.com',
                                category: 'decorator',
                                notes: 'Specializes in floral arrangements',
                                created_at: '2024-01-01T00:00:00Z'
                            }
                        ],
                        pagination: {
                            page: 1,
                            limit: 10,
                            total: 15,
                            totalPages: 2
                        }
                    }
                }
            }
        },
        {
            method: 'POST',
            path: '/api/contacts',
            description: 'Create a new vendor contact',
            auth: true,
            parameters: {
                body: {
                    name: 'Vendor name (required)',
                    phone: 'Phone number (required)',
                    email: 'Email address (optional)',
                    category: 'Vendor category (required)',
                    notes: 'Additional notes (optional)'
                }
            },
            responses: {
                201: {
                    description: 'Vendor contact created successfully',
                    example: {
                        id: 'uuid',
                        name: 'ABC Decorators',
                        phone: '+1234567890',
                        category: 'decorator',
                        created_at: '2024-01-01T00:00:00Z'
                    }
                }
            }
        }
    ],
    events: [
        {
            method: 'GET',
            path: '/api/events',
            description: 'Get event details for the couple',
            auth: true,
            responses: {
                200: {
                    description: 'Event details',
                    example: {
                        couple_intro: 'We are excited to celebrate our special day with you!',
                        events: [
                            {
                                id: 'uuid',
                                name: 'Wedding Ceremony',
                                date: '2024-06-15',
                                time: '16:00',
                                description: 'The main wedding ceremony'
                            }
                        ],
                        venues: [
                            {
                                id: 'uuid',
                                name: 'Grand Ballroom',
                                address: '123 Wedding St, City, State',
                                description: 'Beautiful venue with garden views'
                            }
                        ],
                        timeline: [
                            {
                                id: 'uuid',
                                time: '15:30',
                                event: 'Guest arrival',
                                description: 'Welcome drinks and mingling'
                            }
                        ]
                    }
                }
            }
        },
        {
            method: 'PUT',
            path: '/api/events',
            description: 'Update event details',
            auth: true,
            parameters: {
                body: {
                    couple_intro: 'Couple introduction text',
                    events: 'Array of event objects',
                    venues: 'Array of venue objects',
                    timeline: 'Array of timeline objects'
                }
            },
            responses: {
                200: {
                    description: 'Event details updated successfully',
                    example: {
                        id: 'uuid',
                        couple_intro: 'Updated introduction',
                        events: [],
                        venues: [],
                        timeline: []
                    }
                }
            }
        }
    ],
    photos: [
        {
            method: 'GET',
            path: '/api/photos',
            description: 'Get photo collection details',
            auth: true,
            responses: {
                200: {
                    description: 'Photo collection data',
                    example: {
                        drive_folder_url: 'https://drive.google.com/drive/folders/...',
                        categories: [
                            {
                                id: 'haldi',
                                name: 'Haldi Ceremony',
                                photos: [
                                    {
                                        id: 'uuid',
                                        url: 'https://drive.google.com/file/d/...',
                                        thumbnail: 'https://drive.google.com/thumbnail/...'
                                    }
                                ]
                            }
                        ],
                        highlight_photos: ['photo-id-1', 'photo-id-2']
                    }
                }
            }
        },
        {
            method: 'PUT',
            path: '/api/photos',
            description: 'Update photo collection',
            auth: true,
            parameters: {
                body: {
                    categories: 'Array of photo categories',
                    highlight_photos: 'Array of highlight photo IDs'
                }
            },
            responses: {
                200: {
                    description: 'Photo collection updated successfully',
                    example: {
                        id: 'uuid',
                        categories: [],
                        highlight_photos: []
                    }
                }
            }
        }
    ],
    gifts: [
        {
            method: 'GET',
            path: '/api/gifts',
            description: 'Get gift settings',
            auth: true,
            responses: {
                200: {
                    description: 'Gift settings data',
                    example: {
                        upi_id: 'couple@paytm',
                        qr_code_url: 'https://example.com/qr-code.png',
                        custom_message: 'Thank you for your blessings!'
                    }
                }
            }
        },
        {
            method: 'PUT',
            path: '/api/gifts',
            description: 'Update gift settings',
            auth: true,
            parameters: {
                body: {
                    upi_id: 'UPI ID for payments',
                    qr_code_url: 'URL to QR code image',
                    custom_message: 'Custom message for gift portal'
                }
            },
            responses: {
                200: {
                    description: 'Gift settings updated successfully',
                    example: {
                        id: 'uuid',
                        upi_id: 'couple@paytm',
                        qr_code_url: 'https://example.com/qr-code.png',
                        custom_message: 'Thank you for your blessings!'
                    }
                }
            }
        }
    ],
    todos: [
        {
            method: 'GET',
            path: '/api/todos',
            description: 'Get paginated list of todo tasks with optional filtering',
            auth: true,
            parameters: {
                query: {
                    page: 'Page number (default: 1)',
                    limit: 'Items per page (default: 50, max: 100)',
                    category: 'Filter by task category',
                    completed: 'Filter by completion status (true/false)'
                }
            },
            responses: {
                200: {
                    description: 'List of todo tasks with pagination',
                    example: {
                        tasks: [
                            {
                                id: 'uuid',
                                title: 'Book wedding venue',
                                description: 'Research and book the perfect venue',
                                category: 'Venue',
                                completed: false,
                                due_date: '2024-03-01T00:00:00Z',
                                created_at: '2024-01-01T00:00:00Z'
                            }
                        ],
                        pagination: {
                            page: 1,
                            limit: 50,
                            total: 25,
                            totalPages: 1
                        }
                    }
                }
            }
        },
        {
            method: 'POST',
            path: '/api/todos',
            description: 'Create a new todo task',
            auth: true,
            parameters: {
                body: {
                    title: 'Task title (required)',
                    description: 'Task description (optional)',
                    category: 'Task category (required)',
                    due_date: 'Due date (optional, ISO string)'
                }
            },
            responses: {
                201: {
                    description: 'Todo task created successfully',
                    example: {
                        id: 'uuid',
                        title: 'Book wedding venue',
                        category: 'Venue',
                        completed: false,
                        created_at: '2024-01-01T00:00:00Z'
                    }
                }
            }
        }
    ],
    webhooks: [
        {
            method: 'POST',
            path: '/api/webhooks/invitation-sent',
            description: 'Webhook for invitation sent events',
            auth: false,
            parameters: {
                body: {
                    event_type: 'invitation_sent',
                    couple_id: 'Couple UUID',
                    data: 'Event-specific data object',
                    timestamp: 'Event timestamp (ISO string)'
                }
            },
            responses: {
                200: {
                    description: 'Webhook processed successfully',
                    example: { message: 'Webhook processed successfully' }
                },
                401: {
                    description: 'Invalid webhook signature',
                    example: { error: 'Invalid signature' }
                }
            }
        },
        {
            method: 'POST',
            path: '/api/webhooks/photo-uploaded',
            description: 'Webhook for photo upload events',
            auth: false,
            parameters: {
                body: {
                    event_type: 'photo_uploaded',
                    couple_id: 'Couple UUID',
                    data: 'Photo upload data',
                    timestamp: 'Event timestamp (ISO string)'
                }
            },
            responses: {
                200: {
                    description: 'Webhook processed successfully',
                    example: { message: 'Webhook processed successfully' }
                }
            }
        },
        {
            method: 'POST',
            path: '/api/webhooks/guest-updated',
            description: 'Webhook for guest update events',
            auth: false,
            parameters: {
                body: {
                    event_type: 'guest_updated',
                    couple_id: 'Couple UUID',
                    data: 'Guest update data',
                    timestamp: 'Event timestamp (ISO string)'
                }
            },
            responses: {
                200: {
                    description: 'Webhook processed successfully',
                    example: { message: 'Webhook processed successfully' }
                }
            }
        }
    ]
}

/**
 * Generate API documentation in markdown format
 */
export function generateApiDocs(): string {
    let docs = '# Wedflow API Documentation\n\n'
    docs += 'This document provides comprehensive documentation for the Wedflow API endpoints.\n\n'
    docs += '## Authentication\n\n'
    docs += 'Most API endpoints require authentication using Supabase Auth. Include the session token in your requests.\n\n'
    docs += '## Base URL\n\n'
    docs += '```\nhttps://your-domain.com\n```\n\n'

    for (const [category, endpoints] of Object.entries(API_ENDPOINTS)) {
        docs += `## ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n`

        for (const endpoint of endpoints) {
            docs += `### ${endpoint.method} ${endpoint.path}\n\n`
            docs += `${endpoint.description}\n\n`

            if (endpoint.auth) {
                docs += '**Authentication:** Required\n\n'
            }

            if (endpoint.parameters) {
                docs += '**Parameters:**\n\n'

                if (endpoint.parameters.path) {
                    docs += 'Path Parameters:\n'
                    for (const [param, desc] of Object.entries(endpoint.parameters.path)) {
                        docs += `- \`${param}\`: ${desc}\n`
                    }
                    docs += '\n'
                }

                if (endpoint.parameters.query) {
                    docs += 'Query Parameters:\n'
                    for (const [param, desc] of Object.entries(endpoint.parameters.query)) {
                        docs += `- \`${param}\`: ${desc}\n`
                    }
                    docs += '\n'
                }

                if (endpoint.parameters.body) {
                    docs += 'Request Body:\n'
                    for (const [param, desc] of Object.entries(endpoint.parameters.body)) {
                        docs += `- \`${param}\`: ${desc}\n`
                    }
                    docs += '\n'
                }
            }

            docs += '**Responses:**\n\n'
            for (const [status, response] of Object.entries(endpoint.responses)) {
                docs += `**${status}** - ${response.description}\n\n`
                docs += '```json\n'
                docs += JSON.stringify(response.example, null, 2)
                docs += '\n```\n\n'
            }

            docs += '---\n\n'
        }
    }

    return docs
}

/**
 * Test helper for API endpoints
 */
export class ApiTester {
    private baseUrl: string
    private authToken?: string

    constructor(baseUrl: string = 'http://localhost:3000', authToken?: string) {
        this.baseUrl = baseUrl
        this.authToken = authToken
    }

    setAuthToken(token: string) {
        this.authToken = token
    }

    async request(
        method: string,
        path: string,
        options: {
            body?: any
            query?: Record<string, string>
            headers?: Record<string, string>
        } = {}
    ) {
        const url = new URL(path, this.baseUrl)

        if (options.query) {
            Object.entries(options.query).forEach(([key, value]) => {
                url.searchParams.append(key, value)
            })
        }

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...options.headers
        }

        if (this.authToken) {
            headers['Authorization'] = `Bearer ${this.authToken}`
        }

        const fetchOptions: RequestInit = {
            method,
            headers
        }

        if (options.body && method !== 'GET') {
            fetchOptions.body = JSON.stringify(options.body)
        }

        const response = await fetch(url.toString(), fetchOptions)
        const data = await response.json()

        return {
            status: response.status,
            headers: Object.fromEntries(response.headers.entries()),
            data
        }
    }

    // Convenience methods for common operations
    async get(path: string, query?: Record<string, string>) {
        return this.request('GET', path, { query })
    }

    async post(path: string, body?: any) {
        return this.request('POST', path, { body })
    }

    async put(path: string, body?: any) {
        return this.request('PUT', path, { body })
    }

    async delete(path: string) {
        return this.request('DELETE', path)
    }
}

/**
 * Example usage and test cases
 */
export const API_TEST_CASES = {
    guests: {
        create: {
            valid: {
                name: 'John Doe',
                phone: '+1234567890',
                email: 'john@example.com',
                group_name: 'Family'
            },
            invalid: {
                name: '', // Missing required field
                phone: '123' // Too short
            }
        },
        update: {
            valid: {
                name: 'John Doe Updated',
                invite_status: 'sent'
            }
        }
    },
    contacts: {
        create: {
            valid: {
                name: 'ABC Decorators',
                phone: '+1234567890',
                email: 'contact@abcdecorators.com',
                category: 'decorator',
                notes: 'Specializes in floral arrangements'
            }
        }
    },
    todos: {
        create: {
            valid: {
                title: 'Book wedding venue',
                description: 'Research and book the perfect venue',
                category: 'Venue',
                due_date: '2024-03-01T00:00:00Z'
            }
        }
    }
}