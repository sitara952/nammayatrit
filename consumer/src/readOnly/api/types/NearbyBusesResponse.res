open NearbyBus
open RecentRide
open Utils

@genType
type nearbyBusesResponse = {
  nearbyBuses: array<nearbyBus>,
  recentRides: array<recentRide>,
}

let decodeNearbyBusesResponse = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          nearbyBuses: dict
          ->Dict.get("nearbyBuses")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="nearbyBuses is not of array")
          ->Array.map(x =>
            decodeNearbyBus(x)->Utils.getResultExn(~message="nearbyBuses is coming as undefined")
          ),
          recentRides: dict
          ->Dict.get("recentRides")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="recentRides is not of array")
          ->Array.map(x =>
            decodeRecentRide(x)->Utils.getResultExn(~message="recentRides is coming as undefined")
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("NearbyBusesResponse ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: nearbyBusesResponse) => {
  req->asJson
}
