module TwilioError = {
  type twilioError = {
    causes: array<string>,
    code: option<int>,
    description: string,
    explanation: string,
    solutions: array<string>,
  }
  @module("@twilio/voice-react-native-sdk") @new
  external make: (~message: string, ~number: int=?) => twilioError = "CallMessage"
}

module CallKit = {
  type configurationOptions = {
    callKitIconTemplateImageData: string,
    callKitIncludesCallsInRecents: bool,
    callKitMaximumCallGroups: int,
    callKitMaximumCallsPerCallGroup: int,
    callKitRingtoneSound: string,
    callKitSupportedHandleTypes: array<int>,
  }
}

module RTCStats = {
  type iceCanditatePairState = [
    | #STATE_FAILED
    | #STATE_FROZEN
    | #STATE_IN_PROGRESS
    | #STATE_SUCCEEDED
    | #STATE_WAITING
  ]
  type iceCanditatePairStats = {
    activeCandidatePair: bool,
    availableIncomingBitrate: int,
    availableOutgoingBitrate: int,
    bytesReceived: int,
    bytesSent: int,
    consentRequestsReceived: int,
    consentRequestsSent: int,
    consentResponsesReceived: int,
    consentResponsesSent: int,
    currentRoundTripTime: int,
    localCandidateId: string,
    localCandidateIp: string,
    nominated: bool,
    priority: int,
    readable: bool,
    relayProtocol: string,
    remoteCandidateId: string,
    remoteCandidateIp: string,
    requestsReceieved: int,
    requestsSent: int,
    responsesRecieved: int,
    responsesSent: int,
    retransmissionsReceived: int,
    retransmissionsSent: int,
    state: iceCanditatePairState,
    totalRoundTripTime: int,
    transportId: string,
    writeable: bool,
  }

  type iceCandidateStats = {
    candidateType: string,
    deleted: bool,
    ip: string,
    isRemote: bool,
    port: int,
    priority: int,
    protocol: string,
    transportId: string,
    url: string,
  }

  type baseTrackStats = {
    codec: string,
    packetsLost: int,
    ssrc: string,
    timestamp: int,
    trackId: string,
  }

  type localTrackStats = {
    ...baseTrackStats,
    bytesSent: int,
    packetsSent: int,
    roundTripTime: int,
  }

  type localAudioTrackStats = {
    ...localTrackStats,
    audioLevel: int,
    jitter: int,
  }

  type remoteTrackStats = {
    ...baseTrackStats,
    bytesRecieved: int,
    packetsReceived: int,
  }

  type remoteAudioTrackStats = {
    ...remoteTrackStats,
    audioLevel: int,
    jitter: int,
    mos: int,
  }
  type statsReport = {
    iceCandidatePairStats: array<iceCanditatePairStats>,
    iceCandidateStats: array<iceCandidateStats>,
    localAudioTrackStats: array<localAudioTrackStats>,
    peerConnectionId: string,
    remoteAudioTrackStats: array<remoteAudioTrackStats>,
  }
}

module CallMessage = {
  type content<'contentType> = 'contentType
  type callMessage<'contentType> = {
    content: content<'contentType>,
    contentType: option<string>,
    messageType: string,
  }
  @module("@twilio/voice-react-native-sdk") @new
  external make: (content<'contentType>, string, string) => callMessage<'contentType> =
    "CallMessage"
}

module IncomingCallMessage = {
  type incomingCallMessage
  @send external getContent: incomingCallMessage => CallMessage.content<'contentType> = "getContent"
  @send external getContentType: incomingCallMessage => string = "getContentType"
  @send external getMessageType: incomingCallMessage => string = "getMessageType"
  @send external getSid: incomingCallMessage => option<string> = "getSid"
}

module OutGoingCallMessage = {
  include IncomingCallMessage
  type outGoingCallMessage
  type event = [
    | #failure
    | #sent
  ]
  @send
  external onFailure: (
    outGoingCallMessage,
    event,
    TwilioError.twilioError => unit,
  ) => promise<unit> = "on"
  @send
  external onSent: (outGoingCallMessage, event, unit => unit) => promise<unit> = "on"
}

module AudioDevice = {
  type audioDeviceType = [
    | #earpiece
    | #speaker
    | #bluetooth
  ]
  type audioDevice = {
    name: string,
    audioDeviceType: audioDeviceType,
  }
  @send external select: audioDevice => promise<unit> = "select"
}

module Call = {
  type event = [
    | #connected
    | #connectFailure
    | #reconnecting
    | #reconnected
    | #disconnected
    | #ringing
    | #qualityWarningsChanged
    | #messageReceived
  ]

  type qualityWarning = [
    | #"constant-audio-input-level"
    | #"high-jitter"
    | #"high-packet-loss"
    | #"high-rtt"
    | #"low-mos"
  ]

  type qualityWarningEvent = {
    currentQualityWarnings: array<qualityWarning>,
    previousQualityWarnings: array<qualityWarning>,
  }

  type state = [
    | #connected
    | #connecting
    | #disconnected
    | #reconnecting
    | #ringing
  ]

  type issue = [
    | #"not-reported"
    | #"dropped-call"
    | #"audio-latency"
    | #"one-way-audio"
    | #"choppy-audio"
    | #"noisy-call"
    | #echo
  ]

  type call

