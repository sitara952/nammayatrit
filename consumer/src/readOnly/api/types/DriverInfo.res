open Enums
open Utils

@genType
type driverInfo = {
  applicableServiceTierTypes: array<ServiceTierType.serviceTierType>,
  bearing: option<int>,
  distance: int,
  driverId: string,
  lat: float,
  lon: float,
}

let decodeDriverInfo = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          applicableServiceTierTypes: dict
          ->Dict.get("applicableServiceTierTypes")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="applicableServiceTierTypes not found")
          ->Array.map(x =>
            ServiceTierType.decodeServiceTierType(x)->Utils.getResultExn(
              ~message="applicableServiceTierTypes is coming as undefined",
            )
          ),
          bearing: getOptionInt(dict, "bearing"),
          distance: getOptionInt(dict, "distance")->Option.getExn(~message="distance not found"),
          driverId: getOptionString(dict, "driverId")->Option.getExn(~message="driverId not found"),
          lat: getOptionFloat(dict, "lat")->Option.getExn(~message="lat not found"),
          lon: getOptionFloat(dict, "lon")->Option.getExn(~message="lon not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("DriverInfo ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: driverInfo) => {
  req->asJson
}
