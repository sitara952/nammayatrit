open Utils
open LatLong

type publicTransportStation = {
  stationCode: string,
  lat: option<float>,
  lon: option<float>,
  name: string,
}

type publicTransportQuote = {
  createdAt: string,
  fare: int,
  arrivalTime: string,
  id: string,
  departureStation: publicTransportStation,
  description: string,
  departureTime: string,
  arrivalStation: publicTransportStation,
}

type metroStation = {
  stationCode: string,
  point: option<latLong>,
  name: string,
}

type schedule = {
  arrivalTime: string,
  departureTime: string,
}

type metroRide = {
  schedule: array<schedule>,
  price: int,
  departureStation: metroStation,
  arrivalStation: metroStation,
}

type metroOffer = {
  createdAt: string,
  description: string,
  rides: array<metroRide>,
  rideSearchId: string,
}

type driverOfferAPIEntity = {
  rating: option<float>,
  validTill: string,
  driverName: string,
  distanceToPickup: option<float>,
  durationToPickup: option<int>,
}

type specialZoneQuoteAPIDetails = {quoteId: string}

type oneWayQuoteAPIDetails = {distanceToNearestDriver: string}

type quoteAPIContents =
  | ONE_WAY(oneWayQuoteAPIDetails)
  | DRIVER_OFFER(driverOfferAPIEntity)
  | SPECIAL_ZONE(specialZoneQuoteAPIDetails)
type quoteAPIDetails = {
  contents: option<quoteAPIContents>,
  fareProductType: string,
}

type quoteAPIEntity = {
  agencyfloat: option<string>,
  createdAt: string,
  discount: option<int>,
  estimatedTotalFare: int,
  agencyName: string,
  quoteDetails: option<quoteAPIDetails>,
  vehicleVariant: string,
  estimatedFare: int,
  tripTerms: array<string>,
  id: string,
  agencyCompletedRidesCount: option<int>,
  serviceTierName: option<string>,
  serviceTierShortDesc: option<string>,
  airConditioned: option<bool>,
  vehicleIconUrl: option<string>,
  vehicleServiceTierSeatingCapacity: int,
}

type quoteOfferRes = {onDemandCab: quoteAPIEntity}

type metroOfferRes = {metro: metroOffer}

type publicOfferRes = {publicTransport: publicTransportQuote}

type offerRes =
  | Quotes(quoteOfferRes)
  | Metro(metroOfferRes)
  | Public(publicOfferRes)

type price = {
  amount: option<float>,
  currency: string,
}

type estimateFares = {
  priceWithCurrency: price,
  title: string,
}

type fareRange = {
  maxFare: int,
  minFare: int,
}

type nightShiftRate = {
  nightShiftEnd: option<string>,
  nightShiftMultiplier: option<float>,
  nightShiftStart: option<string>,
}

@genType
type estimateAPIEntity = {
  agencyfloat: string,
  createdAt: string,
  discount: option<int>,
  estimatedTotalFare: int,
  agencyName: string,
  vehicleVariant: string,
  estimatedFare: int,
  tripTerms: array<string>,
  id: string,
  agencyCompletedRidesCount: option<int>,
  estimateFareBreakup: option<array<estimateFares>>,
  totalFareRange: option<fareRange>,
  nightShiftRate: option<nightShiftRate>,
  specialLocationTag: option<string>,
  driversLatLong: option<array<latLong>>,
  serviceTierName: option<string>,
  serviceTierShortDesc: string,
  airConditioned: option<bool>,
  providerName: option<string>,
  providerId: option<string>,
  isValueAddNP: option<bool>,
  validTill: string,
  estimatedFareWithCurrency: option<price>,
  estimatedPickupDuration: option<int>,
  vehicleServiceTierSeatingCapacity: int,
  vehicleIconUrl: option<string>,
}

@genType
type getQuotesRes = {
  quotes: array<offerRes>,
  estimates: array<estimateAPIEntity>,
  fromLocation: option<latLong>,
  toLocation: option<latLong>,
}

