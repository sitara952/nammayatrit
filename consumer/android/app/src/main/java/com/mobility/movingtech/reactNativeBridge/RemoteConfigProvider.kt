package com.mobility.movingtech.reactNativeBridge

import android.util.Log
import com.google.firebase.remoteconfig.FirebaseRemoteConfig
import com.google.firebase.remoteconfig.FirebaseRemoteConfigException
import com.google.firebase.remoteconfig.FirebaseRemoteConfigSettings
import com.google.firebase.remoteconfig.ConfigUpdate
import com.google.firebase.remoteconfig.ConfigUpdateListener
import com.google.firebase.remoteconfig.ConfigUpdateListenerRegistration
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.tasks.await
import kotlinx.coroutines.withContext

/**
 * RemoteConfigProvider handles Firebase Remote Config operations
 * Provides a singleton instance to prevent multiple initializations and listeners
 */
class RemoteConfigProvider private constructor() {
    
    companion object {
        private const val TAG = "RemoteConfigProvider"
        private const val MINIMUM_FETCH_INTERVAL_SECONDS = 3600L // 1 hour
        
        @Volatile
        private var INSTANCE: RemoteConfigProvider? = null
        
        fun getInstance(): RemoteConfigProvider {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: RemoteConfigProvider().also { INSTANCE = it }
            }
        }
    }
    
    private var remoteConfig: FirebaseRemoteConfig? = null
    private var isInitialized = false
    private var isListenerActive = false
    private var configUpdateListener: ConfigUpdateListener? = null
    private var listenerRegistration: ConfigUpdateListenerRegistration? = null
    
    /**
     * Initialize Firebase Remote Config
     * This should be called when the app starts
     */
    suspend fun initialize(): Boolean {
        return withContext(Dispatchers.IO) {
            try {
                if (isInitialized) {
                    Log.d(TAG, "RemoteConfig already initialized")
                    return@withContext true
                }
                
                // Get Firebase Remote Config instance
                remoteConfig = FirebaseRemoteConfig.getInstance()
                
                // Configure Remote Config settings
                val configSettings = FirebaseRemoteConfigSettings.Builder()
                    .setMinimumFetchIntervalInSeconds(MINIMUM_FETCH_INTERVAL_SECONDS)
                    .build()
                
                remoteConfig?.setConfigSettingsAsync(configSettings)
                
                // Set default values
                setDefaultConfigs()
                
                // Fetch and activate configs
                fetchAndActivateConfigs()
                
                // Setup real-time config update listener
                setupConfigUpdateListener()
                
                isInitialized = true
                Log.d(TAG, "RemoteConfig initialized successfully")
                true
                
            } catch (e: Exception) {
                Log.e(TAG, "Failed to initialize RemoteConfig", e)
                false
            }
        }
    }
    
    /**
     * Set default configuration values
     * These values will be used when remote config is not available
     */
    private fun setDefaultConfigs() {
        try {
            val defaults = mapOf(
                "app_version" to "1.0.0",
                "feature_flags_enabled" to "true",
                "api_timeout" to "30",
                "max_retry_attempts" to "3",
                "debug_mode" to "false"
                // Add more default configs as needed
            )
            
            remoteConfig?.setDefaultsAsync(defaults)
            Log.d(TAG, "Default configs set successfully")
            
        } catch (e: Exception) {
            Log.e(TAG, "Failed to set default configs", e)
        }
    }
    
    /**
     * Fetch and activate remote configs
     */
    private suspend fun fetchAndActivateConfigs() {
        try {
            val fetchResult = remoteConfig?.fetchAndActivate()?.await()
            
            if (fetchResult == true) {
                Log.d(TAG, "Remote configs fetched and activated successfully")
            } else {
                Log.w(TAG, "Remote configs fetch failed or no changes")
            }
            
        } catch (e: Exception) {
            Log.e(TAG, "Failed to fetch and activate configs", e)
        }
    }
    
    /**
     * Setup real-time config update listener
     * This automatically fetches and activates new configs when they're published
     * Based on Firebase documentation: https://firebase.google.com/docs/remote-config/get-started?platform=android#add-real-time-listener
     */
    private fun setupConfigUpdateListener() {
        if (isListenerActive) {
            Log.d(TAG, "Config update listener already active")
            return
        }
        
        try {
            configUpdateListener = object : ConfigUpdateListener {
                override fun onUpdate(configUpdate: ConfigUpdate) {
                    Log.d(TAG, "Remote config updated: ${configUpdate.updatedKeys}")
                    
                    // Activate the updated configs
                    remoteConfig?.activate()?.addOnCompleteListener { task ->
                        if (task.isSuccessful) {
                            Log.d(TAG, "Updated configs activated successfully")
                        } else {
                            Log.e(TAG, "Failed to activate updated configs", task.exception)
                        }
                    }
                }
                
                override fun onError(error: FirebaseRemoteConfigException) {
                    Log.w(TAG, "Config update error with code: ${error.code}", error)
                }
            }
            
            remoteConfig?.addOnConfigUpdateListener(configUpdateListener!!)
            isListenerActive = true
            Log.d(TAG, "Real-time config update listener setup successfully")
            
        } catch (e: Exception) {
            Log.e(TAG, "Failed to setup config update listener", e)
        }
    }
    
    /**
     * Remove config update listener
     * Call this when you want to stop listening for config changes
     */
    fun removeConfigUpdateListener() {
        try {
            configUpdateListener?.let { listener ->
                listenerRegistration?.remove()
                configUpdateListener = null
                isListenerActive = false
                Log.d(TAG, "Config update listener removed")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to remove config update listener", e)
        }
    }
    
    // Getter methods for different config types
    
    /**
     * Get string value from remote config
     */
    fun getString(key: String, defaultValue: String = ""): String {
        return try {
            remoteConfig?.getString(key) ?: defaultValue
        } catch (e: Exception) {
            Log.e(TAG, "Failed to get string config for key: $key", e)
            defaultValue
        }
    }
    
    /**
     * Get boolean value from remote config
     */
    fun getBoolean(key: String, defaultValue: Boolean = false): Boolean {
        return try {
            remoteConfig?.getBoolean(key) ?: defaultValue
        } catch (e: Exception) {
            Log.e(TAG, "Failed to get boolean config for key: $key", e)
            defaultValue
        }
    }
    
    /**
     * Get long value from remote config
     */
    fun getLong(key: String, defaultValue: Long = 0L): Long {
        return try {
            remoteConfig?.getLong(key) ?: defaultValue
        } catch (e: Exception) {
            Log.e(TAG, "Failed to get long config for key: $key", e)
            defaultValue
        }
    }
    
    /**
     * Get double value from remote config
     */
    fun getDouble(key: String, defaultValue: Double = 0.0): Double {
        return try {
            remoteConfig?.getDouble(key) ?: defaultValue
        } catch (e: Exception) {
            Log.e(TAG, "Failed to get double config for key: $key", e)
            defaultValue
        }
    }
    
    /**
     * Get all config keys
     */
    fun getAllKeys(): Set<String> {
        return try {
            remoteConfig?.all?.keys ?: emptySet()
        } catch (e: Exception) {
            Log.e(TAG, "Failed to get all config keys", e)
            emptySet()
        }
    }
    
    /**
     * Check if a config key exists
     */
    fun hasKey(key: String): Boolean {
        return try {
            remoteConfig?.all?.containsKey(key) ?: false
        } catch (e: Exception) {
            Log.e(TAG, "Failed to check if config key exists: $key", e)
            false
        }
    }
    
    /**
     * Force fetch remote configs (bypasses cache)
     * Useful for testing or when you need fresh configs
     */
    suspend fun forceFetch(): Boolean {
        return withContext(Dispatchers.IO) {
            try {
                if (!isInitialized) {
                    Log.w(TAG, "RemoteConfig not initialized. Call initialize() first")
                    return@withContext false
                }
                
                val fetchResult = remoteConfig?.fetch()?.await()
                if (fetchResult != null) {
                    Log.d(TAG, "Force fetch completed successfully")
                    true
                } else {
                    Log.w(TAG, "Force fetch failed")
                    false
                }
                
            } catch (e: Exception) {
                Log.e(TAG, "Force fetch failed", e)
                false
            }
        }
    }
    
    /**
     * Get last fetch time
     */
    fun getLastFetchTime(): Long {
        return try {
            remoteConfig?.info?.fetchTimeMillis ?: 0L
        } catch (e: Exception) {
            Log.e(TAG, "Failed to get last fetch time", e)
            0L
        }
    }
    
    /**
     * Check if RemoteConfig is initialized
     */
    fun isInitialized(): Boolean = isInitialized
    
    /**
     * Check if config update listener is active
     */
    fun isListenerActive(): Boolean = isListenerActive
    
    /**
     * Cleanup resources
     * Call this when the app is being destroyed
     */
    fun cleanup() {
        try {
            removeConfigUpdateListener()
            remoteConfig = null
            isInitialized = false
            Log.d(TAG, "RemoteConfigProvider cleaned up")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to cleanup RemoteConfigProvider", e)
        }
    }
}
