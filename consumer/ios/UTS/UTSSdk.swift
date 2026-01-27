//
//  UTSSdk.swift
//  Nammayatri
//
//  Created by Praveen kumar on 05/04/25.
//

import UIKit
import UTS_SDK

class UTSSdk: NSObject {

  let appCode = Bundle.main.object(forInfoDictionaryKey: "UTSappCode") as? String ?? ""
  let sdkChannelId = Bundle.main.object(forInfoDictionaryKey: "UTSsdkChannelId") as? String ?? ""
  let agentAccountId = Bundle.main.object(forInfoDictionaryKey: "UTSagentAccountId") as? String ?? ""
  let sdkPassword = Bundle.main.object(forInfoDictionaryKey: "UTSsdkPassword") as? String ?? ""
  let sdkActivationKey = Bundle.main.object(forInfoDictionaryKey: "UTSsdkActivationKey") as? String ?? ""
  let environment = Bundle.main.object(forInfoDictionaryKey: "UTSEnvironment") as? String ?? ""

  override init() {
    super.init()
    let umSDKInit = UMSdkInit(
      appCode: appCode,
      sdkChannelId: sdkChannelId,
      agentAccountId: agentAccountId,
      sdkPassword: sdkPassword,
      sdkActivationKey: sdkActivationKey
    )

    if(environment == "Release") {
      UTSManager.configure(umSdkInit: umSDKInit, umClientAppType: UMClientAppType.PROD)
    } else {
      UTSManager.configure(umSdkInit: umSDKInit, umClientAppType: UMClientAppType.UAT)
    }
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }

  private func getRootViewController() -> UIViewController? {
    let keyWindow = UIApplication.shared.windows.first(where: { $0.isKeyWindow }
    )
    return keyWindow?.rootViewController
  }

  private func validateAccessToken(_ accessToken: String) throws {
    guard !accessToken.isEmpty else {
      throw NSError(domain: "UTSError", code: -1, userInfo: [NSLocalizedDescriptionKey: "Access token cannot be empty"])
    }
  }

  private func validateParameter<T>(_ value: T?, name: String) throws -> T {
    guard let value = value else {
      throw NSError(domain: "UTSError", code: -1, userInfo: [NSLocalizedDescriptionKey: "\(name) cannot be empty"])
    }
    if let strValue = value as? String, strValue.isEmpty {
      throw NSError(domain: "UTSError", code: -1, userInfo: [NSLocalizedDescriptionKey: "\(name) cannot be empty"])
    }
    return value
  }

  func requestBooking(
    params: [String: Any],
    accessToken: String,
    onSuccess: @escaping (String) -> Void,
    onError: @escaping (String) -> Void
  ) {
    DispatchQueue.main.async {
      do {
        guard let viewController = self.getRootViewController() else {
          onError("Failed to get root view controller")
          return
        }

        try self.validateAccessToken(accessToken)
        let mobileNumber = try self.validateParameter(params["mobileNumber"] as? String, name: "mobileNumber")
        let registrationID = try self.validateParameter(params["registrationID"] as? String, name: "registrationID")

        let zone = try self.validateParameter(params["zone"] as? String, name: "zone")
        let appCode = try self.validateParameter(params["appCode"] as? String, name: "appCode")
        let sourceCode = try self.validateParameter(params["sourceCode"] as? String, name: "sourceCode")
        let destinationCode = try self.validateParameter(params["destinationCode"] as? String, name: "destinationCode")
        let deviceID = try self.validateParameter(params["deviceID"] as? String, name: "deviceID")
        let mobileMake = try self.validateParameter(params["mobileMake"] as? String, name: "mobileMake")
        let mobileModel = try self.validateParameter(params["mobileModel"] as? String, name: "mobileModel")
        let ticketTypeCode = try self.validateParameter(params["ticketTypeCode"] as? String, name: "ticketTypeCode")
        let routeID = try self.validateParameter(params["routeID"] as? String, name: "routeID")
        let agentAccountID = try self.validateParameter(params["agentAccountID"] as? Int, name: "agentAccountID")

        let bookingData = UMClientRequestBooking(
          mobileNumber: mobileNumber,
          appCode: appCode,
          registrationID: registrationID,
          agentAccountID: agentAccountID,
          zone: zone,
          sourceCode: sourceCode,
          destinationCode: destinationCode,
          deviceID: deviceID,
          mobileMake: mobileMake,
          mobileModel: mobileModel,
          ticketTypeCode: ticketTypeCode,
          routeID: routeID
        )

        UTSManager.shared.launchUMSdkForBooking(
          from: viewController,
          data: bookingData,
          accessToken: accessToken,
          onFailure: { errorMessage in
            do {
              let jsonData = try JSONSerialization.data(withJSONObject: errorMessage, options: [])
              if let jsonString = String(data: jsonData, encoding: .utf8) {
                onError(jsonString)
              } else {
                onError("Failed to convert response to string in launchUMSdkForBooking onFailure")
              }
            } catch {
              onError("Failed to serialize response in onFailure: \(error.localizedDescription)")
            }
          },
          onSuccess: { successMessage in
              do {
                let jsonData = try JSONSerialization.data(withJSONObject: successMessage, options: [])
                if let jsonString = String(data: jsonData, encoding: .utf8) {
                  onSuccess(jsonString)
                } else {
                  onError("Failed to convert response to string launchUMSdkForBooking onSuccess")
                }
              } catch {
                onError("Failed to serialize response launchUMSdkForBooking onSuccess: \(error.localizedDescription)")
              }
          }
        )
      } catch {
        onError(error.localizedDescription)
      }
    }
  }

