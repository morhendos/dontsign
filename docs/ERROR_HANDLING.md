# Error Handling and Monitoring

## Overview

DontSign implements comprehensive error tracking and monitoring using Sentry and custom error handling patterns. This document outlines our error handling strategy and monitoring setup.

## Error Handling Architecture

### 1. Global Error Boundary

Location: `app/global-error.tsx`

Handles React rendering errors with:
- Automatic error capture to Sentry
- User-friendly error messages
- Development mode details
- Error recovery options

### 2. Custom Error Types

Location: `lib/errors/api-errors.ts`

Implements specific error types for different scenarios:
- CircuitBreakerError: For API reliability issues
- ValidationError: For input validation failures
- ProcessingError: For document processing issues
- NetworkError: For connectivity problems

### 3. Circuit Breaker Pattern

Location: `lib/services/openai/circuit-breaker.ts`

Implements reliability pattern for API calls:
- Automatic failure detection
- Graceful degradation
- Self-healing capability
- Exponential backoff

### 4. Runtime Coverage

The application implements error handling across all runtime environments:

- **Client-side** (`sentry.client.config.js`)
  - Browser error tracking
  - Performance monitoring
  - Custom error filtering
  - Production-only reporting

- **Server-side** (`sentry.server.config.js`)
  - Node.js specific integrations
  - HTTP request tracing
  - Unhandled rejections
  - Uncaught exceptions

- **Edge Runtime** (`sentry.edge.config.js`)
  - Edge function monitoring
  - Performance tracking
  - Error capturing

## Configuration

### Environment Variables

Required environment variables:
```env
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-name
```

### Source Maps

Source maps are:
- Generated and uploaded to Sentry
- Hidden from browser DevTools in production
- Available for error deminification in Sentry dashboard

## Performance Monitoring

- Sample rate: 10% of transactions
- Automatic instrumentation of:
  - Page loads
  - Route changes
  - API requests
  - Database queries

## Best Practices

1. **Custom Error Context**
   ```typescript
   try {
     // risky operation
   } catch (error) {
     Sentry.withScope((scope) => {
       scope.setExtra('important_data', data);
       Sentry.captureException(error);
     });
   }
   ```

2. **Circuit Breaker Usage**
   ```typescript
   const breaker = new CircuitBreaker({
     failureThreshold: 5,
     resetTimeout: 30000
   });

   try {
     const result = await breaker.execute(async () => {
       // API call or risky operation
     });
   } catch (error) {
     if (error instanceof CircuitBreakerError) {
       // Handle service unavailability
     }
     // Handle other errors
   }
   ```

3. **Performance Tracking**
   ```typescript
   const transaction = Sentry.startTransaction({
     name: 'Process Contract',
     op: 'task'
   });
   try {
     // processing logic
   } finally {
     transaction.finish();
   }
   ```

4. **User Context**
   ```typescript
   Sentry.setUser({
     id: user.id,
     email: user.email
   });
   ```

## Development Guidelines

1. Always add context to errors when capturing
2. Use custom breadcrumbs for important operations
3. Add performance spans for critical sections
4. Include relevant user and system state
5. Follow the environment-specific configuration
6. Implement proper error recovery strategies
7. Use circuit breaker for external services

## Monitoring Dashboard

Access the Sentry dashboard to:
- View error reports and trends
- Analyze performance metrics
- Track user impact
- Monitor release stability
- Set up alerts and notifications
- Monitor circuit breaker metrics
