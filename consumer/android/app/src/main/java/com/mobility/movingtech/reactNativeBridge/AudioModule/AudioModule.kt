package com.mobility.movingtech.reactNativeBridge

import android.content.Context
import android.content.pm.PackageManager
import android.media.MediaPlayer
import android.media.MediaRecorder
import android.net.Uri
import android.os.Environment
import android.os.Handler
import android.os.Looper
import android.util.Log
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.facebook.react.ReactApplication
import com.facebook.react.ReactInstanceEventListener
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.io.File
import java.io.IOException

class AudioModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private var mediaRecorder: MediaRecorder? = null
    private var mediaPlayer: MediaPlayer? = null
    private var isRecording = false
    private var currentRecordingFile: File? = null
    private val context: Context = reactContext;
    private var audioPlayer: MediaPlayer? = null
    private var recordedFilePath: String? = null

    override fun getName(): String {
        return "AudioModule"
    }

    @ReactMethod
    fun startRecording(fileName: String, promise: Promise) {
        // Check if the necessary permissions are granted
        if (ContextCompat.checkSelfPermission(reactApplicationContext, android.Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            currentActivity?.let { ActivityCompat.requestPermissions(it, arrayOf(android.Manifest.permission.RECORD_AUDIO), 101) }
            promise.reject("no_permission", "Audio recording permission is not granted")
            return
        }

        try {
            // Define the path to save the recorded file
            recordedFilePath = "${reactApplicationContext.filesDir}/${fileName.replace(".m4a","")}.mp3"

            // Stop and release any existing MediaRecorder instance
            mediaRecorder?.apply {
                stop()
                reset()
                release()
            }

            // Initialize and configure the MediaRecorder
            mediaRecorder = MediaRecorder().apply {
                setAudioSource(MediaRecorder.AudioSource.MIC)
                setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
                setAudioEncoder(MediaRecorder.AudioEncoder.AAC)  // Use AAC for better quality
                setOutputFile(recordedFilePath)
                prepare()  // Prepare the recorder
                start()    // Start recording
            }

            // Resolve the promise with the recorded file path
            promise.resolve(recordedFilePath)
        } catch (e: Exception) {
            // Reject the promise in case of any error
            promise.reject("start_recording_error", "Failed to start recording: ${e.message}")
        }
    }

//    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<String>, grantResults: IntArray) {
//        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
//        if (requestCode == REQUEST_CODE) {
//            if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
//                // Permission granted, continue with the recording
//                startRecording("my_audio", promise)
//            } else {
//                // Permission denied, show an error or handle accordingly
//                promise.reject("permission_denied", "Permission was denied")
//            }
//        }
//    }

    @ReactMethod
    fun stopRecording(fileName: String, promise: Promise) {
        try {
            mediaRecorder?.apply {
                stop()
                reset()
                release()
            }

            promise.resolve(recordedFilePath)
        } catch (e: Exception) {

            promise.reject("stop_recording_error", "Failed to stop recording: ${e.message}")
        } finally {
            mediaRecorder = null
        }
    }

    private fun getFile(fileName: String): File? {
        if (fileName.isEmpty()) return null
        val directory = reactApplicationContext.filesDir
        return File(directory, fileName)
    }


//     @ReactMethod
     @ReactMethod
     fun playAudio(
         audioFileName: String,
         loopAudio: Boolean,
         promise: Promise
     ) {
         try {
             val filePath = "${reactApplicationContext.filesDir.absolutePath}/${audioFileName.replace(".m4a", "")}.mp3"
             val audioFile = File(filePath)
             mediaPlayer = MediaPlayer();

             if(!audioFile.exists())
             {
                 val context = currentActivity?.applicationContext
                 val resourceId = context?.resources?.getIdentifier(audioFileName.replace(".mp3",""), "raw", context.packageName)

                 if(resourceId == null || resourceId == 0){
                     promise.reject("file_not_found", "File not found in raw resources")
                     return
                 }

                 val audioUri = Uri.parse("android.resource://${context?.packageName}/${resourceId}")
                 mediaPlayer!!.setDataSource(context, audioUri)

             } else {
                 mediaPlayer!!.setDataSource(filePath)
             }
             mediaPlayer?.apply {
                 prepare()
                 isLooping = loopAudio
                 start()
                 setOnCompletionListener {
                     sendEvent("onPlaybackComplete", Arguments.createMap().apply {
                         putString("message", "Playback complete")
                     })
                 }
             }

         }
         catch (e: IOException) {
             promise.reject("start_playing_error", "Failed to start playing: ${e.message}")
         } catch (e: IllegalStateException) {
             promise.reject("player_error", "Player state issue: ${e.message}")
         }

     }

    @ReactMethod
    fun stopAudio(fileName: String, promise: Promise) {
        try {
            mediaPlayer?.apply {
                if (isPlaying) {
                    stop()
                    reset()
                    release()
                }
            }
            mediaPlayer = null
            sendEvent("onPlaybackStop", Arguments.createMap().apply {
                putString("message", "Audio stopped")
            })
            promise.resolve("Playback stopped")
        } catch (e: Exception) {
            promise.reject("E_STOP_AUDIO", "Failed to stop audio", e)
        }
    }

    @ReactMethod
    fun pauseAudio(fileName: String, promise: Promise) {
        try {
            mediaPlayer?.apply {
                if (isPlaying) {
                    pause()
                    sendEvent("onPlaybackPause", Arguments.createMap().apply {
                        putString("message", "Audio paused")
                    })
                    promise.resolve("Audio paused successfully")
                } else {
                    promise.reject("E_PLAYER", "Audio is not currently playing")
                }
            } ?: promise.reject("E_PLAYER", "Audio player is not initialized")
        } catch (e: Exception) {
            promise.reject("E_PAUSE_AUDIO", "Failed to pause audio", e)
        }
    }
    @ReactMethod
    fun isRecordingAudio(promise: Promise) {
        promise.resolve(isRecording)
    }

    private fun sendEvent(eventName: String, params: WritableMap) {

        println(eventName);
        if (reactApplicationContext != null && reactApplicationContext!!.hasActiveReactInstance()) {
            try {
                reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit(eventName, params)
            } catch (e: Exception) {
                Log.e("AudioNativeModule", "Emit failed: ${e.message}")
            }
        } else if (reactApplicationContext != null) {
            val reactInstanceManager =
                (reactApplicationContext.applicationContext as ReactApplication)
                    .reactNativeHost
                    .reactInstanceManager
            val listener = object : ReactInstanceEventListener {
                override fun onReactContextInitialized(context: ReactContext) {
                    context
                        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                        .emit(eventName, params)


                }
            }
            reactInstanceManager.addReactInstanceEventListener(listener)
        }
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // Required for RN event system
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Required for RN event system
    }
}