  func showTicket(
    params: [String: Any],
    onSuccess: @escaping (String) -> Void,
    onError: @escaping (String) -> Void
  ) {
    DispatchQueue.main.async {
      do {
        guard let viewController = self.getRootViewController() else {
          onError("Failed to get root view controller")
          return
        }

        let mobileNumber = try self.validateParameter(params["mobileNumber"] as? String, name: "mobileNumber")
        let appCode = try self.validateParameter(params["appCode"] as? String, name: "appCode")
        let deviceID = try self.validateParameter(params["deviceID"] as? String, name: "deviceID")
        let agentAccountID = try self.validateParameter(params["agentAccountID"] as? Int, name: "agentAccountID")

        let zone = try self.validateParameter(params["zone"] as? String, name: "zone")
        let ticketEncData = try self.validateParameter(params["ticketEncData"] as? String, name: "ticketEncData")

        let sourceStationName = params["sourceStationName"] as? String ?? ""
        let destinationStationName = params["destinationStationName"] as? String ?? ""
        let sourceStationNameHindi = params["sourceStationNameHindi"] as? String ?? ""
        let destinationStationNameHindi = params["destinationStationNameHindi"] as? String ?? ""
        let sourceStationNameRegional = params["sourceStationNameRegional"] as? String ?? ""
        let destinationStationNameRegional = params["destinationStationNameRegional"] as? String ?? ""
        let buttonColorHex = params["buttonColorHex"] as? String ?? ""
        let buttonTextColorHex = params["buttonTextColorHex"] as? String ?? ""

        let ticketDataObj = UMClientRequestShowTicket(
          mobileNumber: mobileNumber,
          appCode: appCode,
          deviceID: deviceID,
          agentAccountID: agentAccountID,
          zone: zone,
          ticketEncData: ticketEncData,
          sourceStationName: sourceStationName,
          destinationStationName: destinationStationName,
          sourceStationNameHindi: sourceStationNameHindi,
          destinationStationNameHindi: destinationStationNameHindi,
          sourceStationNameRegional: sourceStationNameRegional,
          destinationStationNameRegional: destinationStationNameRegional,
          buttonColorHex: buttonColorHex,
          buttonTextColorHex: buttonTextColorHex
        )

        UTSManager.shared.launchUMSdkForShowTicket(
          from: viewController,
          ticketData: ticketDataObj,
          onFailure: { errorMessage in
            do {
              let jsonData = try JSONSerialization.data(withJSONObject: errorMessage, options: [])
              if let jsonString = String(data: jsonData, encoding: .utf8) {
                onError(jsonString)
              } else {
                onError("Failed to convert response to string in launchUMSdkForShowTicket onFailure")
              }
            } catch {
              onError("Failed to serialize response in launchUMSdkForShowTicket onFailure: \(error.localizedDescription)")
            }
          },
          onSuccess: { successMessage in
            onSuccess(successMessage)
          }
        )
      } catch {
        onError(error.localizedDescription)
      }
    }
  }

  func requestReinitialization(
    params: [String: Any],
    accessToken: String,
    onSuccess: @escaping (String) -> Void,
    onError: @escaping (String) -> Void
  ) {
    DispatchQueue.main.async {
      do {

        try self.validateAccessToken(accessToken)
        let mobileNumber = try self.validateParameter(params["mobileNumber"] as? String, name: "mobileNumber")
        let appCode = try self.validateParameter(params["appCode"] as? String, name: "appCode")
        let deviceID = try self.validateParameter(params["deviceID"] as? String, name: "deviceID")
        let agentAccountID = try self.validateParameter(params["agentAccountID"] as? Int, name: "agentAccountID")
        let zone = try self.validateParameter(params["zone"] as? String, name: "zone")

        let reinitializationData = UMClientRequestReinitialization(
          mobileNumber: mobileNumber,
          appCode: appCode,
          agentAccountID: String(agentAccountID),
          deviceID: deviceID,
          zone: zone
        )

        UTSManager.shared.launchUMSdkForReinitialization(
          data: reinitializationData,
          accessToken: accessToken,
          onFailure: { errorMessage in
            do {
              let jsonData = try JSONSerialization.data(withJSONObject: errorMessage, options: [])
              if let jsonString = String(data: jsonData, encoding: .utf8) {
                onError(jsonString)
              } else {
                onError("Failed to convert response to string in launchUMSdkForReinitialization onFailure")
              }
            } catch {
              onError("Failed to serialize response in launchUMSdkForReinitialization onFailure: \(error.localizedDescription)")
            }
          },
          onSuccess: { successMessage in
            do {
              let jsonData = try JSONSerialization.data(withJSONObject: successMessage, options: [])
              if let jsonString = String(data: jsonData, encoding: .utf8) {
                onSuccess(jsonString)
              } else {
                onError("Failed to convert response to string in launchUMSdkForReinitialization onSuccess")
              }
            } catch {
              onError("Failed to serialize response in launchUMSdkForReinitialization onSuccess: \(error.localizedDescription)")
            }
          }
        )
      } catch {
        onError(error.localizedDescription)
      }
    }
  }
}
