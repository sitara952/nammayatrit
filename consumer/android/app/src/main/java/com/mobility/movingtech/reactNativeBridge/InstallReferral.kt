package com.mobility.movingtech.reactNativeBridge

import android.net.Uri
import android.os.RemoteException
import com.android.installreferrer.api.InstallReferrerClient
import com.android.installreferrer.api.InstallReferrerStateListener
import com.facebook.applinks.AppLinkData
import android.util.Log
import com.facebook.react.bridge.*

class InstallReferrerModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "InstallReferrer"

    @ReactMethod
    fun getReferrerDetails(promise: Promise) {
        fetchGoogleReferrer { googleResult, gclid ->
            fetchMetaReferrer { metaResult ->
                if (metaResult != null) {
                    promise.resolve(metaResult)
                } else {
                    promise.resolve(googleResult)
                }
            }
        }
    }

    private fun fetchGoogleReferrer(callback: (WritableMap, String?) -> Unit) {
        val context = reactApplicationContext
        val result = Arguments.createMap()
        val referrerClient = InstallReferrerClient.newBuilder(context).build()

        referrerClient.startConnection(object : InstallReferrerStateListener {
            override fun onInstallReferrerSetupFinished(responseCode: Int) {
                var gclid: String? = null

                if (responseCode == InstallReferrerClient.InstallReferrerResponse.OK) {
                    try {
                        val response = referrerClient.installReferrer
                        val referrerUrl = response.installReferrer
                        Log.d("InstallReferrer", "Fetched referrer URL: $referrerUrl")
                        val uri = Uri.parse("https://example.com?$referrerUrl")

                        result.apply {
                            putString("utm_source", uri.getQueryParameter("utm_source"))
                            putString("utm_medium", uri.getQueryParameter("utm_medium"))
                            putString("utm_campaign", uri.getQueryParameter("utm_campaign"))
                            putString("utm_term", uri.getQueryParameter("utm_term"))
                            putString("utm_content", uri.getQueryParameter("utm_content"))
                            putString("utm_creative_format",uri.getQueryParameter("utm_creative_format"))
                            putString("gclid", uri.getQueryParameter("gclid"))
                            putString("id", uri.getQueryParameter("id"))
                        }

                        gclid = uri.getQueryParameter("gclid")
                        Log.d("InstallReferrer", "Extracted details: $result")
                    } catch (e: Exception) {
                        Log.e("InstallReferrer", "Error parsing referrer: ${e.message}")
                        result.putString("google_error", e.message)
                    }
                } else {
                    Log.w("InstallReferrer", "InstallReferrer error response code: $responseCode")
                    result.putString("google_error", "InstallReferrer error: $responseCode")
                }

                referrerClient.endConnection()
                callback(result, gclid)
            }

            override fun onInstallReferrerServiceDisconnected() {
                val fallback = Arguments.createMap()
                fallback.putString("google_error", "Service disconnected")
                callback(fallback, null)
            }
        })
    }


    private fun fetchMetaReferrer(callback: (WritableMap?) -> Unit) {
        val context = reactApplicationContext

        AppLinkData.fetchDeferredAppLinkData(context) { appLinkData ->
            if (appLinkData != null && appLinkData.targetUri != null) {
                try {
                    val targetUri = appLinkData.targetUri.toString()
                    val uri = Uri.parse(targetUri)
                    val result = Arguments.createMap().apply {
                        putString("utm_source", uri.getQueryParameter("utm_source"))
                        putString("utm_medium", uri.getQueryParameter("utm_medium"))
                        putString("utm_campaign", uri.getQueryParameter("utm_campaign"))
                        putString("utm_term", uri.getQueryParameter("utm_term"))
                        putString("utm_content", uri.getQueryParameter("utm_content"))
                        putString(
                            "utm_creative_format",
                            uri.getQueryParameter("utm_creative_format")
                        )
                        putString("gclid", uri.getQueryParameter("gclid"))
                    }
                    callback(result)
                } catch (e: Exception) {
                    callback(null)
                }
            } else {
                callback(null)
            }
        }
    }
}
