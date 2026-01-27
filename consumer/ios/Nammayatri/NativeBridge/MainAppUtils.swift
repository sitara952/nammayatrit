//
//  MainAppUtils.swift
//  Nammayatri
//
//  Created by Shivendra Shah on 15/10/24.
//

import Foundation
import MobilityCustomer
@objc(MainAppUtils)
class MainAppUtils: NSObject {

  @objc(getSharedPreferences:rejecter:)
  func getSharedPreferences(resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    let userDefaults = UserDefaults.standard
    let key = YatriHelpers.getUserDefaultsKey();
    let hyperSDKStore = userDefaults.dictionary(forKey: key) ?? [String: Any]() // Get the "HyperSDK" dictionary

    // Serialize the dictionary to JSON for migration
    if let jsonData = try? JSONSerialization.data(withJSONObject: hyperSDKStore, options: .prettyPrinted),
       let jsonString = String(data: jsonData, encoding: .utf8) {
      resolver(jsonString)
    } else {
      rejecter("Error", "Failed to get shared preferences", nil)
    }
  }

  @objc func hideSplash() {
    DispatchQueue.main.async {
      if let appDelegate = UIApplication.shared.delegate as? AppDelegate {
        appDelegate.hideSplash()
      }
    }
  }
  @objc(updateSharedPreferences:resolver:rejecter:)
      func updateSharedPreferences(data: [String: String], resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
          for (key, value) in data {
            YatriHelpers.setValue(value, forKey:key)
          }

      }
  @objc(isReactUpdated:rejecter:)
      func isReactUpdated( resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {

          if let isUpdated = YatriHelpers.getValueForKey("isReactUpdated") as? String {
            resolver(isUpdated == "true")
          } else {
            resolver(false)
          }
      }

    @objc(getAppStartTime:rejecter:)
    func getAppStartTime(resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
      DispatchQueue.main.async {
        if let appDelegate = UIApplication.shared.delegate as? AppDelegate {
          resolver(appDelegate.appStartTime)
        } else {
          rejecter("Error", "Could not retrieve AppDelegate", nil)
        }
      }
    }
}
