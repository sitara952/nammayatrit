open UpcomingVehicleInfo
open Utils

@genType
type upcomingTripInfo = {
  busFrequency: option<int>,
  upcomingBuses: array<upcomingVehicleInfo>,
  upcomingVehicles: array<upcomingVehicleInfo>,
  vehicleFrequency: option<int>,
}

let decodeUpcomingTripInfo = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          busFrequency: getOptionInt(dict, "busFrequency"),
          upcomingBuses: dict
          ->Dict.get("upcomingBuses")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="upcomingBuses is not of array")
          ->Array.map(x =>
            decodeUpcomingVehicleInfo(x)->Utils.getResultExn(
              ~message="upcomingBuses is coming as undefined",
            )
          ),
          upcomingVehicles: dict
          ->Dict.get("upcomingVehicles")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="upcomingVehicles is not of array")
          ->Array.map(x =>
            decodeUpcomingVehicleInfo(x)->Utils.getResultExn(
              ~message="upcomingVehicles is coming as undefined",
            )
          ),
          vehicleFrequency: getOptionInt(dict, "vehicleFrequency"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("UpcomingTripInfo ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: upcomingTripInfo) => {
  req->asJson
}
