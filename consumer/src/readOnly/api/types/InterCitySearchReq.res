open SearchReqLocation
open Utils

@genType
type interCitySearchReq = {
  isDestinationManuallyMoved: option<bool>,
  isReallocationEnabled: option<bool>,
  isSourceManuallyMoved: option<bool>,
  isSpecialLocation: option<bool>,
  origin: searchReqLocation,
  placeNameSource: option<string>,
  quotesUnifiedFlow: option<bool>,
  returnTime: option<string>,
  roundTrip: bool,
  sessionToken: option<string>,
  startTime: string,
  stops: option<array<searchReqLocation>>,
}

let decodeInterCitySearchReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
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
          returnTime: getOptionString(dict, "returnTime"),
          roundTrip: getOptionBool(dict, "roundTrip")->Option.getExn(
            ~message="roundTrip not found",
          ),
          sessionToken: getOptionString(dict, "sessionToken"),
          startTime: getOptionString(dict, "startTime")->Option.getExn(
            ~message="startTime not found",
          ),
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
      Console.log2("InterCitySearchReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: interCitySearchReq) => {
  req->asJson
}
