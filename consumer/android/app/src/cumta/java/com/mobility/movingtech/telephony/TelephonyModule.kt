package com.mobility.movingtech.telephony

import android.content.Context
import android.os.Build
import android.telephony.*
import com.facebook.react.bridge.*

class TelephonyModule(private val reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "TelephonyModule"

    @ReactMethod
    fun getDeviceInfo(promise: Promise) {
        try {
            val tm = reactContext.getSystemService(Context.TELEPHONY_SERVICE) as? TelephonyManager
            if (tm == null) {
                promise.reject("SERVICE_ERROR", "TelephonyManager not available", null)
                return
            }

            val cellTowersArray = Arguments.createArray()

            val networkType = getNetworkTypeName(tm.networkType)

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR1) {
                val cellInfoList = tm.allCellInfo

                if (cellInfoList != null && cellInfoList.isNotEmpty()) {
                    for (cellInfo in cellInfoList) {
                        when (cellInfo) {
                            is CellInfoLte -> {
                                val cellData = Arguments.createMap()
                                cellData.putString("networkType", networkType)
                                cellData.putBoolean("isRegistered", cellInfo.isRegistered)

                                val identity = cellInfo.cellIdentity
                                val strength = cellInfo.cellSignalStrength

                                cellData.putString("cellType", "LTE")
                                cellData.putInt("cellId", if (identity.ci == Int.MAX_VALUE) -1 else identity.ci)
                                cellData.putInt("areaCode", if (identity.tac == Int.MAX_VALUE) -1 else identity.tac)
                                cellData.putInt("signalStrengthDbm", strength.dbm)
                                cellTowersArray.pushMap(cellData)
                            }
                            is CellInfoGsm -> {
                                val cellData = Arguments.createMap()
                                cellData.putString("networkType", networkType)
                                cellData.putBoolean("isRegistered", cellInfo.isRegistered)

                                val identity = cellInfo.cellIdentity
                                val strength = cellInfo.cellSignalStrength

                                cellData.putString("cellType", "GSM")
                                cellData.putInt("cellId", if (identity.cid == Int.MAX_VALUE) -1 else identity.cid)
                                cellData.putInt("areaCode", if (identity.lac == Int.MAX_VALUE) -1 else identity.lac)
                                cellData.putInt("signalStrengthDbm", strength.dbm)
                                cellTowersArray.pushMap(cellData)
                            }
                            is CellInfoWcdma -> {
                                val cellData = Arguments.createMap()
                                cellData.putString("networkType", networkType)
                                cellData.putBoolean("isRegistered", cellInfo.isRegistered)

                                val identity = cellInfo.cellIdentity
                                val strength = cellInfo.cellSignalStrength

                                cellData.putString("cellType", "WCDMA")
                                cellData.putInt("cellId", if (identity.cid == Int.MAX_VALUE) -1 else identity.cid)
                                cellData.putInt("areaCode", if (identity.lac == Int.MAX_VALUE) -1 else identity.lac)
                                cellData.putInt("signalStrengthDbm", strength.dbm)
                                cellTowersArray.pushMap(cellData)
                            }
                            is CellInfoNr -> {
                                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                                    val cellData = Arguments.createMap()
                                    cellData.putString("networkType", networkType)
                                    cellData.putBoolean("isRegistered", cellInfo.isRegistered)

                                    val identity = cellInfo.cellIdentity as? CellIdentityNr
                                    val strength = cellInfo.cellSignalStrength as? CellSignalStrengthNr

                                    if (identity != null && strength != null) {
                                        cellData.putString("cellType", "NR")
                                        cellData.putString("cellId", if (identity.nci == Long.MAX_VALUE) "-1" else identity.nci.toString())
                                        cellData.putInt("areaCode", if (identity.tac == Int.MAX_VALUE) -1 else identity.tac)
                                        cellData.putInt("signalStrengthDbm", strength.dbm)
                                        cellTowersArray.pushMap(cellData)
                                    }
                                }
                            }
                        }
                    }
                }
            }

            promise.resolve(cellTowersArray)

        } catch (se: SecurityException) {
            promise.reject("PERMISSION_ERROR", "READ_PHONE_STATE or ACCESS_FINE_LOCATION permission missing", se)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message ?: "Unknown error occurred", e)
        }
    }

    private fun getNetworkTypeName(type: Int): String {
        return when (type) {
            TelephonyManager.NETWORK_TYPE_LTE -> "LTE (4G)"
            TelephonyManager.NETWORK_TYPE_NR -> "NR (5G)"
            TelephonyManager.NETWORK_TYPE_HSPAP -> "HSPA+"
            TelephonyManager.NETWORK_TYPE_EDGE -> "EDGE (2G)"
            TelephonyManager.NETWORK_TYPE_GPRS -> "GPRS (2G)"
            TelephonyManager.NETWORK_TYPE_UMTS -> "UMTS (3G)"
            else -> "UNKNOWN"
        }
    }
}
