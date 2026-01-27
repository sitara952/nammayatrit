open TripCategory
open Utils

@genType
type flowStatusWaitingForDriverOffers = {
  estimateId: string,
  otherSelectedEstimates: option<array<string>>,
  providerId: option<string>,
  tripCategory: option<tripCategory>,
  validTill: string,
}

let decodeFlowStatusWaitingForDriverOffers = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          estimateId: getOptionString(dict, "estimateId")->Option.getExn(
            ~message="estimateId not found",
          ),
          otherSelectedEstimates: getOptionStrArrayFromDict(dict, "otherSelectedEstimates"),
          providerId: getOptionString(dict, "providerId"),
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
      Console.log2("FlowStatusWaitingForDriverOffers ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: flowStatusWaitingForDriverOffers) => {
  req->asJson
}