let getToLocation = (dict, key) => LatLongUtils.extractLatLon(dict, key)
let getFromLocation = (dict, key) => LatLongUtils.extractLatLon(dict, key)

let getDriversLatLong = (dict, key) => {
  dict
  ->Dict.get(key)
  ->Option.flatMap(JSON.Decode.array)
  ->Option.getOr([])
  ->Array.filterMap(JSON.Decode.object)
  ->Array.map(dict => {
    LatLongUtils.getLatLon(dict)
  })
  ->Array.filterMap(x => x)
}

let driverLatLon = (dict, key) =>
  switch getDriversLatLong(dict, key) {
  | [] => None
  | x => Some(x)
  }

let defaultNightShiftRate = {
  nightShiftEnd: None,
  nightShiftMultiplier: None,
  nightShiftStart: None,
}

let getNightShiftRate = (dict, key) => {
  dict
  ->Dict.get(key)
  ->Option.flatMap(JSON.Decode.object)
  ->Option.map(dict => {
    {
      nightShiftEnd: getOptionString(dict, "nightShiftEnd"),
      nightShiftMultiplier: getOptionFloat(dict, "nightShiftMultiplier"),
      nightShiftStart: getOptionString(dict, "nightShiftStart"),
    }
  })
}

let defaultFareRange = {
  maxFare: 0,
  minFare: 0,
}

let getTotalFareRange = (dict, key) => {
  dict
  ->Dict.get(key)
  ->Option.flatMap(JSON.Decode.object)
  ->Option.map(dict => {
    {
      maxFare: getInt(dict, "maxFare", 0),
      minFare: getInt(dict, "minFare", 0),
    }
  })
}

let defaultPrice = {
  amount: None,
  currency: "",
}

let getPriceWithCurrency = (dict, key) => {
  dict
  ->Dict.get(key)
  ->Option.flatMap(JSON.Decode.object)
  ->Option.map(dict => {
    {
      amount: getOptionFloat(dict, "amount"),
      currency: getString(dict, "currency", ""),
    }
  })
  ->Option.getOr(defaultPrice)
}

let getEstimateFareBreakup = (dict, key) => {
  dict
  ->Dict.get(key)
  ->Option.flatMap(JSON.Decode.array)
  ->Option.getOr([])
  ->Array.filterMap(JSON.Decode.object)
  ->Array.map(dict => {
    {
      priceWithCurrency: getPriceWithCurrency(dict, "priceWithCurrency"),
      title: getString(dict, "title", ""),
    }
  })
  ->Some
}

let getEstimates = (dict, key) => {
  dict
  ->Dict.get(key)
  ->Option.flatMap(JSON.Decode.array)
  ->Option.getOr([])
  ->Array.filterMap(JSON.Decode.object)
  ->Array.map(dict => {
    {
      agencyfloat: getString(dict, "agencyfloat", ""),
      createdAt: getString(dict, "createdAt", ""),
      discount: getOptionInt(dict, "discount"),
      estimatedTotalFare: getInt(dict, "estimatedTotalFare", 0),
      agencyName: getString(dict, "agencyName", ""),
      vehicleVariant: getString(dict, "vehicleVariant", ""),
      estimatedFare: getInt(dict, "estimatedFare", 0),
      tripTerms: getStrArrayFromDict(dict, "tripTerms", []),
      id: getString(dict, "id", ""),
      agencyCompletedRidesCount: getOptionInt(dict, "agencyCompletedRidesCount"),
      estimateFareBreakup: getEstimateFareBreakup(dict, "estimateFareBreakup"),
      totalFareRange: getTotalFareRange(dict, "totalFareRange"),
      nightShiftRate: getNightShiftRate(dict, "nightShiftRate"),
      specialLocationTag: getOptionString(dict, "specialLocationTag"),
      driversLatLong: driverLatLon(dict, "driversLatLong"),
      serviceTierName: getOptionString(dict, "serviceTierName"),
      serviceTierShortDesc: getString(dict, "serviceTierShortDesc", ""),
      airConditioned: getOptionBool(dict, "airConditioned"),
      providerName: getOptionString(dict, "providerName"),
      providerId: getOptionString(dict, "providerId"),
      isValueAddNP: getOptionBool(dict, "isValueAddNP"),
      validTill: getString(dict, "validTill", ""),
      estimatedFareWithCurrency: Some(getPriceWithCurrency(dict, "estimatedFareWithCurrency")),
      estimatedPickupDuration: getOptionInt(dict, "estimatedPickupDuration"),
      vehicleServiceTierSeatingCapacity: getInt(dict, "vehicleServiceTierSeatingCapacity", 0),
      vehicleIconUrl: getOptionString(dict, "vehicleIconUrl"),
    }
  })
}

