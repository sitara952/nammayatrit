open Distance
open ExtendLegStartPoint
open GetFareResponse
open LocationAPIEntity
open Utils

@genType
type extendLegReq = {
  bookingUpdateRequestId: option<string>,
  distance: distance,
  duration: int,
  endLocation: option<locationAPIEntity>,
  fare: getFareResponse,
  startLocation: extendLegStartPoint,
}

let decodeExtendLegReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          bookingUpdateRequestId: getOptionString(dict, "bookingUpdateRequestId"),
          distance: dict
          ->Dict.get("distance")
          ->Option.getExn(~message="distance is not found")
          ->decodeDistance
          ->Utils.getResultExn(~message="distance is coming as undefined"),
          duration: getOptionInt(dict, "duration")->Option.getExn(~message="duration not found"),
          endLocation: dict
          ->Dict.get("endLocation")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeLocationAPIEntity(x)->Result.mapOr(None, x => Some(x))),
          fare: dict
          ->Dict.get("fare")
          ->Option.getExn(~message="fare is not found")
          ->decodeGetFareResponse
          ->Utils.getResultExn(~message="fare is coming as undefined"),
          startLocation: dict
          ->Dict.get("startLocation")
          ->Option.getExn(~message="startLocation is not found")
          ->decodeExtendLegStartPoint
          ->Utils.getResultExn(~message="startLocation is coming as undefined"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("ExtendLegReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: extendLegReq) => {
  req->asJson
}