  @send external onConnected: (call, event, unit => unit) => unit = "on"
  @send external onConnnectFailure: (call, event, TwilioError.twilioError => unit) => unit = "on"
  @send external onReconnecting: (call, event, TwilioError.twilioError => unit) => unit = "on"
  @send external onReconnected: (call, event, unit => unit) => unit = "on"
  @send
  external onDisconnected: (call, event, option<TwilioError.twilioError> => unit) => unit = "on"
  @send external onRinging: (call, event, unit => unit) => unit = "on"
  @send external onQualityWarningsChanged: (call, event, qualityWarningEvent => unit) => unit = "on"
  @send
  external onMessageReceived: (
    call,
    event,
    IncomingCallMessage.incomingCallMessage => unit,
  ) => unit = "on"
  @send external disconnect: call => promise<unit> = "disconnect"
  @send external isMuted: call => option<bool> = "isMuted"
  @send external isOnHold: call => option<bool> = "isOnHold"
  @send external getCustomParameters: call => 'a = "getCustomParameters"
  @send external getFrom: call => option<string> = "getFrom"
  @send
  external getInitialConnetedTimeStamp: call => option<Js.Date.t> = "getInitialConnetedTimeStamp"
  @send external getSid: call => option<string> = "getSid"
  @send external getState: call => state = "getState"
  @send external getStats: call => RTCStats.statsReport = "getStats"
  @send external getTo: call => option<string> = "getTo"
  @send external hold: (call, bool) => promise<bool> = "hold"
  @send external mute: (call, bool) => promise<bool> = "mute"
  @send external sendDigits: (call, string) => promise<unit> = "sendDigits"
  @send
  external sendMessage: (
    call,
    CallMessage.callMessage<'contentType>,
  ) => promise<OutGoingCallMessage.outGoingCallMessage> = "sendMessage"
  @send external postFeedBack: (int, issue) => promise<unit> = "postFeedBack"
}

module CallInvite = {
  type callInvite
  type event = [
    | #accepted
    | #rejected
    | #cancelled
    | #notificationTapped
    | #messageReceived
  ]
  type state = [
    | #pending
    | #accepted
    | #rejected
    | #cancelled
  ]

  type callInviteOptions = {}

  @send external onAccepted: (callInvite, event, Call.call => unit) => unit = "on"
  @send external onRejected: (callInvite, event, unit => unit) => unit = "on"
  @send
  external onCancelled: (callInvite, event, option<TwilioError.twilioError> => unit) => unit = "on"
  @send external onNotificationTapped: (callInvite, event, unit => unit) => unit = "on"
  @send
  external onMessageReceived: (
    callInvite,
    event,
    IncomingCallMessage.incomingCallMessage => unit,
  ) => unit = "on"
  @send external accept: (callInvite, callInviteOptions) => promise<Call.call> = "accept"
  @send external reject: callInvite => promise<unit> = "reject"
  @send external isValid: callInvite => promise<bool> = "isValid"
  @send external getCallSid: callInvite => string = "getCallSid"
  @send external getCustomParameters: callInvite => Js.Dict.t<string> = "getCustomParameters"
  @send external getFrom: callInvite => string = "getFrom"
  @send external getState: callInvite => state = "getState"
  @send external getTo: callInvite => string = "getFrom"
  @send
  external sendMessage: (
    callInvite,
    CallMessage.callMessage<'contentType>,
  ) => promise<OutGoingCallMessage.outGoingCallMessage> = "sendMessage"
  @send external updateCallerHandle: (callInvite, string) => option<bool> = "updateCallerHandle"
}

module Voice = {
  type voice
  type getAudioDevicesType = {
    audioDevices: array<AudioDevice.audioDevice>,
    selectedDevice: option<AudioDevice.audioDevice>,
  }
  type event = [
    | #audioDevicesUpdated
    | #callInvite
    | #error
    | #registered
    | #unregistered
  ]

  type connectOptions<'a> = {
    params: 'a,
    contactHandle: option<string>,
  }

  @module("@twilio/voice-react-native-sdk") @new external make: unit => voice = "Voice"
  @send external onAudioDevicesUpdated: (voice, event, getAudioDevicesType => unit) => unit = "on"
  @send external onCallInvite: (voice, event, CallInvite.callInvite => promise<unit>) => unit = "on"
  @send external onError: (voice, event, TwilioError.twilioError => unit) => unit = "on"
  @send external onRegistered: (voice, event, unit => unit) => unit = "on"
  @send external onUnRegistered: (voice, event, unit => unit) => unit = "on"
  @send external connect: (voice, string, connectOptions<'a>) => promise<Call.call> = "connect"
  @send external getVersion: voice => promise<string> = "getVersion"
  @send external getDeviceToken: voice => promise<string> = "getDeviceToken"
  @send external getCalls: voice => promise<Map.t<string, Call.call>> = "getCalls"
  @send external getCallInvites: voice => promise<Map.t<string, CallInvite.callInvite>> = "getCalls"
  @send external register: (voice, string) => promise<unit> = "register"
  @send external unregister: (voice, string) => promise<unit> = "unregister"
  @send external getAudioDevices: voice => promise<getAudioDevicesType> = "getAudioDevices"
  @send external showAvRoutePickerView: voice => promise<unit> = "showAvRoutePickerView"
  @send external initializePushRegistry: voice => promise<unit> = "initializePushRegistry"
  @send
  external setCallKitConfiguration: (voice, CallKit.configurationOptions) => promise<unit> =
    "setCallKitConfiguration"
}
