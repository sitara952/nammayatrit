package com.mobility.movingtech.reactNativeBridge

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.mobility.movingtech.MainActivity
import java.util.concurrent.atomic.AtomicInteger

class DebugNotificationModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        private const val CHANNEL_ID = "debug_events_channel"
        private const val CHANNEL_NAME = "Debug Events"
        private const val CHANNEL_DESCRIPTION = "Notifications for debug events"
        private val notificationIdCounter = AtomicInteger(100000)
    }

    override fun getName(): String {
        return "DebugNotificationModule"
    }

    init {
        createNotificationChannel()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val importance = NotificationManager.IMPORTANCE_HIGH
            val channel = NotificationChannel(CHANNEL_ID, CHANNEL_NAME, importance).apply {
                description = CHANNEL_DESCRIPTION
                enableVibration(false)
                setSound(null, null)
                setShowBadge(true)
            }

            val notificationManager = reactApplicationContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    @ReactMethod
    fun showDebugNotification(eventName: String) {
        try {
            val context = reactApplicationContext
            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

            val intent = Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }

            val pendingIntent = PendingIntent.getActivity(
                context,
                0,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            val notificationBuilder = NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(android.R.drawable.ic_dialog_info)
                .setContentTitle("Event: $eventName")
                .setContentText("Debug event logged")
                .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                .setAutoCancel(true)
                .setContentIntent(pendingIntent)
                .setOngoing(false) // Allow user to dismiss

            // Use unique notification ID for each notification
            val notificationId = notificationIdCounter.incrementAndGet()
            notificationManager.notify(notificationId, notificationBuilder.build())
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}


