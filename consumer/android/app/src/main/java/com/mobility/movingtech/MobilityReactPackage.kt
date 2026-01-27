package com.mobility.movingtech


import android.content.Context
import android.view.View
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ReactShadowNode
import com.facebook.react.uimanager.ViewManager
import com.mobility.movingtech.reactNativeBridge.AppInfoModule
import com.mobility.movingtech.reactNativeBridge.AppRatings
import com.mobility.movingtech.reactNativeBridge.AppUpdate
import com.mobility.movingtech.reactNativeBridge.AudioModule
import com.mobility.movingtech.reactNativeBridge.GeoCoderModule
import com.mobility.movingtech.reactNativeBridge.LocationModule
import com.mobility.movingtech.reactNativeBridge.InstallReferrerModule
import com.mobility.movingtech.reactNativeBridge.OTABridge
import com.mobility.movingtech.reactNativeBridge.PDFGenerator.RNHTMLtoPDFModule
import com.mobility.movingtech.reactNativeBridge.TrueCallerModule
import com.mobility.movingtech.reactNativeBridge.DebugNotificationModule
import com.nammayatri.reactNativeBridge.FCMTokenManagerModule
import com.nammayatri.reactNativeBridge.FirebaseMessagingModule


class MobilityReactPackage: ReactPackage {
    override fun createNativeModules(context: ReactApplicationContext): MutableList<NativeModule> {
        val modules = mutableListOf<NativeModule>(
            FirebaseMessagingModule(context), 
            FCMTokenManagerModule(context),
            RNHTMLtoPDFModule(context), 
            AppInfoModule(context), 
            AppRatings(context), 
            MapUtils(context),  
            MainAppUtils(context), 
            GeoCoderModule(context), 
            AudioModule(context), 
            AppUpdate(context), 
            LocationModule(context), 
            InstallReferrerModule(context), 
            TrueCallerModule(context), 
            OTABridge(context),
            DebugNotificationModule(context)
        )
        
        try {
            val utsModuleClass = Class.forName("com.mobility.movingtech.uts.UTSModule")
            val constructor = utsModuleClass.getConstructor(ReactApplicationContext::class.java)
            val utsModule = constructor.newInstance(context) as NativeModule
            modules.add(utsModule)
        } catch (e: Exception) {
            // UTSModule not available in this variant
        }
        
        try {
            val telephonyModuleClass = Class.forName("com.mobility.movingtech.telephony.TelephonyModule")
            val constructor = telephonyModuleClass.getConstructor(ReactApplicationContext::class.java)
            val telephonyModule = constructor.newInstance(context) as NativeModule
            modules.add(telephonyModule)
        } catch (e: Exception) {
            // TelephonyModule not available in this variant
        }
        
        return modules
    }

    override fun createViewManagers(context: ReactApplicationContext): MutableList<ViewManager<View, ReactShadowNode<*>>> {
        return mutableListOf()
    }
}
