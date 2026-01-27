open Distance
open GetFareResponse
open Utils

@genType
type extendLegGetFareResp = {
  bookingUpdateRequestId: option<string>,
  distance: distance,
  duration: option<int>,
  totalFare: option<getFareResponse>,
}

let decodeExtendLegGetFareResp = data => {
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
          duration: getOptionInt(dict, "duration"),
          totalFare: dict
          ->Dict.get("totalFare")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeGetFareResponse(x)->Result.mapOr(None, x => Some(x))),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("ExtendLegGetFareResp ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: extendLegGetFareResp) => {
  req->asJson
}
