package com.mobility.movingtech.reactNativeBridge


import android.app.Activity
import android.content.IntentSender
import android.location.LocationManager
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.google.android.gms.common.api.ResolvableApiException
import com.google.android.gms.location.LocationRequest
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.LocationSettingsRequest
import com.google.android.gms.location.LocationSettingsResponse
import com.google.android.gms.tasks.Task
import android.content.Context
import android.content.Intent
import com.facebook.react.bridge.ActivityEventListener

class LocationModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "LocationModule"
    }

    private var promise: Promise? = null
    private val REQUEST_GPS = 1001

    @ReactMethod
    fun showGpsEnableDialog(promise: Promise) {
        this.promise = promise

        val activity: Activity = currentActivity ?: run {
            promise.reject("Activity not available")
            return
        }

        val locationRequest = LocationRequest.create().apply {
            priority = LocationRequest.PRIORITY_HIGH_ACCURACY
            interval = 10000
            fastestInterval = 5000
        }

        val builder = LocationSettingsRequest.Builder()
                .addLocationRequest(locationRequest)

        val task: Task<LocationSettingsResponse> =
                LocationServices.getSettingsClient(activity).checkLocationSettings(builder.build())

        task.addOnSuccessListener {
            // Location settings are already satisfied, resolve the promise as true
            promise.resolve(true)
        }

        task.addOnFailureListener { exception ->
            if (exception is ResolvableApiException) {
                try {
                    // Start the resolution activity for result
                    exception.startResolutionForResult(activity, REQUEST_GPS)
                } catch (e: IntentSender.SendIntentException) {
                    promise.reject("Failed to show dialog", e)
                }
            } else {
                // Location services are not available, resolve as false
                promise.resolve(false)
            }
        }

        // Add activity result listener to capture the result
        reactApplicationContext.addActivityEventListener(object : ActivityEventListener {
            override fun onActivityResult(p0: Activity?, requestCode: Int, resultCode: Int, data: Intent?) {
                if (requestCode == REQUEST_GPS) {
                    if (resultCode == Activity.RESULT_OK) {
                        // User accepted the location settings change
                        promise.resolve(true)
                    } else {
                        // User rejected the location settings change
                        promise.resolve(false)
                    }
                }
            }

            override fun onNewIntent(intent: Intent?) {}
        })
    }

    @ReactMethod
    fun isGpsEnabled(promise: Promise) {
        try {
            val locationManager = reactApplicationContext.getSystemService(Context.LOCATION_SERVICE) as LocationManager
            val isEnabled = locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)
            promise.resolve(isEnabled)
        } catch (e: Exception) {
            promise.reject("GPS_STATUS_ERROR", e.message)
        }
    }
}
