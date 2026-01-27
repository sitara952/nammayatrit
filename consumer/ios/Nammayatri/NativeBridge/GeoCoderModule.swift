//
//  GeoCoderModule.swift
//  Nammayatri
//
//  Created by Khuzema Khomosi on 23/05/24.
//

import Foundation

@objc(GeoCoderModule)
class GeoCoderModule: NSObject {
    
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    @objc
    func getLocName(_ latitude: Double, longitude: Double, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        reject("NO_LOCATION_FOUND", "Location lookup not implemented", nil)
    }
    
    @objc
    func getGeoCoordinateFromAddress(_ address: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        reject("NO_LOCATION_FOUND", "Location lookup not implemented", nil)
    }
    
    @objc
    func getAddressTranslation(_ address: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        reject("NO_LOCATION_FOUND", "Location lookup not implemented", nil)
    }
}
