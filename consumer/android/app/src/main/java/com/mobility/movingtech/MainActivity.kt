package com.mobility.movingtech

import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.util.Log
import android.view.WindowInsets
import androidx.activity.enableEdgeToEdge
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.truecaller.android.sdk.oAuth.TcSdk
import `in`.juspay.hypersdk.data.KeyValueStore
import `in`.juspay.hypersdkreact.HyperSdkReactModule
import `in`.juspay.mobility.app.ChatService
import `in`.juspay.mobility.app.InAppNotification
import `in`.juspay.mobility.app.MyFirebaseMessagingService
import `in`.juspay.mobility.app.callbacks.ShowNotificationCallBack
import `in`.juspay.mobility.common.utils.CipherUtil
import org.json.JSONException
import org.json.JSONObject

class MainActivity : ReactActivity() {
  private var inappCallBack: ShowNotificationCallBack? = null

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "Nammayatri"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate {
    return object :ReactActivityDelegate(this, mainComponentName) {
      override fun getLaunchOptions(): Bundle {
        val navBarHeightPx = getNavigationBarHeightFromResources()
        val navBarHeightDp = (navBarHeightPx / resources.displayMetrics.density).toInt()
        val initialProps = Bundle().apply {
          putString("appId", resources.getString(R.string.app_id))
          putString("baseUrl", BuildConfig.CONFIG_URL)
          putString("merchantId", BuildConfig.MERCHANT_ID)
          putInt("navBarHeight", navBarHeightDp)
          // Add more props as needed
        }
        return initialProps
      }
    }
  }

    private fun registerCallBack() {
        inappCallBack = object : ShowNotificationCallBack {
            override fun showInAppNotification(jsonObject: JSONObject, context: Context) {
                showInAppNotificationApp(jsonObject, context)
            }

            override fun hideInAppNotification(channelId: String) {
                hideInAppNotificationApp(channelId)
            }
        }
        ChatService.registerInAppCallback(inappCallBack)
        MyFirebaseMessagingService.registerShowNotificationCallBack(inappCallBack)
    }

    fun showInAppNotificationApp(payload: JSONObject?, context: Context) {
        try {
            val handler = Handler(context.mainLooper)
            handler.postDelayed({
                try {
                    InAppNotification.getInstance(this,reactDelegate?.reactRootView).generateNotification(payload)
                } catch (e: JSONException) {
                    Log.e(
                        LOG_TAG,
                        "Error in In App Notification Handler $e"
                    )
                }
            }, 0)
        } catch (e: Exception) {
            Log.e(LOG_TAG, "Error in In App Notification $e")
        }
    }

    fun hideInAppNotificationApp(channelId: String?) {
        InAppNotification.getInstance(this,reactDelegate?.reactRootView).hideInAppNotification(channelId)
    }
    private fun initiateRSIntegration() {
        val algo: String = BuildConfig.RS_ALGO
        val algoPadding: String = BuildConfig.RS_ALGO_PADDING
        val instanceType: String = BuildConfig.RS_INSTANCE_TYPE
        val encKey: String = BuildConfig.RS_ENC_KEY

        val cipherUtil = CipherUtil.getInstance()
        cipherUtil.setParams(algo, algoPadding, instanceType, encKey)
    }

  override fun onCreate(savedInstanceState: Bundle?) {
      super.onCreate(null)
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && Build.VERSION.SDK_INT < 35)
        enableEdgeToEdge();
      KeyValueStore.write(
        this,
        "godel",
        "ACTIVITY_STATUS",
        "onCreate"
      )
      KeyValueStore.write(
          this,
          "godel",
          "BASE_URL",
          BuildConfig.CONFIG_URL
        )
      KeyValueStore.write(
          this,
          "godel",
          "MERCHANT_ID",
          BuildConfig.MERCHANT_ID
        )
      SplashScreenManager(this).show()
      initiateRSIntegration()
  }


  private fun getNavigationBarHeightFromResources(): Int {
    val resourceId = resources.getIdentifier("navigation_bar_height", "dimen", "android")
    return if (resourceId > 0) resources.getDimensionPixelSize(resourceId) else 0
}

  override fun onPause() {
    super.onPause()
    KeyValueStore.write(
      this,
      "godel",
      "ACTIVITY_STATUS",
      "onPause"
    )
  }

  override fun onResume() {
    super.onResume()
    KeyValueStore.write(
      this,
      "godel",
      "ACTIVITY_STATUS",
      "onResume"
    )
  }


  override fun onDestroy() {
      KeyValueStore.write(
        this,
        "godel",
        "ACTIVITY_STATUS",
        "onDestroy"
      )
      super.onDestroy()
    }

  override fun onNewIntent(intent: Intent) {
      super.onNewIntent(intent)
  }

  override fun onRequestPermissionsResult(
    requestCode: Int,
    permissions: Array<out String>,
    grantResults: IntArray
  ) {
      HyperSdkReactModule.onRequestPermissionsResult(requestCode, permissions, grantResults)
      super.onRequestPermissionsResult(requestCode, permissions, grantResults)
  }


    companion object {
        val LOG_TAG: String?
            get() {
                return Companion::class.java.name
            }
    }


}
