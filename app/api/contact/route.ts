import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { rateLimit } from '@/lib/rate-limit';

export const runtime = 'edge';

// Custom error type for better error handling
class ContactFormError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number
  ) {
    super(message);
    this.name = 'ContactFormError';
  }
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? 'anonymous';
    
    // Start a Sentry transaction
    const transaction = Sentry.startTransaction({
      name: 'contact-form-submission',
      op: 'http.server',
      tags: { ip }
    });

    try {
      // Rate limit check
      const { success, reset, remaining, error } = await rateLimit({
        uniqueKey: `contact:${ip}`,
        limit: 5,
        timeWindow: 3600,
        errorFallback: 'deny' // deny on errors for security
      });

      if (error) {
        // Log rate limit errors to Sentry
        Sentry.captureMessage('Rate limit error', {
          level: 'error',
          tags: {
            error_code: error.code
          },
          extra: {
            error_message: error.message,
            ip
          }
        });
      }

      if (!success) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { 
            status: 429,
            headers: {
              'Retry-After': String(reset),
              'X-RateLimit-Limit': '5',
              'X-RateLimit-Remaining': String(remaining),
              'X-RateLimit-Reset': String(reset)
            }
          }
        );
      }

      // Parse and validate request body
      let data;
      try {
        data = await request.json();
      } catch {
        throw new ContactFormError(
          'Invalid request body',
          'INVALID_JSON',
          400
        );
      }

      const { name, email, subject, message } = data;

      // Validate required fields
      if (!name || !email || !subject || !message) {
        throw new ContactFormError(
          'All fields are required',
          'MISSING_FIELDS',
          400
        );
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new ContactFormError(
          'Invalid email format',
          'INVALID_EMAIL',
          400
        );
      }

      // Email sending would go here
      // Log success to Sentry
      Sentry.addBreadcrumb({
        category: 'contact',
        message: 'Contact form processed successfully',
        level: 'info',
        data: {
          name,
          email,
          subject
        }
      });

      return NextResponse.json(
        { message: 'Message sent successfully' },
        { 
          status: 200,
          headers: {
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': String(remaining),
            'X-RateLimit-Reset': String(reset)
          }
        }
      );

    } finally {
      // End the Sentry transaction
      transaction.finish();
    }

  } catch (error) {
    // Determine error details
    const status = error instanceof ContactFormError ? error.status : 500;
    const code = error instanceof ContactFormError ? error.code : 'UNKNOWN';
    const message = error instanceof Error ? 
      error.message : 
      'An error occurred while processing your request';

    // Log to Sentry
    Sentry.captureException(error, {
      tags: {
        error_code: code
      }
    });

    return NextResponse.json(
      { 
        error: message,
        code 
      },
      { status }
    );
  }
}