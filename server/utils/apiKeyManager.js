/**
 * API Key Manager with Round-Robin Fallback
 * Handles multiple API keys with automatic fallback and rotation
 */

class ApiKeyManager {
  constructor(apiKeys, serviceName) {
    this.apiKeys = apiKeys.filter((key) => key && key.trim());
    this.serviceName = serviceName;
    this.currentIndex = 0;
    this.failedKeys = new Set();

    if (this.apiKeys.length === 0) {
      throw new Error(`No valid ${serviceName} API keys provided`);
    }

    console.log(
      `🔑 Initialized ${serviceName} with ${this.apiKeys.length} API keys`
    );
  }

  /**
   * Get the next available API key using round-robin
   */
  getNextKey() {
    if (this.failedKeys.size === this.apiKeys.length) {
      // All keys have failed, reset failed keys and try again
      console.log(
        `⚠️ All ${this.serviceName} keys failed, resetting and retrying...`
      );
      this.failedKeys.clear();
    }

    // Find next available key
    let attempts = 0;
    while (attempts < this.apiKeys.length) {
      const key = this.apiKeys[this.currentIndex];
      this.currentIndex = (this.currentIndex + 1) % this.apiKeys.length;

      if (!this.failedKeys.has(key)) {
        console.log(
          `🔑 Using ${this.serviceName} key #${
            this.currentIndex
          } (${key.substring(0, 8)}...)`
        );
        return key;
      }
      attempts++;
    }

    throw new Error(`No available ${this.serviceName} API keys`);
  }

  /**
   * Mark a key as failed
   */
  markKeyAsFailed(key) {
    this.failedKeys.add(key);
    console.log(
      `❌ Marked ${this.serviceName} key as failed: ${key.substring(0, 8)}...`
    );
  }

  /**
   * Execute a function with automatic key rotation on failure
   */
  async executeWithFallback(apiFunction, ...args) {
    let lastError;
    const maxAttempts = this.apiKeys.length;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const apiKey = this.getNextKey();
        const result = await apiFunction(apiKey, ...args);

        // If successful, remove key from failed set (in case it was temporarily failing)
        this.failedKeys.delete(apiKey);
        return result;
      } catch (error) {
        lastError = error;
        const currentKey =
          this.apiKeys[
            (this.currentIndex - 1 + this.apiKeys.length) % this.apiKeys.length
          ];

        // Check if it's an API key related error (401, 403, etc.)
        if (this.isApiKeyError(error)) {
          this.markKeyAsFailed(currentKey);
          console.log(
            `🔄 Trying next ${this.serviceName} key due to auth error...`
          );
          continue;
        } else {
          // If it's not an API key error, don't try other keys
          throw error;
        }
      }
    }

    throw new Error(
      `All ${this.serviceName} API keys failed. Last error: ${lastError.message}`
    );
  }

  /**
   * Check if error is related to API key authentication or quota issues
   */
  isApiKeyError(error) {
    const errorMessage = error.message?.toLowerCase() || "";
    const statusCode = error.status || error.response?.status;

    return (
      statusCode === 401 ||
      statusCode === 403 ||
      statusCode === 429 || // Rate limit / quota exceeded
      errorMessage.includes("unauthorized") ||
      errorMessage.includes("invalid api key") ||
      errorMessage.includes("authentication") ||
      errorMessage.includes("forbidden") ||
      errorMessage.includes("insufficient credits") ||
      errorMessage.includes("quota exceeded") ||
      errorMessage.includes("rate limit") ||
      errorMessage.includes("credits are insufficient") ||
      errorMessage.includes("top up")
    );
  }

  /**
   * Get current status of all keys
   */
  getStatus() {
    return {
      total: this.apiKeys.length,
      failed: this.failedKeys.size,
      available: this.apiKeys.length - this.failedKeys.size,
      currentIndex: this.currentIndex,
    };
  }
}

// Initialize API key managers
const initializeSunoKeyManager = () => {
  const sunoKeys = process.env.SUNO_API_KEY?.split(",") || [];
  return new ApiKeyManager(sunoKeys, "Suno");
};

export { ApiKeyManager, initializeSunoKeyManager };
