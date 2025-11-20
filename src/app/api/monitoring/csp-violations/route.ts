import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit, withErrorHandling } from '@/lib/api/middleware';

interface CSPViolation {
    documentURI: string;
    referrer: string;
    blockedURI: string;
    violatedDirective: string;
    originalPolicy: string;
    sourceFile: string;
    lineNumber: number;
    columnNumber: number;
    timestamp: string;
}

// In-memory storage for demo (use proper database in production)
const cspViolations: CSPViolation[] = [];

async function handleCSPViolation(request: NextRequest) {
    if (request.method !== 'POST') {
        return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
    }

    try {
        const violation: CSPViolation = await request.json();

        // Validate violation data
        if (!violation.violatedDirective || !violation.blockedURI) {
            return NextResponse.json({ error: 'Invalid violation data' }, { status: 400 });
        }

        // Store violation (in production, use proper database)
        cspViolations.push(violation);

        // Keep only last 500 violations to prevent memory issues
        if (cspViolations.length > 500) {
            cspViolations.splice(0, cspViolations.length - 500);
        }

        // Log critical violations
        const criticalDirectives = ['script-src', 'object-src', 'base-uri'];
        if (criticalDirectives.some(directive => violation.violatedDirective.includes(directive))) {
            console.warn(`Critical CSP violation detected:`, {
                directive: violation.violatedDirective,
                blockedURI: violation.blockedURI,
                documentURI: violation.documentURI,
                timestamp: violation.timestamp
            });

            // Send alert for critical violations
            if (process.env.SECURITY_ALERT_WEBHOOK) {
                try {
                    await fetch(process.env.SECURITY_ALERT_WEBHOOK, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            text: `🚨 Critical CSP Violation in Wedflow`,
                            attachments: [{
                                color: 'warning',
                                fields: [
                                    {
                                        title: 'Violated Directive',
                                        value: violation.violatedDirective,
                                        short: true
                                    },
                                    {
                                        title: 'Blocked URI',
                                        value: violation.blockedURI,
                                        short: true
                                    },
                                    {
                                        title: 'Document URI',
                                        value: violation.documentURI,
                                        short: false
                                    },
                                    {
                                        title: 'Timestamp',
                                        value: violation.timestamp,
                                        short: true
                                    }
                                ]
                            }]
                        })
                    });
                } catch (webhookError) {
                    console.error('Failed to send CSP violation alert:', webhookError);
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error processing CSP violation:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Get CSP violations for monitoring dashboard
async function getCSPViolations(request: NextRequest) {
    if (request.method !== 'GET') {
        return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
    }

    try {
        const url = new URL(request.url);
        const limit = parseInt(url.searchParams.get('limit') || '50');
        const offset = parseInt(url.searchParams.get('offset') || '0');

        const paginatedViolations = cspViolations
            .slice(offset, offset + limit)
            .reverse(); // Most recent first

        return NextResponse.json({
            violations: paginatedViolations,
            total: cspViolations.length,
            limit,
            offset
        });
    } catch (error) {
        console.error('Error retrieving CSP violations:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Apply rate limiting to prevent abuse
export const POST = withRateLimit(200, 60000)(withErrorHandling(handleCSPViolation));
export const GET = withRateLimit(50, 60000)(withErrorHandling(getCSPViolations));