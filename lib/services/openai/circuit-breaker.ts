/**
 * Circuit breaker implementation for OpenAI API calls.
 * Helps prevent cascading failures and provides automatic recovery.
 */
export class CircuitBreaker {
  private failures = 0;
  private lastFailure: number | null = null;
  private readonly failureThreshold: number;
  private readonly resetTimeout: number;

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
    if (this.isOpen()) {
      throw new Error(
        `Circuit breaker is open. Too many failures. Please try again in ${this.getRemainingTimeout()}ms`
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
   * Checks if the circuit breaker is currently open (preventing calls)
   */
  private isOpen(): boolean {
    if (this.failures >= this.failureThreshold && this.lastFailure) {
      const timeSinceLastFailure = Date.now() - this.lastFailure;
      const currentTimeout = Math.min(
        Math.pow(2, this.failures - this.failureThreshold) * 1000,
        this.resetTimeout
      );
      return timeSinceLastFailure < currentTimeout;
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
    this.failures = Math.max(0, this.failures - 1);
    if (this.failures === 0) {
      this.lastFailure = null;
    }
  }

  /**
   * Handles failed API call
   */
  private onFailure(): void {
    this.failures++;
    this.lastFailure = Date.now();
  }
}