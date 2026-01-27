package com.mobility.movingtech

import android.app.Activity
import android.app.Dialog
import android.graphics.Color
import android.net.Uri
import android.os.Build
import android.util.Log
import android.view.View
import android.view.ViewGroup.LayoutParams.MATCH_PARENT
import android.view.WindowInsets
import android.view.WindowManager
import com.airbnb.lottie.LottieAnimationView
import org.devio.rn.splashscreen.SplashScreen
import com.mobility.movingtech.FullscreenVideoView
import com.mobility.movingtech.R
import android.view.WindowInsetsController

class SplashScreenManager(private val activity: Activity) {

    companion object {
        private val LOG_TAG = SplashScreenManager::class.java.simpleName
    }

    fun show() {
        SplashScreen.show(activity)
        setupSplashScreenVideo()
    }


    private fun setupSplashScreenVideo() {
        try {
            val splashDialog = getSplashDialog() ?: return
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && Build.VERSION.SDK_INT < 35)
                makeDialogEdgeToEdge(splashDialog)
            val videoView = splashDialog.findViewById<FullscreenVideoView>(R.id.splash_video)
            val lottieAnimationView = splashDialog.findViewById<LottieAnimationView>(R.id.splash_lottie)

            if (videoView == null) {
                Log.e(LOG_TAG, "VideoView not found in splash dialog")
                return
            }

            setupVideoPlayer(videoView, lottieAnimationView)
            setupDialogDismissListener(splashDialog, videoView)
        } catch (e: Exception) {
            Log.e(LOG_TAG, "Error setting up splash video: ${e.message}")
            e.printStackTrace()
        }
    }

    private fun getSplashDialog(): Dialog? {
        return try {
            val splashScreenClass = Class.forName("org.devio.rn.splashscreen.SplashScreen")
            val field = splashScreenClass.getDeclaredField("mSplashDialog")
            field.isAccessible = true
            val splashDialog = field.get(null) as? Dialog

            if (splashDialog != null && splashDialog.isShowing) {
                splashDialog
            } else {
                Log.e(LOG_TAG, "Splash dialog is null or not showing")
                null
            }
        } catch (e: Exception) {
            Log.e(LOG_TAG, "Error accessing splash dialog: ${e.message}")
            e.printStackTrace()
            null
        }
    }

    private fun makeDialogEdgeToEdge(dialog: Dialog) {
        try {
            val window = dialog.window ?: return

            // Make dialog match parent
            window.setLayout(MATCH_PARENT, MATCH_PARENT)

            // Make bars transparent
            window.statusBarColor = Color.TRANSPARENT
            window.navigationBarColor = Color.TRANSPARENT

            window.decorView.systemUiVisibility = View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION or View.SYSTEM_UI_FLAG_LAYOUT_STABLE

            // Allow cutout (notch)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                window.attributes.layoutInDisplayCutoutMode =
                    WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES
            }
        } catch (e: Exception) {
            Log.e("Splash", "edge-to-edge error: ${e.message}")
        }
    }



    private fun setupVideoPlayer(videoView: FullscreenVideoView, lottieAnimationView: LottieAnimationView?) {
        val uri = Uri.parse("android.resource://${activity.packageName}/raw/splash_video")
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            videoView.setAudioFocusRequest(android.media.AudioManager.AUDIOFOCUS_NONE)
        }
        videoView.setVideoURI(uri)

        videoView.setOnPreparedListener { mp ->
            mp.setVolume(0f, 0f)
            mp.isLooping = true
            videoView.start()
        }

        videoView.setVideoErrorListener(object : VideoErrorListener {
            override fun onVideoError(what: Int, extra: Int) {
                Log.e(LOG_TAG, "Video playback error: what=$what, extra=$extra")
                videoView.visibility = View.GONE
                lottieAnimationView?.visibility = View.VISIBLE
                lottieAnimationView?.playAnimation()
            }
        })
    }

    private fun setupDialogDismissListener(splashDialog: Dialog, videoView: FullscreenVideoView) {
        splashDialog.setOnDismissListener {
            if (videoView.isPlaying) {
                videoView.stopPlayback()
            }
        }
    }
}
