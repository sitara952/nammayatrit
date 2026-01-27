open Enums
open MultiModalRoute
open Utils

@genType
type multiModalLocation = {
  address: string,
  fare: option<float>,
  fromStationCode: option<string>,
  lat: float,
  lon: float,
  mode: option<EntityType.entityType>,
  multimodalRoutes: option<array<multiModalRoute>>,
  name: string,
  rating: option<float>,
  recentLocationId: option<string>,
  routeCode: option<string>,
  toStationCode: option<string>,
  type_: option<string>,
}

let decodeMultiModalLocation = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          address: getOptionString(dict, "address")->Option.getExn(~message="address not found"),
          fare: getOptionFloat(dict, "fare"),
          fromStationCode: getOptionString(dict, "fromStationCode"),
          lat: getOptionFloat(dict, "lat")->Option.getExn(~message="lat not found"),
          lon: getOptionFloat(dict, "lon")->Option.getExn(~message="lon not found"),
          mode: EntityType.decodeEntityTypeResult(dict, "mode")->Result.mapOr(None, x => Some(x)),
          multimodalRoutes: dict
          ->Dict.get("multimodalRoutes")
          ->Option.flatMap(jsonNullToOption)
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.map(arr =>
            arr->Array.map(x =>
              decodeMultiModalRoute(x)->Utils.getResultExn(
                ~message="multimodalRoutes is coming as undefined",
              )
            )
          ),
          name: getOptionString(dict, "name")->Option.getExn(~message="name not found"),
          rating: getOptionFloat(dict, "rating"),
          recentLocationId: getOptionString(dict, "recentLocationId"),
          routeCode: getOptionString(dict, "routeCode"),
          toStationCode: getOptionString(dict, "toStationCode"),
          type_: getOptionString(dict, "type_"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("MultiModalLocation ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: multiModalLocation) => {
  req->asJson
}
