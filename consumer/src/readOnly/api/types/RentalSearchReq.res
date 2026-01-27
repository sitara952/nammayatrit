open SearchReqLocation
open Utils

@genType
type rentalSearchReq = {
  estimatedRentalDistance: int,
  estimatedRentalDuration: int,
  isReallocationEnabled: option<bool>,
  isSourceManuallyMoved: option<bool>,
  isSpecialLocation: option<bool>,
  origin: searchReqLocation,
  placeNameSource: option<string>,
  quotesUnifiedFlow: option<bool>,
  startTime: string,
  stops: option<array<searchReqLocation>>,
}

let decodeRentalSearchReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          estimatedRentalDistance: getOptionInt(dict, "estimatedRentalDistance")->Option.getExn(
            ~message="estimatedRentalDistance not found",
          ),
          estimatedRentalDuration: getOptionInt(dict, "estimatedRentalDuration")->Option.getExn(
            ~message="estimatedRentalDuration not found",
          ),
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
      Console.log2("RentalSearchReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: rentalSearchReq) => {
  req->asJson
}
