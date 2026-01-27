open Utils

@genType
type routeAvailabilityReq = {
  endStopCode: string,
  onlyLive: bool,
  startStopCode: string,
  journeyId: option<string>,
  legOrder: option<int>,
}

let decodeRouteAvailabilityReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          endStopCode: getOptionString(dict, "endStopCode")->Option.getExn(
            ~message="endStopCode not found",
          ),
          onlyLive: getOptionBool(dict, "onlyLive")->Option.getExn(~message="onlyLive not found"),
          startStopCode: getOptionString(dict, "startStopCode")->Option.getExn(
            ~message="startStopCode not found",
          ),
          journeyId: getOptionString(dict, "journeyId"),
          legOrder: getOptionInt(dict, "legOrder"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("RouteAvailabilityReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: routeAvailabilityReq) => {
  req->asJson
}
