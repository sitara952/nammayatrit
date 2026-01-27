open LatLong
open LocationAPIEntity
open PersonAPIEntity
open RideAPIEntity
open Utils

@genType
type getRideStatusResp = {
  customer: personAPIEntity,
  driverPosition: option<latLong>,
  fromLocation: locationAPIEntity,
  ride: rideAPIEntity,
  toLocation: option<locationAPIEntity>,
}

let decodeGetRideStatusResp = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          customer: dict
          ->Dict.get("customer")
          ->Option.getExn(~message="customer is not found")
          ->decodePersonAPIEntity
          ->Utils.getResultExn(~message="customer is coming as undefined"),
          driverPosition: dict
          ->Dict.get("driverPosition")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeLatLong(x)->Result.mapOr(None, x => Some(x))),
          fromLocation: dict
          ->Dict.get("fromLocation")
          ->Option.getExn(~message="fromLocation is not found")
          ->decodeLocationAPIEntity
          ->Utils.getResultExn(~message="fromLocation is coming as undefined"),
          ride: dict
          ->Dict.get("ride")
          ->Option.getExn(~message="ride is not found")
          ->decodeRideAPIEntity
          ->Utils.getResultExn(~message="ride is coming as undefined"),
          toLocation: dict
          ->Dict.get("toLocation")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeLocationAPIEntity(x)->Result.mapOr(None, x => Some(x))),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("GetRideStatusResp ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: getRideStatusResp) => {
  req->asJson
}
