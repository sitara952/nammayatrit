package com.nammayatri.reactNativeBridge

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.mobility.movingtech.MyFirebaseMessagingService


class FirebaseMessagingModule(context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {

    init {
        MyFirebaseMessagingService.setReactContext(context)
    }

    override fun getName(): String {
        return "FirebaseMessagingModule"
    }
}
