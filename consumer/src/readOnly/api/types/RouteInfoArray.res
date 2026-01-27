open RouteInfo
open Utils

@genType
type routeInfoArray = array<routeInfo>

let decodeRouteInfoArray = data => {
  try {
    Ok(
      data
      ->Js.Json.decodeArray
      ->Utils.getOptionExn(~message="response type is not array")
      ->Array.map(x =>
        decodeRouteInfo(x)->Utils.getResultExn(~message="error in parsing routeInfo")
      ),
    )
  } catch {
  | err => {
      Console.log2("RouteInfoArray ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: routeInfoArray) => {
  req->asJson
}
