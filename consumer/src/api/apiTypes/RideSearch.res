open Utils
open LatLong
open SearchReqLocation
open Enums
open BusLocation
external asJson: _ => JSON.t = "%identity"

let toJson = req => {
  req->asJson
}

@genType
type searchReqLocation = SearchReqLocation.searchReqLocation

@genType
type oneWaySearchReq = {
  destination: searchReqLocation,
  isDestinationManuallyMoved: bool,
  isReallocationEnabled: bool,
  isSourceManuallyMoved: bool,
  isSpecialLocation: bool,
  quotesUnifiedFlow: option<bool>,
  origin: searchReqLocation,
  stops: array<searchReqLocation>,
  sessionToken: string,
  startTime: option<string>,
}

type rentalSearchReq = {
  isReallocationEnabled: bool,
  isSourceManuallyMoved: bool,
  estimatedRentalDistance: int,
  estimatedRentalDuration: int,
  stops: array<searchReqLocation>,
  isSpecialLocation: bool,
  origin: searchReqLocation,
  startTime: string,
  quotesUnifiedFlow: option<bool>,
}

type interCitySearchReq = {
  isDestinationManuallyMoved: bool,
  isReallocationEnabled: bool,
  isSourceManuallyMoved: bool,
  isSpecialLocation: bool,
  origin: searchReqLocation,
  stops: array<searchReqLocation>,
  startTime: string,
  returnTime: option<string>,
  roundTrip: bool,
  quotesUnifiedFlow: option<bool>,
}

@genType
type oneWaySearch = {
  contents: oneWaySearchReq,
  fareProductType: string,
}

type rentalSearch = {
  contents: rentalSearchReq,
  fareProductType: string,
}

type interCitySearch = {
  contents: interCitySearchReq,
  fareProductType: string,
}

type publicTransportSearch = {
  contents: PublicTransportSearchReq.publicTransportSearchReq,
  fareProductType: string,
}

@genType
type searchReqType =
  | OneWaySearch(oneWaySearch)
  | RentalSearch(rentalSearch)
  | IntercitySearch(interCitySearch)
  | PublicTransportSearch(publicTransportSearch)

let searchReqTypeToJson = req => {
  switch req {
  | OneWaySearch(oneWay) => oneWay->toJson
  | RentalSearch(rental) => rental->toJson
  | IntercitySearch(interCity) => interCity->toJson
  | PublicTransportSearch(pts) => pts->toJson
  }
}

type distanceUnit = Meter | Mile | Yard | Kilometer

type distance = {
  unit: distanceUnit,
  value: float,
}

@genType
type searchResp = {
  routeInfo: option<RouteAPI.routeApiType>,
  searchExpiry: string,
  searchId: string,
}

let defaultDistanceUnit = Mile

let getUnit = (dict, key) => {
  dict
  ->Dict.get(key)
  ->Option.flatMap(JSON.Decode.string)
  ->Option.map(str => {
    switch str {
    | "Meter" => Meter
    | "Mile" => Mile
    | "Yard" => Yard
    | "Kilometer" => Kilometer
    | _ => Meter
    }
  })
  ->Option.getOr(defaultDistanceUnit)
}

let defaultDistance = {
  unit: defaultDistanceUnit,
  value: 0.0,
}

let getDistanceWithUnit = (dict, key) => {
  dict
  ->Dict.get(key)
  ->Option.flatMap(JSON.Decode.object)
  ->Option.map(dict => {
    {
      unit: getUnit(dict, "unit"),
      value: getFloat(dict, "value", 0.0),
    }
  })
}

let getRouteInfo = (dict, key) => {
  dict
  ->Dict.get(key)
  ->Option.flatMap(JSON.Decode.object)
  ->Option.map(dict => {
    RouteAPI.itemToObjectMapper(dict)
  })
}

let itemToObjectMapper = resp => {
  let dict = resp->getDictFromJson
  {
    routeInfo: getRouteInfo(dict, "routeInfo"),
    searchExpiry: getString(dict, "searchExpiry", ""),
    searchId: getString(dict, "searchId", ""),
  }
}

let mkSearchLocation = (loc: LocationTypes.location): option<searchReqLocation> => {
  switch (loc.addressComponents, loc.lat, loc.lng) {
  | (Some(address), Some(lat), Some(lon)) =>
    Some({
      address: {...address, title: loc.title},
      gps: {
        lat,
        lon,
      },
    })
  | _ => None
  }
}

@genType
type publicTransportSearchReqWithoutLocations = {
  destinationStopCode: string,
  originStopCode: string,
  recentLocationId: option<string>,
  routeCode: string,
  startTime: option<string>,
  vehicleCategory: option<VehicleCategory.vehicleCategory>,
  currentLocation: option<latLong>,
  vehicleNumber: option<string>,
  routeCodeEditedManually: option<bool>,
  busLocationData: array<busLocation>,
  firstMileRemoved: option<bool>,
}