let getQuoteDetailsContents = (dict, key) => {
  switch dict->Dict.get(key) {
  | Some(val) =>
    switch val->JSON.Decode.object {
    | Some(val) => {
        let oneWay = val->Dict.get("distanceToNearestDriver")
        let specialZone = val->Dict.get("quoteId")
        let driverOffer = val->Dict.get("validTill")
        if oneWay->Option.isSome {
          switch oneWay {
          | Some(a) =>
            Some(
              ONE_WAY({
                distanceToNearestDriver: getString(
                  a->getDictFromJson,
                  "distanceToNearestDriver",
                  "",
                ),
              }),
            )
          | _ => None
          }
        } else if specialZone->Option.isSome {
          switch specialZone {
          | Some(a) =>
            Some(
              SPECIAL_ZONE({
                quoteId: getString(a->getDictFromJson, "quoteId", ""),
              }),
            )
          | _ => None
          }
        } else {
          switch driverOffer {
          | Some(a) =>
            let dict = a->getDictFromJson
            Some(
              DRIVER_OFFER({
                rating: getOptionFloat(dict, "rating"),
                validTill: getString(dict, "validTill", ""),
                driverName: getString(dict, "driverName", ""),
                distanceToPickup: getOptionFloat(dict, "distanceToPickup"),
                durationToPickup: getOptionInt(dict, "durationToPickup"),
              }),
            )
          | _ => None
          }
        }
      }
    | _ => None
    }
  | _ => None
  }
}

let getQuoteDetails = (dict, key) => {
  dict
  ->Dict.get(key)
  ->Option.flatMap(JSON.Decode.object)
  ->Option.map(dict => {
    {
      contents: getQuoteDetailsContents(dict, "contents"),
      fareProductType: getString(dict, "fareProductType", ""),
    }
  })
}

let getQuoteAPIEntity = dict => {
  {
    agencyfloat: getOptionString(dict, "agencyfloat"),
    createdAt: getString(dict, "createdAt", ""),
    discount: getOptionInt(dict, "discount"),
    estimatedTotalFare: getInt(dict, "estimatedTotalFare", 0),
    agencyName: getString(dict, "agencyName", ""),
    quoteDetails: getQuoteDetails(dict, "quoteDetails"),
    vehicleVariant: getString(dict, "vehicleVariant", ""),
    estimatedFare: getInt(dict, "estimatedFare", 0),
    tripTerms: getStrArrayFromDict(dict, "tripTerms", []),
    id: getString(dict, "id", ""),
    agencyCompletedRidesCount: getOptionInt(dict, "agencyCompletedRidesCount"),
    serviceTierName: getOptionString(dict, "serviceTierName"),
    serviceTierShortDesc: getOptionString(dict, "serviceTierShortDesc"),
    airConditioned: getOptionBool(dict, "airConditioned"),
    vehicleServiceTierSeatingCapacity: getInt(dict, "vehicleServiceTierSeatingCapacity", 0),
    vehicleIconUrl: getOptionString(dict, "vehicleIconUrl"),
  }
}

let getPoint = (dict, key) => LatLongUtils.extractLatLon(dict, key)

let defaultMetroStation = {
  stationCode: "",
  point: None,
  name: "",
}

let getMetroStation = (dict, key) => {
  dict
  ->Dict.get(key)
  ->Option.flatMap(JSON.Decode.object)
  ->Option.map(dict => {
    {
      stationCode: getString(dict, "stationCode", ""),
      point: getPoint(dict, "point"),
      name: getString(dict, "name", ""),
    }
  })
  ->Option.getOr(defaultMetroStation)
}

