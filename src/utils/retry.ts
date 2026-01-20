/**
 * Retry configuration options
 */
export interface RetryOptions {
  /** Maximum number of retry attempts */
  maxRetries?: number;
  /** Initial delay in milliseconds */
  initialDelay?: number;
  /** Multiplier for exponential backoff */
  backoffMultiplier?: number;
  /** Maximum delay in milliseconds */
  maxDelay?: number;
  /** Whether to jitter the delay (add randomness) */
  jitter?: boolean;
  /** Callback called before each retry */
  onRetry?: (error: Error, attempt: number) => void;
}

/**
 * Default retry options
 */
const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000,
  backoffMultiplier: 2,
  maxDelay: 10000,
  jitter: true,
  onRetry: () => {},
};

/**
 * Retry specific error types based on status code or error message
 * @param error - The error to check
 * @returns True if the error is retryable
 */
function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    // Retry on network errors
    if (error.message.includes('ECONNRESET') ||
        error.message.includes('ETIMEDOUT') ||
        error.message.includes('ENOTFOUND') ||
        error.message.includes('ECONNREFUSED')) {
      return true;
    }

    // Retry on rate limit (429) and server errors (5xx)
    const statusMatch = error.message.match(/status (\d+)/);
    if (statusMatch) {
      const status = parseInt(statusMatch[1], 10);
      return status === 429 || status >= 500;
    }
  }

  return false;
}

/**
 * Calculates delay with exponential backoff and optional jitter
 * @param attempt - Current attempt number (0-indexed)
 * @param options - Retry options
 * @returns Delay in milliseconds
 */
function calculateDelay(attempt: number, options: Required<RetryOptions>): number {
  let delay = options.initialDelay * Math.pow(options.backoffMultiplier, attempt);
  delay = Math.min(delay, options.maxDelay);

  if (options.jitter) {
    // Add up to 25% randomness
    delay = delay * (0.75 + Math.random() * 0.5);
  }

  return Math.floor(delay);
}

/**
 * Wraps an async function with retry logic
 * @param fn - Async function to retry
 * @param options - Retry configuration options
 * @returns Result of the function with retries applied
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry if this is the last attempt or error is not retryable
      if (attempt === opts.maxRetries || !isRetryableError(error)) {
        throw lastError;
      }

      // Calculate delay and wait before retry
      const delay = calculateDelay(attempt, opts);
      opts.onRetry(lastError, attempt + 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Wraps an async function with retry logic specifically for API calls
 * Includes status code checking for 429 and 5xx errors
 * @param fn - Async function to retry
 * @param context - Context string for error messages
 * @returns Result of the function with retries applied
 */
export async function withApiRetry<T>(
  fn: () => Promise<T>,
  context: string = 'API call'
): Promise<T> {
  return withRetry(fn, {
    maxRetries: 3,
    initialDelay: 1000,
    backoffMultiplier: 2,
    maxDelay: 10000,
    jitter: true,
    onRetry: (error, attempt) => {
      console.warn(`${context} failed, retrying (${attempt}/3): ${error.message}`);
    },
  });
}
