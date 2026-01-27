package com.mobility.movingtech

import android.content.Context
import android.util.AttributeSet
import android.util.Log
import android.view.View
import android.widget.VideoView

/**
 * Interface for listening to video errors.
 */
interface VideoErrorListener {
    fun onVideoError(what: Int, extra: Int)
}

/**
 * Custom VideoView that scales the video to fill the entire view while maintaining aspect ratio.
 * This will crop some of the video content to ensure no gaps appear on the sides.
 */
class FullscreenVideoView : VideoView {
    constructor(context: Context) : super(context)
    constructor(context: Context, attrs: AttributeSet?) : super(context, attrs)
    constructor(context: Context, attrs: AttributeSet?, defStyleAttr: Int) : super(context, attrs, defStyleAttr)

    private var videoWidth = 0
    private var videoHeight = 0
    private val TAG = "FullscreenVideoView"
    private var videoErrorListener: VideoErrorListener? = null

    init {
        // Force the video dimensions to be initialized
        setOnPreparedListener { mp ->
            videoWidth = mp.videoWidth
            videoHeight = mp.videoHeight

            Log.d(TAG, "Video prepared. Dimensions: $videoWidth x $videoHeight")

            if (videoWidth > 0 && videoHeight > 0) {
                requestLayout()
            }

            // Start the video
            mp.isLooping = false
            start()
        }

        setOnErrorListener { mp, what, extra ->
            Log.e(TAG, "Error playing video: what=$what, extra=$extra")
            videoErrorListener?.onVideoError(what, extra)
            true // Return true to indicate the error was handled
        }
    }

    /**
     * Sets a listener for video errors.
     */
    fun setVideoErrorListener(listener: VideoErrorListener?) {
        this.videoErrorListener = listener
    }

    

    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        // Get the width and height of the view
        val width = View.getDefaultSize(0, widthMeasureSpec)
        val height = View.getDefaultSize(0, heightMeasureSpec)

        if (videoWidth > 0 && videoHeight > 0) {
            val aspectRatio = videoWidth.toFloat() / videoHeight.toFloat()
            val viewRatio = width.toFloat() / height.toFloat()

            if (aspectRatio > viewRatio) {
                // Video is wider than the view (relative to their heights)
                // We need to scale based on height and crop the width
                val newWidth = (height.toFloat() * aspectRatio).toInt()
                setMeasuredDimension(newWidth, height)
                Log.d(TAG, "Video wider than view - Setting dimensions: $newWidth x $height")
            } else {
                // Video is taller than the view (relative to their widths)
                // We need to scale based on width and crop the height
                val newHeight = (width.toFloat() / aspectRatio).toInt()
                setMeasuredDimension(width, newHeight)
                Log.d(TAG, "Video taller than view - Setting dimensions: $width x $newHeight")
            }
        } else {
            setMeasuredDimension(width, height)
            Log.d(TAG, "Using default dimensions: $width x $height")
        }
    }
}
