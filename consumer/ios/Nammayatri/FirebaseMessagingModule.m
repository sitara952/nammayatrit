#import "FirebaseMessagingModule.h"

@implementation FirebaseMessagingModule

RCT_EXPORT_MODULE(FirebaseMessagingModule);

RCTEventEmitter *eventEmitter;

// Class method to emit events
+ (void)sendEventWithName:(NSString *)name body:(id)body {
  if (eventEmitter) {
    [eventEmitter sendEventWithName:name body:body];
  }
}

- (instancetype)init {
  self = [super init];
  if (self) {
    eventEmitter = self;
  }
  return self;
}

// Required method to return supported events
- (NSArray<NSString *> *)supportedEvents {
  return @[@"onFCMReceived"];
}

//-(void) onFCMReceived:(NSString *) name {
//  [self sendEventWithName:@"onFCMReceived" body:@{@"":@""}];
//}

@end
