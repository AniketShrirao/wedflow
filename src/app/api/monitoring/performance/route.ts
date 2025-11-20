import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit, withErrorHandling } from '@/lib/api/middleware';

interface PerformanceMetric {
    name: string;
    value: number;
    unit: string;
    timestamp: string;
    environment: string;
    context?: Record<string, any>;
}

// In-memory storage for demo (use proper database in production)
const performanceMetrics: PerformanceMetric[] = [];

async function handlePerformanceMetric(request: NextRequest) {
    if (request.method !== 'POST') {
        return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
    }

    try {
        const metric: PerformanceMetric = await request.json();

        // Validate metric data
        if (!metric.name || typeof metric.value !== 'number') {
            return NextResponse.json({ error: 'Invalid metric data' }, { status: 400 });
        }

        // Store metric (in production, use proper database)
        performanceMetrics.push(metric);

        // Keep only last 1000 metrics to prevent memory issues
        if (performanceMetrics.length > 1000) {
            performanceMetrics.splice(0, performanceMetrics.length - 1000);
        }

        // Log slow operations
        if (metric.name === 'api_response_time' && metric.value > 5000) {
            console.warn(`Slow API response detected: ${metric.context?.url} took ${metric.value}ms`);
        }

        if (metric.name === 'page_load_time' && metric.value > 3000) {
            console.warn(`Slow page load detected: ${metric.context?.url} took ${metric.value}ms`);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error processing performance metric:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Apply rate limiting to prevent abuse
export const POST = withRateLimit(100, 60000)(withErrorHandling(handlePerformanceMetric));