let mkPublicTransportSearchReq = (
  source: option<LocationTypes.location>,
  destination: option<LocationTypes.location>,
  ptsReq: publicTransportSearchReqWithoutLocations,
): option<searchReqType> => {
  switch (source, destination) {
  | (Some(sourceLoc), Some(destLoc)) => {
      let sourceReq = mkSearchLocation(sourceLoc)
      let destReq = mkSearchLocation(destLoc)
      switch (sourceReq, destReq) {
      | (Some(origin), Some(destination)) =>
        Some(
          PublicTransportSearch({
            contents: {
              destination: Some(destination),
              destinationStopCode: ptsReq.destinationStopCode,
              firstMileRemoved: ptsReq.firstMileRemoved,
              origin,
              originStopCode: ptsReq.originStopCode,
              recentLocationId: ptsReq.recentLocationId,
              routeCode: Some(ptsReq.routeCode),
              startTime: ptsReq.startTime,
              platformType: Some(PlatformType.MULTIMODAL),
              vehicleCategory: ptsReq.vehicleCategory,
              currentLocation: ptsReq.currentLocation,
              vehicleNumber: ptsReq.vehicleNumber,
              routeCodeEditedManually: ptsReq.routeCodeEditedManually,
              busLocationData: ptsReq.busLocationData,
            },
            fareProductType: "PTSearch",
          }),
        )
      | _ => None
      }
    }
  | _ => None
  }
}

let mkRideSearchReq = (
  source: option<LocationTypes.location>,
  destination: option<LocationTypes.location>,
  stops: array<LocationTypes.location>,
  req: bool,
  pickupTime: option<string>,
  dropTime: option<string>,
  isIntercity: bool,
  startTime: option<string>,
  rentalDuration: option<int>,
  rentalDistance: option<int>,
  publicTransportReq: option<publicTransportSearchReqWithoutLocations>,
  isAmbulance: bool,
): option<searchReqType> => {
  Console.info2("source -> ", source)
  Console.info2("destination -> ", destination)
  Console.info2("stops -> ", stops)
  let mbPublicTransportReq =
    publicTransportReq->Option.flatMap(x => x->asJson->jsonNullToOption->Option.map(_ => x))
  switch mbPublicTransportReq {
  | Some(ptsReq) => mkPublicTransportSearchReq(source, destination, ptsReq)
  | None =>
    switch source {
    | Some(sourceAdd) => {
        let sourceReq = mkSearchLocation(sourceAdd)
        let stopsReq = stops->Array.filterMap(x => mkSearchLocation(x))
        let roundTrip_ = switch Js.Nullable.fromOption(dropTime) {
        | Value(_) => true
        | _ => false
        }
        switch sourceReq {
        | Some(srceReq) =>
          if req {
            switch (pickupTime, isIntercity, destination, isAmbulance) {
            | (Some(startSearchTime), true, Some(dest), false) => {
                let destinationReq = mkSearchLocation(dest)
                switch destinationReq {
                | Some(desReq) =>
                  Some(
                    IntercitySearch({
                      contents: {
                        isDestinationManuallyMoved: false,
                        isReallocationEnabled: true,
                        isSourceManuallyMoved: false,
                        isSpecialLocation: false,
                        origin: srceReq,
                        stops: Array.concat(stopsReq, [desReq]),
                        startTime: startSearchTime,
                        returnTime: dropTime,
                        roundTrip: roundTrip_,
                        quotesUnifiedFlow: Some(true),
                      },
                      fareProductType: "INTER_CITY",
                    }),
                  )
                | _ => None
                }
              }
            | (_, _, Some(dest), false) => {
                let destinationReq = mkSearchLocation(dest)
                switch destinationReq {
                | Some(dReq) =>
                  Some(
                    OneWaySearch({
                      contents: {
                        destination: dReq,
                        isDestinationManuallyMoved: false,
                        isReallocationEnabled: true,
                        isSourceManuallyMoved: false,
                        isSpecialLocation: false,
                        origin: srceReq,
                        stops: stopsReq,
                        sessionToken: "2642155c-ceab-0299-9733-d0cab1ecfbbc",
                        startTime: None,
                        quotesUnifiedFlow: Some(true),
                      },
                      fareProductType: "ONE_WAY",
                    }),
                  )
                | _ => None
                }
              }
            | (_, _, Some(dest), true) => {
                let destinationReq = mkSearchLocation(dest)
                switch destinationReq {
                | Some(dReq) =>
                  Some(
                    OneWaySearch({
                      contents: {
                        destination: dReq,
                        isDestinationManuallyMoved: false,
                        isReallocationEnabled: true,
                        isSourceManuallyMoved: false,
                        isSpecialLocation: false,
                        origin: srceReq,
                        stops: stopsReq,
                        sessionToken: "2642155c-ceab-0299-9733-d0cab1ecfbbc",
                        startTime: None,
                        quotesUnifiedFlow: Some(true),
                      },
                      fareProductType: "AMBULANCE",
                    }),
                  )
                | _ => None
                }
              }
            | (_, _, _, _) => None
            }
          } else {
            let transformedDestination =
              destination->Option.flatMap(x => x->asJson->jsonNullToOption->Option.map(_ => x))
            let stopsArr = switch transformedDestination {
            | Some(dest) =>
              switch mkSearchLocation(dest) {
              | Some(destReq) => Array.concat(stopsReq, [destReq])
              | None => stopsReq
              }
            | None => stopsReq
            }
            Some(
              RentalSearch({
                contents: {
                  isReallocationEnabled: true,
                  isSourceManuallyMoved: false,
                  estimatedRentalDistance: switch rentalDistance {
                  | Some(distance) => distance
                  | None => 0
                  },
                  estimatedRentalDuration: switch rentalDuration {
                  | Some(duration) => duration
                  | None => 0
                  },
                  stops: stopsArr,
                  isSpecialLocation: false,
                  origin: srceReq,
                  startTime: switch pickupTime {
                  | Some(time) => time
                  | None => Js.Date.make()->Js.Date.toISOString
                  },
                  quotesUnifiedFlow: Some(true),
                },
                fareProductType: "RENTAL",
              }),
            )
          }
        | _ => None
        }
      }

    | _ => None
    }
  }
}

let rideSearchBody = req => {
  req->asJson->JSON.stringify->Some
}
