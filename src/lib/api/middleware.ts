import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

export interface AuthenticatedRequest extends NextRequest {
    user: {
        id: string
        email?: string
    }
    couple: {
        id: string
        couple_slug: string
    }
}

export interface ApiResponse<T = any> {
    data?: T
    error?: string
    message?: string
    pagination?: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
}

/**
 * Authentication middleware for API routes
 */
export async function withAuth(
    handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
    return async (request: NextRequest) => {
        try {
            const supabase = await createClient()

            const {
                data: { user },
                error: authError
            } = await supabase.auth.getUser()

            if (authError || !user) {
                return NextResponse.json(
                    { error: 'Unauthorized' },
                    { status: 401 }
                )
            }

            // Get couple information
            const { data: couple, error: coupleError } = await supabase
                .from('couples')
                .select('id, couple_slug')
                .eq('user_id', user.id)
                .single()

            if (coupleError || !couple) {
                return NextResponse.json(
                    { error: 'Couple profile not found' },
                    { status: 404 }
                )
            }

            // Extend request with auth data
            const authenticatedRequest = request as AuthenticatedRequest
            authenticatedRequest.user = {
                id: user.id,
                email: user.email
            }
            authenticatedRequest.couple = couple

            return await handler(authenticatedRequest)
        } catch (error) {
            console.error('Authentication middleware error:', error)
            return NextResponse.json(
                { error: 'Internal server error' },
                { status: 500 }
            )
        }
    }
}

/**
 * Validation middleware for request body
 */
export function withValidation<T>(schema: z.ZodSchema<T>) {
    return function (
        handler: (req: AuthenticatedRequest, validatedData: T) => Promise<NextResponse>
    ) {
        return async (request: AuthenticatedRequest) => {
            try {
                const body = await request.json()
                const validatedData = schema.parse(body)
                return await handler(request, validatedData)
            } catch (error) {
                if (error instanceof z.ZodError) {
                    return NextResponse.json(
                        {
                            error: 'Validation failed',
                            details: error.errors.map(err => ({
                                field: err.path.join('.'),
                                message: err.message
                            }))
                        },
                        { status: 400 }
                    )
                }

                console.error('Validation middleware error:', error)
                return NextResponse.json(
                    { error: 'Invalid request data' },
                    { status: 400 }
                )
            }
        }
    }
}

/**
 * Error handling wrapper for API routes
 */
export function withErrorHandling(
    handler: (req: NextRequest) => Promise<NextResponse>
) {
    return async (request: NextRequest) => {
        try {
            return await handler(request)
        } catch (error) {
            console.error('API route error:', error)

            // Handle specific error types
            if (error instanceof z.ZodError) {
                return NextResponse.json(
                    {
                        error: 'Validation failed',
                        details: error.errors
                    },
                    { status: 400 }
                )
            }

            return NextResponse.json(
                { error: 'Internal server error' },
                { status: 500 }
            )
        }
    }
}

/**
 * Enhanced rate limiting middleware with security features
 */
import { RateLimiter, htmlSanitizer, sqlSanitizer } from '@/lib/security/input-validation'

const globalRateLimiter = new RateLimiter()

export function withRateLimit(
    maxRequests: number = 100,
    windowMs: number = 15 * 60 * 1000 // 15 minutes
) {
    const rateLimiter = new RateLimiter(maxRequests, windowMs)

    return function (
        handler: (req: NextRequest) => Promise<NextResponse>
    ) {
        return async (request: NextRequest) => {
            const ip = request.headers.get('x-forwarded-for') ||
                request.headers.get('x-real-ip') ||
                request.headers.get('cf-connecting-ip') ||
                'unknown'

            const { allowed, remaining, resetTime } = rateLimiter.isAllowed(ip)

            if (!allowed) {
                return NextResponse.json(
                    {
                        error: 'Too many requests',
                        message: 'Rate limit exceeded. Please try again later.'
                    },
                    {
                        status: 429,
                        headers: {
                            'X-RateLimit-Limit': maxRequests.toString(),
                            'X-RateLimit-Remaining': '0',
                            'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString(),
                            'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString()
                        }
                    }
                )
            }

            const response = await handler(request)

            // Add rate limit headers
            response.headers.set('X-RateLimit-Limit', maxRequests.toString())
            response.headers.set('X-RateLimit-Remaining', remaining.toString())
            response.headers.set('X-RateLimit-Reset', Math.ceil(resetTime / 1000).toString())

            return response
        }
    }
}

