//
//  AppInfoModule.swift
//  Bridge
//
//  Created by Shivendra Shah on 29/07/24.
//

import Foundation
@objc(AppInfoModule)
class AppInfoModule: NSObject {
    @objc
     static func requiresMainQueueSetup() -> Bool {
         return true
     }

    @objc
    func getAppName(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
        if let appName = Bundle.main.infoDictionary?["CFBundleName"] as? String {
            resolve(appName)
        } else {
            let error = NSError(domain: "", code: 200, userInfo: nil)
            reject("no_app_name", "Could not get app name", error)
        }
    }

  @objc
  func isDebug(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    #if DEBUG
      resolve(true)
    #else
      resolve(false)
    #endif
  }

  @objc
  func getDeviceId(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    let deviceID: String = DeviceIdentifier.getDeviceID();
    DeviceIdentifier.logDebug("Device ID : \(deviceID)")
    resolve(deviceID);
  }

  @objc
  func getUTSId(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    let utsId: String = DeviceIdentifier.getDeviceID();
    let shortId = String(utsId.prefix(30))
    DeviceIdentifier.logDebug("UTS ID : \(shortId)")
    resolve(shortId);
  }

  @objc
  func removeFromKeyChain(_ key: String, resolver resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    let success = KeychainUtils.removeFromKeyChain(key: key);
    resolve(success);
  }

  @objc
  func addToKeychain(_ key: String, value: String, resolver resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    let success = KeychainUtils.addToKeychain(key: key, value: value);
    resolve(success);
  }

  @objc
  func isPackagePresent(_ packageName: String, resolver resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    if let url = URL(string: "\(packageName)://") {
        if UIApplication.shared.canOpenURL(url) {
            resolve(true)
        } else {
            resolve(false)
        }
    } else {
      let error = NSError(domain: "", code: 200, userInfo: nil)
      reject("package_not_present","Couldn't check package presence", error)
    }
  }

  @objc
  func getMoEngageAppId(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    if let appId = Bundle.main.infoDictionary?["moengage_app_id"] as? String, !appId.isEmpty {
      resolve(appId)
    } else {
      resolve("")
    }
  }
}
