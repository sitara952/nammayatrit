//
//  GeoCoderModule.m
//  Nammayatri
//
//  Created by Khuzema Khomosi on 23/05/24.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(GeoCoderModule, NSObject)

RCT_EXTERN_METHOD(getLocName: (double)latitude
                  longitude: (double)longitude
                  resolver: (RCTPromiseResolveBlock)resolve
                  rejecter: (RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getGeoCoordinateFromAddress: (NSString *)address
                  resolver: (RCTPromiseResolveBlock)resolve
                  rejecter: (RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getAddressTranslation: (NSString *)address
                  resolver: (RCTPromiseResolveBlock)resolve
                  rejecter: (RCTPromiseRejectBlock)reject)

@end