let getPoint = (dict, key) => LatLongUtils.extractLatLon(dict, key)

let defaultMetroStation = {
  stationCode: "",
  point: None,
  name: "",
}

let defaultSchedule = {
  arrivalTime: "",
  departureTime: "",
}

let getSchedule = (dict, key) => {
  dict
  ->Dict.get(key)
  ->Option.flatMap(JSON.Decode.array)
  ->Option.getOr([])
  ->Array.filterMap(JSON.Decode.object)
  ->Array.map(dict => {
    {
      arrivalTime: getString(dict, "arrivalTime", ""),
      departureTime: getString(dict, "departureTime", ""),
    }
  })
}

let defaultMetroRide = {
  schedule: [],
  price: 0,
  departureStation: defaultMetroStation,
  arrivalStation: defaultMetroStation,
}

let getRides = (dict, key) => {
  dict
  ->Dict.get(key)
  ->Option.flatMap(JSON.Decode.array)
  ->Option.getOr([])
  ->Array.filterMap(JSON.Decode.object)
  ->Array.map(dict => {
    {
      schedule: getSchedule(dict, "schedule"),
      price: getInt(dict, "price", 0),
      departureStation: getMetroStation(dict, "departureStation"),
      arrivalStation: getMetroStation(dict, "arrivalStation"),
    }
  })
}

let getMetroApiEntity = dict => {
  createdAt: getString(dict, "createdAt", ""),
  description: getString(dict, "description", ""),
  rides: getRides(dict, "rides"),
  rideSearchId: getString(dict, "rideSearchId", ""),
}

let defaultPublicTransportStation = {
  stationCode: "",
  lat: None,
  lon: None,
  name: "",
}

let getStation = (dict, key) => {
  dict
  ->Dict.get(key)
  ->Option.flatMap(JSON.Decode.object)
  ->Option.map(dict => {
    {
      stationCode: getString(dict, "stationCode", ""),
      lat: getOptionFloat(dict, "lat"),
      lon: getOptionFloat(dict, "lon"),
      name: getString(dict, "name", ""),
    }
  })
  ->Option.getOr(defaultPublicTransportStation)
}

let getPublicTransport = dict => {
  createdAt: getString(dict, "createdAt", ""),
  fare: getInt(dict, "fare", 0),
  arrivalTime: getString(dict, "arrivalTime", ""),
  id: getString(dict, "id", ""),
  departureStation: getStation(dict, "departureStation"),
  description: getString(dict, "description", ""),
  departureTime: getString(dict, "departureTime", ""),
  arrivalStation: getStation(dict, "arrivalStation"),
}

let getQuotes = (dict, key) => {
  dict
  ->Utils.getArray(key)
  ->Array.filterMap(item => {
    let itemDict = item->getDictFromJson
    let onDemandCab = itemDict->Dict.get("onDemandCab")
    let metro = itemDict->Dict.get("metro")
    let publicTransport = itemDict->Dict.get("publicTransport")
    if onDemandCab->Option.isSome {
      switch onDemandCab {
      | Some(value) =>
        Some(
          Quotes({
            onDemandCab: getQuoteAPIEntity(value->getDictFromJson),
          }),
        )
      | _ => None
      }
    } else if metro->Option.isSome {
      switch metro {
      | Some(value) =>
        Some(
          Metro({
            metro: getMetroApiEntity(value->getDictFromJson),
          }),
        )
      | _ => None
      }
    } else {
      switch publicTransport {
      | Some(value) =>
        Some(
          Public({
            publicTransport: getPublicTransport(value->getDictFromJson),
          }),
        )
      | _ => None
      }
    }
  })
}

let itemToObjectMapper = resp => {
  let dict = resp->getDictFromJson
  {
    quotes: getQuotes(dict, "quotes"),
    estimates: getEstimates(dict, "estimates"),
    fromLocation: getFromLocation(dict, "fromLocation"),
    toLocation: getToLocation(dict, "toLocation"),
  }
}
