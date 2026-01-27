package com.mobility.movingtech.reactNativeBridge

import android.content.Context
import android.location.Address
import android.location.Geocoder
import com.facebook.react.bridge.*
import java.io.IOException
import java.math.BigDecimal
import java.math.RoundingMode
import java.util.*

class GeoCoderModule(reactContext: ReactApplicationContext) :
        ReactContextBaseJavaModule(reactContext) {

    private val context: Context = reactContext
    private val geocoder: Geocoder = Geocoder(context, Locale.getDefault())

    override fun getName(): String {
        return "GeoCoder"
    }

    @ReactMethod
    fun getLocName(latitude: Double, longitude: Double, promise: Promise) {
        try {
            val addresses: List<Address>? = geocoder.getFromLocation(latitude, longitude, 1)
            if (Geocoder.isPresent() && !addresses.isNullOrEmpty()) {
                promise.resolve(addresses[0].getAddressLine(0) ?: "NO_LOCATION_FOUND")
            } else {
                promise.reject("GeoCoderModule:getLocName", "No location found")
            }
        } catch (e: IOException) {
            promise.reject("GeoCoderModule:getLocName", "No location found")
        }
    }

    @ReactMethod
    fun getGeoCoordinateFromAddress(address: String, promise: Promise) {
        try {
            val addresses: List<Address>? = geocoder.getFromLocationName(address, 1)
            if (!addresses.isNullOrEmpty()) {
                val latitude: Double = addresses[0].latitude
                val longitude: Double = addresses[0].longitude
                val decimalPlaces = 7
                val roundedValueLat: BigDecimal =
                        BigDecimal(latitude).setScale(decimalPlaces, RoundingMode.HALF_UP)
                val roundedValueLon: BigDecimal =
                        BigDecimal(longitude).setScale(decimalPlaces, RoundingMode.HALF_UP)
                val geoCoordinate =
                        GeoCoordinate(roundedValueLat.toDouble(), roundedValueLon.toDouble())
                promise.resolve(geoCoordinate.toWritableMap())
            } else {
                promise.reject("GeoCoderModule:getGeoCoordinateFromAddress", "No location found")
            }
        } catch (e: IOException) {
            promise.reject("GeoCoderModule:getGeoCoordinateFromAddress", "No location found")
        }
    }

    @ReactMethod
    fun getAddressTranslation(address: String, promise: Promise) {
        try {
            val addresses: List<Address>? = geocoder.getFromLocationName(address, 1)
            if (!addresses.isNullOrEmpty()) {
                promise.resolve(addresses[0].getAddressLine(0) ?: address)
            } else {
                promise.reject("GeoCoderModule:getAddressTranslation","No location found")
            }
        } catch (e: IOException) {
            promise.reject("GeoCoderModule:getAddressTranslation", "No location found")
        }
    }

    data class GeoCoordinate(val latitude: Double, val longitude: Double) {
        fun toWritableMap(): WritableMap {
            val map = Arguments.createMap()
            map.putDouble("latitude", latitude)
            map.putDouble("longitude", longitude)
            return map
        }
    }
}
