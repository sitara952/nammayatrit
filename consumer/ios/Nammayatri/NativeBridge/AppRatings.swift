//
//  AppRatings.swift
//  Nammayatri
//
//  Created by Shailesh Gahlawat on 11/30/24.
//

import Foundation
import StoreKit

@objc(AppRatings)
class AppRatings: NSObject {
  
  @objc
  func callAppRatings() {
    DispatchQueue.main.async {
      if #available(iOS 14.0, *) {
        if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene {
          SKStoreReviewController.requestReview(in: windowScene)
        }
      } else {
        SKStoreReviewController.requestReview()
      }
    }
  }
}
