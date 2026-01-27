open LocationV2
open MultiModalStopDetails
open Utils

@genType
type multiModalRouteDetails = {
  alternateShortNames: array<string>,
  color: option<string>,
  endLocation: locationV2,
  fromArrivalTime: option<string>,
  fromDepartureTime: option<string>,
  fromStopDetails: option<multiModalStopDetails>,
  gtfsId: option<string>,
  longName: option<string>,
  shortName: option<string>,
  startLocation: locationV2,
  subLegOrder: int,
  toArrivalTime: option<string>,
  toDepartureTime: option<string>,
  toStopDetails: option<multiModalStopDetails>,
}

let decodeMultiModalRouteDetails = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          alternateShortNames: getOptionStrArrayFromDict(
            dict,
            "alternateShortNames",
          )->Option.getExn(~message="alternateShortNames not found"),
          color: getOptionString(dict, "color"),
          endLocation: dict
          ->Dict.get("endLocation")
          ->Option.getExn(~message="endLocation is not found")
          ->decodeLocationV2
          ->Utils.getResultExn(~message="endLocation is coming as undefined"),
          fromArrivalTime: getOptionString(dict, "fromArrivalTime"),
          fromDepartureTime: getOptionString(dict, "fromDepartureTime"),
          fromStopDetails: dict
          ->Dict.get("fromStopDetails")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x =>
            decodeMultiModalStopDetails(x)->Result.mapOr(None, x => Some(x))
          ),
          gtfsId: getOptionString(dict, "gtfsId"),
          longName: getOptionString(dict, "longName"),
          shortName: getOptionString(dict, "shortName"),
          startLocation: dict
          ->Dict.get("startLocation")
          ->Option.getExn(~message="startLocation is not found")
          ->decodeLocationV2
          ->Utils.getResultExn(~message="startLocation is coming as undefined"),
          subLegOrder: getOptionInt(dict, "subLegOrder")->Option.getExn(
            ~message="subLegOrder not found",
          ),
          toArrivalTime: getOptionString(dict, "toArrivalTime"),
          toDepartureTime: getOptionString(dict, "toDepartureTime"),
          toStopDetails: dict
          ->Dict.get("toStopDetails")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x =>
            decodeMultiModalStopDetails(x)->Result.mapOr(None, x => Some(x))
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("MultiModalRouteDetails ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: multiModalRouteDetails) => {
  req->asJson
}
