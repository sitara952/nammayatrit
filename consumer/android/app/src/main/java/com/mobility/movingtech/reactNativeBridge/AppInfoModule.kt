package com.mobility.movingtech.reactNativeBridge

import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.provider.Settings
import android.content.ClipData
import android.content.ClipboardManager
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableArray
import com.mobility.movingtech.BuildConfig
import com.mobility.movingtech.AppSignatureHelper
import com.mobility.movingtech.R

class AppInfoModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val deviceIdentifierModule = DeviceIdentifierModule(reactContext)

    override fun getName(): String {
        return "AppInfoModule"
    }

    @ReactMethod
    fun getAppName(promise: Promise) {
        try {
            val context: Context = reactApplicationContext
            val appName: String = context.applicationInfo.loadLabel(context.packageManager).toString()
            promise.resolve(appName)
        } catch (e: Exception) {
            promise.reject("Error", e)
        }
    }

    @ReactMethod
    fun isDebug (promise: Promise){
        try{
            promise.resolve(BuildConfig.DEBUG);
        }
        catch (e : Exception){
            promise.reject("Failed to fetch APK mode");
        }
    }
    @ReactMethod
    fun isPackagePresent( packageName : String, promise: Promise) {
        try {

            val pm = reactApplicationContext.packageManager
            val packages = pm.getInstalledApplications(PackageManager.GET_META_DATA)
            for (packageInfo in packages) {
                if (packageInfo.packageName == packageName)
                { promise.resolve(true)
                return}
            }
            promise.resolve(false)
            return
        }
        catch (e : Exception){
            promise.reject("Failed to get app list",e)
        }
    }

    @ReactMethod
    fun getDeviceId(promise: Promise) {
        try {
            val deviceId = deviceIdentifierModule.getDeviceId(promise)
            promise.resolve(deviceId)
        } catch (e: Exception) {
            promise.reject("ERROR_DEVICE_ID", "Failed to get device ID", e)
        }
    }

    @SuppressLint("HardwareIds")
    @ReactMethod
    fun getUTSId(promise: Promise) {
        try {
            val androidId = Settings.Secure.getString(reactApplicationContext.contentResolver,
                Settings.Secure.ANDROID_ID
            )
            return promise.resolve(androidId)
        } catch (e: Exception) {
            promise.reject("ERROR_IN_UTS_ID", "Failed to get UTS Id", e)
        }
    }

    @ReactMethod
    fun restartApp() {
        val context = reactApplicationContext
        val packageManager = context.packageManager
        val intent = packageManager.getLaunchIntentForPackage(context.packageName)
        val mainIntent = Intent.makeRestartActivityTask(intent!!.component)
        context.startActivity(mainIntent)
        Runtime.getRuntime().exit(0)
    }
    @ReactMethod
    fun isDevSettingsEnabled(promise: Promise) {
        try {
            val isDeveloperModeEnabled = Settings.Global.getInt(reactApplicationContext.contentResolver,
                Settings.Global.DEVELOPMENT_SETTINGS_ENABLED, 0) != 0

            val isUsbDebuggingEnabled = Settings.Global.getInt(reactApplicationContext.contentResolver,
                Settings.Global.ADB_ENABLED, 0) != 0

            val isWifiDebuggingEnabled = Settings.Global.getInt(reactApplicationContext.contentResolver,
                "adb_wifi_enabled", 0) != 0

            val resultMap = Arguments.createMap().apply {
                putBoolean("isDeveloperModeEnabled", isDeveloperModeEnabled)
                putBoolean("isUsbDebuggingEnabled", isUsbDebuggingEnabled)
                putBoolean("isWifiDebuggingEnabled", isWifiDebuggingEnabled)
            }

            promise.resolve(resultMap)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to check developer settings", e)
        }
    }

    @ReactMethod
    fun getAppSignatures(promise: Promise) {
        try {
            val appSignatureHelper = AppSignatureHelper(reactApplicationContext)
            val signatures = appSignatureHelper.getAppSignatures()
            
            
            // Convert ArrayList to WritableArray for React Native
            val signaturesArray = Arguments.createArray()
            for (signature in signatures) {
                signaturesArray.pushString(signature)
            }
            
            promise.resolve(signaturesArray)
        } catch (e: Exception) {
            promise.reject("ERROR_APP_SIGNATURES", "Failed to get app signatures", e)
        }
    }

    @ReactMethod
    fun getMoEngageAppId(promise: Promise) {
        try {
            val moEngageAppId = reactApplicationContext.getString(R.string.moengage_app_id)
            promise.resolve(moEngageAppId ?: "")
        } catch (e: Exception) {
            promise.resolve("")
        }
    }
}
