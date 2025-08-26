"""
API Key Manager with Round-Robin Fallback for Python
Handles multiple API keys with automatic fallback and rotation
"""

import os
import logging
from typing import List, Callable, Any, Optional

class ApiKeyManager:
    def __init__(self, api_keys: List[str], service_name: str):
        self.api_keys = [key.strip() for key in api_keys if key and key.strip()]
        self.service_name = service_name
        self.current_index = 0
        self.failed_keys = set()
        
        if not self.api_keys:
            raise ValueError(f"No valid {service_name} API keys provided")
        
        print(f"🔑 Initialized {service_name} with {len(self.api_keys)} API keys")

    def get_next_key(self) -> str:
        """Get the next available API key using round-robin"""
        if len(self.failed_keys) == len(self.api_keys):
            # All keys have failed, reset failed keys and try again
            print(f"⚠️ All {self.service_name} keys failed, resetting and retrying...")
            self.failed_keys.clear()

        # Find next available key
        attempts = 0
        while attempts < len(self.api_keys):
            key = self.api_keys[self.current_index]
            self.current_index = (self.current_index + 1) % len(self.api_keys)
            
            if key not in self.failed_keys:
                print(f"🔑 Using {self.service_name} key #{self.current_index} ({key[:8]}...)")
                return key
            attempts += 1
        
        raise Exception(f"No available {self.service_name} API keys")

    def mark_key_as_failed(self, key: str):
        """Mark a key as failed"""
        self.failed_keys.add(key)
        print(f"❌ Marked {self.service_name} key as failed: {key[:8]}...")

    def execute_with_fallback(self, api_function: Callable, *args, **kwargs) -> Any:
        """Execute a function with automatic key rotation on failure"""
        last_error = None
        max_attempts = len(self.api_keys)
        
        for attempt in range(max_attempts):
            try:
                api_key = self.get_next_key()
                result = api_function(api_key, *args, **kwargs)
                
                # If successful, remove key from failed set (in case it was temporarily failing)
                self.failed_keys.discard(api_key)
                return result
                
            except Exception as error:
                last_error = error
                current_key = self.api_keys[(self.current_index - 1) % len(self.api_keys)]
                
                # Check if it's an API key related error
                if self.is_api_key_error(error):
                    self.mark_key_as_failed(current_key)
                    print(f"🔄 Trying next {self.service_name} key due to auth error...")
                    continue
                else:
                    # If it's not an API key error, don't try other keys
                    raise error
        
        raise Exception(f"All {self.service_name} API keys failed. Last error: {str(last_error)}")

    def is_api_key_error(self, error: Exception) -> bool:
        """Check if error is related to API key authentication or quota issues"""
        error_message = str(error).lower()
        
        # Check for common authentication and quota error patterns
        auth_patterns = [
            'unauthorized', 'invalid api key', 'authentication', 
            'forbidden', '401', '403', '429', 'invalid_api_key',
            'api key', 'authentication failed', 'insufficient credits',
            'quota exceeded', 'rate limit', 'credits are insufficient',
            'top up', 'billing', 'payment required'
        ]
        
        return any(pattern in error_message for pattern in auth_patterns)

    def get_status(self) -> dict:
        """Get current status of all keys"""
        return {
            'total': len(self.api_keys),
            'failed': len(self.failed_keys),
            'available': len(self.api_keys) - len(self.failed_keys),
            'current_index': self.current_index
        }


def initialize_stability_key_manager() -> ApiKeyManager:
    """Initialize Stability AI key manager from environment"""
    stability_keys = os.getenv('STABILITY_KEY', '').split(',')
    return ApiKeyManager(stability_keys, 'Stability AI')