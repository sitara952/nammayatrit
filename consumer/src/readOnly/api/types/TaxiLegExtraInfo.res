open Enums
open BatchConfig
open Distance
open Location
open Price
open Utils

@genType
type taxiLegExtraInfo = {
  batchConfig: option<batchConfig>,
  bookingId: option<string>,
  bppRideId: option<string>,
  chargeableRideDistance: option<distance>,
  destination: location,
  driverMobileNumber: option<string>,
  driverName: option<string>,
  exoPhoneNumber: option<string>,
  extraDistanceFare: option<price>,
  extraTimeFare: option<price>,
  fareProductType: option<string>,
  origin: location,
  otp: option<string>,
  rideEndTime: option<string>,
  rideId: option<string>,
  rideStartTime: option<string>,
  serviceTierName: option<string>,
  tollDifference: option<price>,
  trackingStatus: option<TrackingStatus.trackingStatus>,
  trackingStatusLastUpdatedAt: option<string>,
  vehicleIconUrl: option<string>,
  vehicleNumber: option<string>,
  waitingCharges: option<price>,
}

let decodeTaxiLegExtraInfo = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          batchConfig: dict
          ->Dict.get("batchConfig")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeBatchConfig(x)->Result.mapOr(None, x => Some(x))),
          bookingId: getOptionString(dict, "bookingId"),
          bppRideId: getOptionString(dict, "bppRideId"),
          chargeableRideDistance: dict
          ->Dict.get("chargeableRideDistance")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeDistance(x)->Result.mapOr(None, x => Some(x))),
          destination: dict
          ->Dict.get("destination")
          ->Option.getExn(~message="destination is not found")
          ->decodeLocation
          ->Utils.getResultExn(~message="destination is coming as undefined"),
          driverMobileNumber: getOptionString(dict, "driverMobileNumber"),
          driverName: getOptionString(dict, "driverName"),
          exoPhoneNumber: getOptionString(dict, "exoPhoneNumber"),
          extraDistanceFare: dict
          ->Dict.get("extraDistanceFare")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodePrice(x)->Result.mapOr(None, x => Some(x))),
          extraTimeFare: dict
          ->Dict.get("extraTimeFare")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodePrice(x)->Result.mapOr(None, x => Some(x))),
          fareProductType: getOptionString(dict, "fareProductType"),
          origin: dict
          ->Dict.get("origin")
          ->Option.getExn(~message="origin is not found")
          ->decodeLocation
          ->Utils.getResultExn(~message="origin is coming as undefined"),
          otp: getOptionString(dict, "otp"),
          rideEndTime: getOptionString(dict, "rideEndTime"),
          rideId: getOptionString(dict, "rideId"),
          rideStartTime: getOptionString(dict, "rideStartTime"),
          serviceTierName: getOptionString(dict, "serviceTierName"),
          tollDifference: dict
          ->Dict.get("tollDifference")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodePrice(x)->Result.mapOr(None, x => Some(x))),
          trackingStatus: TrackingStatus.decodeTrackingStatusResult(
            dict,
            "trackingStatus",
          )->Result.mapOr(None, x => Some(x)),
          trackingStatusLastUpdatedAt: getOptionString(dict, "trackingStatusLastUpdatedAt"),
          vehicleIconUrl: getOptionString(dict, "vehicleIconUrl"),
          vehicleNumber: getOptionString(dict, "vehicleNumber"),
          waitingCharges: dict
          ->Dict.get("waitingCharges")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodePrice(x)->Result.mapOr(None, x => Some(x))),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("TaxiLegExtraInfo ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: taxiLegExtraInfo) => {
  req->asJson
}
