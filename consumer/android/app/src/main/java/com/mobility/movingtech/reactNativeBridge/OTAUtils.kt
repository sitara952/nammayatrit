package com.mobility.movingtech.reactNativeBridge

import android.content.Context
import android.util.Log

/**
 * Utility class demonstrating how to use the OTA Native Manager
 * This can be called from anywhere in your Android native code
 */
object OTAUtils {
    
    private const val TAG = "OTAUtils"
    
    /**
     * Initialize OTA and start checking for updates
     * Call this from your MainApplication or MainActivity
     */
    fun initializeOTA(context: Context, baseUrl: String) {
        val otaManager = OTANativeManager.getInstance(context)
        
        otaManager.initializeAndCheckUpdates(baseUrl, object : OTANativeManager.DownloadCallback {
            override fun onSuccess(bundlePath: String, version: String, packageName: String) {
                Log.d(TAG, "OTAHere Success: $packageName v$version at $bundlePath")
                // Handle successful download
                // You can notify your app that a new bundle is available
            }
            
            override fun onError(error: String) {
                Log.e(TAG, "OTAHere Success: $error")
                // Handle error
            }
            
            override fun onProgress(progress: Int) {
                Log.d(TAG, "OTAHere Progress: $progress%")
                // Update progress if needed
            }
        })
    }
    
    /**
     * Get the current bundle path for loading
     * Use this when starting your React Native bundle
     */
    fun getBundlePath(context: Context): String? {
        return if (OTANativeManager.isInitialized()) {
            OTANativeManager.getInstance(context).getBundlePathSync()
        } else {
            null
        }
    }
    
    /**
     * Get the current version
     */
    fun getCurrentVersion(context: Context): String {
        return if (OTANativeManager.isInitialized()) {
            OTANativeManager.getInstance(context).getCurrentVersionSync()
        } else {
            "unknown"
        }
    }
    
    /**
     * Check if OTA bundle is available
     */
    fun isBundleAvailable(context: Context): Boolean {
        return if (OTANativeManager.isInitialized()) {
            OTANativeManager.getInstance(context).isBundleAvailable()
        } else {
            false
        }
    }
    
    /**
     * Force check for updates
     */
    fun checkForUpdates(context: Context, baseUrl: String) {
        val otaManager = OTANativeManager.getInstance(context)
        
        otaManager.forceCheckForUpdates(baseUrl, object : OTANativeManager.DownloadCallback {
            override fun onSuccess(bundlePath: String, version: String, packageName: String) {
                Log.d(TAG, "Update check complete: $packageName v$version")
            }
            
            override fun onError(error: String) {
                Log.e(TAG, "Update check failed: $error")
            }
            
            override fun onProgress(progress: Int) {
                Log.d(TAG, "Update progress: $progress%")
            }
        })
    }
    
    /**
     * Clear OTA cache
     */
    fun clearCache(context: Context): Boolean {
        return if (OTANativeManager.isInitialized()) {
            OTANativeManager.getInstance(context).clearCache()
        } else {
            false
        }
    }
    
    /**
     * Print debug information to logs
     * Useful for troubleshooting OTA issues
     */
    fun printDebugInfo(context: Context) {
        if (OTANativeManager.isInitialized()) {
            OTANativeManager.getInstance(context).printDebugInfo()
        } else {
            Log.w(TAG, "OTA Manager not initialized. Cannot print debug info.")
        }
    }
    
    /**
     * Get debug information as a map
     * Useful for displaying OTA status in the app
     */
    fun getDebugInfo(context: Context): Map<String, String> {
        return if (OTANativeManager.isInitialized()) {
            OTANativeManager.getInstance(context).getDebugInfo()
        } else {
            mapOf("status" to "OTA Manager not initialized")
        }
    }
}
