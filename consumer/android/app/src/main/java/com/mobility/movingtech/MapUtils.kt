package com.mobility.movingtech

import android.annotation.SuppressLint
import android.content.pm.PackageManager
import android.os.Build
import android.os.Handler
import android.os.Looper
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.tasks.CancellationTokenSource
import com.google.maps.android.PolyUtil
import com.google.maps.android.SphericalUtil
import kotlin.math.abs
import kotlin.math.asin
import kotlin.math.ceil
import kotlin.math.cos
import kotlin.math.max
import kotlin.math.min
import kotlin.math.pow
import kotlin.math.sign
import kotlin.math.sin
import kotlin.math.sqrt

// Earth radius in meters (approx.)
private const val EARTH_RADIUS = 6371008.8

class MapUtils(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String {
        return "MapUtils"
    }

    private val fusedLocationClient: FusedLocationProviderClient =
        LocationServices.getFusedLocationProviderClient(reactContext)

    @SuppressLint("MissingPermission")
    @ReactMethod
    fun getCurrentPosition(accuracy: String, timeoutMs: Int = 15000, promise: Promise) {
        if (!hasLocationPermission()) {
            promise.reject("PERMISSION_DENIED", "Location permissions not granted.")
            return
        }

        val priority = when (accuracy) {
            "high" -> Priority.PRIORITY_HIGH_ACCURACY
            "balanced" -> Priority.PRIORITY_BALANCED_POWER_ACCURACY
            "low" -> Priority.PRIORITY_LOW_POWER
            "no_power" -> Priority.PRIORITY_PASSIVE
            else -> {
                promise.reject("INVALID_ACCURACY", "Invalid accuracy parameter.")
                return
            }
        }

        // Create a cancellation token for the location request
        val cancellationTokenSource = CancellationTokenSource()

        // Set a timeout
        val handler = Handler(Looper.getMainLooper())
        val timeoutRunnable = Runnable {
            try {
                // Cancel the request if it's still active
                cancellationTokenSource.cancel()
                // Try to get last known location instead
                fetchLastKnownLocation(promise)
            } catch (e: Exception) {
                // If there was an error cancelling, still try to fetch last known location
                fetchLastKnownLocation(promise)
            }
        }

        handler.postDelayed(timeoutRunnable, timeoutMs.toLong())

        fusedLocationClient.getCurrentLocation(priority, cancellationTokenSource.token)
            .addOnSuccessListener { location ->
                handler.removeCallbacks(timeoutRunnable)

                if (location != null) {
                    val speedAccuracy =
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) location.speedAccuracyMetersPerSecond.toDouble() else null
                    val locationData =
                        createLocationMap(
                            location.latitude,
                            location.longitude,
                            location.accuracy.toDouble(),
                            location.time,
                            location.speed.toDouble(),
                            speedAccuracy
                        )
                    promise.resolve(locationData)
                } else {
                    fetchLastKnownLocation(promise)
                }
            }
            .addOnFailureListener { exception ->
                handler.removeCallbacks(timeoutRunnable)
                fetchLastKnownLocation(promise)
            }
    }

    @ReactMethod
    fun getLastKnownLocation(promise: Promise) {
        if (!hasLocationPermission()) {
            promise.reject("PERMISSION_DENIED", "Location permissions not granted.")
            return
        }
        fetchLastKnownLocation(promise)
    }

    @SuppressLint("MissingPermission")
    private fun fetchLastKnownLocation(promise: Promise) {
        fusedLocationClient.lastLocation
            .addOnSuccessListener { location ->
                if (location != null) {
                    val speedAccuracy =
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) location.speedAccuracyMetersPerSecond.toDouble() else null
                    val locationData =
                        createLocationMap(
                            location.latitude,
                            location.longitude,
                            location.accuracy.toDouble(),
                            location.time,
                            location.speed.toDouble(),
                            speedAccuracy
                        )
                    promise.resolve(locationData)
                } else {
                    promise.reject("NO_LOCATION", "Unable to retrieve last known location.")
                }
            }
            .addOnFailureListener { exception ->
                promise.reject("ERROR", exception.message)
            }
    }

    private fun createLocationMap(
        latitude: Double,
        longitude: Double,
        accuracy: Double,
        timestamp: Long = System.currentTimeMillis(),
        speed: Double,
        speedAccuracy: Double?,
    ): WritableMap {
        return Arguments.createMap().apply {
            putDouble("latitude", latitude)
            putDouble("longitude", longitude)
            putDouble("accuracy", accuracy)
            putDouble("timestamp", timestamp.toDouble())
            putDouble("speed", speed)
            if (speedAccuracy != null) {
                putDouble("speedAccuracy", speedAccuracy)
            }
        }
    }

    private fun hasLocationPermission(): Boolean {
        val context = reactApplicationContext
        val fineLocation = ContextCompat.checkSelfPermission(
            context,
            android.Manifest.permission.ACCESS_FINE_LOCATION
        )
        val coarseLocation = ContextCompat.checkSelfPermission(
            context,
            android.Manifest.permission.ACCESS_COARSE_LOCATION
        )
        return fineLocation == PackageManager.PERMISSION_GRANTED || coarseLocation == PackageManager.PERMISSION_GRANTED
    }

    @ReactMethod
    fun getExtendedPath(coordinateArray: ReadableArray, distanceMeter: Double, promise: Promise) {
        val coordinateArrayList = coordinateArray.toArrayList()
        val path: ArrayList<LatLng> = ArrayList()
        val extendedPath: ArrayList<LatLng> = ArrayList()

        for (i in 0..<coordinateArrayList.size) {
            coordinateArrayList[i]
            val coordinate = coordinateArrayList[i] as HashMap<*, *>
            val lng: Double = (coordinate["longitude"] as Double?)!!
            val lat: Double = (coordinate["latitude"] as Double?)!!
            val tempPoints = LatLng(lat, lng)
            path.add(tempPoints)
        }

        for (i in 0..path.size - 2) {
            val point1: LatLng = path[i]
            val point2: LatLng = path[i + 1]
            extendedPath.add(point1)
            val distanceBtw: Double = SphericalUtil.computeDistanceBetween(point1, point2)
            val noOfPoints = ceil(distanceBtw / distanceMeter).toInt()
            val fraction = 1.0f / (noOfPoints + 1)
            for (k in 1..noOfPoints) {
                val point: LatLng = getNewLatLng(fraction * k, point1, point2)
                extendedPath.add(point)
            }
        }

        if (path.size >= 1) {
            extendedPath.add(path[path.size - 1])
        }

        val extendedPathOutput: WritableArray = Arguments.createArray()
        for (point in extendedPath) {
            val pointMap: WritableMap = Arguments.createMap()
            pointMap.putDouble("latitude", point.latitude)
            pointMap.putDouble("longitude", point.longitude)
            extendedPathOutput.pushMap(pointMap)
        }
        promise.resolve(extendedPathOutput)
    }

    private fun getNewLatLng(fraction: Float, a: LatLng, b: LatLng): LatLng {
        val lat = (b.latitude - a.latitude) * fraction + a.latitude
        var lngDelta = b.longitude - a.longitude
        // Take the shortest path across the 180th meridian.
        if (abs(lngDelta) > 180) {
            lngDelta -= sign(lngDelta) * 360
        }
        val lng = lngDelta * fraction + a.longitude
        return LatLng(lat, lng)
    }


    /**
     * Convert degrees to radians.
     */
    private fun toRadians(deg: Double): Double {
        return deg * Math.PI / 180.0
    }

    /**
     * Haversine distance (in meters) between two LatLng points.
     */
    private fun haversineDistance(a: LatLng, b: LatLng): Double {
        val lat1 = toRadians(a.latitude)
        val lat2 = toRadians(b.latitude)
        val dLat = lat2 - lat1
        val dLon = toRadians(b.longitude - a.longitude)

        val h = sin(dLat / 2).pow(2) +
                cos(lat1) * cos(lat2) * sin(dLon / 2).pow(2)
        val c = 2 * asin(sqrt(h))

        return EARTH_RADIUS * c
    }

    /**
     * Approximate projection of LatLng to local XY (in meters)
     * relative to a chosen origin.
     */
    private fun latLngToLocalXY(point: LatLng, origin: LatLng): Pair<Double, Double> {
        // 1 deg of lat ~ 111,320 m
        // 1 deg of lon ~ 111,320 * cos(latitude) m
        val latScale = 111320.0
        val originLatInRad = toRadians(origin.latitude)
        val lonScale = 111320.0 * cos(originLatInRad)

        val x = (point.longitude - origin.longitude) * lonScale
        val y = (point.latitude - origin.latitude) * latScale

        return Pair(x, y)
    }

    /**
     * Converts local XY (in meters) back to LatLng relative
     * to the same origin.
     */
    private fun localXYToLatLng(xy: Pair<Double, Double>, origin: LatLng): LatLng {
        val (x, y) = xy

        val latScale = 111320.0
        val originLatInRad = toRadians(origin.latitude)
        val lonScale = 111320.0 * cos(originLatInRad)

        val longitude = origin.longitude + x / lonScale
        val latitude = origin.latitude + y / latScale

        return LatLng(latitude, longitude)
    }

    /**
     * Given a point P and a segment AB, compute the point on the segment
     * that is closest to P, using a local XY coordinate approximation.
     */
    private fun closestPointOnSegment(
        p: LatLng,
        A: LatLng,
        B: LatLng
    ): LatLng {
        // If A and B are identical, just return A (degenerate case)
        if (A == B) return A

        // Use A as origin for local coordinate projection
        val origin = A

        // Convert A, B, p into local XY coords
        val Axy = latLngToLocalXY(A, origin)
        val Bxy = latLngToLocalXY(B, origin)
        val Pxy = latLngToLocalXY(p, origin)

        // Define AB and AP in XY
        val ABx = Bxy.first - Axy.first
        val ABy = Bxy.second - Axy.second
        val APx = Pxy.first - Axy.first
        val APy = Pxy.second - Axy.second

        // Compute dot products
        val ABdotAB = ABx * ABx + ABy * ABy   // |AB|^2
        val APdotAB = APx * ABx + APy * ABy

        // Parameter t along AB where projection of P lands
        var t = 0.0
        if (ABdotAB != 0.0) {
            t = APdotAB / ABdotAB
        }

        // Clamp t to [0, 1]
        t = max(0.0, min(1.0, t))

        // Projected point in XY
        val projX = Axy.first + t * ABx
        val projY = Axy.second + t * ABy

        // Convert back to LatLng
        return localXYToLatLng(Pair(projX, projY), origin)
    }

    /**
     * Main method that RN will call. It takes:
     *  - currPoint (latitude, longitude) in a ReadableMap
     *  - path (array of lat-lon objects) in a ReadableArray
     * Returns a Promise that resolves with { segmentIndex, distance, location }
     */
    @ReactMethod
    fun getClosestPointOnPath(currPoint: ReadableMap, path: ReadableArray, promise: Promise) {
        try {
            // 1) Parse currPoint
            val cpLat = currPoint.getDouble("latitude")
            val cpLon = currPoint.getDouble("longitude")
            val currentLatLng = LatLng(cpLat, cpLon)

            // 2) Parse path
            val latLngList = mutableListOf<LatLng>()
            for (i in 0 until path.size()) {
                val item = path.getMap(i)
                item?.let {
                    val lat = it.getDouble("latitude")
                    val lon = it.getDouble("longitude")
                    latLngList.add(LatLng(lat, lon))
                }
            }

            if (latLngList.isEmpty()) {
                // Return default if path is empty
                promise.resolve(
                    Arguments.createMap().apply {
                        putInt("segmentIndex", -1)
                        putDouble("distance", -1.0)
                        putNull("location")
                    }
                )
                return
            }

            if (latLngList.size == 1) {
                // Only one point in path
                val dist = haversineDistance(currentLatLng, latLngList[0])
                promise.resolve(
                    Arguments.createMap().apply {
                        putInt("segmentIndex", 0)
                        putDouble("distance", dist)
                        putMap("location", Arguments.createMap().apply {
                            putDouble("latitude", latLngList[0].latitude)
                            putDouble("longitude", latLngList[0].longitude)
                        })
                    }
                )
                return
            }

            // 3) Iterate over path segments
            var minDistance = Double.POSITIVE_INFINITY
            var bestSegmentIndex = -1
            var bestPointOnSegment: LatLng? = null

            for (i in 0 until latLngList.size - 1) {
                val A = latLngList[i]
                val B = latLngList[i + 1]

                val candidate = closestPointOnSegment(currentLatLng, A, B)
                val dist = haversineDistance(currentLatLng, candidate)

                if (dist < minDistance) {
                    minDistance = dist
                    bestSegmentIndex = i
                    bestPointOnSegment = candidate
                }
            }

            // 4) Resolve promise with results
            val result = Arguments.createMap().apply {
                putInt("segmentIndex", bestSegmentIndex)
                putDouble("distance", minDistance)
                val locMap = Arguments.createMap()
                bestPointOnSegment?.let {
                    locMap.putDouble("latitude", it.latitude)
                    locMap.putDouble("longitude", it.longitude)
                }
                putMap("location", locMap)
            }

            promise.resolve(result)

        } catch (e: Exception) {
            promise.reject("GET_CLOSEST_POINT_ERROR", e)
        }
    }

    @ReactMethod
    fun isCoordinateOnPath(
        coordinateArray: ReadableArray,
        currentPosition: ReadableMap,
        locationOnPathThreshold: Double,
        promise: Promise
    ) {
        if (currentPosition.hasKey("latitude") && currentPosition.hasKey("longitude")) {
            val currLat = currentPosition.getDouble("latitude")
            val currLng = currentPosition.getDouble("longitude")
            val currPoint = LatLng(currLat, currLng)
            val path = ArrayList<LatLng>()

            for (i in 0..<coordinateArray.size()) {
                val coordinateMap = coordinateArray.getMap(i)
                val lat = coordinateMap?.getDouble("latitude") ?: 0.0
                val lng = coordinateMap?.getDouble("longitude") ?: 0.0
                path.add(LatLng(lat, lng))
            }

            if (path.size == 0) {
                promise.resolve(-1)
                return
            }
            promise.resolve(
                PolyUtil.locationIndexOnEdgeOrPath(
                    currPoint,
                    path,
                    PolyUtil.isClosedPolygon(path),
                    true,
                    locationOnPathThreshold
                )
            )
        } else {
            promise.resolve(-1)
        }
    }

    @ReactMethod
    fun computeLength(path: ReadableArray, promise: Promise) {
        val minThreshold = 0.0
        var index = 0
        val arrLength = path.size()
        var totalDistance = 0.0;

        while (index < arrLength - 1) {
            val path1 = ArrayList<LatLng>()
            val iCoordinate = path.getMap(index)
            val jCoordinate = path.getMap(index + 1);
            val iLat = iCoordinate?.getDouble("latitude") ?: 0.0
            val iLng = iCoordinate?.getDouble("longitude") ?: 0.0

            val jLat = jCoordinate?.getDouble("latitude") ?: 0.0
            val jLng = jCoordinate?.getDouble("longitude") ?: 0.0

            path1.add(LatLng(iLat, iLng))
            path1.add(LatLng(jLat, jLng))

            val distance = SphericalUtil.computeLength(path1);

            if (distance > minThreshold) {
                totalDistance += distance
            }
            index++

        }

        promise.resolve(totalDistance)
    }
}
