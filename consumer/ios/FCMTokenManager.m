#import "FCMTokenManager.h"
#import <React/RCTLog.h>

@implementation FCMTokenManager

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(getFCMToken:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  NSString *fcmToken = [[NSUserDefaults standardUserDefaults] stringForKey:@"fcm_token"];
  if (fcmToken != nil) {
    resolve(fcmToken);
  } else {
    NSError *error = [NSError errorWithDomain:@"FCMTokenManager" code:404 userInfo:@{NSLocalizedDescriptionKey:@"FCM token not found"}];
    reject(@"no_fcm_token", @"FCM token not found", error);
  }
}

@end

