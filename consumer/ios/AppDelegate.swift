//
//  AppDelegate.swift
//  Nammayatri
//
//  Created by Vignesh S on 19/10/24.
//

import FBSDKCoreKit

// MARK: - AppDelegate + InitializeSDK

extension AppDelegate: InitializeSDK {
    private static var splashManager: SplashScreenManager?

    private func getSplashManager() -> SplashScreenManager? {
        if AppDelegate.splashManager == nil {
            AppDelegate.splashManager = SplashScreenManager(window: window)
        }
        return AppDelegate.splashManager
    }

    public func startMeta() {
        ApplicationDelegate.initialize()
    }

    @available(iOS 14, *)
    public func setSettings(_ status: ATTrackingManager.AuthorizationStatus) {
        switch status {
            case .authorized:
                Settings.shared.isAutoLogAppEventsEnabled = true;
                Settings.shared.isAdvertiserIDCollectionEnabled = true;
                Settings.shared.enableLoggingBehavior(.appEvents);
                break
            case .denied:
                Settings.shared.isAutoLogAppEventsEnabled = false;
                Settings.shared.isAdvertiserIDCollectionEnabled = false;
                break
            default:
                break
        }
    }

    public func showSplash() {
        if let splashManager = getSplashManager() {
            splashManager.showSplash()
        }
    }

    public func hideSplash() {
        if let splashManager = getSplashManager() {
            splashManager.hideSplash()
        }
    }
}
