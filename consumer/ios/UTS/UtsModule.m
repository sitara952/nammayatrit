//
//  UTSModule.m
//  Nammayatri
//
//  Created by Praveen kumar on 05/04/25.
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(UTSModule, NSObject)

RCT_EXTERN_METHOD(requestBooking:(NSDictionary *)params
                 accessToken:(NSString *)accessToken
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(showTicket:(NSDictionary *)params
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(requestReinitialization:(NSDictionary *)params
                 accessToken:(NSString *)accessToken
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
