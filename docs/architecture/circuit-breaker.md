# Circuit Breaker Pattern Implementation

## Overview

The circuit breaker pattern is implemented to protect our application from OpenAI API failures and improve system resilience. It prevents cascading failures and provides automatic recovery.

## States

The circuit breaker has three states:

1. **CLOSED** (Normal Operation)
   - All requests pass through to OpenAI API
   - Failures are counted
   - System monitors for error threshold

2. **OPEN** (Failure Mode)
   - All requests are immediately rejected
   - Prevents unnecessary API calls
   - Automatic timeout with exponential backoff

3. **HALF-OPEN** (Recovery Mode)
   - Allows one test request through
   - Success -> CLOSED state
   - Failure -> OPEN state

## Implementation

```typescript
class CircuitBreaker {
  private failures = 0;
  private lastFailure: number | null = null;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.isOpen()) {
      throw new CircuitBreakerError(
        'Circuit breaker is open',
        this.getRemainingTimeout()
      );
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
}
```

## Usage

```typescript
// Service implementation
class OpenAIService {
  private circuitBreaker = new CircuitBreaker();

  async createChatCompletion(params: OpenAI.ChatCompletionCreateParams) {
    return this.circuitBreaker.execute(async () => {
      return await this.withRetry(() => 
        this.client.chat.completions.create(params)
      );
    });
  }
}

// Usage in application
const result = await openAIService.createChatCompletion({
  model: "gpt-3.5-turbo-1106",
  messages: [...]
});
```

## Error Handling

1. **Rate Limiting**
```typescript
if (error.status === 429) {
  throw new RateLimitError(error.message);
}
```

2. **Service Errors**
```typescript
if (error.status >= 500) {
  throw new AIServiceError(error.message);
}
```

## Recovery Strategy

1. **Exponential Backoff**
```typescript
const backoffTime = Math.pow(2, attempt - 1) * 1000;
const jitter = Math.random() * 1000;
await new Promise(resolve => 
  setTimeout(resolve, backoffTime + jitter)
);
```

2. **Automatic Reset**
```typescript
private onSuccess(): void {
  if (this.state === 'HALF_OPEN') {
    // Successful test request, reset circuit breaker
    this.failures = 0;
    this.lastFailure = null;
    this.state = 'CLOSED';
  }
}
```

## User Feedback

The system provides clear feedback to users:

1. **During Outage**
```text
"AI service is temporarily unavailable. Please try again in X seconds."
```

2. **Rate Limiting**
```text
"Our AI service is experiencing high demand. Please try again in a few moments."
```

3. **Service Errors**
```text
"Our AI service is temporarily unavailable. We're working on it."
```

## Monitoring

The circuit breaker provides metrics:
```typescript
interface CircuitBreakerMetrics {
  totalCalls: number;
  failedCalls: number;
  lastFailure: number | null;
  currentState: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
}
```

## Benefits

1. **Prevents Cascading Failures**
   - Stops making calls to failing services
   - Prevents resource exhaustion
   - Reduces load on failing services

2. **Automatic Recovery**
   - Self-healing system
   - Gradual recovery with half-open state
   - Exponential backoff prevents thundering herd

3. **Better User Experience**
   - Immediate feedback
   - Clear error messages
   - Estimated recovery time

4. **Resource Efficiency**
   - No wasted API calls
   - Better resource utilization
   - Reduced costs

## Configuration

The circuit breaker can be configured:
```typescript
const circuitBreaker = new CircuitBreaker({
  failureThreshold: 5,     // Failures before opening
  resetTimeout: 30000,     // Max timeout (30 seconds)
});
```

## Future Improvements

1. **Persistent Metrics**
   - Store failure counts across restarts
   - Track long-term reliability metrics

2. **Advanced Recovery**
   - Multiple failure thresholds
   - Service-specific timeouts
   - Custom retry strategies

3. **Enhanced Monitoring**
   - Real-time circuit status dashboard
   - Alert system for repeated failures
   - Performance metrics tracking
