open Enums
open BatchConfig
open EstimatedEndTimeRange
open StopInformation
open Utils

@genType
type bookingStatusAPIEntity = {
  batchConfig: option<batchConfig>,
  bookingStatus: BookingStatus.bookingStatus,
  driverArrivalTime: option<string>,
  driversPreviousRideDropLocLat: option<float>,
  driversPreviousRideDropLocLon: option<float>,
  estimatedEndTimeRange: option<estimatedEndTimeRange>,
  id: string,
  isBookingUpdated: bool,
  rideStatus: option<RideStatus.rideStatus>,
  sosStatus: option<SosStatus.sosStatus>,
  stopInfo: array<stopInformation>,
}

let decodeBookingStatusAPIEntity = data => {
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
          bookingStatus: BookingStatus.decodeBookingStatusResult(
            dict,
            "bookingStatus",
          )->Utils.getResultExn(~message="bookingStatus is coming as undefined"),
          driverArrivalTime: getOptionString(dict, "driverArrivalTime"),
          driversPreviousRideDropLocLat: getOptionFloat(dict, "driversPreviousRideDropLocLat"),
          driversPreviousRideDropLocLon: getOptionFloat(dict, "driversPreviousRideDropLocLon"),
          estimatedEndTimeRange: dict
          ->Dict.get("estimatedEndTimeRange")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x =>
            decodeEstimatedEndTimeRange(x)->Result.mapOr(None, x => Some(x))
          ),
          id: getOptionString(dict, "id")->Option.getExn(~message="id not found"),
          isBookingUpdated: getOptionBool(dict, "isBookingUpdated")->Option.getExn(
            ~message="isBookingUpdated not found",
          ),
          rideStatus: RideStatus.decodeRideStatusResult(dict, "rideStatus")->Result.mapOr(
            None,
            x => Some(x),
          ),
          sosStatus: SosStatus.decodeSosStatusResult(dict, "sosStatus")->Result.mapOr(
            None,
            x => Some(x),
          ),
          stopInfo: dict
          ->Dict.get("stopInfo")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="stopInfo is not of array")
          ->Array.map(x =>
            decodeStopInformation(x)->Utils.getResultExn(~message="stopInfo is coming as undefined")
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("BookingStatusAPIEntity ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: bookingStatusAPIEntity) => {
  req->asJson
}
