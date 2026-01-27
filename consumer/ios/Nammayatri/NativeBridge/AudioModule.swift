import Foundation
import AVFoundation
import React

@objc(AudioModule)
class AudioModule: RCTEventEmitter, AVAudioPlayerDelegate {
    private var audioRecorder: AVAudioRecorder?
    private var audioPlayer: AVAudioPlayer?
    private var isRecording = false
    private var onPlaybackStop: RCTResponseSenderBlock?
    private var onPlaybackComplete: RCTResponseSenderBlock?
  
    
  private func sendPlaybackCompleteEvent(_ status: Bool) {
          sendEvent(withName: "onPlaybackComplete", body: ["status": status])
      }

      private func sendPlaybackStopEvent(_ message: String) {
          sendEvent(withName: "onPlaybackStop", body: ["message": message])
      }
  
  private func sendPlaybackPauseEvent(_ message: String) {
    sendEvent(withName: "onPlaybackPause", body: ["message": message])
  }
    // Start recording audio
    @objc func startRecording(_ fileName: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        guard let fileURL = getFileURL(fileName: fileName) else {
            reject("E_FILE_URL", "Failed to set up file URL", nil)
            return
        }

        let settings: [String: Any] = [
            AVFormatIDKey: Int(kAudioFormatMPEG4AAC),
            AVSampleRateKey: 12000,
            AVNumberOfChannelsKey: 1,
            AVEncoderAudioQualityKey: AVAudioQuality.high.rawValue
        ]

        do {
            let audioSession = AVAudioSession.sharedInstance()
            try audioSession.setCategory(.playAndRecord, mode: .default)
            try audioSession.setActive(true)

            // Remove existing file if it exists
            if FileManager.default.fileExists(atPath: fileURL.path) {
                try FileManager.default.removeItem(at: fileURL)
            }

            audioRecorder = try AVAudioRecorder(url: fileURL, settings: settings)
            audioRecorder?.prepareToRecord()
            audioRecorder?.record()

            isRecording = true
            resolve("Recording started at \(fileURL.absoluteString)")
        } catch {
            reject("E_RECORDER", "Failed to start recording: \(error.localizedDescription)", error)
        }
    }

    // Stop recording audio
    @objc func stopRecording(_ fileName: String,resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        guard isRecording else {
            reject("E_NOT_RECORDING", "Not currently recording", nil)
            return
        }

        audioRecorder?.stop()
        isRecording = false
        resolve("Recording stopped")
    }

    // Play recorded audio
  @objc func playAudio(
         _ fileName: String,
         loopAudio: Bool,
         resolve: @escaping RCTPromiseResolveBlock,
         reject: @escaping RCTPromiseRejectBlock
     ) {
         guard !fileName.isEmpty else {
             reject("E_INVALID_FILE", "File name cannot be empty", nil)
             return
         }
         
         var fileURL: URL?
         
         // Check if the file exists in the Documents directory
         let documentsDirectory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first!
         let documentFileURL = documentsDirectory.appendingPathComponent(fileName)
         
         if FileManager.default.fileExists(atPath: documentFileURL.path) {
             fileURL = documentFileURL
         } else {
             if let bundleFileURL = Bundle.main.url(forResource: fileName, withExtension: nil) {
                 fileURL = bundleFileURL
             }
         }
         
         guard let validFileURL = fileURL else {
             reject("E_FILE_NOT_FOUND", "File not found", nil)
             return
         }
         
         // Setup audio session and player
         do {
             let audioSession = AVAudioSession.sharedInstance()
             try audioSession.setCategory(.playback, mode: .default)
             try audioSession.setActive(true)
             
             audioPlayer = try AVAudioPlayer(contentsOf: validFileURL)
             audioPlayer?.delegate = self  // Set the delegate to self
             audioPlayer?.numberOfLoops = loopAudio ? -1 : 0
             
             audioPlayer?.play()
             resolve("Playback started for \(fileName)")  // Resolving the promise
             
         } catch {
             reject("E_PLAYER", "Failed to play audio: \(error.localizedDescription)", error)
         }
     }
  
  // MARK: AVAudioPlayerDelegate Methods
  
  // Delegate method for when the audio finishes
      func audioPlayerDidFinishPlaying(_ player: AVAudioPlayer, successfully flag: Bool) {
        sendPlaybackCompleteEvent(flag)
      }

      // Delegate method for when the audio player is interrupted
      func audioPlayerBeginInterruption(_ player: AVAudioPlayer) {
        sendPlaybackStopEvent("Audio interrupted")
      }
    
  
      
      // Method to stop playback
      @objc func stopAudio() {
          audioPlayer?.stop()
        sendPlaybackStopEvent("Audio stopped")
      }
  
  @objc func pauseAudio() {
    audioPlayer?.pause()
    sendPlaybackPauseEvent("Audio paused")
  }
  
  @objc func pauseAudio(_ fileName:String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
      guard let player = audioPlayer else {
        reject("E_PLAYER", "Audio player is not initialized", nil)
        return
      }

      if player.isPlaying {
        player.pause()
        resolve("Audio paused successfully")
        sendPlaybackPauseEvent("Audio paused")
      } else {
        reject("E_PLAYER", "Audio is not currently playing", nil)
      }
    }
  
  override func supportedEvents() -> [String]! {
          return ["onPlaybackComplete", "onPlaybackStop", "onPlaybackPause"]  // Events we will send to JS
      }


    // Stop playing audio
  @objc func stopAudio(_ fileName:String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        guard let player = audioPlayer, player.isPlaying else {
            reject("E_NOT_PLAYING", "No audio is currently playing", nil)
            return
        }

        player.stop()
    audioPlayer = nil
        resolve("Playback stopped")
    }

    // Check if currently recording
    @objc func isRecordingAudio(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        resolve(isRecording)
    }

    // Generate file URL based on the given file name
    private func getFileURL(fileName: String) -> URL? {
        guard !fileName.isEmpty else { return nil }
        let documentsDirectory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first!
        return documentsDirectory.appendingPathComponent(fileName)
    }
}
