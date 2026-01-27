open Utils

@genType
type journeyLegRouteDetails = {
  fromStopCode: string,
  subLegOrder: int,
  toStopCode: string,
}

let decodeJourneyLegRouteDetails = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          fromStopCode: getOptionString(dict, "fromStopCode")->Option.getExn(
            ~message="fromStopCode not found",
          ),
          subLegOrder: getOptionInt(dict, "subLegOrder")->Option.getExn(
            ~message="subLegOrder not found",
          ),
          toStopCode: getOptionString(dict, "toStopCode")->Option.getExn(
            ~message="toStopCode not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("JourneyLegRouteDetails ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: journeyLegRouteDetails) => {
  req->asJson
}
