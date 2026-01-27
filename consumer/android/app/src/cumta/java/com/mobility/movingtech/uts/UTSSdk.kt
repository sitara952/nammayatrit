package com.mobility.movingtech.uts

import android.app.Activity
import `in`.org.cris.utsmasdk.api.UMClientRequestBooking
import `in`.org.cris.utsmasdk.api.UMClientRequestShowTicket
import `in`.org.cris.utsmasdk.api.UMSdk
import `in`.org.cris.utsmasdk.api.UMSdkInit
import com.mobility.movingtech.BuildConfig
import `in`.org.cris.utsmasdk.api.UMClientAppType
import `in`.org.cris.utsmasdk.api.UMClientRequestReinitialization

class UTSSdk {
    private val umSdkInit = UMSdkInit(
        BuildConfig.UTS_CLIENT_NAME,
        BuildConfig.UTS_CLIENT_VERSION,
        BuildConfig.UTS_CLIENT_ID,
        BuildConfig.UTS_API_KEY,
        BuildConfig.UTS_API_SECRET
    )
    private val umSdk = UMSdk(umSdkInit, if (BuildConfig.DEBUG) UMClientAppType.UAT else UMClientAppType.PROD)

    fun launchUMSdkForBooking(
        context: Activity?,
        bookingRequest: UMClientRequestBooking,
        accessToken: String,
        onError: (String) -> Unit,
        onSuccess: (String) -> Unit
    ) {
        try {

            if (context != null) {
                umSdk.launchUMSdkForBooking(context, bookingRequest, accessToken, /*OnError*/ { message
                    ->
                    onError(message)
                }, /*Success*/ { response ->
                    onSuccess(response)
                })
            } else {
                onError("Cannot call SDK: Context is null")
            }
        } catch (e: Exception) {
            onError("Error in UMSdk: ${e.message}")
        }
    }

    fun launchUMSdkForShowTicket(
        context: Activity?,
        showTicketRequest: UMClientRequestShowTicket,
        onError: (String) -> Unit,
        onSuccess: (String) -> Unit
    ) {
        try {

            if (context != null) {
                umSdk.launchUMSdkForShowTicket(
                    context, showTicketRequest,
                    /*onError */ { message ->
                        onError(message)
                    }, /*onSuccess */{ response ->
                        onSuccess(response)
                    })
            } else {
                onError("Cannot call SDK: Context is null")
            }

        } catch (e: Exception) {
            onError("Error in UMSdk: ${e.message}")
        }
    }

    fun launchUMSdkForReinitialization(
        context: Activity?,
        reinitializationRequest: UMClientRequestReinitialization,
        accessToken: String,
        onError: (String) -> Unit,
        onSuccess: (String) -> Unit
    ) {
        try {
            if(context != null) {
                umSdk.launchUMSdkForReinitialization(
                    context, reinitializationRequest, accessToken,
                    /*onError */ { message ->
                        onError(message)
                    }, /*onSuccess */{ response ->
                        onSuccess(response)
                    })
            }
        } catch (e: Exception) {
            onError("Error in UMSdk: ${e.message}")
        }
    }
}