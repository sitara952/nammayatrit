package com.mobility.movingtech.reactNativeBridge

import android.annotation.SuppressLint
import android.content.Context
import android.media.MediaDrm
import android.media.UnsupportedSchemeException
import android.os.Build
import android.provider.Settings
import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import java.util.UUID

class DeviceIdentifierModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "DeviceIdentifier"
    }

    fun getDeviceId(promise: Promise) {
        try {
            val deviceId = getDeviceIdInternal(reactApplicationContext)
            promise.resolve(deviceId)
        } catch (e: Exception) {
            promise.reject("ERROR_DEVICE_ID", e.message, e)
        }
    }

    private fun getDeviceIdInternal(context: Context): String {
        val mediaDRM = getMediaDRM()
        if (isValid(mediaDRM)) return "$mediaDRM$${getDeviceModel()}"
        val androidId = getAndroidId(context)
        if (isValid(androidId)) return "$androidId$$ANDROID_ID"
        return getFallbackUUID(context)
    }

    private fun getFallbackUUID(context: Context): String {
        return try {
            val sharedPrefs = context.getSharedPreferences("device_prefs", Context.MODE_PRIVATE)
            var uuid = sharedPrefs.getString(DEVICE_ID, null)
            if (!isValid(uuid)) {
                uuid = UUID.randomUUID().toString()
                sharedPrefs.edit().putString(DEVICE_ID, uuid).apply()
            }
            "$uuid$$RANDOM_UUID"
        } catch (e: Exception) {
            "NO_DEVICE_ID"
        }
    }

    private fun getMediaDRM(): String? {
        var deviceId: String? = null
        val widevineUUID = UUID.fromString(WIDEVINE_UUID_STRING)

        var mediaDrm: MediaDrm? = null
        try {
            mediaDrm = MediaDrm(widevineUUID)
            val deviceUniqueId = mediaDrm.getPropertyByteArray(MediaDrm.PROPERTY_DEVICE_UNIQUE_ID)
            deviceId = bytesToHex(deviceUniqueId)
        } catch (e: UnsupportedSchemeException) {
            Log.e(TAG, "Unsupported DRM scheme", e)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to get DRM ID", e)
        } finally {
            mediaDrm?.let {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                    it.close()
                } else {
                    @Suppress("DEPRECATION")
                    it.release()
                }
            }
        }
        return deviceId
    }

    private fun bytesToHex(bytes: ByteArray): String {
        val sb = StringBuilder()
        for (b in bytes) {
            sb.append(String.format("%02x", b))
        }
        return sb.toString()
    }

    private fun getDeviceModel(): String {
        val model = Build.MODEL
        return model?.replace(" ", "") ?: "UnknownModel"
    }

    companion object {
        private const val TAG = "DeviceIdentifierModule"
        private const val WIDEVINE_UUID_STRING = "edef8ba9-79d6-4ace-a3c8-27dcd51d21ed"
        private const val DEVICE_ID = "DEVICE_ID"
        private const val ANDROID_ID = "ANDROID_ID"
        private const val RANDOM_UUID = "RANDOM_UUID"

        fun isValid(id: String?): Boolean {
            return id != null && id.isNotEmpty() && id != "null" && id != "__failed" && id != "(null)"
        }

        @SuppressLint("HardwareIds")
        fun getAndroidId(context: Context?): String? {
            return context?.let {
                Settings.Secure.getString(it.contentResolver, Settings.Secure.ANDROID_ID)
            }
        }
    }
}
