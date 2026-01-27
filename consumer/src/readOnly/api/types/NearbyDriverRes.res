open NearByDriversBucket
open VehicleDataBucket
open Utils

@genType
type nearbyDriverRes = {
  buckets: array<nearByDriversBucket>,
  serviceTierTypeToVehicleVariant: string,
  variantLevelDriverCount: string,
  vehicleDataBuckets: array<vehicleDataBucket>,
}

let decodeNearbyDriverRes = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          buckets: dict
          ->Dict.get("buckets")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="buckets is not of array")
          ->Array.map(x =>
            decodeNearByDriversBucket(x)->Utils.getResultExn(
              ~message="buckets is coming as undefined",
            )
          ),
          serviceTierTypeToVehicleVariant: getOptionString(
            dict,
            "serviceTierTypeToVehicleVariant",
          )->Option.getExn(~message="serviceTierTypeToVehicleVariant not found"),
          variantLevelDriverCount: getOptionString(dict, "variantLevelDriverCount")->Option.getExn(
            ~message="variantLevelDriverCount not found",
          ),
          vehicleDataBuckets: dict
          ->Dict.get("vehicleDataBuckets")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="vehicleDataBuckets is not of array")
          ->Array.map(x =>
            decodeVehicleDataBucket(x)->Utils.getResultExn(
              ~message="vehicleDataBuckets is coming as undefined",
            )
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("NearbyDriverRes ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: nearbyDriverRes) => {
  req->asJson
}
