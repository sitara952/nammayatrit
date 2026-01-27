package com.nammayatri.reactNativeBridge

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.google.firebase.messaging.FirebaseMessaging

class FCMTokenManagerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "FCMTokenManager"
    }

    @ReactMethod
    fun getFCMToken(promise: Promise) {
        FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
            if (!task.isSuccessful) {
                promise.reject("FCM_ERROR", "Fetching FCM registration token failed", task.exception)
                return@addOnCompleteListener
            }

            // Get new FCM registration token
            val token = task.result
            if (token != null) {
                promise.resolve(token)
            } else {
                promise.reject("FCM_ERROR", "Token is null")
            }
        }
    }
}
