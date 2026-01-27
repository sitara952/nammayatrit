//
//  MapUtils.swift
//  Nammayatri
//
//  Created by Pravinkumar S on 04/07/24.
//

import Foundation
import GoogleMaps
import CoreLocation

@objc(MapUtils)
class MapUtils: NSObject, CLLocationManagerDelegate {
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }

  // Earth radius in meters (approx.)
  private let EARTH_RADIUS = 6371008.8
  private var locationManager: CLLocationManager?
  private var locationCallbacks: [CLLocationManager: (resolver: RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock, timer: Timer)] = [:]

  override init() {
      super.init()
      locationManager = CLLocationManager()
      locationManager?.delegate = self
    //   locationManager?.requestWhenInUseAuthorization()
  }

  //  import CoreLocation

  private func getLocationAuthorizationStatus() -> CLAuthorizationStatus {
    return CLLocationManager().authorizationStatus
  }

  private func isLocationEnabled() -> Bool {
    let status = getLocationAuthorizationStatus()
    return !(status == .denied || status == .notDetermined)
  }

  private func getCurrentLocationCoordinates() -> CLLocationCoordinate2D {
    if isLocationEnabled(), let location = locationManager?.location {
      return location.coordinate
    } else {
      // Default to Chennai location
      return CLLocationCoordinate2D(latitude: 13.0827, longitude: 80.2707)
    }
  }

  @objc(getCurrentPosition:timeout:resolver:rejecter:)
  func getCurrentPosition(
    accuracy: String,
    timeout: NSNumber,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    print("DEBUG: getCurrentPosition called with accuracy: \(accuracy), timeout: \(timeout)")

    // Check if location services are enabled
    if !isLocationEnabled() {
      reject("PERMISSION_DENIED", "Location permissions not granted or location services disabled", nil)
      return
    }

    // Simple implementation that returns the last known location
    if let currentLocation = locationManager?.location {
      print("DEBUG: Returning last known location: \(currentLocation.coordinate.latitude), \(currentLocation.coordinate.longitude)")
      let locationData: [String: Any] = [
        "latitude": currentLocation.coordinate.latitude,
        "longitude": currentLocation.coordinate.longitude,
        "accuracy": currentLocation.horizontalAccuracy,
        "timestamp": Int(currentLocation.timestamp.timeIntervalSince1970 * 1000),
        "speed": currentLocation.speed,
        "speedAccuracy": currentLocation.speedAccuracy
      ]
      resolve(locationData)
    } else {
      print("DEBUG: No location available, returning error")
      // Return an error instead of default location
      reject("NO_LOCATION_AVAILABLE", "No location data available", nil)
    }
  }

  // CLLocationManagerDelegate methods
  func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
    guard let location = locations.last else {
      print("DEBUG: didUpdateLocations received empty locations array")
      return
    }

    guard let callbackInfo = locationCallbacks[manager] else {
      print("DEBUG: didUpdateLocations called but no callback found for manager: \(manager)")
      return
    }

    print("DEBUG: didUpdateLocations called with location: \(location.coordinate.latitude), \(location.coordinate.longitude)")

    // Stop updates and invalidate timer
    manager.stopUpdatingLocation()
    callbackInfo.timer.invalidate()

    // Remove from tracking dictionary
    locationCallbacks.removeValue(forKey: manager)

    // Return the location data
    let locationData: [String: Any] = [
      "latitude": location.coordinate.latitude,
      "longitude": location.coordinate.longitude,
      "accuracy": location.horizontalAccuracy,
      "timestamp": Int(location.timestamp.timeIntervalSince1970 * 1000),
      "speed": location.speed,
      "speedAccuracy": location.speedAccuracy
    ]

    print("DEBUG: Resolving with location: \(locationData)")
    callbackInfo.resolver(locationData)
  }

  func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
    print("DEBUG: didFailWithError called with error: \(error.localizedDescription)")

    guard let callbackInfo = locationCallbacks[manager] else {
      print("DEBUG: didFailWithError called but no callback found for manager: \(manager)")
      return
    }

    // Handle the error by passing it to the rejecter
    manager.stopUpdatingLocation()
    callbackInfo.timer.invalidate()
    locationCallbacks.removeValue(forKey: manager)

    // If we have a last known location, return that instead of failing
    if let lastLocation = locationManager?.location {
      let locationData: [String: Any] = [
        "latitude": lastLocation.coordinate.latitude,
        "longitude": lastLocation.coordinate.longitude,
        "accuracy": lastLocation.horizontalAccuracy,
        "timestamp": Int(lastLocation.timestamp.timeIntervalSince1970 * 1000),
        "speed": lastLocation.speed,
        "speedAccuracy": lastLocation.speedAccuracy
      ]
      print("DEBUG: Returning last known location on error: \(locationData)")
      callbackInfo.resolver(locationData)
    } else {
      print("DEBUG: No location available, returning error")
      callbackInfo.rejecter("LOCATION_ERROR", "Failed to get location: \(error.localizedDescription)", error)
    }
  }

  @objc(getLastKnownLocation:rejecter:)
  func getLastKnownLocation(
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    if let location = locationManager?.location {
      let locationData: [String: Any] = [
        "latitude": location.coordinate.latitude,
        "longitude": location.coordinate.longitude,
        "accuracy": location.horizontalAccuracy,
        "timestamp": Int(location.timestamp.timeIntervalSince1970 * 1000),
        "speed": location.speed,
        "speedAccuracy": location.speedAccuracy
      ]
      resolve(locationData)
    } else if isLocationEnabled() {
      // No location available but permissions are granted
      reject("NO_LOCATION", "No last known location available", nil)
    } else {
      // Location permissions not granted
      reject("PERMISSION_DENIED", "Location permissions not granted", nil)
    }
  }
  struct LatLng {
    let latitude: Double
    let longitude: Double
  }

  private func toRadians(_ degrees: Double) -> Double {
    return degrees * Double.pi / 180.0
  }

  private func haversineDistance(_ a: LatLng, _ b: LatLng) -> Double {
    let lat1 = toRadians(a.latitude)
    let lat2 = toRadians(b.latitude)
    let dLat = lat2 - lat1
    let dLon = toRadians(b.longitude - a.longitude)

    let h = sin(dLat / 2.0) * sin(dLat / 2.0)
    + cos(lat1) * cos(lat2) * sin(dLon / 2.0) * sin(dLon / 2.0)
    let c = 2.0 * asin(sqrt(h))

    return EARTH_RADIUS * c
  }

  private func latLngToLocalXY(_ point: LatLng, origin: LatLng) -> (x: Double, y: Double) {
    let latScale = 111320.0
    let originLatInRad = toRadians(origin.latitude)
    let lonScale = latScale * cos(originLatInRad)

    let x = (point.longitude - origin.longitude) * lonScale
    let y = (point.latitude - origin.latitude) * latScale
    return (x, y)
  }

  private func localXYToLatLng(_ xy: (x: Double, y: Double), origin: LatLng) -> LatLng {
    let (x, y) = xy
    let latScale = 111320.0
    let originLatInRad = toRadians(origin.latitude)
    let lonScale = latScale * cos(originLatInRad)

    let longitude = origin.longitude + x / lonScale
    let latitude  = origin.latitude + y / latScale
    return LatLng(latitude: latitude, longitude: longitude)
  }

  private func closestPointOnSegment(_ p: LatLng, _ A: LatLng, _ B: LatLng) -> LatLng {
    if A.latitude == B.latitude && A.longitude == B.longitude {
      return A
    }

    let origin = A
    let Axy = latLngToLocalXY(A, origin: origin)
    let Bxy = latLngToLocalXY(B, origin: origin)
    let Pxy = latLngToLocalXY(p, origin: origin)

    let ABx = Bxy.x - Axy.x
    let ABy = Bxy.y - Axy.y
    let APx = Pxy.x - Axy.x
    let APy = Pxy.y - Axy.y

    let ABdotAB = ABx * ABx + ABy * ABy
    let APdotAB = APx * ABx + APy * ABy

    var t = 0.0
    if ABdotAB != 0.0 {
      t = APdotAB / ABdotAB
    }
    t = max(0.0, min(1.0, t))

    let projX = Axy.x + t * ABx
    let projY = Axy.y + t * ABy

    return localXYToLatLng((projX, projY), origin: origin)
  }

  @objc(getClosestPointOnPath:andPath:andResolver:andRejecter:)
  func getClosestPointOnPath(
    _ currentPosition: NSDictionary,
    andPath path: NSArray,
    andResolver resolve: @escaping RCTPromiseResolveBlock,
    andRejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    do {
      // Parse `currentPosition`
      guard let latitude = currentPosition["latitude"] as? Double,
            let longitude = currentPosition["longitude"] as? Double else {
        throw NSError(domain: "Invalid currentPosition", code: -1, userInfo: nil)
      }

      let currentLatLng = LatLng(latitude: latitude, longitude: longitude)

      // Parse `path`
      var latLngList: [LatLng] = []
      for item in path {
        if let point = item as? NSDictionary,
           let lat = point["latitude"] as? Double,
           let lon = point["longitude"] as? Double {
          latLngList.append(LatLng(latitude: lat, longitude: lon))
        }
      }

      if latLngList.isEmpty {
        resolve([
          "segmentIndex": -1,
          "distance": -1.0,
          "location": NSNull()
        ])
        return
      }

      // Logic to find the closest point
      var minDistance = Double.greatestFiniteMagnitude
      var bestSegmentIndex = -1
      var bestPointOnSegment: LatLng? = nil

      if latLngList.count == 1 {
        let singlePoint = latLngList[0]
        let distance = haversineDistance(currentLatLng, singlePoint)
        resolve([
          "segmentIndex": 0,
          "distance": distance,
          "location": [
            "latitude": singlePoint.latitude,
            "longitude": singlePoint.longitude
          ]
        ])
        return
      }

      for i in 0..<(latLngList.count - 1) {
        let A = latLngList[i]
        let B = latLngList[i + 1]
        let candidate = closestPointOnSegment(currentLatLng, A, B)
        let dist = haversineDistance(currentLatLng, candidate)

        if dist < minDistance {
          minDistance = dist
          bestSegmentIndex = i
          bestPointOnSegment = candidate
        }
      }

      // Prepare result
      let location = bestPointOnSegment.map { point in
        [
          "latitude": point.latitude,
          "longitude": point.longitude
        ]
      }

      resolve([
        "segmentIndex": bestSegmentIndex,
        "distance": minDistance,
        "location": location ?? NSNull()
      ])
    } catch {
      reject("GET_CLOSEST_POINT_ERROR", "Failed to find closest point", error)
    }
  }

  @objc(isCoordinateOnPath:andCurrentPosition:locationOnPathThreshold:andResolver:andRejecter:)
  func isCoordinateOnPath(_ coordinateArray: NSArray,andCurrentPosition currentPosition: NSDictionary,locationOnPathThreshold:Double , andResolver resolve: @escaping RCTPromiseResolveBlock, andRejecter reject: @escaping RCTPromiseRejectBlock) -> Void {
    let path = GMSMutablePath()
    for coord in coordinateArray {
      if let coordDict = coord as? NSDictionary,
         let latitude = coordDict["latitude"] as? Double,
         let longitude = coordDict["longitude"] as? Double{
        let coordinate = CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
        path.add(coordinate)

      }else{
        reject("MapUtils_isCoordinateOnPath_Error", "Not able to decode coordinateArray", nil)
        return
      }
    }

    var currentCoordinate = CLLocationCoordinate2D(latitude: 0.0, longitude: 0.0)
    if let latitude = currentPosition["latitude"] as? Double,
       let longitude = currentPosition["longitude"] as? Double {

      currentCoordinate = CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
    }else{
      reject("MapUtils_isCoordinateOnPath_Error", "Not able to decode currentPosition", nil)
      return
    }

    let isOnPath = MapUtils.locationIndexOnEdgeOrPath(point: currentCoordinate, path: path, toleranceEarth: locationOnPathThreshold)

    print("isCoordinate onPath Success", isOnPath);

    resolve(isOnPath)

  }


  static let kGMSEarthRadius: Double = 6371009.0 // Earth radius in meters

  static func locationIndexOnEdgeOrPath(point: CLLocationCoordinate2D, path: GMSPath, toleranceEarth: CLLocationDistance) -> Int {
    let size = path.count()
    if size == 0 {
      return -1
    }

    let tolerance = toleranceEarth / kGMSEarthRadius
    let havTolerance = self.hav(value: tolerance)
    let lat3 = self.toRadians(value: point.latitude)
    let lng3 = self.toRadians(value: point.longitude)
    var lat1 = self.toRadians(value: path.coordinate(at: 0).latitude)
    var lng1 = self.toRadians(value: path.coordinate(at: 0).longitude)
    var idx = 0

    for i in 0..<size {
      let point2 = path.coordinate(at: i)
      let lat2 = self.toRadians(value: point2.latitude)
      let lng2 = self.toRadians(value: point2.longitude)

      if self.isOnSegmentGC(lat1: lat1, lng1: lng1, lat2: lat2, lng2: lng2, lat3: lat3, lng3: lng3, havTolerance: havTolerance) {
        return max(0, idx - 1)
      }

      lat1 = lat2
      lng1 = lng2
      idx += 1
    }

    return -1
  }

  static func isOnSegmentGC(lat1: Double, lng1: Double, lat2: Double, lng2: Double, lat3: Double, lng3: Double, havTolerance: Double) -> Bool {
    let havDist13 = self.havDistance(lat1: lat1, lat2: lat3, dLng: lng1 - lng3)

    if havDist13 <= havTolerance {
      return true
    }

    let havDist23 = self.havDistance(lat1: lat2, lat2: lat3, dLng: lng2 - lng3)

    if havDist23 <= havTolerance {
      return true
    }

    let sinBearing = self.sinDeltaBearing(lat1: lat1, lng1: lng1, lat2: lat2, lng2: lng2, lat3: lat3, lng3: lng3)
    let sinDist13 = self.sinFromHav(hav: havDist13)
    let havCrossTrack = self.havFromSin(sin: sinDist13 * sinBearing)

    if havCrossTrack > havTolerance {
      return false
    }

    let havDist12 = self.havDistance(lat1: lat1, lat2: lat2, dLng: lng1 - lng2)
    let term = havDist12 + havCrossTrack * (1 - 2 * havDist12)

    if havDist13 > term || havDist23 > term {
      return false
    }

    if havDist12 < 0.7 {
      return true
    }

    let cosCrossTrack = 1 - 2 * havCrossTrack
    let havAlongTrack13 = (havDist13 - havCrossTrack) / cosCrossTrack
    let havAlongTrack23 = (havDist23 - havCrossTrack) / cosCrossTrack
    let sinSumAlongTrack = self.sinSumFromHav(hav1: havAlongTrack13, hav2: havAlongTrack23)

    return sinSumAlongTrack > 0
  }

  static func hav(value: Double) -> Double {
    return sin(value / 2) * sin(value / 2)
  }

  static func toRadians(value: Double) -> Double {
    return value * .pi / 180.0
  }

  static func havDistance(lat1: Double, lat2: Double, dLng: Double) -> Double {
    return self.hav(value: lat1 - lat2) + self.hav(value: dLng) * cos(lat1) * cos(lat2)
  }

  static func sinDeltaBearing(lat1: Double, lng1: Double, lat2: Double, lng2: Double, lat3: Double, lng3: Double) -> Double {
    let sinLat1 = sin(lat1)
    let sinLat2 = sin(lat2)
    let cosLat1 = cos(lat1)
    let cosLat2 = cos(lat2)
    let dLng = lng2 - lng1
    let sinDLng = sin(dLng)
    let cosDLng = cos(dLng)

    let y = sinDLng * cosLat2
    let x = cosLat1 * sinLat2 - sinLat1 * cosLat2 * cosDLng

    return atan2(y, x)
  }

  static func sinFromHav(hav: Double) -> Double {
    return 2 * sqrt(hav * (1 - hav))
  }

  static func havFromSin(sin: Double) -> Double {
    let sin2 = sin * sin
    return sin2 / (1 + sqrt(1 - sin2)) * 2
  }

  static func sinSumFromHav(hav1: Double, hav2: Double) -> Double {
    let h = hav1 + hav2
    return self.sinFromHav(hav: h) * sqrt(1 - hav1 - hav2)
  }

  @objc(getExtendedPath:distanceBtwPointThreshold:andResolver:andRejecter:)
  func getExtendedPath(_ coordinateArray: NSArray, _ distanceBtwPointThreshold:Double, andResolver resolve: @escaping RCTPromiseResolveBlock, andRejecter reject: @escaping RCTPromiseRejectBlock){
    
    // Wrap everything in a do-catch to handle any unexpected errors gracefully
    do {
      // Input validation - return empty array for invalid inputs
      guard distanceBtwPointThreshold > 0 else {
        resolve([])
        return
      }
      
      guard coordinateArray.count > 0 else {
        resolve([])
        return
      }
      
      // For extremely large arrays, limit processing to prevent memory issues
      let maxArraySize = 10000
      let processableArray = coordinateArray.count > maxArraySize ? 
        Array(coordinateArray.prefix(maxArraySize)) : Array(coordinateArray)
      
      var path: [CLLocationCoordinate2D] = []
      var extendedPath: [CLLocationCoordinate2D] = []
      
      // Parse coordinates with error handling - skip invalid coordinates
      for item in processableArray {
        if let coordinate = item as? [String: Any],
           let lat = coordinate["latitude"] as? Double,
           let lng = coordinate["longitude"] as? Double {
          
          // Validate coordinate values - only add valid coordinates
          if lat >= -90.0 && lat <= 90.0 && lng >= -180.0 && lng <= 180.0 {
            let tempPoints = CLLocationCoordinate2D(latitude: lat, longitude: lng)
            path.append(tempPoints)
          }
        }
      }
      
      // Check if we have at least one coordinate - return empty array if none
      guard path.count > 0 else {
        resolve([])
        return
      }
      
      // If only one point, return it as is
      if path.count == 1 {
        let singlePointOutput = path.map { (point) -> [String: Double] in
          return ["latitude": point.latitude, "longitude": point.longitude]
        }
        resolve(singlePointOutput)
        return
      }
      
      // Process path segments
      for i in 0..<(path.count - 1) {
        let point1 = path[i]
        let point2 = path[i + 1]
        extendedPath.append(point1)

        let distanceBtw = GMSGeometryDistance(point1, point2)
        
        // Skip if distance is very small
        guard distanceBtw > 0.1 else {
          continue
        }
        
        let pointsToAdd = distanceBtw / distanceBtwPointThreshold
        
        // Limit the number of points to prevent memory issues
        let maxPoints = 1000
        let noOfPoints = min(Int(ceil(pointsToAdd)), maxPoints)
        
        if noOfPoints >= 1 {
          let fraction = 1.0 / Double(noOfPoints + 1)
          for k in 1...noOfPoints {
            let point = getNewLatLng(fraction: fraction * Double(k), a: point1, b: point2)
            extendedPath.append(point)
          }
        }
      }

      // Add the last point
      if let lastPoint = path.last {
        extendedPath.append(lastPoint)
      }

      let extendedPathOutput = extendedPath.map { (point) -> [String: Double] in
        return ["latitude": point.latitude, "longitude": point.longitude]
      }

      resolve(extendedPathOutput)
      
    } catch {
      // Fallback: return original coordinates as-is
      let fallbackOutput = coordinateArray.compactMap { item -> [String: Double]? in
        if let coordinate = item as? [String: Any],
           let lat = coordinate["latitude"] as? Double,
           let lng = coordinate["longitude"] as? Double,
           lat >= -90.0 && lat <= 90.0 && lng >= -180.0 && lng <= 180.0 {
          return ["latitude": lat, "longitude": lng]
        }
        return nil
      }
      resolve(fallbackOutput)
    }
  }

  private func getNewLatLng(fraction: Double, a: CLLocationCoordinate2D, b: CLLocationCoordinate2D) -> CLLocationCoordinate2D {
    // Clamp fraction to valid range
    let clampedFraction = max(0.0, min(1.0, fraction))
    
    let lat = (b.latitude - a.latitude) * clampedFraction + a.latitude
    var lngDelta = b.longitude - a.longitude

    if abs(lngDelta) > 180 {
      lngDelta -= copysign(360.0, lngDelta)
    }

    let lng = lngDelta * clampedFraction + a.longitude
    
    // Ensure the resulting coordinates are valid
    let finalLat = max(-90.0, min(90.0, lat))
    let finalLng = lng > 180.0 ? lng - 360.0 : (lng < -180.0 ? lng + 360.0 : lng)
    
    return CLLocationCoordinate2D(latitude: finalLat, longitude: finalLng)
  }

  @objc(computeLength:andResolver:andRejecter:)
  func computeLength(_ path: [[String: Double]], andResolver resolve: @escaping RCTPromiseResolveBlock, andRejecter reject: @escaping RCTPromiseRejectBlock) -> Void {
    let minThreshold = 0.0
    var index = 0
    let arrLength = path.count
    var totalDistance = 0.0

    while index < arrLength-1 {
      let path1 = GMSMutablePath()
      let iCoordinate = path[index]
      let jCoordinate = path[index+1]

      if let iLat = iCoordinate["latitude"], let iLng = iCoordinate["longitude"],
         let jLat = jCoordinate["latitude"], let jLng = jCoordinate["longitude"] {

        path1.add(CLLocationCoordinate2D(latitude: iLat, longitude: iLng))
        path1.add(CLLocationCoordinate2D(latitude: jLat, longitude: jLng))

        let distance = GMSGeometryLength(path1)
        if distance > minThreshold {
          totalDistance += distance
        }
      } else {
        let error = NSError(domain: "", code: 400, userInfo: [NSLocalizedDescriptionKey: "Invalid coordinates in path"])
        reject("invalid_coordinates", "One or more coordinates are missing or invalid", error)
        return
      }

      index += 1
    }

    resolve(totalDistance)
  }
}

