import { CircuitBreakerError } from '@/lib/errors/api-errors';

interface CircuitBreakerMetrics {
  totalCalls: number;
  failedCalls: number;
  lastFailure: number | null;
  currentState: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
}

/**
 * Circuit breaker implementation for OpenAI API calls.
 * Helps prevent cascading failures and provides automatic recovery.
 */
export class CircuitBreaker {
  private failures = 0;
  private totalCalls = 0;
  private successfulCalls = 0;
  private lastFailure: number | null = null;
  private readonly failureThreshold: number;
  private readonly resetTimeout: number;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor({
    failureThreshold = 5,
    resetTimeout = 30000 // 30 seconds max timeout
  } = {}) {
    this.failureThreshold = failureThreshold;
    this.resetTimeout = resetTimeout;
  }

  /**
   * Executes the provided function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.totalCalls++;

    if (this.isOpen()) {
      const remainingTimeout = this.getRemainingTimeout();
      throw new CircuitBreakerError(
        `Circuit breaker is open. Too many failures.`,
        remainingTimeout
      );
    }

    // If we're half-open, only allow one request through
    if (this.state === 'HALF_OPEN' && this.totalCalls > 1) {
      throw new CircuitBreakerError(
        'Circuit breaker is recovering',
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

  /**
   * Gets current metrics for monitoring
   */
  getMetrics(): CircuitBreakerMetrics {
    return {
      totalCalls: this.totalCalls,
      failedCalls: this.failures,
      lastFailure: this.lastFailure,
      currentState: this.state
    };
  }

  /**
   * Checks if the circuit breaker is currently open (preventing calls)
   */
  private isOpen(): boolean {
    if (this.state === 'OPEN' && this.lastFailure) {
      const timeSinceLastFailure = Date.now() - this.lastFailure;
      const currentTimeout = Math.min(
        Math.pow(2, this.failures - this.failureThreshold) * 1000,
        this.resetTimeout
      );

      // Check if we should move to half-open state
      if (timeSinceLastFailure >= currentTimeout) {
        this.state = 'HALF_OPEN';
        this.totalCalls = 0; // Reset call count for half-open state
        return false;
      }
      return true;
    }
    return false;
  }

  /**
   * Gets the remaining timeout before the circuit breaker resets
   */
  private getRemainingTimeout(): number {
    if (!this.lastFailure) return 0;

    const timeSinceLastFailure = Date.now() - this.lastFailure;
    const currentTimeout = Math.min(
      Math.pow(2, this.failures - this.failureThreshold) * 1000,
      this.resetTimeout
    );
    return Math.max(currentTimeout - timeSinceLastFailure, 0);
  }

  /**
   * Handles successful API call
   */
  private onSuccess(): void {
    this.successfulCalls++;
    if (this.state === 'HALF_OPEN') {
      // If we succeed in half-open state, reset the circuit breaker
      this.failures = 0;
      this.lastFailure = null;
      this.state = 'CLOSED';
    } else {
      // In closed state, gradually reduce failure count
      this.failures = Math.max(0, this.failures - 1);
    }
  }

  /**
   * Handles failed API call
   */
  private onFailure(): void {
    this.failures++;
    this.lastFailure = Date.now();
    
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }
}