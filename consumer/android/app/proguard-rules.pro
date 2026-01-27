# Add project specific ProGuard rules here.
# For more details, see http://developer.android.com/guide/developing/tools/proguard.html

# Remove verbose logging in release builds
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
}

# Preserve Stripe classes
-keep class com.stripe.** { *; }
-dontwarn com.stripe.**

# # FastImage & Glide rules
-keep public class com.dylanvann.fastimage.* {*;}
-keep public class com.dylanvann.fastimage.** {*;}
-keep public class * implements com.bumptech.glide.module.GlideModule
-keep public class * extends com.bumptech.glide.module.AppGlideModule
-keep public enum com.bumptech.glide.load.ImageHeaderParser$** {
  **[] $VALUES;
  public *;
}

# Preserve MLKit classes
-keep class com.google.mlkit.** { *; }
-dontwarn com.google.mlkit.**

# Preserve BuildConfig
-keep class com.mobility.movingtech.BuildConfig { *; }

# Preserve SplashScreen classes
-keep class org.devio.rn.splashscreen.SplashScreen {
    private android.app.Dialog mSplashDialog;
}
-keepclassmembers class org.devio.rn.splashscreen.SplashScreen {
    private android.app.Dialog mSplashDialog;
}

# Preserve React Native core classes
-keep class com.facebook.react.** { *; }
-keepclassmembers class com.facebook.react.** { *; }

# Fix for Issue #1: Preserve Google Maps SDK classes to prevent native library loading issues
-keep class com.google.maps.** { *; }
-keep interface com.google.maps.** { *; }
-dontwarn com.google.maps.**
-keep class com.google.android.gms.maps.** { *; }
-keep interface com.google.android.gms.maps.** { *; }
-dontwarn com.google.android.gms.maps.**

# Preserve Google Maps internal classes and native libraries
-keepclassmembers class * {
    @com.google.android.gms.common.annotation.KeepName *;
}
-keepclassmembers class * {
    @com.google.android.gms.maps.internal.util.impl.GoogleApiAvailability *;
}

# Keep dynamite module loader classes (fixes "couldn't find DSO" errors)
-keep class com.google.android.gms.dynamite.** { *; }
-dontwarn com.google.android.gms.dynamite.**

# MoEngage ProGuard Rules
# Suppress warnings for Huawei Push Kit (HMS) as we use FCM
-dontwarn com.moengage.hms.**
-dontwarn com.moengage.plugin.base.internal.PluginHelper

# Preserve MoEngage SDK classes
-keep class com.moengage.** { *; }
