open Distance
open LatLong
open Utils

@genType
type routeInfo = {
  boundingBox: option<string>,
  distance: option<int>,
  distanceWithUnit: option<distance>,
  duration: option<int>,
  points: array<latLong>,
  snappedWaypoints: array<latLong>,
  staticDuration: option<int>,
}

let decodeRouteInfo = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          boundingBox: getOptionString(dict, "boundingBox"),
          distance: getOptionInt(dict, "distance"),
          distanceWithUnit: dict
          ->Dict.get("distanceWithUnit")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeDistance(x)->Result.mapOr(None, x => Some(x))),
          duration: getOptionInt(dict, "duration"),
          points: dict
          ->Dict.get("points")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="points is not of array")
          ->Array.map(x =>
            decodeLatLong(x)->Utils.getResultExn(~message="points is coming as undefined")
          ),
          snappedWaypoints: dict
          ->Dict.get("snappedWaypoints")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="snappedWaypoints is not of array")
          ->Array.map(x =>
            decodeLatLong(x)->Utils.getResultExn(~message="snappedWaypoints is coming as undefined")
          ),
          staticDuration: getOptionInt(dict, "staticDuration"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("RouteInfo ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: routeInfo) => {
  req->asJson
}
