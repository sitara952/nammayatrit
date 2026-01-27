#import "AppDelegate.h"
#import <Firebase.h>
#import <FirebaseCrashlytics/FirebaseCrashlytics.h>
#import <FirebaseMessaging/FirebaseMessaging.h> // Add this line
#import <React/RCTBundleURLProvider.h>
#import <GoogleMaps/GoogleMaps.h>
#import "RNSplashScreen.h"
#import <React/RCTBridge.h>
#import "MobilityCustomer/MobilityCustomer.h"
#import <React/RCTEventEmitter.h>
#import "FirebaseMessagingModule.h" // Import the Objective-C header for the module
#import <MobilityCustomer/MobilityCustomer-umbrella.h>
#import "MobilityCustomer-Swift.h"
#import <CleverTapSDK/CleverTap.h>
#import <FBSDKCoreKit/FBSDKCoreKit.h>
#if DEBUG
#import "FLEXManager.h"
#endif
#import "AppTrackingTransparency/ATTrackingManager.h"
#import <React/RCTLinkingManager.h>
#import <ReactAppDependencyProvider/RCTAppDependencyProvider.h>
#import <ReactNativeMoEngage/MoEngageInitializer.h>
#import <MoEngageSDK/MoEngageSDK.h>

@interface AppDelegate()<FIRMessagingDelegate, UNUserNotificationCenterDelegate, InitializeSDK>
@end

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application
   openURL:(NSURL *)url
   options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
  return [RCTLinkingManager application:application openURL:url options:options];
}

- (BOOL)application:(UIApplication *)application continueUserActivity:(nonnull NSUserActivity *)userActivity
 restorationHandler:(nonnull void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler
{
 return [RCTLinkingManager application:application
                  continueUserActivity:userActivity
                    restorationHandler:restorationHandler];
}

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.appStartTime = [[NSDate date] timeIntervalSince1970] * 1000;
  [GMSServices provideAPIKey:@"add_google_key"]; // add your key here (Will be available on "GoogleService-Info.plist" )
   [UNUserNotificationCenter currentNotificationCenter].delegate = self;
  self.dependencyProvider = [RCTAppDependencyProvider new];
  
  self.moduleName = @"Nammayatri";
  [CleverTap autoIntegrate];
  [self startMeta];
  [CleverTap setDebugLevel:CleverTapLogDebug];
  [[CleverTap sharedInstance] enableDeviceNetworkInfoReporting:true];
  
  // Retrieve moengage_app_id from Info.plist
  NSString *moEngageAppId = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"moengage_app_id"];
  if (moEngageAppId && moEngageAppId.length > 0) {
    MoEngageSDKConfig* sdkConfig = [[MoEngageSDKConfig alloc] initWithAppId:moEngageAppId dataCenter: MoEngageDataCenterData_center_03];
    sdkConfig.consoleLogConfig = [[MoEngageConsoleLogConfig alloc] initWithIsLoggingEnabled:true loglevel:MoEngageLoggerTypeVerbose];
    [[MoEngageInitializer sharedInstance] initializeDefaultSDKConfig:sdkConfig andLaunchOptions:launchOptions];
    NSLog(@"MoEngage SDK initialized with App ID from Info.plist");
  } else {
    NSLog(@"MoEngage SDK not initialized: moengage_app_id not configured in Info.plist");
  }
  
  
  dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(2 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
      [ATTrackingManager requestTrackingAuthorizationWithCompletionHandler: ^(ATTrackingManagerAuthorizationStatus status) {
        [self setSettings:status];
        [[UNUserNotificationCenter currentNotificationCenter] requestAuthorizationWithOptions:(UNAuthorizationOptionSound | UNAuthorizationOptionAlert | UNAuthorizationOptionBadge)

          completionHandler:^(BOOL granted, NSError * _Nullable error){
            if(!error){
              dispatch_async(dispatch_get_main_queue(), ^{
                [[UIApplication sharedApplication] registerForRemoteNotifications];
              });
            }
        }];
      }];
    });

  [[FBSDKAppEvents shared] activateApp];
  [FIRApp configure];
  [FIRMessaging messaging].delegate = self;
  [[FIRCrashlytics crashlytics] setCrashlyticsCollectionEnabled:true];

  // Retrieve app_id from Info.plist
  NSString *appIdFromPlist = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"app_id"];
  NSString *baseUrl =  [[NSBundle mainBundle] objectForInfoDictionaryKey:@"base_url"];
  NSString *merchantId = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"merchant_id"];

  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  NSDictionary *initialProps = @{
    @"appId": appIdFromPlist ?: @"defaultAppId",
    @"baseUrl":baseUrl,
    @"merchantId": merchantId,
  };
  [YatriHelpers setValue:merchantId forKey: @"MERCHANT_ID"];
  [YatriHelpers setValue:baseUrl forKey: @"BASE_URL"];
  self.initialProps = initialProps;

  BOOL ret = [super application:application didFinishLaunchingWithOptions:launchOptions];
    if (ret == YES) {
      [self showSplash];
    }
    return ret;
}


