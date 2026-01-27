package com.movingtech.reactNativeBridge

import android.content.Context
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Callback
import com.mobility.movingtech.BuildConfig
import com.mobility.movingtech.R

class BuildConfigModule(reactContext: ReactApplicationContext?) :
    ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String {
        return "BuildConfigModule"
    }

    override fun getConstants(): MutableMap<String, Any> {
        val constants = HashMap<String, Any>()
        constants["BASE_URL"] = BuildConfig.BASE_URL
        constants["SDK_ENV"] = BuildConfig.SDK_ENV
        constants["MERCHANT_ID"] = BuildConfig.MERCHANT_ID
        constants["CONFIG_URL"] = BuildConfig.CONFIG_URL
        return constants
    }

    @ReactMethod
    fun getMerchantId(callback: Callback) {
        callback.invoke(BuildConfig.MERCHANT_ID)
    }

    @ReactMethod
    fun getConfigUrl(callback: Callback) {
        callback.invoke(BuildConfig.CONFIG_URL)
    }

    @ReactMethod
    fun getAppId(callback: Callback) {
        val context: Context = reactApplicationContext
        callback.invoke(context.resources.getString(R.string.app_id))
    }

    @ReactMethod
    fun getBaseUrl(callback: Callback) {
        callback.invoke(BuildConfig.BASE_URL)
    }
}
