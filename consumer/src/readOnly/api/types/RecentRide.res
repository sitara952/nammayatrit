open Price
open Utils

@genType
type recentRide = {
  fare: price,
  fromStopCode: string,
  routeCode: option<string>,
  toStopCode: string,
}

let decodeRecentRide = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          fare: dict
          ->Dict.get("fare")
          ->Option.getExn(~message="fare is not found")
          ->decodePrice
          ->Utils.getResultExn(~message="fare is coming as undefined"),
          fromStopCode: getOptionString(dict, "fromStopCode")->Option.getExn(
            ~message="fromStopCode not found",
          ),
          routeCode: getOptionString(dict, "routeCode"),
          toStopCode: getOptionString(dict, "toStopCode")->Option.getExn(
            ~message="toStopCode not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("RecentRide ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: recentRide) => {
  req->asJson
}
