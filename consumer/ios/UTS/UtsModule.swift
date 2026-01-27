//
//  UTSModule.swift
//  Nammayatri
//
//  Created by Praveen kumar on 05/04/25.
//

import Foundation
import UTS_SDK

@objc(UTSModule)
class UTSModule: NSObject {

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }

  let utsSdk: UTSSdk = UTSSdk();

  @objc(requestBooking:accessToken:withResolver:withRejecter:)
  func requestBooking(params: [String: Any], accessToken: String,
                resolve: @escaping RCTPromiseResolveBlock,
                reject: @escaping RCTPromiseRejectBlock) -> Void {
    utsSdk.requestBooking(
      params: params,
      accessToken: accessToken,
      onSuccess: { successMessage in
        let response: [String: Any] = [
          "status": "success",
          "data": successMessage
        ]
        resolve(response)
      },
      onError: { errorMessage in
        let response: [String: Any] = [
          "status": "error",
          "data": errorMessage
        ]
        resolve(response)
      }
    )
  }

  @objc(showTicket:withResolver:withRejecter:)
  func showTicket(params: [String: Any],
                     resolve: @escaping RCTPromiseResolveBlock,
                     reject: @escaping RCTPromiseRejectBlock) -> Void {
    utsSdk.showTicket(
      params: params,
      onSuccess: { successMessage in
        let response: [String: Any] = [
          "status": "success",
          "data": successMessage
        ]
        resolve(response)
      },
      onError: { errorMessage in
        let response: [String: Any] = [
          "status": "error",
          "data": errorMessage
        ]
        resolve(response)
      }
    )
  }

  @objc(requestReinitialization:accessToken:withResolver:withRejecter:)
  func requestReinitialization(params: [String: Any], accessToken: String,
                resolve: @escaping RCTPromiseResolveBlock,
                reject: @escaping RCTPromiseRejectBlock) -> Void {
    utsSdk.requestReinitialization(
      params: params,
      accessToken: accessToken,
      onSuccess: { successMessage in
        let response: [String: Any] = [
          "status": "success",
          "data": successMessage
        ]
        resolve(response)
      },
      onError: { errorMessage in
        let response: [String: Any] = [
          "status": "error",
          "data": errorMessage
        ]
        resolve(response)
      }
    )
  }
}