/**
 * Security middleware for input sanitization and validation
 */
export function withSecurity() {
    return function (
        handler: (req: NextRequest) => Promise<NextResponse>
    ) {
        return async (request: NextRequest) => {
            try {
                // Check for suspicious patterns in URL
                const url = request.url
                if (sqlSanitizer.containsSQLInjection(url)) {
                    console.warn(`Potential SQL injection attempt from ${request.headers.get('x-forwarded-for')}: ${url}`)
                    return NextResponse.json(
                        { error: 'Invalid request' },
                        { status: 400 }
                    )
                }

                // Check request headers for suspicious content
                const userAgent = request.headers.get('user-agent') || ''
                if (userAgent.length > 1000 || sqlSanitizer.containsSQLInjection(userAgent)) {
                    console.warn(`Suspicious user agent from ${request.headers.get('x-forwarded-for')}: ${userAgent}`)
                    return NextResponse.json(
                        { error: 'Invalid request' },
                        { status: 400 }
                    )
                }

                // Sanitize request body if present
                if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
                    try {
                        const body = await request.text()
                        if (body && sqlSanitizer.containsSQLInjection(body)) {
                            console.warn(`Potential SQL injection in request body from ${request.headers.get('x-forwarded-for')}`)
                            return NextResponse.json(
                                { error: 'Invalid request data' },
                                { status: 400 }
                            )
                        }

                        // Recreate request with sanitized body
                        const sanitizedBody = htmlSanitizer.sanitize(body)
                        const newRequest = new NextRequest(request.url, {
                            method: request.method,
                            headers: request.headers,
                            body: sanitizedBody || undefined
                        })

                        return await handler(newRequest)
                    } catch (error) {
                        // If body parsing fails, continue with original request
                        return await handler(request)
                    }
                }

                return await handler(request)
            } catch (error) {
                console.error('Security middleware error:', error)
                return NextResponse.json(
                    { error: 'Security check failed' },
                    { status: 500 }
                )
            }
        }
    }
}

/**
 * CORS middleware for API routes
 */
export function withCors(
    allowedOrigins: string[] = ['http://localhost:3000'],
    allowedMethods: string[] = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
) {
    return function (
        handler: (req: NextRequest) => Promise<NextResponse>
    ) {
        return async (request: NextRequest) => {
            const origin = request.headers.get('origin')
            const isAllowedOrigin = !origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')

            // Handle preflight requests
            if (request.method === 'OPTIONS') {
                return new NextResponse(null, {
                    status: 200,
                    headers: {
                        'Access-Control-Allow-Origin': isAllowedOrigin ? (origin || '*') : 'null',
                        'Access-Control-Allow-Methods': allowedMethods.join(', '),
                        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
                        'Access-Control-Max-Age': '86400'
                    }
                })
            }

            const response = await handler(request)

            // Add CORS headers to response
            if (isAllowedOrigin) {
                response.headers.set('Access-Control-Allow-Origin', origin || '*')
                response.headers.set('Access-Control-Allow-Methods', allowedMethods.join(', '))
                response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
            }

            return response
        }
    }
}

/**
 * Compose multiple middleware functions
 */
export function compose(...middlewares: Array<(handler: any) => any>) {
    return (handler: any) => {
        return middlewares.reduceRight((acc, middleware) => middleware(acc), handler)
    }
}

/**
 * Standard API response helper
 */
export function createApiResponse<T>(
    data?: T,
    options?: {
        status?: number
        message?: string
        pagination?: ApiResponse['pagination']
    }
): NextResponse {
    const response: ApiResponse<T> = {}

    if (data !== undefined) response.data = data
    if (options?.message) response.message = options.message
    if (options?.pagination) response.pagination = options.pagination

    return NextResponse.json(response, { status: options?.status || 200 })
}

/**
 * Standard API error response helper
 */
export function createApiError(
    error: string,
    status: number = 500,
    details?: any
): NextResponse {
    const response: ApiResponse = { error }
    if (details) response.data = details

    return NextResponse.json(response, { status })
}