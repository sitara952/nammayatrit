package com.mobility.movingtech

import android.app.Application
import android.content.Context
import com.facebook.react.JSEngineResolutionAlgorithm
import com.facebook.react.PackageList
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.ReactPackageTurboModuleManagerDelegate
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.UIManagerProvider
import com.facebook.react.defaults.DefaultComponentsRegistry
import com.facebook.react.defaults.DefaultTurboModuleManagerDelegate
import com.facebook.react.fabric.ComponentFactory
import com.facebook.react.fabric.FabricUIManagerProviderImpl
import com.facebook.react.uimanager.ViewManagerRegistry
import com.facebook.react.uimanager.ViewManagerResolver
import com.mobility.movingtech.reactNativeBridge.OTAUtils
import com.facebook.react.defaults.DefaultReactNativeHost

/**
 * A utility class that allows you to simplify the setup of a [ReactNativeHost] for new apps in Open
 * Source.
 *
 * Specifically, for apps that are using the New Architecture, this Default class takes care of
 * providing the default TurboModuleManagerDelegateBuilder and the default JSIModulePackage,
 * provided the name of the dynamic library to load.
 */

class MobilityReactNativeHost(application: Application): DefaultReactNativeHost(application) {

    override val isNewArchEnabled: Boolean = true
    override val isHermesEnabled: Boolean =true
    private var packageList: List<ReactPackage> = ArrayList<ReactPackage>();
    override fun getPackages(): List<ReactPackage> {
        if (packageList.isEmpty()) {
            packageList = PackageList(this).packages.apply {
                add(MobilityReactPackage())
            }
        }
        return packageList;
    }


    override fun getJSMainModuleName(): String = "index"

    override fun getBundleAssetName(): String? {
        val bundleAssets = super.getBundleAssetName()
        return bundleAssets
    }

    override fun getJSBundleFile(): String? {
        val path = OTAUtils.getBundlePath(application)
        return if (BuildConfig.DEBUG) null else path
    }
    override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG


}
