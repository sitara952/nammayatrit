package com.mobility.movingtech

//import com.spdroid.schedulefcm.example.util.NotificationUtil
//import com.spdroid.schedulefcm.example.util.isTimeAutomatic
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.media.RingtoneManager
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import java.util.*
import org.json.JSONObject
import java.io.File
import com.facebook.react.bridge.WritableMap
import android.os.Handler
import android.os.Looper
import com.facebook.react.ReactApplication
import com.facebook.react.ReactInstanceEventListener
import com.facebook.react.bridge.ReactContext
import com.moengage.firebase.MoEFireBaseHelper
import com.moengage.pushbase.MoEPushHelper
import `in`.juspay.mobility.app.MyFirebaseMessagingService as HyperFireBase
class MyFirebaseMessagingService : FirebaseMessagingService() {

    companion object {
        private var reactContext: ReactApplicationContext? = null

        fun setReactContext(context: ReactApplicationContext) {
            reactContext = context
        }

        private const val TAG = "MyFirebaseMsgService"
        const val NOTIFICATION_TITLE = "notification_title"
        const val NOTIFICATION_MESSAGE = "notification_message"
    }

    val chanelID = "GENERAL_NOTIFIACTION"

    private val handler = Handler(Looper.getMainLooper())
    private val retryInterval: Long = 10000
    private val maxRetries = 10
    private var retryCount = 0
    private fun getOptionalString(jsonObject: JSONObject, key: String): String {
        return try {
            jsonObject.getString(key)
        } catch (e: Exception) {
            "{}"
        }
    }
    private fun getOptBoolean(jsonObject: JSONObject, key: String): Boolean {
        return try {
            jsonObject.getBoolean(key)
        } catch (e: Exception) {
            false
        }
    }
    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        Log.d("REACT CONTEXT", "$reactContext")
        Log.d(TAG, "Message data payload 1: ${remoteMessage.data}")

        if (MoEPushHelper.getInstance().isFromMoEngagePlatform(remoteMessage.data)){
            MoEFireBaseHelper.getInstance().passPushPayload(applicationContext, remoteMessage.data)
            return;
        }
        val params = Arguments.createMap()
        val dataMap: Map<String, String> = remoteMessage.data // Your data map
        Log.d(TAG, "dataMap: ${dataMap}")

        val dataString = JSONObject(dataMap as Map<*, *>).toString()
        val jsonObject = JSONObject(dataString)
        val notificationJson = getOptionalString(jsonObject,"notification_json")
        val notificationType = getOptionalString(jsonObject,"notification_type")
        val entityIds = getOptionalString(jsonObject,"entity_ids")
        val entityType = getOptionalString(jsonObject,"entity_type")
        val entityData = getOptionalString(jsonObject,"entity_data")
        val notificationJsonVal = JSONObject(getOptionalString(jsonObject,"notification_json"))
        val title = getOptionalString(notificationJsonVal,"title")
        val body = getOptionalString(notificationJsonVal,"body")

        val showNotification = getOptBoolean(jsonObject,"show_notification").toString()
        params.putString("notification_json", notificationJson)
        params.putString("notification_type", notificationType)
        params.putString("entity_ids", entityIds)
        params.putString("entity_type", entityType)
        params.putString("entity_data", entityData)
        params.putString("show_notification", showNotification)
        val driverNotificationPayload = getOptionalString(jsonObject,"driver_notification_payload")
        params.putString("driver_notification_payload", driverNotificationPayload)

        HyperFireBase.onMessageReceived(applicationContext,remoteMessage);
//        showNotification(title, body)

        // Try to emit the event
        emitEvent(params)

        Log.d(TAG, "Message data payload: ${remoteMessage.data}")
    }

    private fun emitEvent(params: WritableMap) {
        Log.d(TAG, "reactContext val: ${reactContext}")

        if (reactContext != null  && reactContext!!.hasActiveReactInstance()) {
            reactContext?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                ?.emit("onFCMReceived", params)
        }
        else if (reactContext != null) {
            val reactInstanceManager =
                (reactContext?.applicationContext as ReactApplication)
                    .reactNativeHost
                    .reactInstanceManager
            val listener = object : ReactInstanceEventListener {
                override fun onReactContextInitialized(context: ReactContext) {
                    context
                        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                        .emit("onFCMReceived", params)
                }
            }
            reactInstanceManager.addReactInstanceEventListener(listener)
        }
        else {
            Log.d(TAG, "this got called reactContext val: ${reactContext}")

            // Only retry if the maximum number of retries has not been reached
            if (retryCount < maxRetries) {
                retryCount++
                handler.postDelayed({ emitEvent(params) }, retryInterval)
            } else {
                Log.d(TAG, "Max retries reached, giving up")
            }
        }
    }

    private fun showNotification(title: String, message: String) {
        val context = this
        createNotificationChannel()
        val intent = Intent(context, MainActivity::class.java)
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
        val pendingIntent = PendingIntent.getActivity(
            context, 0, intent,
            PendingIntent.FLAG_ONE_SHOT or PendingIntent.FLAG_IMMUTABLE
        )

        val defaultSoundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
        val notificationBuilder = NotificationCompat.Builder(context, chanelID)
            .setColor(ContextCompat.getColor(context, android.R.color.holo_red_dark))
            .setSmallIcon(androidx.vectordrawable.animated.R.drawable.notification_tile_bg)
            .setContentTitle(title)
            .setContentText(message)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setSound(defaultSoundUri)
            .setContentIntent(pendingIntent)

        val notificationManager =
            context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        // Since android Oreo notification channel is needed.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                chanelID,
                "Default Channel",
                NotificationManager.IMPORTANCE_HIGH
            )
            notificationManager.createNotificationChannel(channel)
        }

        notificationManager.notify(12345678, notificationBuilder.build())
    }

    override fun onNewToken(token: String) {
        Log.d(TAG, "Refreshed token: $token")
        HyperFireBase.onNewToken(applicationContext,token);

        MoEFireBaseHelper.getInstance().passPushToken(applicationContext,token);

        val sharedPref = applicationContext.getSharedPreferences("RN_ENCRYPTED_STORAGE_SHARED_PREF", Context.MODE_PRIVATE)
        with(sharedPref.edit()) {
            putString("fcm_token", token)
            apply()
        }
    }


    fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val name = "name"
            val descriptionText = "descriptionText"
            val importance = NotificationManager.IMPORTANCE_DEFAULT
            val mChannel = NotificationChannel(chanelID, name, importance)
            mChannel.description = descriptionText
            // Register the channel with the system. You can't change the importance
            // or other notification behaviors after this.
            val notificationManager = getSystemService(NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(mChannel)

        }
    }
}
