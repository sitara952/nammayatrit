#import <React/RCTEventEmitter.h>
#import <React/RCTBridgeModule.h>

@interface FirebaseMessagingModule : RCTEventEmitter <RCTBridgeModule>
+ (void)sendEventWithName:(NSString *)name body:(id)body;
@end
