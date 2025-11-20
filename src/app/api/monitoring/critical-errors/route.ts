import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit, withErrorHandling } from '@/lib/api/middleware';
import { createClient } from '@/lib/supabase/server';

interface CriticalError {
    message: string;
    stack?: string;
    level: string;
    context: {
        userId?: string;
        coupleId?: string;
        url?: string;
        userAgent?: string;
        timestamp: string;
        environment: string;
        version?: string;
    };
    fingerprint?: string;
}

async function handleCriticalError(request: NextRequest) {
    if (request.method !== 'POST') {
        return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
    }

    try {
        const errorReport: CriticalError = await request.json();

        // Validate error data
        if (!errorReport.message || !errorReport.context) {
            return NextResponse.json({ error: 'Invalid error data' }, { status: 400 });
        }

        const supabase = await createClient();

        // Store critical error in database
        const { error: dbError } = await supabase
            .from('critical_errors')
            .insert({
                message: errorReport.message,
                stack: errorReport.stack,
                level: errorReport.level,
                context: errorReport.context,
                fingerprint: errorReport.fingerprint,
                created_at: new Date().toISOString()
            });

        if (dbError) {
            console.error('Failed to store critical error in database:', dbError);
            // Continue processing even if database storage fails
        }

        // Send immediate notification for critical errors
        if (process.env.CRITICAL_ERROR_WEBHOOK) {
            try {
                await fetch(process.env.CRITICAL_ERROR_WEBHOOK, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text: `🚨 Critical Error in Wedflow Production`,
                        attachments: [{
                            color: 'danger',
                            fields: [
                                {
                                    title: 'Error Message',
                                    value: errorReport.message,
                                    short: false
                                },
                                {
                                    title: 'Environment',
                                    value: errorReport.context.environment,
                                    short: true
                                },
                                {
                                    title: 'Timestamp',
                                    value: errorReport.context.timestamp,
                                    short: true
                                },
                                {
                                    title: 'User ID',
                                    value: errorReport.context.userId || 'Unknown',
                                    short: true
                                },
                                {
                                    title: 'URL',
                                    value: errorReport.context.url || 'Unknown',
                                    short: true
                                }
                            ]
                        }]
                    })
                });
            } catch (webhookError) {
                console.error('Failed to send critical error notification:', webhookError);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error processing critical error report:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Apply rate limiting to prevent abuse
export const POST = withRateLimit(50, 60000)(withErrorHandling(handleCriticalError));