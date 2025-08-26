# API Key Fallback System

This project now includes a robust API key fallback mechanism with round-robin rotation for both Suno API and Stability AI services.

## Features

- **Round-Robin Rotation**: Automatically cycles through available API keys
- **Automatic Fallback**: If one key fails, automatically tries the next one
- **Error Detection**: Intelligently detects API key-related errors (401, 403, etc.)
- **Key Recovery**: Failed keys are retried after all keys have been attempted
- **Status Monitoring**: Track which keys are working and which have failed

## Configuration

### Server (Node.js) - Suno API Keys

In your `server/.env` file, add multiple Suno API keys separated by commas:

```env
SUNO_API_KEY=key1,key2,key3,key4
```

### Python Server - Stability AI Keys

In your `python-server/.env` file, add multiple Stability AI keys separated by commas:

```env
STABILITY_KEY=sk-key1,sk-key2,sk-key3,sk-key4
```

## How It Works

### Node.js Server (Suno API)

The `ApiKeyManager` class in `server/utils/apiKeyManager.js` handles:

1. **Initialization**: Parses comma-separated keys from environment variables
2. **Round-Robin**: Cycles through keys using `getNextKey()`
3. **Fallback**: `executeWithFallback()` automatically retries with different keys
4. **Error Handling**: Detects authentication errors and marks keys as failed

### Python Server (Stability AI)

The `ApiKeyManager` class in `python-server/api_key_manager.py` provides:

1. **Key Management**: Handles multiple Stability AI keys
2. **Automatic Retry**: Tries next key when current one fails
3. **Error Detection**: Identifies API key authentication issues
4. **Status Tracking**: Monitors key health and availability

## Usage Examples

### Node.js (Suno API)

```javascript
// The API key manager is automatically used in all Suno API functions:
// - generateMusic()
// - checkMusicGenerationStatus()
// - generateCustomMusic()
// - getSunoAccountInfo()

// Example: Generate music with automatic fallback
const result = await generateMusic("My Song", "A happy melody");
```

### Python (Stability AI)

```python
# The API key manager is automatically used in:
# - text_to_image()
# - edit_image()

# Example: Generate image with automatic fallback
from stability_ai import text_to_image

image = text_to_image("A beautiful landscape")
```

## Testing

### Test Node.js API Key Manager

```bash
cd server
node test-api-keys.js
```

### Test Python API Key Manager

```bash
cd python-server
python test_api_keys.py
```

## Error Handling

The system automatically handles these error types:

- **401 Unauthorized**: Invalid or expired API key
- **403 Forbidden**: API key lacks required permissions
- **Authentication errors**: Various auth-related failures

When an API key fails:

1. It's marked as failed and temporarily excluded
2. The next available key is automatically used
3. If all keys fail, they're reset and retried
4. Non-authentication errors don't trigger fallback

## Monitoring

Check API key status programmatically:

### Node.js

```javascript
const status = sunoKeyManager.getStatus();
console.log(status);
// Output: { total: 4, failed: 1, available: 3, currentIndex: 2 }
```

### Python

```python
status = stability_key_manager.get_status()
print(status)
# Output: {'total': 4, 'failed': 1, 'available': 3, 'current_index': 2}
```

## Benefits

1. **High Availability**: Service continues even if some keys fail
2. **Load Distribution**: Spreads requests across multiple keys
3. **Rate Limit Mitigation**: Reduces chance of hitting individual key limits
4. **Automatic Recovery**: Failed keys are retried periodically
5. **Zero Downtime**: Seamless failover between keys

## Migration

If you currently have single API keys, simply add more keys separated by commas:

**Before:**

```env
SUNO_API_KEY=single_key
STABILITY_KEY=single_key
```

**After:**

```env
SUNO_API_KEY=key1,key2,key3
STABILITY_KEY=key1,key2,key3
```

The system is backward compatible and works with single keys too.
