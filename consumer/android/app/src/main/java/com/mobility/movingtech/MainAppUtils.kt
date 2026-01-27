package com.mobility.movingtech

import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableType
import `in`.juspay.hypersdk.data.KeyValueStore
import org.json.JSONObject
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat


class MainAppUtils(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "MainAppUtils"
    }

    @ReactMethod
    fun getSharedPreferences(promise: Promise) {
        try {
            val context: Context = reactApplicationContext
            val oldSharedPref: SharedPreferences = context.getSharedPreferences("godel", Context.MODE_PRIVATE)
            val oldEntries: Map<String, *> = oldSharedPref.all

            // Convert old SharedPreferences data to JSON
            val json = JSONObject()
            for ((key, value) in oldEntries) {
                when (value) {
                    is Int -> json.put(key, value)
                    is String -> json.put(key, value)
                    is Float -> json.put(key, value)
                    is Long -> json.put(key, value)
                    is Boolean -> json.put(key, value)
                }
            }

            // Resolve the promise with the JSON data as a string
            promise.resolve(json.toString())
        } catch (e: Exception) {
            promise.reject("Error", e)
        }
    }

    @ReactMethod
    fun isReactUpdated(promise: Promise) {
        try {
            val context: Context = reactApplicationContext
            val oldSharedPref: SharedPreferences = context.getSharedPreferences("godel", Context.MODE_PRIVATE)
            promise.resolve(oldSharedPref.contains("isReactUpdated"))
        } catch (e: Exception) {
            promise.resolve(true);
        }
    }

    @ReactMethod
    fun updateSharedPreferences(data: ReadableMap, promise: Promise) {
        try {
            // Iterate over ReadableMap keys
            val iterator = data.keySetIterator()
            while (iterator.hasNextKey()) {
                val key = iterator.nextKey()

                // Validate value type
                when (data.getType(key)) {
                    ReadableType.String -> {
                        KeyValueStore.write(
                            reactApplicationContext,
                            "godel",
                            key,
                            data.getString(key)
                        )
                    }
                    ReadableType.Boolean -> {
                        val sharedPrefs = reactApplicationContext.getSharedPreferences("godel", Context.MODE_PRIVATE)
                        sharedPrefs.edit().putBoolean(key, data.getBoolean(key)).apply()
                    }
                    else -> {
                        throw IllegalArgumentException(
                            "Unsupported value type for key: $key. Only string and boolean values are allowed."
                        )
                    }
                }
            }
            promise.resolve("Data successfully updated in SharedPreferences")
        } catch (e: Exception) {
            promise.reject("Error in updating SharedPreferences", e.message)
        }
    }

    @ReactMethod
    fun hideSplash() { }

    @ReactMethod
    fun getAppStartTime(promise: Promise) {
        promise.resolve(MainApplication.appStartTime.toString())
    }

    @ReactMethod
    fun minimizeApp() {
        val context: Context = reactApplicationContext
        val startMain = Intent(Intent.ACTION_MAIN)
        startMain.addCategory(Intent.CATEGORY_HOME)
        startMain.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        context.startActivity(startMain)
    }

    @ReactMethod
    fun isGestureNavigationEnabled(promise: Promise) {
        val activity = currentActivity ?: run {
        promise.resolve(false)
        return
        }

        val decorView = activity.window?.decorView ?: run {
        promise.resolve(false)
        return
        }

        // Must be posted because insets may be zero early in lifecycle in release builds
        decorView.post {
        val insets = ViewCompat.getRootWindowInsets(decorView)
        if (insets == null) {
            promise.resolve(false)
            return@post
        }

        val gesture = insets.getInsets(WindowInsetsCompat.Type.systemGestures()).bottom
        val nav = insets.getInsets(WindowInsetsCompat.Type.navigationBars()).bottom

        promise.resolve(gesture > nav)
        }
    }
}
