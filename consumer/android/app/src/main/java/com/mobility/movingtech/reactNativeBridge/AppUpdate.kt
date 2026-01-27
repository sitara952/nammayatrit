package com.mobility.movingtech.reactNativeBridge

import android.app.Activity
import android.app.Instrumentation
import android.content.Intent
import android.content.IntentSender
import android.graphics.Color
import android.util.Log
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.google.android.material.snackbar.Snackbar
import com.google.android.play.core.appupdate.AppUpdateInfo
import com.google.android.play.core.appupdate.AppUpdateManager
import com.google.android.play.core.appupdate.AppUpdateManagerFactory
import com.google.android.play.core.install.InstallStateUpdatedListener
import com.google.android.play.core.install.model.AppUpdateType
import com.google.android.play.core.install.model.InstallStatus
import com.google.android.play.core.install.model.UpdateAvailability


class AppUpdate(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), ActivityEventListener {

    private val appUpdateManager: AppUpdateManager = AppUpdateManagerFactory.create(reactContext)
    private val REQUEST_CODE_UPDATE_APP = 587

    init {
        reactContext.addActivityEventListener(this)
    }

    override fun getName(): String {
        return "AppUpdate"
    }

    @ReactMethod
    fun checkAndUpdateApp(updateTypeConfig: String?) {
        val activity = currentActivity ?: return

        if (updateTypeConfig == "ignore_update") return

        Log.d("AppUpdateReact", "Called CheckAndUpdate");
        // Determine update type
        val updateType = if (updateTypeConfig == "force_update") {
            AppUpdateType.IMMEDIATE
        } else {
            AppUpdateType.FLEXIBLE
        }

        val listener = InstallStateUpdatedListener { state ->
            if (state.installStatus() == InstallStatus.DOWNLOADED) {
                showSnackbarForUpdateCompletion(activity)
            }
        }

        appUpdateManager.registerListener(listener)

        val appUpdateInfoTask = appUpdateManager.appUpdateInfo

        appUpdateInfoTask.addOnSuccessListener { appUpdateInfo: AppUpdateInfo ->
            if (appUpdateInfo.updateAvailability() == UpdateAvailability.UPDATE_AVAILABLE &&
                appUpdateInfo.isUpdateTypeAllowed(updateType)
            ) {
                try {
                    appUpdateManager.startUpdateFlowForResult(
                        appUpdateInfo,
                        updateType,
                        activity,
                        REQUEST_CODE_UPDATE_APP
                    )
                } catch (e: IntentSender.SendIntentException) {
                    e.printStackTrace()
                }
            }
        }
    }

    private fun showSnackbarForUpdateCompletion(activity: Activity) {
        Snackbar.make(
            activity.findViewById(android.R.id.content),
            "An update has just been downloaded.",
            Snackbar.LENGTH_INDEFINITE
        ).setAction("RESTART") {
            appUpdateManager.completeUpdate()
        }.setActionTextColor(Color.parseColor("#FCC32C")).show()
    }

    override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode == REQUEST_CODE_UPDATE_APP) {
            if (resultCode != Activity.RESULT_OK) {
                println("Update flow failed or was canceled by the user.")
            }
        }
    }

    override fun onNewIntent(intent: Intent?) {
        // Not required
    }
}
