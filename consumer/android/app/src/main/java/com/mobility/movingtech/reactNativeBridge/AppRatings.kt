package com.mobility.movingtech.reactNativeBridge

import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.google.android.play.core.review.ReviewManagerFactory
import com.google.android.play.core.review.ReviewException

class AppRatings(reactContext: ReactApplicationContext?) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "AppRatings"
    }

    @ReactMethod
    fun callAppRatings() {
        try {
            Log.i("AppRatings", "Review flow initiated")

            val activity = currentActivity
            if (activity == null) {
                Log.e("AppRatings", "Activity is null. Cannot start review flow.")
                return
            }

            val manager = ReviewManagerFactory.create(activity)
            val request = manager.requestReviewFlow()

            request.addOnCompleteListener { task ->
                if (task.isSuccessful) {
                    val reviewInfo = task.result
                    val flow = manager.launchReviewFlow(activity, reviewInfo)
                    flow.addOnCompleteListener {
                        Log.i("AppRatings", "Review flow completed")
                    }
                } else {
                    val exception = task.exception
                    if (exception is ReviewException) {
                        val errorCode = exception.errorCode
                        Log.e("AppRatings", "Review flow error code: $errorCode")
                    } else {
                        Log.e("AppRatings", "Error requesting review flow: ${exception?.message}")
                    }
                }
            }

        } catch (error: Exception) {
            Log.e("AppRatings", error.toString())
        }
    }
}
