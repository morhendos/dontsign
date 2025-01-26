import { type NextRequest, NextResponse } from 'next/server';
import { sendContactEmail } from '@/lib/services/email';
import { createRateLimiter } from '@/lib/middleware/rate-limit';

export const runtime = 'nodejs';

const rateLimiter = createRateLimiter({
  limit: 5,
  windowMs: 60 * 60 * 1000 // 1 hour
});

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = await rateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    const data = await request.json();
    const { name, email, subject, message } = data;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const emailResult = await sendContactEmail({ name, email, subject, message });
    
    if (!emailResult.success) {
      throw new Error(emailResult.error);
    }

    return NextResponse.json(
      { message: 'Message sent successfully' },
      { status: 200 }
    );

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}