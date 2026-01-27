open AvailableRoute
open Utils

@genType
type routeAvailabilityResp = {availableRoutes: array<availableRoute>}

let decodeRouteAvailabilityResp = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          availableRoutes: dict
          ->Dict.get("availableRoutes")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="availableRoutes is not of array")
          ->Array.map(x =>
            decodeAvailableRoute(x)->Utils.getResultExn(
              ~message="availableRoutes is coming as undefined",
            )
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("RouteAvailabilityResp ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: routeAvailabilityResp) => {
  req->asJson
}
