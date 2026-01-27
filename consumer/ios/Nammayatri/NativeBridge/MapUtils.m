//
//  MapUtils.m
//  Nammayatri
//
//  Created by Pravinkumar S on 04/07/24.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>


@interface RCT_EXTERN_MODULE(MapUtils, NSObject)

RCT_EXTERN_METHOD(isCoordinateOnPath:(NSArray*)coordinateArray
                 andCurrentPosition:(NSDictionary*)currentPosition
                 locationOnPathThreshold:(nonnull double)locationOnPathThreshold
                 andResolver:(RCTPromiseResolveBlock)resolve
                 andRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(computeLength:(NSArray*)path
                 andResolver:(RCTPromiseResolveBlock)resolve
                 andRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getExtendedPath:(NSArray*)coordinateArray
                 distanceBtwPointThreshold:(nonnull double)distanceMeter
                 andResolver:(RCTPromiseResolveBlock)resolve
                 andRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getClosestPointOnPath:(NSDictionary*)currentPosition
                 andPath:(NSArray*)path
                 andResolver:(RCTPromiseResolveBlock)resolve
                 andRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getCurrentPosition:(NSString*)accuracy
                 timeout:(nonnull NSNumber*)timeout
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getLastKnownLocation:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)

@end


