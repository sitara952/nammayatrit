package com.mobility.movingtech.reactNativeBridge

import com.facebook.react.bridge.*
import android.util.Log
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.DeviceEventManagerModule

/**
 * React Native bridge for OTA Native Manager
 * Provides TypeScript interface to native OTA functionality
 */
class OTABridge(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val NAME = "OTABridge"
        private const val TAG = "OTABridge"
    }

    override fun getName(): String = NAME

    /**
     * Mark the currently loaded bundle as stable
     * @param promise Promise for the result
     */
    @ReactMethod
    fun markCurrentBundleAsStable(promise: Promise) {
        // Execute on background thread
        Thread {
            try {
                val otaManager = OTANativeManager.getInstance(reactContext)
                
                otaManager.markCurrentBundleAsStable(object : OTANativeManager.StableMarkCallback {
                    override fun onSuccess(version: String) {
                        promise.resolve(version)
                    }
                    
                    override fun onError(error: String) {
                        promise.reject("MARK_STABLE_ERROR", error)
                    }
                })
            } catch (e: Exception) {
                Log.e(TAG, "Error marking current bundle as stable: ${e.message}")
                promise.reject("MARK_STABLE_ERROR", e.message, e)
            }
        }.start()
    }

    /**
     * Mark the current bundle as stable
     * @param version The version to mark as stable
     * @param promise Promise for the result
     */
    @ReactMethod
    fun markBundleAsStable(version: String, promise: Promise) {
        // Execute on background thread
        Thread {
            try {
                val otaManager = OTANativeManager.getInstance(reactContext)
                
                otaManager.markBundleAsStable(version, object : OTANativeManager.StableMarkCallback {
                    override fun onSuccess(version: String) {
                        promise.resolve(version)
                    }
                    
                    override fun onError(error: String) {
                        promise.reject("MARK_STABLE_ERROR", error)
                    }
                })
            } catch (e: Exception) {
                Log.e(TAG, "Error marking bundle as stable: ${e.message}")
                promise.reject("MARK_STABLE_ERROR", e.message, e)
            }
        }.start()
    }

    /**
     * Rollback to previous stable version
     * @param promise Promise for the result
     */
    @ReactMethod
    fun rollbackToPreviousVersion(promise: Promise) {
        // Execute on background thread
        Thread {
            try {
                val otaManager = OTANativeManager.getInstance(reactContext)
                
                otaManager.rollbackToPreviousVersion(object : OTANativeManager.RollbackCallback {
                    override fun onSuccess(version: String, bundlePath: String) {
                        val result = Arguments.createMap().apply {
                            putString("version", version)
                            putString("bundlePath", bundlePath)
                        }
                        promise.resolve(result)
                    }
                    
                    override fun onError(error: String) {
                        promise.reject("ROLLBACK_ERROR", error)
                    }
                })
            } catch (e: Exception) {
                Log.e(TAG, "Error during rollback: ${e.message}")
                promise.reject("ROLLBACK_ERROR", e.message, e)
            }
        }.start()
    }

    /**
     * Get all available versions
     * @param promise Promise for the result
     */
    @ReactMethod
    fun getAllVersions(promise: Promise) {
        // Execute on background thread
        Thread {
            try {
                val otaManager = OTANativeManager.getInstance(reactContext)
                val versions = otaManager.getAllVersions()
                
                val versionsArray = Arguments.createArray()
                versions.forEach { version ->
                    val versionMap = Arguments.createMap().apply {
                        putString("version", version.version)
                        putString("packageName", version.packageName)
                        putString("configVersion", version.configVersion)
                        putDouble("downloadTime", version.downloadTime.toDouble())
                        putBoolean("isStable", version.isStable)
                        putString("bundlePath", version.bundlePath)
                        putString("configPath", version.configPath)
                    }
                    versionsArray.pushMap(versionMap)
                }
                
                promise.resolve(versionsArray)
            } catch (e: Exception) {
                Log.e(TAG, "Error getting all versions: ${e.message}")
                promise.reject("GET_VERSIONS_ERROR", e.message, e)
            }
        }.start()
    }

    /**
     * Get current stable version
     * @param promise Promise for the result
     */
    @ReactMethod
    fun getCurrentStableVersion(promise: Promise) {
        // Execute on background thread
        Thread {
            try {
                val otaManager = OTANativeManager.getInstance(reactContext)
                val version = otaManager.getCurrentVersionSync()
                Log.d("OTAHereeee version", version)
                promise.resolve(version)
            } catch (e: Exception) {
                Log.e("OTAHereeee error", "Error getting current stable version: ${e.message}")
                promise.reject("GET_STABLE_VERSION_ERROR", e.message, e)
            }
        }.start()
    }

    /**
     * Get stable bundle path
     * @param promise Promise for the result
     */
    @ReactMethod
    fun getStableBundlePath(promise: Promise) {
        // Execute on background thread
        Thread {
            try {
                val otaManager = OTANativeManager.getInstance(reactContext)
                val bundlePath = otaManager.getBundlePathSync()
                promise.resolve(bundlePath)
            } catch (e: Exception) {
                Log.e(TAG, "Error getting stable bundle path: ${e.message}")
                promise.reject("GET_BUNDLE_PATH_ERROR", e.message, e)
            }
        }.start()
    }

    /**
     * Get metadata for the currently loaded version
     * @param promise Promise for the result
     */
    @ReactMethod
    fun getCurrentVersionMetadata(promise: Promise) {
        // Execute on background thread
        Thread {
            try {
                val otaManager = OTANativeManager.getInstance(reactContext)
                val version = otaManager.getCurrentVersionMetadata()
                
                if (version != null) {
                    val versionMap = Arguments.createMap().apply {
                        putString("version", version.version)
                        putString("packageName", version.packageName)
                        putString("configVersion", version.configVersion)
                        putString("urlConfigVersion", version.urlConfigVersion)
                        putDouble("downloadTime", version.downloadTime.toDouble())
                        putBoolean("isStable", version.isStable)
                        putString("bundlePath", version.bundlePath)
                        putString("configPath", version.configPath)
                    }
                    promise.resolve(versionMap)
                } else {
                    promise.resolve(null)
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error getting current version metadata: ${e.message}")
                promise.reject("GET_METADATA_ERROR", e.message, e)
            }
        }.start()
    }

    fun cleanupOldVersions(keepCount: Double, promise: Promise?) {
        // Execute on background thread
        Thread {
            try {
                val otaManager = OTANativeManager.getInstance(reactContext)
                otaManager.cleanupOldVersions(keepCount.toInt())
                promise?.resolve(true)
            } catch (e: Exception) {
                Log.e(TAG, "Error cleaning up old versions: ${e.message}")
                promise?.reject("CLEANUP_ERROR", e.message, e)
            }
        }.start()
    }

    /**
     * Clean up old versions
     * @param keepCount Number of versions to keep (default: 3)
     * @param promise Promise for the result
     */
    @ReactMethod
    fun cleanupOldVersions(keepCount: Int, promise: Promise) {
        // Execute on background thread
        Thread {
            try {
                val otaManager = OTANativeManager.getInstance(reactContext)
                otaManager.cleanupOldVersions(keepCount)
                promise.resolve(true)
            } catch (e: Exception) {
                Log.e(TAG, "Error cleaning up old versions: ${e.message}")
                promise.reject("CLEANUP_ERROR", e.message, e)
            }
        }.start()
    }

    /**
     * Remove a version from blacklist
     * @param version The version to remove from blacklist
     * @param promise Promise for the result
     */
    @ReactMethod
    fun removeFromBlacklist(version: String, promise: Promise) {
        // Execute on background thread
        Thread {
            try {
                val otaManager = OTANativeManager.getInstance(reactContext)
                otaManager.removeFromBlacklist(version)
                promise.resolve(true)
            } catch (e: Exception) {
                Log.e(TAG, "Error removing from blacklist: ${e.message}")
                promise.reject("BLACKLIST_ERROR", e.message, e)
            }
        }.start()
    }

    /**
     * Clear blacklist
     * @param promise Promise for the result
     */
    @ReactMethod
    fun clearBlacklist(promise: Promise) {
        // Execute on background thread
        Thread {
            try {
                val otaManager = OTANativeManager.getInstance(reactContext)
                otaManager.clearBlacklist()
                promise.resolve(true)
            } catch (e: Exception) {
                Log.e(TAG, "Error clearing blacklist: ${e.message}")
                promise.reject("BLACKLIST_ERROR", e.message, e)
            }
        }.start()
    }

    /**
     * Initialize OTA and check for updates
     * @param baseUrl The base URL for OTA updates
     * @param promise Promise for the result
     */
    @ReactMethod
    fun initializeAndCheckUpdates(baseUrl: String, promise: Promise) {
        // Execute on background thread
        Thread {
            try {
                val otaManager = OTANativeManager.getInstance(reactContext)
                
                otaManager.initializeAndCheckUpdates(baseUrl, object : OTANativeManager.DownloadCallback {
                    override fun onSuccess(bundlePath: String, version: String, packageName: String) {
                        val result = Arguments.createMap().apply {
                            putString("bundlePath", bundlePath)
                            putString("version", version)
                            putString("packageName", packageName)
                        }
                        promise.resolve(result)
                    }
                    
                    override fun onError(error: String) {
                        promise.reject("INIT_ERROR", error)
                    }
                    
                    override fun onProgress(progress: Int) {
                        // Send progress events if needed
                        sendEvent("onOTAProgress", Arguments.createMap().apply {
                            putInt("progress", progress)
                        })
                    }
                })
            } catch (e: Exception) {
                Log.e(TAG, "Error initializing OTA: ${e.message}")
                promise.reject("INIT_ERROR", e.message, e)
            }
        }.start()
    }

    /**
     * Update the toss parameter
     * @param newToss The new toss value to use, or null to generate a new one
     * @param promise Promise for the result
     */
    @ReactMethod
    fun updateTossParam(newToss: String?, promise: Promise) {
        // Execute on background thread
        Thread {
            try {
                val otaManager = OTANativeManager.getInstance(reactContext)
                otaManager.updateTossParam(newToss)
                val currentToss = otaManager.getCurrentTossParam()
                promise.resolve(currentToss)
            } catch (e: Exception) {
                Log.e(TAG, "Error updating toss param: ${e.message}")
                promise.reject("UPDATE_TOSS_ERROR", e.message, e)
            }
        }.start()
    }

    /**
     * Get the current toss parameter
     * @param promise Promise for the result
     */
    @ReactMethod
    fun getCurrentTossParam(promise: Promise) {
        // Execute on background thread
        Thread {
            try {
                val otaManager = OTANativeManager.getInstance(reactContext)
                val tossParam = otaManager.getCurrentTossParam()
                promise.resolve(tossParam)
            } catch (e: Exception) {
                Log.e(TAG, "Error getting toss param: ${e.message}")
                promise.reject("GET_TOSS_ERROR", e.message, e)
            }
        }.start()
    }

    private fun sendEvent(eventName: String, params: WritableMap?) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }
}
