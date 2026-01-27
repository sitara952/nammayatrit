open Utils
open SuggestedStations
open Enums

@genType
type transportRoute = {
  code: string,
  shortName: string,
  longName: string,
  vehicleType: string,
  dailyTripCount: option<int>,
  stopCount: option<int>,
  reverseRoute: option<string>,
  color: option<string>,
  serviceType: option<FRFSServiceTierType.fRFSServiceTierType>,
  serviceTypeName: option<string>,
}

@genType
type transportStation = {
  code: string,
  name: string,
  lat: float,
  lon: float,
  vehicleType: string,
  address: option<string>,
  suggestedDestination: option<array<suggestedStations>>,
  gatesInfo: option<string>,
  geoJson: option<string>,
}

@genType
type transportRouteStopMapping = {
  routeCode: string,
  stopCode: string,
  sequenceNum: int,
}

@genType
type publicTransportData = {
  routes: array<transportRoute>,
  stations: array<transportStation>,
  routeStopMappings: array<transportRouteStopMapping>,
  publicTransportConfigVersion: string,
  eligiblePassIds: option<array<string>>,
}

let decodeTransportRoute = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          code: getOptionString(dict, "cd")->Option.getExn(~message="cd not found"),
          shortName: getOptionString(dict, "sN")->Option.getExn(~message="sN not found"),
          longName: getOptionString(dict, "lN")->Option.getExn(~message="lN not found"),
          vehicleType: getOptionString(dict, "vt")->Option.getExn(~message="vt not found"),
          dailyTripCount: getOptionInt(dict, "dTC"),
          stopCount: getOptionInt(dict, "stC"),
          color: getOptionString(dict, "clr"),
          reverseRoute: getOptionString(dict, "rr"),
          serviceType: FRFSServiceTierType.decodeFRFSServiceTierTypeResult(
            dict,
            "st",
          )->Result.mapOr(None, x => Some(x)),
          serviceTypeName: getOptionString(dict, "stn"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("TransportRoute ERROR", err)
      Error(err)
    }
  }
}

let decodeTransportStation = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          code: getOptionString(dict, "cd")->Option.getExn(~message="cd not found"),
          name: getOptionString(dict, "nm")->Option.getExn(~message="nm not found"),
          lat: getOptionFloat(dict, "lt")->Option.getExn(~message="lt not found"),
          lon: getOptionFloat(dict, "ln")->Option.getExn(~message="ln not found"),
          vehicleType: getOptionString(dict, "vt")->Option.getExn(~message="vt not found"),
          address: getOptionString(dict, "ad"),
          gatesInfo: getOptionString(dict, "gi"),
          geoJson: getOptionString(dict, "gj"),
          suggestedDestination: dict
          ->Dict.get("sgstdDest")
          ->Option.flatMap(jsonNullToOption)
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.map(arr =>
            arr->Array.map(x =>
              decodeSuggestedStations(x)->Utils.getResultExn(
                ~message="suggestedDestination is coming as undefined",
              )
            )
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("TransportStation ERROR", err)
      Error(err)
    }
  }
}

let decodeTransportRouteStopMapping = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          routeCode: getOptionString(dict, "rc")->Option.getExn(~message="rc not found"),
          stopCode: getOptionString(dict, "sc")->Option.getExn(~message="sc not found"),
          sequenceNum: getOptionInt(dict, "sn")->Option.getExn(~message="sn not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("TransportRouteStopMapping ERROR", err)
      Error(err)
    }
  }
}

let decodePublicTransportData = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          routes: dict
          ->Dict.get("rs")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="rs is not of array")
          ->Array.map(x =>
            decodeTransportRoute(x)->Utils.getResultExn(~message="routes is coming as undefined")
          ),
          stations: dict
          ->Dict.get("ss")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="ss is not of array")
          ->Array.map(x =>
            decodeTransportStation(x)->Utils.getResultExn(
              ~message="stations is coming as undefined",
            )
          ),
          routeStopMappings: dict
          ->Dict.get("rsm")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="rsm is not of array")
          ->Array.map(x =>
            decodeTransportRouteStopMapping(x)->Utils.getResultExn(
              ~message="routeStopMappings is coming as undefined",
            )
          ),
          publicTransportConfigVersion: getOptionString(dict, "ptcv")->Option.getExn(
            ~message="ptcv not found",
          ),
          eligiblePassIds: dict
          ->Dict.get("eligiblePassIds")
          ->Option.flatMap(jsonNullToOption)
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.map(arr =>
            arr->Array.map(x =>
              x->JSON.Decode.string->Option.getExn(~message="passId is not a string")
            )
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("PublicTransportData ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: publicTransportData) => {
  req->asJson
}
