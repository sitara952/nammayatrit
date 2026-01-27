package com.mobility.movingtech.reactNativeBridge

import android.util.Log
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/**
 * RemoteConfigHelper provides easy-to-use static methods for accessing RemoteConfig
 * This class acts as a bridge between other native files and RemoteConfigProvider
 */
object RemoteConfigHelper {
    
    private const val TAG = "RemoteConfigHelper"
    
    /**
     * Initialize RemoteConfig when the app starts
     * Call this in your Application class or MainActivity
     */
    fun initialize() {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                Log.d(TAG, "🔄 Starting RemoteConfig initialization...")
                val success = RemoteConfigProvider.getInstance().initialize()
                if (success) {
                    Log.i(TAG, "✅ RemoteConfig initialized successfully")
                } else {
                    Log.e(TAG, "❌ Failed to initialize RemoteConfig")
                }
            } catch (e: Exception) {
                Log.e(TAG, "❌ Error initializing RemoteConfig", e)
            }
        }
    }
    
    /**
     * Initialize RemoteConfig with callback when ready
     * The callback is executed on the main thread when initialization completes
     */
    fun initializeWithCallback(onReady: () -> Unit) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                Log.d(TAG, "🔄 Starting RemoteConfig initialization with callback...")
                val success = RemoteConfigProvider.getInstance().initialize()
                
                if (success) {
                    Log.i(TAG, "✅ RemoteConfig initialized successfully, executing callback")
                    // Execute callback on main thread
                    kotlinx.coroutines.withContext(Dispatchers.Main) {
                        onReady()
                    }
                } else {
                    Log.e(TAG, "❌ Failed to initialize RemoteConfig, callback not executed")
                }
            } catch (e: Exception) {
                Log.e(TAG, "❌ Error initializing RemoteConfig, callback not executed", e)
            }
        }
    }
    
    /**
     * Initialize RemoteConfig synchronously (blocking)
     * Use this when you need to ensure RemoteConfig is ready before proceeding
     */
    suspend fun initializeSync(): Boolean {
        return try {
            Log.d(TAG, "🔄 Starting synchronous RemoteConfig initialization...")
            val success = RemoteConfigProvider.getInstance().initialize()
            if (success) {
                Log.i(TAG, "✅ RemoteConfig initialized successfully (sync)")
            } else {
                Log.e(TAG, "❌ Failed to initialize RemoteConfig (sync)")
            }
            success
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error initializing RemoteConfig (sync)", e)
            false
        }
    }
    
    /**
     * Get string value from remote config
     */
    fun getString(key: String, defaultValue: String = ""): String {
        return try {
            RemoteConfigProvider.getInstance().getString(key, defaultValue)
        } catch (e: Exception) {
            Log.e(TAG, "Error getting string config for key: $key", e)
            defaultValue
        }
    }
    
    /**
     * Get boolean value from remote config
     */
    fun getBoolean(key: String, defaultValue: Boolean = false): Boolean {
        return try {
            RemoteConfigProvider.getInstance().getBoolean(key, defaultValue)
        } catch (e: Exception) {
            Log.e(TAG, "Error getting boolean config for key: $key", e)
            defaultValue
        }
    }
    
    /**
     * Get long value from remote config
     */
    fun getLong(key: String, defaultValue: Long = 0L): Long {
        return try {
            RemoteConfigProvider.getInstance().getLong(key, defaultValue)
        } catch (e: Exception) {
            Log.e(TAG, "Error getting long config for key: $key", e)
            defaultValue
        }
    }
    
    /**
     * Get double value from remote config
     */
    fun getDouble(key: String, defaultValue: Double = 0.0): Double {
        return try {
            RemoteConfigProvider.getInstance().getDouble(key, defaultValue)
        } catch (e: Exception) {
            Log.e(TAG, "Error getting double config for key: $key", e)
            defaultValue
        }
    }
    
    /**
     * Check if a config key exists
     */
    fun hasKey(key: String): Boolean {
        return try {
            RemoteConfigProvider.getInstance().hasKey(key)
        } catch (e: Exception) {
            Log.e(TAG, "Error checking if config key exists: $key", e)
            false
        }
    }
    
    /**
     * Get all config keys
     */
    fun getAllKeys(): Set<String> {
        return try {
            RemoteConfigProvider.getInstance().getAllKeys()
        } catch (e: Exception) {
            Log.e(TAG, "Error getting all config keys", e)
            emptySet()
        }
    }
    
    /**
     * Force fetch remote configs (bypasses cache)
     */
    fun forceFetch() {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val success = RemoteConfigProvider.getInstance().forceFetch()
                if (success) {
                    Log.d(TAG, "Force fetch completed successfully")
                } else {
                    Log.w(TAG, "Force fetch failed")
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error during force fetch", e)
            }
        }
    }
    
    /**
     * Get last fetch time
     */
    fun getLastFetchTime(): Long {
        return try {
            RemoteConfigProvider.getInstance().getLastFetchTime()
        } catch (e: Exception) {
            Log.e(TAG, "Error getting last fetch time", e)
            0L
        }
    }
    
    /**
     * Check if RemoteConfig is initialized
     */
    fun isInitialized(): Boolean {
        return try {
            RemoteConfigProvider.getInstance().isInitialized()
        } catch (e: Exception) {
            Log.e(TAG, "Error checking if RemoteConfig is initialized", e)
            false
        }
    }
    
    /**
     * Wait for RemoteConfig to be ready with timeout
     * Returns true if ready within timeout, false otherwise
     */
    suspend fun waitForReady(timeoutMs: Long = 10000L): Boolean {
        return try {
            val startTime = System.currentTimeMillis()
            while (!isInitialized() && (System.currentTimeMillis() - startTime) < timeoutMs) {
                kotlinx.coroutines.delay(100) // Wait 100ms between checks
            }
            isInitialized()
        } catch (e: Exception) {
            Log.e(TAG, "Error waiting for RemoteConfig to be ready", e)
            false
        }
    }
    
    /**
     * Check if config update listener is active
     */
    fun isListenerActive(): Boolean {
        return try {
            RemoteConfigProvider.getInstance().isListenerActive()
        } catch (e: Exception) {
            Log.e(TAG, "Error checking if config update listener is active", e)
            false
        }
    }
    
    /**
     * Remove config update listener
     * Call this when you want to stop listening for config changes
     */
    fun removeConfigUpdateListener() {
        try {
            RemoteConfigProvider.getInstance().removeConfigUpdateListener()
            Log.d(TAG, "Config update listener removed")
        } catch (e: Exception) {
            Log.e(TAG, "Error removing config update listener", e)
        }
    }
    
    /**
     * Cleanup resources
     * Call this when the app is being destroyed
     */
    fun cleanup() {
        try {
            RemoteConfigProvider.getInstance().cleanup()
            Log.d(TAG, "RemoteConfigHelper cleaned up")
        } catch (e: Exception) {
            Log.e(TAG, "Error during cleanup", e)
        }
    }
    
    // Convenience methods for common use cases
    
    /**
     * Get feature flag value
     */
    fun isFeatureEnabled(featureKey: String, defaultValue: Boolean = false): Boolean {
        return getBoolean(featureKey, defaultValue)
    }
    
    /**
     * Get API timeout value
     */
    fun getApiTimeout(defaultValue: Long = 30L): Long {
        return getLong("api_timeout", defaultValue)
    }
    
    /**
     * Get app-level boolean value from Remote Config
     * Parses a JSON object with app-specific boolean values
     * @param key The Remote Config key containing the JSON object
     * @param appName The app name to look for in the JSON object
     * @param defaultValue Default value if app not found or parsing fails
     * @return Boolean value for the specific app
     */
    fun getAppLevelBoolean(key: String, appName: String, defaultValue: Boolean = false): Boolean {
        return try {
            val jsonString = getString(key, "")
            if (jsonString.isEmpty()) {
                Log.w(TAG, "No config found for key: $key")
                return defaultValue
            }
            
            val jsonObject = org.json.JSONObject(jsonString)
            val appValue = jsonObject.optBoolean(appName, defaultValue)
            
            Log.d(TAG, "App-level config for $appName: $appValue (key: $key)")
            appValue
        } catch (e: Exception) {
            Log.e(TAG, "Error parsing app-level boolean config for key: $key, app: $appName", e)
            defaultValue
        }
    }
    
    /**
     * Get max retry attempts
     */
    fun getMaxRetryAttempts(defaultValue: Long = 3L): Long {
        return getLong("max_retry_attempts", defaultValue)
    }
    
    /**
     * Check if debug mode is enabled
     */
    fun isDebugMode(): Boolean {
        return getBoolean("debug_mode", false)
    }
    
    /**
     * Get app version from remote config
     */
    fun getAppVersion(defaultValue: String = "1.0.0"): String {
        return getString("app_version", defaultValue)
    }
}
