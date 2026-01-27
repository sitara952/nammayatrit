//
//  DeviceIdentifier.swift
//  MobilityCustomer
//
//  Created by Praveen Kumar on 13/06/24.
//

import Foundation
import Security

class DeviceIdentifier {

    static func getDeviceID() -> String {
        let serviceName = Bundle.main.bundleIdentifier ?? "in.mobility.consumer"
        let keyName = "\(serviceName).unique_id"

        // Define query parameters for keychain access
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: serviceName,
            kSecAttrAccount as String: keyName,
            kSecReturnData as String: kCFBooleanTrue as Any
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        if status == errSecSuccess {
            // UUID already exists in keychain, extract and return it
            if let uuidData = result as? Data,
               let uuidString = String(data: uuidData, encoding: .utf8) {
                return "\(uuidString)$IOS"
            }
        } else {
            // Generate a new UUID
            let newUUID = UUID().uuidString

            if status == errSecItemNotFound {
                // Prepare data to be stored in keychain
                let newUUIDData = newUUID.data(using: .utf8)!
                let attributes: [String: Any] = [
                    kSecClass as String: kSecClassGenericPassword,
                    kSecAttrService as String: serviceName,
                    kSecAttrAccount as String: keyName,
                    kSecValueData as String: newUUIDData
                ]

                // Store the new UUID in keychain
                let addStatus = SecItemAdd(attributes as CFDictionary, nil)

                if addStatus == errSecSuccess {
                    return "\(newUUID)$IOS"
                } else {
                    logDebug("Error storing UUID in keychain: \(addStatus)")
                    return "\(newUUID)$STORE_ERROR"
                }
            } else {
                logDebug("Error retrieving UUID from keychain: \(status)")
                return "\(newUUID)$RETRIEVE_ERROR"
            }
        }

        return "NO_DEVICE_ID"
    }

    static func logDebug(_ log: String) {
        #if DEBUG
        print(log)
        #endif
    }
}
