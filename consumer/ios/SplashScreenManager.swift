//
//  SplashScreenManager.swift
//  Nammayatri
//
//  Created by Praveen Kumar on 17/07/25.
//

import AVFoundation
import Lottie
import SwiftUI

// MARK: - SplashScreenManager

class SplashScreenManager {
    private var lottieAnimationView: LottieAnimationView?
    private var videoPlayer: AVPlayer?
    private var playerLayer: AVPlayerLayer?
    private let rootSplashView = UIView(frame: UIScreen.main.bounds)
    private weak var window: UIWindow?

    init(window: UIWindow?) {
        self.window = window
    }

    // MARK: - Public API

    func showSplash() {
        if hasSplashVideo() {
            showSplashVideo()
        } else {
            showSplashLottie()
        }
        window?.addSubview(rootSplashView)
    }

    func hideSplash() {
        if hasSplashVideo() {
            stopSplashVideo()
        } else {
            stopSplashLottie()
        }
        rootSplashView.removeFromSuperview()
    }

    // MARK: - Private Helpers

    private func hasSplashVideo() -> Bool {
        return Bundle.main.url(forResource: "splash_video", withExtension: "mp4") != nil
    }

    private func getLottieView() -> LottieAnimationView? {
        if lottieAnimationView == nil, Bundle.main.path(forResource: "splash_lottie", ofType: "json") != nil {
            lottieAnimationView = LottieAnimationView(name: "splash_lottie")
        }
        return lottieAnimationView
    }

    private func setupVideoPlayer() -> AVPlayerLayer? {
        guard let videoURL = Bundle.main.url(forResource: "splash_video", withExtension: "mp4") else {
            return nil
        }
        
        // Configure audio session to allow mixing with other audio
        configureAudioSessionForVideo()
        
        videoPlayer = AVPlayer(url: videoURL)
        videoPlayer?.isMuted = true
      
        NotificationCenter.default.addObserver(
                self,
                selector: #selector(playerItemDidReachEnd(_:)),
                name: .AVPlayerItemDidPlayToEndTime,
                object: videoPlayer?.currentItem
            )

        let layer = AVPlayerLayer(player: videoPlayer)
        layer.videoGravity = .resizeAspectFill
        playerLayer = layer
        return layer
    }
  
    @objc private func playerItemDidReachEnd(_ notification: Notification) {
        videoPlayer?.seek(to: .zero)
        videoPlayer?.play()
    }

    private func addBackgroundImage() {
        if Bundle.main.path(forResource: "ny_ic_splash_bg", ofType: "png") != nil {
            let imageView = UIImageView(frame: UIScreen.main.bounds)
            imageView.image = UIImage(named: "ny_ic_splash_bg")
            imageView.contentMode = .scaleAspectFill
            rootSplashView.addSubview(imageView)
        }
    }

    private func showSplashLottie() {
        guard let view = window?.rootViewController?.view else { return }
        addBackgroundImage()

        if let animationView = getLottieView() {
            if getAppId() == "odishaYatri" {
                animationView.contentMode = .scaleAspectFill
            }
            else if getAppId() == "yatriSathi" {
              animationView.contentMode = .scaleToFill // Adjust full screen lotties for iPhone SE and similar devices
            }
            animationView.frame = UIScreen.main.bounds
            animationView.center = view.center
            animationView.loopMode = .loop
            animationView.play()
            rootSplashView.addSubview(animationView)
        } else {
            showDefaultSplashView()
        }
    }

    private func showSplashVideo() {
        if let layer = setupVideoPlayer() {
            addBackgroundImage()
            layer.frame = UIScreen.main.bounds
            rootSplashView.layer.addSublayer(layer)
            videoPlayer?.play()
        }
    }

    private func showDefaultSplashView() {
        if #available(iOS 13.0.0, *) {
            let splashView = UIHostingController(rootView: SplashScreen()).view
            splashView?.frame = UIScreen.main.bounds
            if let splashView = splashView {
                rootSplashView.addSubview(splashView)
            }
        }
    }

    private func stopSplashVideo() {
        videoPlayer?.pause()
        playerLayer?.removeFromSuperlayer()
        playerLayer = nil
        videoPlayer = nil
        
        // Restore audio session to allow other apps to resume their audio
        restoreAudioSession()
    }

    private func stopSplashLottie() {
        getLottieView()?.stop()
    }

    private func getAppId() -> String? {
        return Bundle.main.object(forInfoDictionaryKey: "app_id") as? String
    }
    
    // MARK: - Audio Session Management
    
    private func configureAudioSessionForVideo() {
        do {
            let audioSession = AVAudioSession.sharedInstance()
            // Use ambient category which allows background audio to continue
            try audioSession.setCategory(.ambient, mode: .default, options: [])
            try audioSession.setActive(true)
        } catch {
            print("Failed to configure audio session for video: \(error)")
        }
    }
    
    private func restoreAudioSession() {
        do {
            let audioSession = AVAudioSession.sharedInstance()
            // Deactivate our audio session to allow other apps to resume
            try audioSession.setActive(false, options: .notifyOthersOnDeactivation)
        } catch {
            print("Failed to restore audio session: \(error)")
        }
    }
}
