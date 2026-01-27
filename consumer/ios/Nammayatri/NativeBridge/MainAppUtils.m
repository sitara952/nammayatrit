//
//  MainAppUtils.m
//  Nammayatri
//
//  Created by Shivendra Shah on 15/10/24.
//

#import <Foundation/Foundation.h>
#import "React/RCTBridgeModule.h"

@interface RCT_EXTERN_MODULE(MainAppUtils, NSObject)

RCT_EXTERN_METHOD(getSharedPreferences:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(hideSplash)
RCT_EXTERN_METHOD(updateSharedPreferences:(NSDictionary *)data resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(isReactUpdated:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(getAppStartTime:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

@end
