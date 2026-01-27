#import <RCTAppDelegate.h>
#import <UIKit/UIKit.h>
#import "AppTrackingTransparency/AppTrackingTransparency.h"

@interface AppDelegate : RCTAppDelegate
@property (nonatomic, assign) NSTimeInterval appStartTime;
@end


@protocol InitializeSDK <NSObject>

- (void)startMeta;
- (void)showSplash;
- (void)setSettings: (ATTrackingManagerAuthorizationStatus) status;

@end
