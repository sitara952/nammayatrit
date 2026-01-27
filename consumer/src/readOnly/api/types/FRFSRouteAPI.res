open FRFSStationAPI
open LatLong
open Utils

@genType
type fRFSRouteAPI = {
  code: string,
  endPoint: latLong,
  longName: string,
  shortName: string,
  startPoint: latLong,
  stops: option<array<fRFSStationAPI>>,
  totalStops: option<int>,
  waypoints: option<array<latLong>>,
}

let decodeFRFSRouteAPI = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          code: getOptionString(dict, "code")->Option.getExn(~message="code not found"),
          endPoint: dict
          ->Dict.get("endPoint")
          ->Option.getExn(~message="endPoint is not found")
          ->decodeLatLong
          ->Utils.getResultExn(~message="endPoint is coming as undefined"),
          longName: getOptionString(dict, "longName")->Option.getExn(~message="longName not found"),
          shortName: getOptionString(dict, "shortName")->Option.getExn(
            ~message="shortName not found",
          ),
          startPoint: dict
          ->Dict.get("startPoint")
          ->Option.getExn(~message="startPoint is not found")
          ->decodeLatLong
          ->Utils.getResultExn(~message="startPoint is coming as undefined"),
          stops: dict
          ->Dict.get("stops")
          ->Option.flatMap(jsonNullToOption)
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.map(arr =>
            arr->Array.map(x =>
              decodeFRFSStationAPI(x)->Utils.getResultExn(~message="stops is coming as undefined")
            )
          ),
          totalStops: getOptionInt(dict, "totalStops"),
          waypoints: dict
          ->Dict.get("waypoints")
          ->Option.flatMap(jsonNullToOption)
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.map(arr =>
            arr->Array.map(x =>
              decodeLatLong(x)->Utils.getResultExn(~message="waypoints is coming as undefined")
            )
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("FRFSRouteAPI ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: fRFSRouteAPI) => {
  req->asJson
}
