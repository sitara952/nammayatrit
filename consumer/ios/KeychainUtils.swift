//
//  KeychainUtils.swift
//  Nammayatri
//
//  Created by Praveen kumar on 26/06/25.
//

import Foundation
import Security

class KeychainUtils {
  static func removeFromKeyChain(key: String) -> Bool {
      let serviceName = Bundle.main.bundleIdentifier ?? "in.mobility.consumer"
      let keyName = "\(serviceName).\(key)"

      // Define query parameters for keychain deletion
      let query: [String: Any] = [
          kSecClass as String: kSecClassGenericPassword,
          kSecAttrService as String: serviceName,
          kSecAttrAccount as String: keyName
      ]

      // Delete the item from keychain
      let status = SecItemDelete(query as CFDictionary)

      if status == errSecSuccess || status == errSecItemNotFound {
          logDebug("Successfully deleted key from keychain: \(key)")
          return true
      } else {
          logDebug("Error deleting key from keychain: \(status)")
          return false
      }
  }

  static func addToKeychain(key: String, value: String) -> Bool {
      let serviceName = Bundle.main.bundleIdentifier ?? "in.mobility.consumer"
      let keyName = "\(serviceName).\(key)"

      // Convert the value string to Data
      guard let valueData = value.data(using: .utf8) else {
          logDebug("Error converting value to Data for key: \(key)")
          return false
      }

      // Prepare attributes for storing in keychain
      let attributes: [String: Any] = [
          kSecClass as String: kSecClassGenericPassword,
          kSecAttrService as String: serviceName,
          kSecAttrAccount as String: keyName,
          kSecValueData as String: valueData
      ]

      // Store the item in keychain
      let status = SecItemAdd(attributes as CFDictionary, nil)

      if status == errSecSuccess {
          logDebug("Successfully added key-value pair to keychain: \(key)")
          return true
      } else if status == errSecDuplicateItem {
          // Item already exists, try to update it
          let updateQuery: [String: Any] = [
              kSecClass as String: kSecClassGenericPassword,
              kSecAttrService as String: serviceName,
              kSecAttrAccount as String: keyName
          ]

          let updateAttributes: [String: Any] = [
              kSecValueData as String: valueData
          ]

          let updateStatus = SecItemUpdate(updateQuery as CFDictionary, updateAttributes as CFDictionary)

          if updateStatus == errSecSuccess {
              logDebug("Successfully updated existing key-value pair in keychain: \(key)")
              return true
          } else {
              logDebug("Error updating existing key in keychain: \(updateStatus)")
              return false
          }
      } else {
          logDebug("Error adding key-value pair to keychain: \(status)")
          return false
      }
  }
  
  static func logDebug(_ log: String) {
      #if DEBUG
      print(log)
      #endif
  }
}
