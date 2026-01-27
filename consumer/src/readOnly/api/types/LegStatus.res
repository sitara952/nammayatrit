open Enums
open JourneyBookingStatus
open LatLong
open VehiclePosition
open Utils

@genType
type legStatus = {
  bookingStatus: journeyBookingStatus,
  legOrder: int,
  mode: MultimodalTravelMode.multimodalTravelMode,
  subLegOrder: int,
  trackingStatus: option<TrackingStatus.trackingStatus>,
  trackingStatusLastUpdatedAt: option<string>,
  userPosition: option<latLong>,
  vehiclePositions: array<vehiclePosition>,
}

let decodeLegStatus = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          bookingStatus: dict
          ->Dict.get("bookingStatus")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeJourneyBookingStatus(x)->Result.mapOr(None, x => Some(x)))
          ->Option.getExn(~message="bookingStatus not found"),
          legOrder: getOptionInt(dict, "legOrder")->Option.getExn(~message="legOrder not found"),
          mode: MultimodalTravelMode.decodeMultimodalTravelModeResult(
            dict,
            "mode",
          )->Utils.getResultExn(~message="mode is coming as undefined"),
          subLegOrder: getOptionInt(dict, "subLegOrder")->Option.getExn(
            ~message="subLegOrder not found",
          ),
          trackingStatus: TrackingStatus.decodeTrackingStatusResult(
            dict,
            "trackingStatus",
          )->Result.mapOr(None, x => Some(x)),
          trackingStatusLastUpdatedAt: getOptionString(dict, "trackingStatusLastUpdatedAt"),
          userPosition: dict
          ->Dict.get("userPosition")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeLatLong(x)->Result.mapOr(None, x => Some(x))),
          vehiclePositions: dict
          ->Dict.get("vehiclePositions")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="vehiclePositions is not of array")
          ->Array.map(x =>
            decodeVehiclePosition(x)->Utils.getResultExn(
              ~message="vehiclePositions is coming as undefined",
            )
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("LegStatus ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: legStatus) => {
  req->asJson
}
