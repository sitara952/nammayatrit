package com.mobility.movingtech.uts

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.Arguments
import `in`.org.cris.utsmasdk.api.UMClientRequestBooking
import `in`.org.cris.utsmasdk.api.UMClientRequestReinitialization
import `in`.org.cris.utsmasdk.api.UMClientRequestShowTicket

class UTSModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String {
        return "UTSModule"
    }

    private val utsSdk = UTSSdk()

    private fun validateRequiredString(params: ReadableMap, key: String): String {
        val value = params.getString(key)
        if (value.isNullOrEmpty()) {
            throw IllegalArgumentException("$key cannot be empty")
        }
        return value
    }

    private fun validateAccessToken(accessToken: String) {
        if (accessToken.isEmpty()) {
            throw IllegalArgumentException("Access token cannot be empty")
        }
    }

    @ReactMethod
    fun requestBooking(params: ReadableMap, accessToken: String, promise: Promise) {
        try {
            validateAccessToken(accessToken)

            val agentAccountID = params.getInt("agentAccountID")

            val bookingRequest = UMClientRequestBooking(
                validateRequiredString(params, "mobileNumber"),
                validateRequiredString(params, "appCode"),
                agentAccountID.toString(),
                validateRequiredString(params, "deviceID"),
                validateRequiredString(params, "zone"),
                validateRequiredString(params, "sourceCode"),
                validateRequiredString(params, "destinationCode"),
                validateRequiredString(params, "routeID"),
                validateRequiredString(params, "registrationID"),
                validateRequiredString(params, "mobileMake"),
                validateRequiredString(params, "mobileModel"),
                validateRequiredString(params, "ticketTypeCode"),
            )

            utsSdk.launchUMSdkForBooking(
                currentActivity,
                bookingRequest,
                accessToken,
                { message ->
                    val response = Arguments.createMap()
                    response.putString("status", "error")
                    response.putString("data", message)
                    promise.resolve(response)
                },
                { responseMessage ->
                    val response = Arguments.createMap()
                    response.putString("status", "success")
                    response.putString("data", responseMessage)
                    promise.resolve(response)
                }
            )
        } catch (e: Exception) {
            promise.reject("UTS_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun showTicket(params: ReadableMap, promise: Promise) {
        try {
            val agentAccountID = params.getInt("agentAccountID")

            val showTicketRequest = UMClientRequestShowTicket(
                validateRequiredString(params, "mobileNumber"),
                validateRequiredString(params, "appCode"),
                agentAccountID.toString(),
                validateRequiredString(params, "deviceID"),
                validateRequiredString(params, "zone"),
                validateRequiredString(params, "ticketEncData"),
                validateRequiredString(params, "sourceStationName"),
                validateRequiredString(params, "sourceStationNameHindi"),
                validateRequiredString(params, "sourceStationNameRegional"),
                validateRequiredString(params, "destinationStationName"),
                validateRequiredString(params, "destinationStationNameHindi"),
                validateRequiredString(params, "destinationStationNameRegional"),
                validateRequiredString(params, "buttonColorHex"),
                validateRequiredString(params, "buttonTextColorHex"),
            )

            utsSdk.launchUMSdkForShowTicket(
                currentActivity,
                showTicketRequest,
                { message ->
                    val response = Arguments.createMap()
                    response.putString("status", "error")
                    response.putString("data", message)
                    promise.resolve(response)
                },
                { responseMessage ->
                    val response = Arguments.createMap()
                    response.putString("status", "success")
                    response.putString("data", responseMessage)
                    promise.resolve(response)
                }
            )
        } catch (e: Exception) {
            promise.reject("UTS_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun requestReinitialization(params: ReadableMap, accessToken: String, promise: Promise) {
        try {
            validateAccessToken(accessToken)

            val agentAccountID = params.getInt("agentAccountID")

            val reinitializationRequest = UMClientRequestReinitialization(
                validateRequiredString(params, "mobileNumber"),
                validateRequiredString(params, "appCode"),
                agentAccountID.toString(),
                validateRequiredString(params, "deviceID"),
                validateRequiredString(params, "zone")
            );

            utsSdk.launchUMSdkForReinitialization(
                currentActivity,
                reinitializationRequest,
                accessToken,
                { message ->
                    val response = Arguments.createMap()
                    response.putString("status", "error")
                    response.putString("data", message)
                    promise.resolve(response)
                },
                { responseMessage ->
                    val response = Arguments.createMap()
                    response.putString("status", "success")
                    response.putString("data", responseMessage)
                    promise.resolve(response)
                }
            )
        } catch (e: Exception) {
            promise.reject("UTS_ERROR", e.message, e)
        }
    }
}
