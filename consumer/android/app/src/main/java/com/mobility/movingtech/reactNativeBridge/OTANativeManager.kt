package com.mobility.movingtech.reactNativeBridge

import android.content.Context
import android.util.Log
import com.mobility.movingtech.BuildConfig
import com.mobility.movingtech.R
import com.mobility.movingtech.reactNativeBridge.RemoteConfigHelper
//import com.mobility.movingtech.configmanager.ConfigManager
import kotlinx.coroutines.*
import okhttp3.*
import org.json.JSONObject
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.util.concurrent.TimeUnit
import java.util.zip.ZipEntry
import java.util.zip.ZipInputStream
// import com.tencent.mmkv.MMKV

/**
 * Native OTA Manager Singleton
 * Handles OTA downloads and bundle management without React Native dependencies
 */
class OTANativeManager private constructor(private val context: Context) {

    companion object {
        private const val TAG = "OTANativeManager"
        private const val BUNDLE_DIR = "ota_bundles"
        private const val CONFIG_FILE = "config.json"
        private const val BUNDLE_FILE = "index.android.bundle"
        private const val ASSETS_DIR = "assets"
        private const val METADATA_FILE = "metadata.json"
        private const val STABLE_VERSION_FILE = "stable_version.txt"
        private const val TOSS_PARAM_FILE = "toss_param.txt"
        private const val CURRENT_LOADED_VERSION_FILE = "current_loaded_version.txt"
        private const val LOADED_ONCE_VERSIONS_FILE = "loaded_once_versions.json"
        private const val PENDING_VERSION_FILE = "pending_version.txt"
        private const val BLACKLISTED_VERSIONS_FILE = "blacklisted_versions.json"
        private const val LAST_NATIVE_VERSION_FILE = "last_native_version.txt"

        @Volatile
        private var INSTANCE: OTANativeManager? = null

        /**
         * Get singleton instance of OTANativeManager
         */
        fun getInstance(context: Context): OTANativeManager {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: OTANativeManager(context.applicationContext).also { INSTANCE = it }
            }
        }

