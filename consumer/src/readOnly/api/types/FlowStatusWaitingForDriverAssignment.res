open Enums
open TripCategory
open Utils

@genType
type flowStatusWaitingForDriverAssignment = {
  bookingId: string,
  fareProductType: option<FareProductType.fareProductType>,
  tripCategory: option<tripCategory>,
  validTill: string,
}

let decodeFlowStatusWaitingForDriverAssignment = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          bookingId: getOptionString(dict, "bookingId")->Option.getExn(
            ~message="bookingId not found",
          ),
          fareProductType: FareProductType.decodeFareProductTypeResult(
            dict,
            "fareProductType",
          )->Result.mapOr(None, x => Some(x)),
          tripCategory: dict
          ->Dict.get("tripCategory")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeTripCategory(x)->Result.mapOr(None, x => Some(x))),
          validTill: getOptionString(dict, "validTill")->Option.getExn(
            ~message="validTill not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("FlowStatusWaitingForDriverAssignment ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: flowStatusWaitingForDriverAssignment) => {
  req->asJson
}
