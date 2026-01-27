package com.mobility.movingtech

import android.util.Log
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.soloader.SoLoader
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.appevents.AppEventsLogger
import com.clevertap.react.CleverTapApplication
import com.google.firebase.analytics.FirebaseAnalytics
import com.clevertap.android.sdk.CleverTapAPI
import com.facebook.react.modules.network.NetworkingModule
import com.movingtech.appmonitor.ApiLatencyInterceptor
import com.movingtech.appmonitor.AppMonitor
import com.mobility.movingtech.reactNativeBridge.OTAUtils
import com.mobility.movingtech.reactNativeBridge.RemoteConfigHelper
import com.mobility.movingtech.Utils
import com.facebook.react.soloader.OpenSourceMergedSoMapping
import com.facebook.react.defaults.DefaultReactNativeHost
import java.util.UUID
import com.moengage.core.MoEngage
import com.moengage.core.DataCenter
import com.moengage.core.LogLevel
import com.moengage.core.config.FcmConfig


class MainApplication() : CleverTapApplication(), ReactApplication {
  companion object {
    private const val TAG = "MainApplication"
    var appStartTime: Long = 0L
  }

  override val reactNativeHost: DefaultReactNativeHost = MobilityReactNativeHost(this)

  override val reactHost: ReactHost
    get() = getDefaultReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    appStartTime = System.currentTimeMillis()
    // Uncomment to use in physical device.
    // val preferences =
    //   PreferenceManager.getDefaultSharedPreferences(applicationContext)
    // preferences.edit().putString("debug_http_host", applicationContext.getString(R.string.local_ip) + ":8081").apply()

    // App signatures are now available via AppInfoModule.getAppSignatures() method
    // Initialize Firebase Remote Config with callback
    RemoteConfigHelper.initializeWithCallback {
    }
    val otaBaseUrl = getString(R.string.ota_base_url)
    OTAUtils.initializeOTA(this, otaBaseUrl)
    SoLoader.init(this, OpenSourceMergedSoMapping)
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      // If you opted-in for the New Architecture, we load the native entry point for this app.
      load()
    }
    if(applicationContext != null){
      AppEventsLogger.activateApp(this)
    }

    val defaultInstance = CleverTapAPI.getDefaultInstance(this)
    defaultInstance?.let { ins ->
        try {
          FirebaseAnalytics.getInstance(this).setUserProperty("ct_objectId", ins.cleverTapID)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to sync CleverTap user ID with Firebase Analytics", e)
        }
    } ?: run {
        Log.e(TAG, "Uninstall tracking not setup cause of non initialised instance")
    }

    // Initialize MoEngage SDK
    initMoEngage()

    initAppMonitor()

  }

  private fun initAppMonitor() {
    val monitor: AppMonitor = AppMonitor.getInstance(this);
    var userId = this.getSharedPreferences("godel", MODE_PRIVATE).getString("CUSTOMER_ID",null);
    var baseUrl = BuildConfig.LOG_URL;
    if (baseUrl[baseUrl.length - 1] == '/') {
      baseUrl = baseUrl.substring(0,baseUrl.length - 1)
    }
    if (userId == null) userId = UUID.randomUUID().toString();
    monitor.initialize(baseUrl, "", userId)
    NetworkingModule.setCustomClientBuilder { builder ->
      builder.addInterceptor(
        ApiLatencyInterceptor(true, this)
      )
    }
    val eventPayload: Map<String, Any> = mapOf(
      "event" to "onCreate",
      "timestamp" to System.currentTimeMillis()
    )
    monitor.addEvent("flow_event", "app_start", eventPayload)
  }

  private fun initMoEngage() {
    try {
      val moEngageAppId = getString(R.string.moengage_app_id)
      if (moEngageAppId.isNotEmpty()) {
        val moEngage = MoEngage.Builder(this, moEngageAppId, DataCenter.DATA_CENTER_3)
          .configureFcm(FcmConfig(false))
          .build()
        MoEngage.initialiseDefaultInstance(moEngage)
        Log.i(TAG, "MoEngage SDK initialized successfully")
      } else {
        Log.w(TAG, "MoEngage SDK not initialized: APP_ID not configured")
      }
    } catch (e: Exception) {
      Log.e(TAG, "Failed to initialize MoEngage SDK", e)
    }
  }

  override fun onTerminate() {
    super.onTerminate()
  }
}
