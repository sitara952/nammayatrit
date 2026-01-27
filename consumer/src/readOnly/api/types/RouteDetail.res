open LatLong
open Utils

@genType
type routeDetail = {
  alternateShortNames: array<string>,
  color: option<string>,
  colorCode: option<string>,
  fromStationCode: option<string>,
  fromStationLatLong: latLong,
  fromStationPlatformCode: option<string>,
  routeCode: option<string>,
  toStationCode: option<string>,
  toStationLatLong: latLong,
  toStationPlatformCode: option<string>,
}

let decodeRouteDetail = data => {
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
          colorCode: getOptionString(dict, "colorCode"),
          fromStationCode: getOptionString(dict, "fromStationCode"),
          fromStationLatLong: dict
          ->Dict.get("fromStationLatLong")
          ->Option.getExn(~message="fromStationLatLong is not found")
          ->decodeLatLong
          ->Utils.getResultExn(~message="fromStationLatLong is coming as undefined"),
          fromStationPlatformCode: getOptionString(dict, "fromStationPlatformCode"),
          routeCode: getOptionString(dict, "routeCode"),
          toStationCode: getOptionString(dict, "toStationCode"),
          toStationLatLong: dict
          ->Dict.get("toStationLatLong")
          ->Option.getExn(~message="toStationLatLong is not found")
          ->decodeLatLong
          ->Utils.getResultExn(~message="toStationLatLong is coming as undefined"),
          toStationPlatformCode: getOptionString(dict, "toStationPlatformCode"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("RouteDetail ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: routeDetail) => {
  req->asJson
}
