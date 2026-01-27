open DriverIdentifier
open SearchReqLocation
open Utils

@genType
type oneWaySearchReq = {
  destination: searchReqLocation,
  driverIdentifier: option<driverIdentifier>,
  isDestinationManuallyMoved: option<bool>,
  isReallocationEnabled: option<bool>,
  isSourceManuallyMoved: option<bool>,
  isSpecialLocation: option<bool>,
  origin: searchReqLocation,
  placeNameSource: option<string>,
  quotesUnifiedFlow: option<bool>,
  sessionToken: option<string>,
  startTime: option<string>,
  stops: option<array<searchReqLocation>>,
}

let decodeOneWaySearchReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          destination: dict
          ->Dict.get("destination")
          ->Option.getExn(~message="destination is not found")
          ->decodeSearchReqLocation
          ->Utils.getResultExn(~message="destination is coming as undefined"),
          driverIdentifier: dict
          ->Dict.get("driverIdentifier")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeDriverIdentifier(x)->Result.mapOr(None, x => Some(x))),
          isDestinationManuallyMoved: getOptionBool(dict, "isDestinationManuallyMoved"),
          isReallocationEnabled: getOptionBool(dict, "isReallocationEnabled"),
          isSourceManuallyMoved: getOptionBool(dict, "isSourceManuallyMoved"),
          isSpecialLocation: getOptionBool(dict, "isSpecialLocation"),
          origin: dict
          ->Dict.get("origin")
          ->Option.getExn(~message="origin is not found")
          ->decodeSearchReqLocation
          ->Utils.getResultExn(~message="origin is coming as undefined"),
          placeNameSource: getOptionString(dict, "placeNameSource"),
          quotesUnifiedFlow: getOptionBool(dict, "quotesUnifiedFlow"),
          sessionToken: getOptionString(dict, "sessionToken"),
          startTime: getOptionString(dict, "startTime"),
          stops: dict
          ->Dict.get("stops")
          ->Option.flatMap(jsonNullToOption)
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.map(arr =>
            arr->Array.map(x =>
              decodeSearchReqLocation(x)->Utils.getResultExn(
                ~message="stops is coming as undefined",
              )
            )
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("OneWaySearchReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: oneWaySearchReq) => {
  req->asJson
}
