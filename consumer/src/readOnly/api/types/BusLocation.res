open LatLong
open Utils

@genType
type busLocation = {
  busNumber: string,
  customerLocation: latLong,
  customerLocationTimestamp: string,
  distanceToBus: float,
  id: option<string>,
  locationAccuracy: option<float>,
  timestamp: option<string>,
}

let decodeBusLocation = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          busNumber: getOptionString(dict, "busNumber")->Option.getExn(
            ~message="busNumber not found",
          ),
          customerLocation: dict
          ->Dict.get("customerLocation")
          ->Option.getExn(~message="customerLocation is not found")
          ->decodeLatLong
          ->Utils.getResultExn(~message="customerLocation is coming as undefined"),
          customerLocationTimestamp: getOptionString(
            dict,
            "customerLocationTimestamp",
          )->Option.getExn(~message="customerLocationTimestamp not found"),
          distanceToBus: getOptionFloat(dict, "distanceToBus")->Option.getExn(
            ~message="distanceToBus not found",
          ),
          id: getOptionString(dict, "id"),
          locationAccuracy: getOptionFloat(dict, "locationAccuracy"),
          timestamp: getOptionString(dict, "timestamp"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("BusLocation ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: busLocation) => {
  req->asJson
}