        /**
         * Check if instance is initialized
         */
        fun isInitialized(): Boolean = INSTANCE != null
    }

    private val client = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)
        .writeTimeout(60, TimeUnit.SECONDS)
        .build()

    private val coroutineScope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    
    // Callback interfaces for native code
    interface DownloadCallback {
        fun onSuccess(bundlePath: String, version: String, packageName: String)
        fun onError(error: String)
        fun onProgress(progress: Int) // 0-100
    }

    interface VersionCallback {
        fun onResult(version: String)
    }

    interface BundlePathCallback {
        fun onResult(bundlePath: String?)
    }

    interface StableMarkCallback {
        fun onSuccess(version: String)
        fun onError(error: String)
    }

    interface RollbackCallback {
        fun onSuccess(version: String, bundlePath: String)
        fun onError(error: String)
    }

    // Data classes for version management
    data class BundleVersion(
        val version: String,
        val packageName: String,
        val configVersion: String,
        val urlConfigVersion: String,
        val downloadTime: Long,
        val isStable: Boolean,
        val bundlePath: String,
        val configPath: String
    )

    init {
        createDirectories()
        Log.d(TAG, "OTA Native Manager initialized")
        logCurrentState()
    }
    
    /**
     * Log current state for debugging
     */
    private fun logCurrentState() {
        try {
            val nativeVersion = getCurrentNativeVersion()
            val bundledJsVersion = getBundledJsVersion()
            val currentLoadedVersion = getCurrentLoadedVersion()
            val stableVersion = getStableVersion()
            val pendingVersion = getPendingVersion()
            val lastNativeVersion = getLastNativeVersion()
            
            Log.d(TAG, "═══════════════════════════════════════════")
            Log.d(TAG, "📱 OTA STATE AT INITIALIZATION")
            Log.d(TAG, "═══════════════════════════════════════════")
            Log.d(TAG, "Native Version (Current):  $nativeVersion")
            Log.d(TAG, "Native Version (Last):     $lastNativeVersion")
            Log.d(TAG, "Bundled JS Version:        $bundledJsVersion")
            Log.d(TAG, "Current Loaded OTA:        ${currentLoadedVersion ?: "None"}")
            Log.d(TAG, "Stable OTA Version:        ${stableVersion ?: "None"}")
            Log.d(TAG, "Pending OTA Version:       ${pendingVersion ?: "None"}")
            Log.d(TAG, "═══════════════════════════════════════════")
        } catch (e: Exception) {
            Log.e(TAG, "Error logging current state: ${e.message}")
        }
    }

    /**
     * Initialize and check for updates from the given base URL
     * @param baseUrl The base URL where config.json is hosted
     * @param callback Callback for download result
     */
    fun initializeAndCheckUpdates(baseUrl: String, callback: DownloadCallback? = null) {
        Log.d(TAG, "Initializing OTA Manager with base URL: $baseUrl")
        
        // Check if OTA is enabled via ConfigManager
        if (!isOTAEnabled()) {
            Log.d(TAG, "OTA is disabled via configuration")
            callback?.let {
                it.onSuccess(getBundlePathSync() ?: "", getCurrentVersionSync(), "ota-disabled")
            }
            return
        }

        // Launch async initialization to avoid blocking the main thread
        coroutineScope.launch {
            try {
                // First, handle version management logic (async to prevent ANRs)
                handleVersionManagement()
                
                // Then check for new updates
                val hasUpdate = checkForUpdates(baseUrl, callback)
                if (!hasUpdate && callback != null) {
                    withContext(Dispatchers.Main) {
                        callback.onSuccess(getBundlePathSync() ?: "", getCurrentVersionSync(), "no-update")
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error during initialization: ${e.message}")
                callback?.let {
                    withContext(Dispatchers.Main) {
                        it.onError(e.message ?: "Unknown error")
                    }
                }
            }
        }
    }

    /**
     * Force check for updates
     * @param baseUrl The base URL where config.json is hosted
     * @param callback Callback for download result
     */
    fun forceCheckForUpdates(baseUrl: String, callback: DownloadCallback? = null) {
        // Check if OTA is enabled via ConfigManager
        if (!isOTAEnabled()) {
            Log.d(TAG, "OTA is disabled via configuration")
            callback?.let {
                it.onError("OTA is disabled via configuration")
            }
            return
        }
        
        coroutineScope.launch {
            try {
                checkForUpdates(baseUrl, callback)
            } catch (e: Exception) {
                Log.e(TAG, "Error forcing update check: ${e.message}")
                callback?.let {
                    withContext(Dispatchers.Main) {
                        it.onError(e.message ?: "Unknown error")
                    }
                }
            }
        }
    }

    /**
     * Get the current bundle path with smart loading logic
     * Uses the filePath from config to locate bundle within extracted folder
     * @return The path to the bundle file or null if not available (falls back to bundled JS)
     */
    fun getBundlePathSync(): String? {
        return try {
            val currentLoadedVersion = getCurrentLoadedVersion()
            val bundledJsVersion = getBundledJsVersion()
            
            if (currentLoadedVersion != null) {
                if (!shouldUseOTABundle(currentLoadedVersion)) {
                    Log.w(TAG, "⚠️ OTA bundle $currentLoadedVersion should not be used (bundled JS $bundledJsVersion is newer or equal). Invalidating.")
                    // Launch invalidation asynchronously to avoid blocking the main thread
                    coroutineScope.launch {
                        invalidateAllOTABundles()
                    }
                    return null
                }
                
                val bundlePath = getBundlePathForVersion(currentLoadedVersion)
                if (bundlePath != null) {
                    Log.d(TAG, "✅ Using OTA bundle version $currentLoadedVersion: $bundlePath")
                    return bundlePath
                }
            }
            
            Log.w(TAG, "ℹ️ No valid OTA bundle found. Will use bundled JS version $bundledJsVersion")
            null
        } catch (e: Exception) {
            Log.e(TAG, "Error getting bundle path: ${e.message}")
            null
        }
    }

    /**
     * Handle version management logic during initialization
     * This is where all the smart loading decisions happen
     * This is a suspend function to support async file operations
     */
    private suspend fun handleVersionManagement() {
        try {
            val currentNativeVersion = getCurrentNativeVersion()
            val lastNativeVersion = getLastNativeVersion()
            val bundledJsVersion = getBundledJsVersion()
            
            Log.d(TAG, "🔍 Version Check - Native: $currentNativeVersion, Last: $lastNativeVersion, Bundled JS: $bundledJsVersion")
            
            // Check for version change (handles both old and new format)
            val versionChanged = when {
                // CRITICAL FIX: Treat null as version change to invalidate OTA bundles on first launch
                lastNativeVersion == null -> {
                    Log.d(TAG, "📝 First launch detected (no last native version stored). Treating as version change.")
                    true
                }
                // Old format migration: if stored version is old format, compare VERSION_NAME only
                !lastNativeVersion.contains(":") -> {
                    val (currentName, _) = parseNativeVersion(currentNativeVersion)
                    val changed = currentName != lastNativeVersion
                    if (changed) {
                        Log.d(TAG, "📝 Migrating from old version format. Treating as version change.")
                    }
                    changed
                }
                // New format: compare full version string
                else -> currentNativeVersion != lastNativeVersion
            }
            
            // Check if native app was updated
            if (versionChanged) {
                Log.d(TAG, "🔄 Native app updated: $lastNativeVersion → $currentNativeVersion")
                Log.d(TAG, "📦 Bundled JS version: $bundledJsVersion")
                invalidateAllOTABundles()
                setLastNativeVersion(currentNativeVersion)
                Log.d(TAG, "✅ All OTA bundles invalidated. Will use bundled JS.")
                return // Use bundled JS
            }
            
            // Migration handling for old format (after version check, if no change detected)
            if (lastNativeVersion != null && !lastNativeVersion.contains(":")) {
                // Migrate old format to new format
                Log.d(TAG, "📝 Migrating old version format to new format: $lastNativeVersion → $currentNativeVersion")
                setLastNativeVersion(currentNativeVersion)
            }
            
            val currentLoadedVersion = getCurrentLoadedVersion()
            val stableVersion = getStableVersion()
            val pendingVersion = getPendingVersion()
            val loadedOnceVersions = getLoadedOnceVersions()
            val blacklistedVersions = getBlacklistedVersions()
            
            Log.d(TAG, "Version Management - Current: $currentLoadedVersion, Stable: $stableVersion, Pending: $pendingVersion")
            
            // Check if we have a pending version to try (downloaded but not yet loaded)
            if (pendingVersion != null && !loadedOnceVersions.contains(pendingVersion) && !blacklistedVersions.contains(pendingVersion)) {
                val pendingBundlePath = getBundlePathForVersion(pendingVersion)
                if (pendingBundlePath != null) {
                    Log.d(TAG, "Loading pending version once: $pendingVersion")
                    setCurrentLoadedVersion(pendingVersion)
                    markVersionAsLoadedOnce(pendingVersion)
                    clearPendingVersion() // Clear pending since we're loading it
                    return
                }
            }
            
            // Check if current loaded version was loaded once but not marked stable
            if (currentLoadedVersion != null &&
                loadedOnceVersions.contains(currentLoadedVersion) &&
                currentLoadedVersion != stableVersion) {
                Log.w(TAG, "Current version $currentLoadedVersion was loaded but not marked stable, blacklisting it and falling back to stable")
                
                // Blacklist the buggy version
                addToBlacklist(currentLoadedVersion)
                
                // Fall back to stable version
                if (stableVersion != null) {
                    val stableBundlePath = getBundlePathForVersion(stableVersion)
                    if (stableBundlePath != null) {
                        Log.d(TAG, "Falling back to stable version: $stableVersion")
                        setCurrentLoadedVersion(stableVersion)
                        return
                    }
                } else {
                    clearCurrentLoadedVersion()
                    return
                }
            }
            
            // If no current loaded version, set stable as current
            if (currentLoadedVersion == null && stableVersion != null) {
                val stableBundlePath = getBundlePathForVersion(stableVersion)
                if (stableBundlePath != null) {
                    Log.d(TAG, "No current version, setting stable as current: $stableVersion")
                    setCurrentLoadedVersion(stableVersion)
                    return
                }
            }
            
            // If no stable version, try to find any available bundle and set it as current
            if (currentLoadedVersion == null && stableVersion == null) {
                val lastDownloadedBundle = findLastDownloadedBundle()
                if (lastDownloadedBundle != null) {
                    val version = extractVersionFromPath(lastDownloadedBundle)
                    if (version != null && !blacklistedVersions.contains(version)) {
                        // Check if this OTA bundle should be used
                        if (shouldUseOTABundle(version)) {
                            Log.d(TAG, "No stable version, setting last available as current: $version")
                            setCurrentLoadedVersion(version)
                            // Also mark it as stable since it's the only option
                            setStableVersion(version)
                        } else {
                            Log.d(TAG, "Found OTA bundle $version but bundled JS is newer. Will use bundled JS.")
                        }
                    }
                }
            }
            
            // Log final decision
            val finalLoadedVersion = getCurrentLoadedVersion()
            if (finalLoadedVersion != null) {
                Log.d(TAG, "🎯 FINAL DECISION: Will load OTA bundle version $finalLoadedVersion")
            } else {
                Log.d(TAG, "🎯 FINAL DECISION: Will load bundled JS version $bundledJsVersion")
            }
            
        } catch (e: Exception) {
            Log.e(TAG, "Error during version management: ${e.message}")
        }
    }

    /**
     * Check if OTA bundle should be used instead of bundled JS
     * Compares OTA version with bundled JS version
     * @param otaVersion The OTA version to check
     * @return true if OTA should be used, false if bundled JS is newer or equal
     */
    private fun shouldUseOTABundle(otaVersion: String): Boolean {
        return try {
            val bundledJsVersion = getBundledJsVersion()
            val metadata = getVersionMetadata(otaVersion)
            val otaUrlConfigVersion = metadata?.urlConfigVersion ?: otaVersion
            
            val comparison = compareVersions(otaUrlConfigVersion, bundledJsVersion)
            val shouldUse = comparison > 0
            
            Log.d(TAG, "📊 Bundle Decision - OTA: $otaUrlConfigVersion vs Bundled: $bundledJsVersion → ${if (shouldUse) "Use OTA" else "Use Bundled"}")
            
            shouldUse
        } catch (e: Exception) {
            Log.e(TAG, "Error checking if OTA bundle should be used: ${e.message}")
            false // Default to bundled JS on error
        }
    }

    /**
     * Get bundle path for a specific version
     */
    private fun getBundlePathForVersion(version: String): String? {
        return try {
            val versionDir = getVersionDirectory(version)
            val configFile = File(versionDir, CONFIG_FILE)
            
            if (configFile.exists()) {
                val configContent = configFile.readText()
                val config = JSONObject(configContent)
                val packageObj = config.optJSONObject("package")
                val indexObj = packageObj?.optJSONObject("index")
                val filePath = indexObj?.optString("filePath", BUNDLE_FILE) ?: BUNDLE_FILE
                
                val bundleFile = File(versionDir, "extracted/$filePath")
                if (bundleFile.exists()) {
                    return bundleFile.absolutePath
                }
            }
            null
        } catch (e: Exception) {
            Log.e(TAG, "Error getting bundle path for version $version: ${e.message}")
            null
        }
    }



    private fun clearCurrentLoadedVersion() {
        val currentLoaded = File(getBundleDirectory(), CURRENT_LOADED_VERSION_FILE)
        if (currentLoaded.exists()) {
            currentLoaded.delete()
        }
    }
    /**
     * Find the last downloaded bundle path
     * @return Path to the last downloaded bundle or null if not found
     */
    private fun findLastDownloadedBundle(): String? {
        return try {
            val bundleDir = getBundleDirectory()
            if (!bundleDir.exists()) {
                return null
            }
            
            // Get all version directories and sort by modification time (newest first)
            val versionDirs = bundleDir.listFiles()?.filter { it.isDirectory }?.sortedByDescending { it.lastModified() }
            
            for (versionDir in versionDirs ?: emptyList()) {
                val configFile = File(versionDir, CONFIG_FILE)
                if (configFile.exists()) {
                    try {
                        val configContent = configFile.readText()
                        val config = JSONObject(configContent)
                        val packageObj = config.optJSONObject("package")
                        val indexObj = packageObj?.optJSONObject("index")
                        val filePath = indexObj?.optString("filePath", BUNDLE_FILE) ?: BUNDLE_FILE
                        
                        val bundleFile = File(versionDir, "extracted/$filePath")
                        if (bundleFile.exists()) {
                            Log.d(TAG, "Found last downloaded bundle at: ${bundleFile.absolutePath}")
                            return bundleFile.absolutePath
                        }
                    } catch (e: Exception) {
                        Log.w(TAG, "Error reading config for version ${versionDir.name}: ${e.message}")
                        continue
                    }
                }
            }
            
            null
        } catch (e: Exception) {
            Log.e(TAG, "Error finding last downloaded bundle: ${e.message}")
            null
        }
    }

    /**
     * Get the current downloaded bundle path asynchronously
     * @param callback Callback with the bundle path result
     */
    fun getBundlePathAsync(callback: BundlePathCallback) {
        coroutineScope.launch {
            val path = getBundlePathSync()
            withContext(Dispatchers.Main) {
                callback.onResult(path)
            }
        }
    }

    /**
     * Get the current stable version synchronously
     * @return The current stable version or "unknown" if not available
     */
    fun getCurrentVersionSync(): String {
        return getCurrentLoadedVersion() ?: "unknown"
    }

    /**
     * Get the current version asynchronously
     * @param callback Callback with the version result
     */
    fun getCurrentVersionAsync(callback: VersionCallback) {
        coroutineScope.launch {
            val version = getCurrentVersionSync()
            withContext(Dispatchers.Main) {
                callback.onResult(version)
            }
        }
    }

    /**
     * Clear all OTA cache
     * @return true if successful, false otherwise
     */
    fun clearCache(): Boolean {
        return try {
            val bundleDir = getBundleDirectory()
            if (bundleDir.exists()) {
                bundleDir.deleteRecursively()
            }
            createDirectories()
            Log.d(TAG, "OTA cache cleared successfully")
            true
        } catch (e: Exception) {
            Log.e(TAG, "Error clearing cache: ${e.message}")
            false
        }
    }

    /**
     * Check if a bundle is available locally
     * @return true if bundle exists, false otherwise
     */
    fun isBundleAvailable(): Boolean {
        return getBundlePathSync() != null
    }

    /**
     * Get bundle info (path and version) synchronously
     * @return Pair of (bundlePath, version) or (null, "unknown") if not available
     */
    fun getBundleInfo(): Pair<String?, String> {
        return Pair(getBundlePathSync(), getCurrentVersionSync())
    }
    
    /**
     * Get detailed version info for debugging
     * @return Map with all version information
     */
    fun getDebugInfo(): Map<String, String> {
        return try {
            mapOf(
                "nativeVersion" to getCurrentNativeVersion(),
                "lastNativeVersion" to (getLastNativeVersion() ?: "None"),
                "bundledJsVersion" to getBundledJsVersion(),
                "currentLoadedOTA" to (getCurrentLoadedVersion() ?: "None"),
                "stableOTA" to (getStableVersion() ?: "None"),
                "pendingOTA" to (getPendingVersion() ?: "None"),
                "bundlePath" to (getBundlePathSync() ?: "Using bundled JS"),
                "otaEnabled" to isOTAEnabled().toString()
            )
        } catch (e: Exception) {
            Log.e(TAG, "Error getting debug info: ${e.message}")
            mapOf("error" to (e.message ?: "Unknown error"))
        }
    }
    
    /**
     * Print debug info to logs
     */
    fun printDebugInfo() {
        val info = getDebugInfo()
        Log.d(TAG, "═══════════════════════════════════════════")
        Log.d(TAG, "📊 OTA DEBUG INFO")
        Log.d(TAG, "═══════════════════════════════════════════")
        info.forEach { (key, value) ->
            Log.d(TAG, "${key.padEnd(20)}: $value")
        }
        Log.d(TAG, "═══════════════════════════════════════════")
    }

    /**
     * Get metadata for the currently loaded version
     * @return BundleVersion object or null if not found
     */
    fun getCurrentVersionMetadata(): BundleVersion? {
        val currentVersion = getCurrentLoadedVersion()
        return if (currentVersion != null) {
            getVersionMetadata(currentVersion)
        } else {
            null
        }
    }

    /**
     * Get metadata for a specific version
     * @param version The version to get metadata for
     * @return BundleVersion object or null if not found
     */
    fun getVersionMetadata(version: String): BundleVersion? {
        return try {
            val versionDir = getVersionDirectory(version)
            if (!versionDir.isDirectory) {
                return null
            }

            val metadataFile = File(versionDir, METADATA_FILE)
            if (metadataFile.exists()) {
                try {
                    val metadata = JSONObject(metadataFile.readText())
                    var urlConfigVersion = metadata.optString("urlConfigVersion", "")

                    // Self-healing: If urlConfigVersion is missing, extract it from config.json
                    if (urlConfigVersion.isEmpty()) {
                        val configFile = File(versionDir, CONFIG_FILE)
                        if (configFile.exists()) {
                            val configContent = configFile.readText()
                            val config = JSONObject(configContent)
                            val bundleUrl = config.optJSONObject("package")?.optJSONObject("index")?.optString("url", "") ?: ""
                            if (bundleUrl.isNotEmpty()) {
                                urlConfigVersion = extractUrlConfigVersion(bundleUrl)
                                // Update metadata file
                                metadata.put("urlConfigVersion", urlConfigVersion)
                                metadataFile.writeText(metadata.toString())
                                Log.d(TAG, "Self-healed metadata for version $version with urlConfigVersion: $urlConfigVersion")
                            }
                        }
                    }

                    val bundlePath = getBundlePathForVersion(version) ?: ""
                    val configPath = File(versionDir, CONFIG_FILE).absolutePath

                    return BundleVersion(
                        version = metadata.getString("version"),
                        packageName = metadata.getString("packageName"),
                        configVersion = metadata.getString("configVersion"),
                        urlConfigVersion = urlConfigVersion,
                        downloadTime = metadata.getLong("downloadTime"),
                        isStable = metadata.getBoolean("isStable"),
                        bundlePath = bundlePath,
                        configPath = configPath
                    )
                } catch (e: Exception) {
                    Log.w(TAG, "Error reading metadata for $version: ${e.message}")
                    return null
                }
            }
            null
        } catch (e: Exception) {
            Log.e(TAG, "Error getting version metadata for $version: ${e.message}")
            null
        }
    }

    /**
     * Mark the currently loaded bundle as stable
     * @param callback Callback for the result
     */
    fun markCurrentBundleAsStable(callback: StableMarkCallback? = null) {
        coroutineScope.launch {
            try {
                val currentVersion = getCurrentLoadedVersion()
                val currentVersionMeta = getVersionMetadata(currentVersion ?: "")
                println("OTA Stable Marking current bundle as stable...$currentVersion");
                println("OTA Current Version Meta Data")
                println(currentVersionMeta);
                if (currentVersion != null) {
                    markBundleAsStable(currentVersion, callback)
                } else {
                    withContext(Dispatchers.Main) {
                        callback?.onError("No bundle is currently loaded")
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error marking current bundle as stable: ${e.message}")
                withContext(Dispatchers.Main) {
                    callback?.onError(e.message ?: "Unknown error")
                }
            }
        }
    }

    /**
     * Mark the current downloaded bundle as stable
     * @param version The version to mark as stable
     * @param callback Callback for the result
     */
    fun markBundleAsStable(version: String, callback: StableMarkCallback? = null) {
        coroutineScope.launch {
            try {
                val versionDir = getVersionDirectory(version)
                if (!versionDir.exists()) {
                    callback?.onError("Version $version not found")
                    return@launch
                }

                // Mark as stable
                setStableVersion(version)
                
                // Update metadata
                updateVersionMetadata(version, isStable = true)
                
                Log.d(TAG, "Bundle version $version marked as stable")
                
                withContext(Dispatchers.Main) {
                    callback?.onSuccess(version)
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error marking bundle as stable: ${e.message}")
                withContext(Dispatchers.Main) {
                    callback?.onError(e.message ?: "Unknown error")
                }
            }
        }
    }

    /**
     * Rollback to the previous stable version
     * @param callback Callback for the result
     */
    fun rollbackToPreviousVersion(callback: RollbackCallback? = null) {
        coroutineScope.launch {
            try {
                val versions = getAllVersions()
                val currentStable = getStableVersion()
                
                // Find the previous stable version
                val previousStable = versions.find { 
                    it.isStable && it.version != currentStable 
                }
                
                if (previousStable != null) {
                    setStableVersion(previousStable.version)
                    Log.d(TAG, "Rolled back to version ${previousStable.version}")
                    
                    withContext(Dispatchers.Main) {
                        callback?.onSuccess(previousStable.version, previousStable.bundlePath)
                    }
                } else {
                    withContext(Dispatchers.Main) {
                        callback?.onError("No previous stable version found")
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error during rollback: ${e.message}")
                withContext(Dispatchers.Main) {
                    callback?.onError(e.message ?: "Unknown error")
                }
            }
        }
    }

    /**
     * Get all available versions (synchronous - should be called from background thread)
     * @return List of all bundle versions
     */
    fun getAllVersions(): List<BundleVersion> {
        return try {
            val bundleDir = getBundleDirectory()
            val versions = mutableListOf<BundleVersion>()

            bundleDir.listFiles()?.forEach { versionDir ->
                if (versionDir.isDirectory) {
                    getVersionMetadata(versionDir.name)?.let {
                        versions.add(it)
                    }
                }
            }

            versions.sortedByDescending { it.downloadTime }
        } catch (e: Exception) {
            Log.e(TAG, "Error getting all versions: ${e.message}")
            emptyList()
        }
    }

    /**
     * Clean up old versions (keep only the latest N versions) - runs on background thread
     * @param keepCount Number of versions to keep (default: 3)
     */
    fun cleanupOldVersions(keepCount: Int = 3) {
        // This method is already async via coroutineScope.launch - no changes needed
        // It properly runs on background thread and performs I/O operations safely
        coroutineScope.launch {
            try {
                val versions = getAllVersions()
                val stableVersion = getStableVersion()
                
                // Keep stable version + latest versions
                val versionsToDelete = versions.drop(keepCount).filter { 
                    it.version != stableVersion 
                }
                
                versionsToDelete.forEach { version ->
                    val versionDir = getVersionDirectory(version.version)
                    if (versionDir.exists()) {
                        versionDir.deleteRecursively()
                        Log.d(TAG, "Cleaned up version ${version.version}")
                    }
                }
                
                Log.d(TAG, "Cleanup completed. Removed ${versionsToDelete.size} old versions")
            } catch (e: Exception) {
                Log.e(TAG, "Error during cleanup: ${e.message}")
            }
        }
    }

    /**
     * Update the toss parameter (useful for testing or manual refresh) - runs on background thread
     * @param newToss The new toss value to use, or null to generate a new one
     */
    fun updateTossParam(newToss: String? = null) {
        coroutineScope.launch {
            try {
                val tossValue = newToss ?: generateTossParam()
                saveTossParam(tossValue)
                Log.d(TAG, "Updated toss parameter to: $tossValue")
            } catch (e: Exception) {
                Log.e(TAG, "Error updating toss param: ${e.message}")
            }
        }
    }

    /**
     * Get the current toss parameter (synchronous - should be called from background thread)
     * @return The current toss parameter
     */
    fun getCurrentTossParam(): String {
        return getTossParam()
    }

    private fun createDirectories() {
        val bundleDir = getBundleDirectory()
        val assetsDir = File(bundleDir, ASSETS_DIR)
        
        if (!bundleDir.exists()) {
            bundleDir.mkdirs()
        }
        if (!assetsDir.exists()) {
            assetsDir.mkdirs()
        }
    }

    private suspend fun checkForUpdates(baseUrl: String, callback: DownloadCallback?): Boolean {
        return withContext(Dispatchers.IO) {
            try {
                Log.d(TAG, "Checking for updates from: $baseUrl")
                
                // Build config URL with toss parameter
                val configUrl = buildUrlWithTossParam(baseUrl)
                Log.d(TAG, "Config URL with toss param: $configUrl")
                
                val configResponse = downloadFile(configUrl)
                
                if (configResponse == null) {
                    Log.w(TAG, "Failed to download config")
                    return@withContext false
                }
                
                val config = JSONObject(configResponse)
                val packageObj = config.getJSONObject("package")
                val remoteVersion = packageObj.getString("version")
                val indexObj = packageObj.getJSONObject("index")
                val bundleUrl = indexObj.getString("url")
                val packageName = packageObj.getString("name")
                val configVersion = config.getString("version")
                val urlConfigVersion = extractUrlConfigVersion(bundleUrl)
                val bundledJsVersion = getBundledJsVersion()

                Log.d(TAG, "📊 Version Check - Remote: $remoteVersion, URL Config: $urlConfigVersion, Bundled JS: $bundledJsVersion")

                // CRITICAL CHECK 1: Compare OTA version with bundled JS version
                Log.d(TAG, "📊 Version Comparison Check 1:")
                Log.d(TAG, "   Remote OTA: $urlConfigVersion")
                Log.d(TAG, "   Bundled JS: $bundledJsVersion")
                Log.d(TAG, "   Comparison: ${compareVersions(urlConfigVersion, bundledJsVersion)}")
                
                if (compareVersions(urlConfigVersion, bundledJsVersion) <= 0) {
                    Log.d(TAG, "⏭️ Skipping OTA: OTA version ($urlConfigVersion) is not newer than bundled JS ($bundledJsVersion)")
                    return@withContext false
                }

                // Check current version
                val currentVersion = getCurrentVersionSync()
                val blackListedVersion = getBlacklistedVersions()

                if ((remoteVersion == currentVersion)) {
                    Log.d(TAG, "ℹ️ No update needed. Already on version: $currentVersion")
                    return@withContext false
                }

                if  (blackListedVersion.contains(remoteVersion)) {
                    Log.d(TAG, "⚠️ Skipping blacklisted version: $remoteVersion")
                    return@withContext false
                }

                // CRITICAL CHECK 2: Compare with currently downloaded OTA version (if any)
                val currentLoadedVersion = getCurrentLoadedVersion()
                if (currentLoadedVersion != null) {
                    val currentMetadata = getVersionMetadata(currentLoadedVersion)
                    val currentUrlConfigVersion = currentMetadata?.urlConfigVersion ?: "0.0.0"
                    
                    Log.d(TAG, "📊 Version Comparison Check 2:")
                    Log.d(TAG, "   Remote OTA: $urlConfigVersion")
                    Log.d(TAG, "   Current OTA: $currentUrlConfigVersion")
                    Log.d(TAG, "   Comparison: ${compareVersions(urlConfigVersion, currentUrlConfigVersion)}")
                    
                    if (compareVersions(urlConfigVersion, currentUrlConfigVersion) <= 0) {
                        Log.d(TAG, "⏭️ Skipping OTA: Remote OTA ($urlConfigVersion) is not newer than current OTA ($currentUrlConfigVersion)")
                        return@withContext false
                    }
                }
                
                Log.d(TAG, "✅ Update available. Downloading...")
                Log.d(TAG, "   Bundled JS: $bundledJsVersion")
                Log.d(TAG, "   Current OTA: ${currentLoadedVersion ?: "None"}")
                Log.d(TAG, "   New OTA: $urlConfigVersion")
                
                // Notify progress start
                callback?.let {
                    withContext(Dispatchers.Main) {
                        it.onProgress(10) // Starting download
                    }
                }
                
                // Create version directory
                val versionDir = getVersionDirectory(remoteVersion)
                if (!versionDir.exists()) {
                    versionDir.mkdirs()
                }
                
                // Check if bundleUrl is a zip file
                val isZipFile = bundleUrl.endsWith(".zip", ignoreCase = true)
                
                if (isZipFile) {
                    // Download and extract zip file
                    val zipDownloaded = downloadAndExtractZip(bundleUrl, remoteVersion) { progress ->
                        callback?.let {
                            GlobalScope.launch(Dispatchers.Main) {
                                it.onProgress(10 + (progress * 0.8).toInt()) // 10-90% for zip download and extraction
                            }
                        }
                    }
                    
                    if (!zipDownloaded) {
                        Log.e(TAG, "Failed to download and extract zip bundle")
                        return@withContext false
                    }
                } else {
                    // Download individual bundle file (legacy support)
                    val bundleDownloaded = downloadBundleToVersion(bundleUrl, remoteVersion) { progress ->
                        callback?.let {
                            GlobalScope.launch(Dispatchers.Main) {
                                it.onProgress(10 + (progress * 0.7).toInt()) // 10-80% for bundle
                            }
                        }
                    }
                    
                    if (!bundleDownloaded) {
                        Log.e(TAG, "Failed to download bundle")
                        return@withContext false
                    }
                    
                    // Download important assets if any (for legacy individual file downloads)
                    val importantAssets = packageObj.optJSONArray("important")
                    if (importantAssets != null) {
                        callback?.let {
                            withContext(Dispatchers.Main) {
                                it.onProgress(80) // Starting assets download
                            }
                        }
                        downloadAssetsToVersion(baseUrl, importantAssets, remoteVersion)
                    }
                }
                
                // Save new config to version directory
                saveConfigToVersion(configResponse, remoteVersion)

                // Create metadata for this version
                saveVersionMetadata(remoteVersion, packageName, configVersion, urlConfigVersion)

                // Set as pending version (to be loaded on next app start)
                setPendingVersion(remoteVersion)
                
                // Optimize storage: keep only stable version and this new version
                optimizeStorage(remoteVersion)
                
                Log.d(TAG, "Downloaded new version $remoteVersion, set as pending for next app start")
                
                callback?.let {
                    withContext(Dispatchers.Main) {
                        it.onProgress(100) // Complete
                        it.onSuccess(
                            getBundlePathSync() ?: "", // Return current stable bundle path
                            getCurrentVersionSync(), // Return current stable version
                            packageName
                        )
                    }
                }
                
                Log.d(TAG, "OTA update completed successfully. Version: $remoteVersion (pending)")
                true
            } catch (e: Exception) {
                Log.e(TAG, "Error checking for updates: ${e.message}")
                false
            }
        }
    }

    private suspend fun downloadFile(url: String): String? {
        return withContext(Dispatchers.IO) {
            try {
                val request = Request.Builder()
                    .url(url)
                    .addHeader("x-dimension", getXDimensionHeader())
                    .build()
                
                client.newCall(request).execute().use { response ->
                    if (response.isSuccessful) {
                        response.body?.string()
                    } else {
                        Log.e(TAG, "Failed to download file: ${response.code}")
                        null
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error downloading file: ${e.message}")
                null
            }
        }
    }

    private suspend fun downloadBundle(bundleUrl: String, progressCallback: ((Float) -> Unit)? = null): Boolean {
        return withContext(Dispatchers.IO) {
            try {
                val request = Request.Builder()
                    .url(bundleUrl)
                    .build()
                
                val bundleFile = File(getBundleDirectory(), BUNDLE_FILE)
                val tempFile = File(getBundleDirectory(), "temp.bundle")
                
                client.newCall(request).execute().use { response ->
                    if (response.isSuccessful) {
                        val body = response.body
                        val contentLength = body?.contentLength() ?: -1L
                        
                        body?.byteStream()?.use { inputStream ->
                            FileOutputStream(tempFile).use { outputStream ->
                                val buffer = ByteArray(8192)
                                var totalBytesRead = 0L
                                var bytesRead: Int
                                
                                while (inputStream.read(buffer).also { bytesRead = it } != -1) {
                                    outputStream.write(buffer, 0, bytesRead)
                                    totalBytesRead += bytesRead
                                    
                                    // Report progress
                                    if (contentLength > 0 && progressCallback != null) {
                                        val progress = (totalBytesRead.toFloat() / contentLength.toFloat())
                                        progressCallback(progress)
                                    }
                                }
                            }
                        }
                        
                        // Move temp file to final location
                        if (tempFile.exists()) {
                            if (bundleFile.exists()) {
                                bundleFile.delete()
                            }
                            tempFile.renameTo(bundleFile)
                            true
                        } else {
                            false
                        }
                    } else {
                        Log.e(TAG, "Failed to download bundle: ${response.code}")
                        false
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error downloading bundle: ${e.message}")
                false
            }
        }
    }

    private suspend fun downloadAssets(baseUrl: String, assets: org.json.JSONArray) {
        withContext(Dispatchers.IO) {
            try {
                val assetsDir = File(getBundleDirectory(), ASSETS_DIR)
                
                for (i in 0 until assets.length()) {
                    val asset = assets.getString(i)
                    val assetUrl = "$baseUrl/assets/$asset"
                    val assetFile = File(assetsDir, asset)
                    
                    // Create parent directories if needed
                    assetFile.parentFile?.mkdirs()
                    
                    val request = Request.Builder()
                        .url(assetUrl)
                        .addHeader("x-dimension", getXDimensionHeader())
                        .build()
                    
                    client.newCall(request).execute().use { response ->
                        if (response.isSuccessful) {
                            response.body?.byteStream()?.use { inputStream ->
                                FileOutputStream(assetFile).use { outputStream ->
                                    inputStream.copyTo(outputStream)
                                }
                            }
                            Log.d(TAG, "Downloaded asset: $asset")
                        } else {
                            Log.w(TAG, "Failed to download asset: $asset (${response.code})")
                        }
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error downloading assets: ${e.message}")
            }
        }
    }

    private fun saveConfig(configContent: String) {
        try {
            val configFile = File(getBundleDirectory(), CONFIG_FILE)
            configFile.writeText(configContent)
        } catch (e: Exception) {
            Log.e(TAG, "Error saving config: ${e.message}")
        }
    }

    private fun getBundleDirectory(): File {
        return File(context.filesDir, BUNDLE_DIR)
    }

    private fun getVersionDirectory(version: String): File {
        return File(getBundleDirectory(), version)
    }

    private fun getStableVersion(): String? {
        return try {
            val stableFile = File(getBundleDirectory(), STABLE_VERSION_FILE)
            if (stableFile.exists()) {
                stableFile.readText().trim()
            } else {
                null
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error getting stable version: ${e.message}")
            null
        }
    }

    private fun setStableVersion(version: String) {
        try {
            val stableFile = File(getBundleDirectory(), STABLE_VERSION_FILE)
            stableFile.writeText(version)
        } catch (e: Exception) {
            Log.e(TAG, "Error setting stable version: ${e.message}")
        }
    }

    private fun saveVersionMetadata(version: String, packageName: String, configVersion: String, urlConfigVersion: String) {
        try {
            val versionDir = getVersionDirectory(version)
            val metadataFile = File(versionDir, METADATA_FILE)

            val metadata = JSONObject().apply {
                put("version", version)
                put("packageName", packageName)
                put("configVersion", configVersion)
                put("urlConfigVersion", urlConfigVersion)
                put("downloadTime", System.currentTimeMillis())
                put("isStable", false) // New versions are not stable by default
            }

            metadataFile.writeText(metadata.toString())
        } catch (e: Exception) {
            Log.e(TAG, "Error saving version metadata: ${e.message}")
        }
    }

    private fun updateVersionMetadata(version: String, isStable: Boolean) {
        try {
            val versionDir = getVersionDirectory(version)
            val metadataFile = File(versionDir, METADATA_FILE)
            
            if (metadataFile.exists()) {
                val metadata = JSONObject(metadataFile.readText())
                metadata.put("isStable", isStable)
                metadataFile.writeText(metadata.toString())
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error updating version metadata: ${e.message}")
        }
    }

    private suspend fun downloadBundleToVersion(bundleUrl: String, version: String, progressCallback: ((Float) -> Unit)? = null): Boolean {
        return withContext(Dispatchers.IO) {
            try {
                val request = Request.Builder()
                    .url(bundleUrl)
                    .addHeader("x-dimension", getXDimensionHeader())
                    .build()
                
                val versionDir = getVersionDirectory(version)
                val bundleFile = File(versionDir, BUNDLE_FILE)
                val tempFile = File(versionDir, "temp.bundle")
                
                client.newCall(request).execute().use { response ->
                    if (response.isSuccessful) {
                        val body = response.body
                        val contentLength = body?.contentLength() ?: -1L
                        
                        body?.byteStream()?.use { inputStream ->
                            FileOutputStream(tempFile).use { outputStream ->
                                val buffer = ByteArray(8192)
                                var totalBytesRead = 0L
                                var bytesRead: Int
                                
                                while (inputStream.read(buffer).also { bytesRead = it } != -1) {
                                    outputStream.write(buffer, 0, bytesRead)
                                    totalBytesRead += bytesRead
                                    
                                    // Report progress
                                    if (contentLength > 0 && progressCallback != null) {
                                        val progress = (totalBytesRead.toFloat() / contentLength.toFloat())
                                        progressCallback(progress)
                                    }
                                }
                            }
                        }
                        
                        // Move temp file to final location
                        if (tempFile.exists()) {
                            if (bundleFile.exists()) {
                                bundleFile.delete()
                            }
                            tempFile.renameTo(bundleFile)
                            true
                        } else {
                            false
                        }
                    } else {
                        Log.e(TAG, "Failed to download bundle: ${response.code}")
                        false
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error downloading bundle: ${e.message}")
                false
            }
        }
    }

    private suspend fun downloadAssetsToVersion(baseUrl: String, assets: org.json.JSONArray, version: String) {
        withContext(Dispatchers.IO) {
            try {
                val versionDir = getVersionDirectory(version)
                val assetsDir = File(versionDir, ASSETS_DIR)
                
                if (!assetsDir.exists()) {
                    assetsDir.mkdirs()
                }
                
                for (i in 0 until assets.length()) {
                    val asset = assets.getString(i)
                    val assetUrl = "$baseUrl/assets/$asset"
                    val assetFile = File(assetsDir, asset)
                    
                    // Create parent directories if needed
                    assetFile.parentFile?.mkdirs()
                    
                    val request = Request.Builder()
                        .url(assetUrl)
                        .addHeader("x-dimension", getXDimensionHeader())
                        .build()
                    
                    client.newCall(request).execute().use { response ->
                        if (response.isSuccessful) {
                            response.body?.byteStream()?.use { inputStream ->
                                FileOutputStream(assetFile).use { outputStream ->
                                    inputStream.copyTo(outputStream)
                                }
                            }
                            Log.d(TAG, "Downloaded asset: $asset to version $version")
                        } else {
                            Log.w(TAG, "Failed to download asset: $asset (${response.code})")
                        }
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error downloading assets: ${e.message}")
            }
        }
    }

    private fun saveConfigToVersion(configContent: String, version: String) {
        try {
            val versionDir = getVersionDirectory(version)
            val configFile = File(versionDir, CONFIG_FILE)
            configFile.writeText(configContent)
        } catch (e: Exception) {
            Log.e(TAG, "Error saving config to version: ${e.message}")
        }
    }

    private suspend fun downloadAndExtractZip(zipUrl: String, version: String, progressCallback: ((Float) -> Unit)? = null): Boolean {
        return withContext(Dispatchers.IO) {
            try {
                Log.d(TAG, "Downloading zip bundle from: $zipUrl")
                
                val versionDir = getVersionDirectory(version)
                val zipFile = File(versionDir, "bundle.zip")
                val extractDir = File(versionDir, "extracted")
                
                // Create directories
                if (!extractDir.exists()) {
                    extractDir.mkdirs()
                }
                
                // Download zip file
                val downloadSuccess = downloadZipFile(zipUrl, zipFile) { progress ->
                    progressCallback?.invoke(progress * 0.7f) // 0-70% for download
                }
                
                if (!downloadSuccess) {
                    Log.e(TAG, "Failed to download zip file")
                    return@withContext false
                }
                
                // Extract zip file
                progressCallback?.invoke(0.7f) // 70% - starting extraction
                val extractSuccess = extractZipFile(zipFile, extractDir) { progress ->
                    progressCallback?.invoke(0.7f + (progress * 0.3f)) // 70-100% for extraction
                }
                
                if (!extractSuccess) {
                    Log.e(TAG, "Failed to extract zip file")
                    return@withContext false
                }
                
                // Clean up zip file
                if (zipFile.exists()) {
                    zipFile.delete()
                    Log.d(TAG, "Cleaned up zip file")
                }
                
                Log.d(TAG, "Successfully downloaded and extracted zip bundle for version $version")
                true
            } catch (e: Exception) {
                Log.e(TAG, "Error downloading and extracting zip: ${e.message}")
                false
            }
        }
    }

    private suspend fun downloadZipFile(zipUrl: String, zipFile: File, progressCallback: ((Float) -> Unit)? = null): Boolean {
        return withContext(Dispatchers.IO) {
            try {
                val request = Request.Builder()
                    .url(zipUrl)
                    .addHeader("x-dimension", getXDimensionHeader())
                    .build()
                
                client.newCall(request).execute().use { response ->
                    if (response.isSuccessful) {
                        val body = response.body
                        val contentLength = body?.contentLength() ?: -1L
                        
                        body?.byteStream()?.use { inputStream ->
                            FileOutputStream(zipFile).use { outputStream ->
                                val buffer = ByteArray(8192)
                                var totalBytesRead = 0L
                                var bytesRead: Int
                                
                                while (inputStream.read(buffer).also { bytesRead = it } != -1) {
                                    outputStream.write(buffer, 0, bytesRead)
                                    totalBytesRead += bytesRead
                                    
                                    // Report progress
                                    if (contentLength > 0 && progressCallback != null) {
                                        val progress = (totalBytesRead.toFloat() / contentLength.toFloat())
                                        progressCallback(progress)
                                    }
                                }
                            }
                        }
                        true
                    } else {
                        Log.e(TAG, "Failed to download zip file: ${response.code}")
                        false
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error downloading zip file: ${e.message}")
                false
            }
        }
    }

    private suspend fun extractZipFile(zipFile: File, extractDir: File, progressCallback: ((Float) -> Unit)? = null): Boolean {
        return withContext(Dispatchers.IO) {
            try {
                Log.d(TAG, "Extracting zip file to: ${extractDir.absolutePath}")
                
                // First pass: count entries for progress tracking
                var totalEntries = 0
                ZipInputStream(FileInputStream(zipFile)).use { zipInputStream ->
                    while (zipInputStream.nextEntry != null) {
                        totalEntries++
                        zipInputStream.closeEntry()
                    }
                }
                
                // Second pass: extract files
                var extractedEntries = 0
                ZipInputStream(FileInputStream(zipFile)).use { zipInputStream ->
                    var entry: ZipEntry? = zipInputStream.nextEntry
                    
                    while (entry != null) {
                        val entryFile = File(extractDir, entry.name)
                        
                        if (entry.isDirectory) {
                            // Create directory
                            entryFile.mkdirs()
                        } else {
                            // Create parent directories if needed
                            entryFile.parentFile?.mkdirs()
                            
                            // Extract file
                            FileOutputStream(entryFile).use { outputStream ->
                                val buffer = ByteArray(8192)
                                var bytesRead: Int
                                while (zipInputStream.read(buffer).also { bytesRead = it } != -1) {
                                    outputStream.write(buffer, 0, bytesRead)
                                }
                            }
                            
                            Log.d(TAG, "Extracted: ${entry.name}")
                        }
                        
                        zipInputStream.closeEntry()
                        extractedEntries++
                        
                        // Report progress
                        if (totalEntries > 0 && progressCallback != null) {
                            val progress = extractedEntries.toFloat() / totalEntries.toFloat()
                            progressCallback(progress)
                        }
                        
                        entry = zipInputStream.nextEntry
                    }
                }
                
                Log.d(TAG, "Successfully extracted $extractedEntries files")
                true
            } catch (e: Exception) {
                Log.e(TAG, "Error extracting zip file: ${e.message}")
                false
            }
        }
    }

    private fun buildUrlWithTossParam(baseUrl: String): String {
        return try {
            val tossValue = getTossParam()
            val separator = if (baseUrl.contains("?")) "&" else "?"
            "$baseUrl${separator}toss=$tossValue"
        } catch (e: Exception) {
            Log.e(TAG, "Error building URL with toss param: ${e.message}")
            baseUrl
        }
    }

    private fun getTossParam(): String {
        return try {
            val tossFile = File(getBundleDirectory(), TOSS_PARAM_FILE)
            if (tossFile.exists()) {
                val storedToss = tossFile.readText().trim()
                Log.d(TAG, "Using stored toss parameter: $storedToss")
                storedToss
            } else {
                val newToss = generateTossParam()
                saveTossParam(newToss)
                Log.d(TAG, "Generated new toss parameter: $newToss")
                newToss
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error getting toss param: ${e.message}")
            generateTossParam()
        }
    }

    private fun generateTossParam(): String {
        // Generate a toss parameter between 0 and 100
        val tossValue = (Math.random() * 101).toInt() // 0 to 100 inclusive
        return tossValue.toString()
    }

    private fun saveTossParam(tossValue: String) {
        try {
            val tossFile = File(getBundleDirectory(), TOSS_PARAM_FILE)
            tossFile.writeText(tossValue)
            Log.d(TAG, "Saved toss parameter: $tossValue")
        } catch (e: Exception) {
            Log.e(TAG, "Error saving toss param: ${e.message}")
        }
    }

    private fun getLocalCugValue(): String {
        return try {
            val sharedPrefs = context.getSharedPreferences("godel", Context.MODE_PRIVATE)
            val localCugEnabled = sharedPrefs.getBoolean("LOCAL_CUG_ENABLED", false)
            Log.d("OTA CUG", "LOCAL_CUG_ENABLED: $localCugEnabled")
            if (localCugEnabled) "true" else "false"
        } catch (e: Exception) {
            Log.e(TAG, "Error reading LOCAL_CUG_ENABLED: ${e.message}")
            "false" // fallback to current behavior
        }
    }

    private fun getXDimensionHeader(): String {
        return try {
            // Get device and app information for headers
            val rcHeaders = mutableMapOf<String, String>()
            
            // Add device information
            rcHeaders["device_model"] = android.os.Build.MODEL
            rcHeaders["device_manufacturer"] = android.os.Build.MANUFACTURER
            rcHeaders["android_version"] = android.os.Build.VERSION.RELEASE
            rcHeaders["client_version"] = BuildConfig.VERSION_NAME
            rcHeaders["version"] = BuildConfig.VERSION_NAME
            rcHeaders["package_name"] = context.packageName
            rcHeaders["local_cug"] = getLocalCugValue()
            rcHeaders["local_version"] = BuildConfig.VERSION_NAME
            // val mmkv = MMKV.defaultMMKV()
            // val consumerId = mmkv?.decodeString("USER_ID", "unknown") ?: "unknown"
            // rcHeaders["consumerId"] = consumerId
            // Add OTA specific information
            rcHeaders["ota_manager"] = "native"
            rcHeaders["stable_version"] = getStableVersion() ?: "unknown"
            rcHeaders["toss_param"] = getTossParam()
            
            // Sort headers and create dimension string
            val sortedHeaders = rcHeaders.toSortedMap()
            sortedHeaders.entries.joinToString(";") { "${it.key}=${it.value}" }
        } catch (e: Exception) {
            Log.e(TAG, "Error creating x-dimension header: ${e.message}")
            "ota_manager=native;error=header_creation_failed"
        }
    }

    /**
     * Get the currently loaded version
     */
    private fun getCurrentLoadedVersion(): String? {
        return try {
            val currentLoadedFile = File(getBundleDirectory(), CURRENT_LOADED_VERSION_FILE)
            if (currentLoadedFile.exists()) {
                currentLoadedFile.readText().trim().takeIf { it.isNotEmpty() }
            } else {
                null
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error getting current loaded version: ${e.message}")
            null
        }
    }

    /**
     * Set the currently loaded version
     */
    private fun setCurrentLoadedVersion(version: String) {
        try {
            val currentLoadedFile = File(getBundleDirectory(), CURRENT_LOADED_VERSION_FILE)
            currentLoadedFile.writeText(version)
            Log.d(TAG, "Set current loaded version to: $version")
        } catch (e: Exception) {
            Log.e(TAG, "Error setting current loaded version: ${e.message}")
        }
    }

    /**
     * Get versions that have been loaded once
     */
    private fun getLoadedOnceVersions(): Set<String> {
        return try {
            val loadedOnceFile = File(getBundleDirectory(), LOADED_ONCE_VERSIONS_FILE)
            if (loadedOnceFile.exists()) {
                val jsonContent = loadedOnceFile.readText()
                val jsonArray = org.json.JSONArray(jsonContent)
                val versions = mutableSetOf<String>()
                for (i in 0 until jsonArray.length()) {
                    versions.add(jsonArray.getString(i))
                }
                versions
            } else {
                emptySet()
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error getting loaded once versions: ${e.message}")
            emptySet()
        }
    }

    /**
     * Mark a version as loaded once
     */
    private fun markVersionAsLoadedOnce(version: String) {
        try {
            val loadedOnceVersions = getLoadedOnceVersions().toMutableSet()
            loadedOnceVersions.add(version)
            
            val jsonArray = org.json.JSONArray(loadedOnceVersions.toList())
            val loadedOnceFile = File(getBundleDirectory(), LOADED_ONCE_VERSIONS_FILE)
            loadedOnceFile.writeText(jsonArray.toString())
            
            Log.d(TAG, "Marked version $version as loaded once")
        } catch (e: Exception) {
            Log.e(TAG, "Error marking version as loaded once: ${e.message}")
        }
    }

    /**
     * Extract version from bundle path
     */
    private fun extractVersionFromPath(bundlePath: String): String? {
        return try {
            // Extract version from path like: .../ota_bundles/1.2.3/extracted/index.android.bundle
            val pathParts = bundlePath.split("/")
            val bundlesDirIndex = pathParts.indexOfLast { it == "ota_bundles" }
            if (bundlesDirIndex >= 0 && bundlesDirIndex + 1 < pathParts.size) {
                pathParts[bundlesDirIndex + 1]
            } else {
                null
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error extracting version from path: ${e.message}")
            null
        }
    }

    /**
     * Get blacklisted versions
     */
    private fun getBlacklistedVersions(): Set<String> {
        return try {
            val blacklistFile = File(getBundleDirectory(), BLACKLISTED_VERSIONS_FILE)
            if (blacklistFile.exists()) {
                val jsonContent = blacklistFile.readText()
                val jsonArray = org.json.JSONArray(jsonContent)
                val versions = mutableSetOf<String>()
                for (i in 0 until jsonArray.length()) {
                    versions.add(jsonArray.getString(i))
                }
                versions
            } else {
                emptySet()
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error getting blacklisted versions: ${e.message}")
            emptySet()
        }
    }

    /**
     * Add a version to blacklist
     */
    private fun addToBlacklist(version: String) {
        try {
            val blacklistedVersions = getBlacklistedVersions().toMutableSet()
            blacklistedVersions.add(version)
            
            val jsonArray = org.json.JSONArray(blacklistedVersions.toList())
            val blacklistFile = File(getBundleDirectory(), BLACKLISTED_VERSIONS_FILE)
            blacklistFile.writeText(jsonArray.toString())
            
            Log.d(TAG, "Added version $version to blacklist")
        } catch (e: Exception) {
            Log.e(TAG, "Error adding version to blacklist: ${e.message}")
        }
    }

    /**
     * Remove a version from blacklist
     */
    fun removeFromBlacklist(version: String) {
        coroutineScope.launch {
            try {
                val blacklistedVersions = getBlacklistedVersions().toMutableSet()
                blacklistedVersions.remove(version)
                
                val jsonArray = org.json.JSONArray(blacklistedVersions.toList())
                val blacklistFile = File(getBundleDirectory(), BLACKLISTED_VERSIONS_FILE)
                blacklistFile.writeText(jsonArray.toString())
                
                Log.d(TAG, "Removed version $version from blacklist")
            } catch (e: Exception) {
                Log.e(TAG, "Error removing version from blacklist: ${e.message}")
            }
        }
    }

    /**
     * Clear blacklist (useful for testing) - runs on background thread
     */
    fun clearBlacklist() {
        coroutineScope.launch {
            try {
                val blacklistFile = File(getBundleDirectory(), BLACKLISTED_VERSIONS_FILE)
                if (blacklistFile.exists()) {
                    blacklistFile.delete()
                }
                Log.d(TAG, "Cleared blacklist")
            } catch (e: Exception) {
                Log.e(TAG, "Error clearing blacklist: ${e.message}")
            }
        }
    }

    /**
     * Clear loaded once tracking (useful for testing) - runs on background thread
     */
    fun clearLoadedOnceTracking() {
        coroutineScope.launch {
            try {
                val loadedOnceFile = File(getBundleDirectory(), LOADED_ONCE_VERSIONS_FILE)
                if (loadedOnceFile.exists()) {
                    loadedOnceFile.delete()
                }
                Log.d(TAG, "Cleared loaded once tracking")
            } catch (e: Exception) {
                Log.e(TAG, "Error clearing loaded once tracking: ${e.message}")
            }
        }
    }

    /**
     * Get the pending version (downloaded but not yet loaded)
     */
    private fun getPendingVersion(): String? {
        return try {
            val pendingFile = File(getBundleDirectory(), PENDING_VERSION_FILE)
            if (pendingFile.exists()) {
                pendingFile.readText().trim().takeIf { it.isNotEmpty() }
            } else {
                null
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error getting pending version: ${e.message}")
            null
        }
    }

    /**
     * Set the pending version (downloaded but not yet loaded)
     */
    private fun setPendingVersion(version: String) {
        try {
            val pendingFile = File(getBundleDirectory(), PENDING_VERSION_FILE)
            pendingFile.writeText(version)
            Log.d(TAG, "Set pending version to: $version")
        } catch (e: Exception) {
            Log.e(TAG, "Error setting pending version: ${e.message}")
        }
    }

    /**
     * Clear the pending version
     */
    private fun clearPendingVersion() {
        try {
            val pendingFile = File(getBundleDirectory(), PENDING_VERSION_FILE)
            if (pendingFile.exists()) {
                pendingFile.delete()
            }
            Log.d(TAG, "Cleared pending version")
        } catch (e: Exception) {
            Log.e(TAG, "Error clearing pending version: ${e.message}")
        }
    }

    /**
     * Get the current app name from strings.xml
     */
    private fun getCurrentAppName(): String {
        return try {
            context.getString(R.string.app_id)
        } catch (e: Exception) {
            Log.e(TAG, "Error getting app name from strings.xml: ${e.message}")
            "unknown"
        }
    }

    /**
     * Check if OTA is enabled via Remote Config
     */
   private fun isOTAEnabled(): Boolean {
       val appName = getCurrentAppName()
       val isEnabled = RemoteConfigHelper.getAppLevelBoolean("ota_enabled_apps", appName, false)
       Log.d(TAG, "🔧 OTA Status from Remote Config - App: $appName, Enabled: $isEnabled")
       return isEnabled
   }

    /**
     * Optimize storage by keeping only stable version and new version
     */
    private fun optimizeStorage(newVersion: String) {
        try {
            val stableVersion = getStableVersion()
            val bundleDir = getBundleDirectory()
            
            if (!bundleDir.exists()) return
            
            val versionsToKeep = mutableSetOf<String>()
            
            // Always keep stable version
            stableVersion?.let { versionsToKeep.add(it) }
            
            // Always keep new version
            versionsToKeep.add(newVersion)
            
            // Get all version directories
            val versionDirs = bundleDir.listFiles()?.filter { it.isDirectory } ?: emptyList()
            
            // Delete versions not in keep list
            var deletedCount = 0
            for (versionDir in versionDirs) {
                val version = versionDir.name
                if (!versionsToKeep.contains(version)) {
                    try {
                        versionDir.deleteRecursively()
                        deletedCount++
                        Log.d(TAG, "Deleted old version: $version")
                    } catch (e: Exception) {
                        Log.e(TAG, "Error deleting version $version: ${e.message}")
                    }
                }
            }
            
            // Clean up loaded once tracking for deleted versions
            cleanupLoadedOnceTracking(versionsToKeep)

            Log.d(TAG, "Storage optimization completed. Deleted $deletedCount old versions. Keeping: ${versionsToKeep.joinToString(", ")}")
        } catch (e: Exception) {
            Log.e(TAG, "Error during storage optimization: ${e.message}")
        }
    }

    /**
     * Clean up loaded once tracking for deleted versions
     */
    private fun cleanupLoadedOnceTracking(versionsToKeep: Set<String>) {
        try {
            val loadedOnceVersions = getLoadedOnceVersions().filter { versionsToKeep.contains(it) }.toSet()
            
            val jsonArray = org.json.JSONArray(loadedOnceVersions.toList())
            val loadedOnceFile = File(getBundleDirectory(), LOADED_ONCE_VERSIONS_FILE)
            loadedOnceFile.writeText(jsonArray.toString())
            
            Log.d(TAG, "Cleaned up loaded once tracking")
        } catch (e: Exception) {
            Log.e(TAG, "Error cleaning up loaded once tracking: ${e.message}")
        }
    }

    /**
     * Clean up blacklist for deleted versions
     */
    private fun cleanupBlacklist(versionsToKeep: Set<String>) {
        try {
            val blacklistedVersions = getBlacklistedVersions().filter { versionsToKeep.contains(it) }.toSet()
            
            val jsonArray = org.json.JSONArray(blacklistedVersions.toList())
            val blacklistFile = File(getBundleDirectory(), BLACKLISTED_VERSIONS_FILE)
            blacklistFile.writeText(jsonArray.toString())
            
            Log.d(TAG, "Cleaned up blacklist")
        } catch (e: Exception) {
            Log.e(TAG, "Error cleaning up blacklist: ${e.message}")
        }
    }

    private fun extractUrlConfigVersion(url: String): String {
        // Extracts version from URL like: https://ny.assets.juspay.in/hyper/bundles/app/consumer/0.0.27/android/react-native-bundle-0.0.27.zip -> 0.0.27
        return try {
            Log.d("OTATest", "Extracting version from URL: $url")
            val regex = Regex("""/(\d+\.\d+\.\d+)/""")
            val match = regex.find(url)
            val res = match?.groups?.get(1)?.value ?: ""
            Log.d("OTATest", "Extracted version: $res")
            return res
        } catch (e: Exception) {
            Log.e(TAG, "Error extracting version from URL: $url")
            ""
        }
    }

    /**
     * Get the bundled JS version from resources
     * @return The bundled JS version string
     */
    private fun getBundledJsVersion(): String {
        return try {
            context.getString(R.string.bundled_js_version)
        } catch (e: Exception) {
            Log.e(TAG, "Error getting bundled JS version: ${e.message}")
            "0.0.0" // Fallback to lowest version
        }
    }

    /**
     * Get the current native app version
     * Returns combined format: "VERSION_NAME:VERSION_CODE" for reliable change detection
     * @return The native app version from BuildConfig in format "VERSION_NAME:VERSION_CODE"
     */
    private fun getCurrentNativeVersion(): String {
        return "${BuildConfig.VERSION_NAME}:${BuildConfig.VERSION_CODE}"
    }

    /**
     * Get the last native version from storage
     * Supports backward compatibility with old format (VERSION_NAME only)
     * @return The last native version or null if not set
     */
    private fun getLastNativeVersion(): String? {
        return try {
            val lastNativeFile = File(getBundleDirectory(), LAST_NATIVE_VERSION_FILE)
            if (lastNativeFile.exists()) {
                val storedVersion = lastNativeFile.readText().trim().takeIf { it.isNotEmpty() }
                
                // Backward compatibility: If old format (no colon), migrate to new format
                if (storedVersion != null && !storedVersion.contains(":")) {
                    Log.d(TAG, "📝 Detected old version format: $storedVersion. Migrating to new format on next save.")
                    // Return as-is for now, will be migrated when setLastNativeVersion is called
                    return storedVersion
                }
                
                storedVersion
            } else {
                null
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error getting last native version: ${e.message}")
            null
        }
    }

    /**
     * Set the last native version to storage
     * @param version The native version to save
     */
    private fun setLastNativeVersion(version: String) {
        try {
            val lastNativeFile = File(getBundleDirectory(), LAST_NATIVE_VERSION_FILE)
            lastNativeFile.writeText(version)
            Log.d(TAG, "Set last native version to: $version")
        } catch (e: Exception) {
            Log.e(TAG, "Error setting last native version: ${e.message}")
        }
    }

    /**
     * Parse native version string into VERSION_NAME and VERSION_CODE
     * Supports both formats: "VERSION_NAME:VERSION_CODE" (new) and "VERSION_NAME" (old)
     * @param version The version string to parse
     * @return Pair of (VERSION_NAME, VERSION_CODE) where VERSION_CODE is null for old format
     */
    private fun parseNativeVersion(version: String): Pair<String, Int?> {
        return try {
            if (version.contains(":")) {
                val parts = version.split(":", limit = 2)
                val name = parts[0]
                val code = parts[1].toIntOrNull()
                Pair(name, code)
            } else {
                // Old format: only VERSION_NAME
                Pair(version, null)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error parsing native version $version: ${e.message}")
            Pair(version, null)
        }
    }

    /**
     * Compare two semantic versions
     * @param v1 First version string (e.g., "1.2.3")
     * @param v2 Second version string (e.g., "1.2.4")
     * @return 1 if v1 > v2, -1 if v1 < v2, 0 if equal
     */
    private fun compareVersions(v1: String, v2: String): Int {
        return try {
            val parts1 = v1.split(".").map { it.toIntOrNull() ?: 0 }
            val parts2 = v2.split(".").map { it.toIntOrNull() ?: 0 }
            
            val maxLength = maxOf(parts1.size, parts2.size)
            
            for (i in 0 until maxLength) {
                val p1 = parts1.getOrNull(i) ?: 0
                val p2 = parts2.getOrNull(i) ?: 0
                
                when {
                    p1 > p2 -> return 1
                    p1 < p2 -> return -1
                }
            }
            
            0 // Versions are equal
        } catch (e: Exception) {
            Log.e(TAG, "Error comparing versions $v1 and $v2: ${e.message}")
            0 // Treat as equal on error
        }
    }

    /**
     * Invalidate all OTA bundles (called when native app is updated)
     * This is a suspend function to ensure file I/O operations don't block the main thread
     */
    private suspend fun invalidateAllOTABundles() {
        withContext(Dispatchers.IO) {
            try {
                Log.d(TAG, "Invalidating all OTA bundles due to native app update")
                
                // Clear current loaded version
                clearCurrentLoadedVersion()
                
                // Clear pending version
                clearPendingVersion()
                
                // Clear stable version
                val stableFile = File(getBundleDirectory(), STABLE_VERSION_FILE)
                if (stableFile.exists()) {
                    stableFile.delete()
                }
                
                // Optionally: Delete all downloaded bundles to save space
                // For now, we'll keep them for potential debugging/rollback
                val bundleDir = getBundleDirectory()
                bundleDir.listFiles()?.forEach { versionDir ->
                    if (versionDir.isDirectory) {
                        versionDir.deleteRecursively()
                        Log.d(TAG, "Deleted OTA bundle: ${versionDir.name}")
                    }
                }
                
                Log.d(TAG, "OTA bundles invalidated successfully")
            } catch (e: Exception) {
                Log.e(TAG, "Error invalidating OTA bundles: ${e.message}")
            }
        }
    }

    /**
     * Clean up resources
     */
    fun cleanup() {
        coroutineScope.cancel()
        Log.d(TAG, "OTA Native Manager cleaned up")
    }
}