- (void)setRootView:(UIView *)rootView toRootViewController:(UIViewController *)rootViewController {
    [super setRootView:rootView toRootViewController:rootViewController];
    #if DEBUG
      UITapGestureRecognizer* tap = [[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(handleFlexTap:)];
      [tap setNumberOfTapsRequired:4];
      [rootView addGestureRecognizer:tap];
    #endif

}

-(void)handleFlexTap:(UITapGestureRecognizer*) tapGesture {
  if (tapGesture.state == UIGestureRecognizerStateRecognized) {
      #if DEBUG
        [[FLEXManager sharedManager] showExplorer];
      #endif
  }
    
}

//- (void)clearUserDefaults {
//    NSString *appDomain = [[NSBundle mainBundle] bundleIdentifier];
//    [[NSUserDefaults standardUserDefaults] setPersistentDomain:[NSDictionary dictionary] forName:appDomain];
//    [[NSUserDefaults standardUserDefaults] synchronize];
//}

- (void)messaging:(FIRMessaging *)messaging didReceiveRegistrationToken:(NSString *)fcmToken
{
  NSLog(@"NSLOG newToken --------------------------> %@", fcmToken);
    [[NSUserDefaults standardUserDefaults] setObject:fcmToken forKey:@"fcm_token"];
    [[NSUserDefaults standardUserDefaults] synchronize];
  
  NSString *fcmTokenA = [[NSUserDefaults standardUserDefaults] stringForKey:@"fcm_token"];
  NSLog(@"Retrieved FCM Token from NSUserDefaults-------------------------------: %@", fcmTokenA);


}



// Called when a notification is delivered to a foreground app.
- (void)userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions options))completionHandler
{
    NSLog(@"User Info : %@", notification.request.content.userInfo);

    // Prepare the userInfo dictionary
    NSDictionary *userInfo = notification.request.content.userInfo;
  NSDictionary *aps = [userInfo valueForKey:@"aps"] ?: @{};
  NSDictionary *data = [aps valueForKey:@"data"] ?: @{};
  NSString *entity_data = [data valueForKey:@"entity_data"] ?: @"";
  NSString *notification_json = [data valueForKey:@"notification_json"] ?: @"";
  NSString *entity_ids = [data valueForKey:@"entity_ids"] ?: @"";
  NSString *notification_type = [data valueForKey:@"notification_type"] ?: @"";
  NSString *show_notification = [data valueForKey:@"show_notification"] ?: @"";
  
  
    // Use the FirebaseMessagingModule to send the event
    [FirebaseMessagingModule sendEventWithName:@"onFCMReceived" body:@{@"entity_data": entity_data,
                                                                       @"notification_json": notification_json,
                                                                       @"entity_ids": entity_ids,
                                                                       @"notification_type": notification_type,
                                                                       @"show_notification": show_notification,
                                                                     }];
  [Notifications userNotificationCenter:center willPresent:notification withCompletionHandler:completionHandler];
}

// Method to handle the notification response
- (void)userNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler:(void (^)(void))completionHandler
{
    NSLog(@"User Info : %@", response.notification.request.content.userInfo);

    // Prepare the userInfo dictionary
    NSDictionary *userInfo = response.notification.request.content.userInfo;
  NSDictionary *aps = [userInfo valueForKey:@"aps"] ?: @{};
  NSDictionary *data = [aps valueForKey:@"data"] ?: @{};
  NSString *entity_data = [data valueForKey:@"entity_data"] ?: @"";
  NSString *notification_json = [data valueForKey:@"notification_json"] ?: @"";
  NSString *entity_ids = [data valueForKey:@"entity_ids"] ?: @"";
  NSString *notification_type = [data valueForKey:@"notification_type"] ?: @"";
  NSString *show_notification = [data valueForKey:@"show_notification"] ?: @"";
    // Use the FirebaseMessagingModule to send the event
    [FirebaseMessagingModule sendEventWithName:@"onFCMReceived" body:@{@"entity_data": entity_data,
                                                                       @"notification_json": notification_json,
                                                                       @"entity_ids": entity_ids,
                                                                       @"notification_type": notification_type,
                                                                       @"show_notification": show_notification,
                                                                     }];
  [Notifications userNotificationCenter:center didReceive:response withCompletionHandler:completionHandler];
    completionHandler();
}

- (NSURL *)bundleURL
{
#if DEBUG
 return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
 return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end

