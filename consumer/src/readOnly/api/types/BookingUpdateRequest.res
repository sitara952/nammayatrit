open Enums
open ErrorObj
open Utils

@genType
type bookingUpdateRequest = {
  bookingId: string,
  createdAt: string,
  currentPointLat: option<float>,
  currentPointLon: option<float>,
  distanceUnit: DistanceUnit.distanceUnit,
  errorObj: option<errorObj>,
  estimatedDistance: option<float>,
  estimatedFare: option<float>,
  id: string,
  merchantId: string,
  merchantOperatingCityId: string,
  oldEstimatedDistance: option<float>,
  oldEstimatedFare: float,
  status: BookingUpdateRequestStatus.bookingUpdateRequestStatus,
  totalDistance: option<float>,
  travelledDistance: option<float>,
  updatedAt: string,
}

let decodeBookingUpdateRequest = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          bookingId: getOptionString(dict, "bookingId")->Option.getExn(
            ~message="bookingId not found",
          ),
          createdAt: getOptionString(dict, "createdAt")->Option.getExn(
            ~message="createdAt not found",
          ),
          currentPointLat: getOptionFloat(dict, "currentPointLat"),
          currentPointLon: getOptionFloat(dict, "currentPointLon"),
          distanceUnit: DistanceUnit.decodeDistanceUnitResult(
            dict,
            "distanceUnit",
          )->Utils.getResultExn(~message="distanceUnit is coming as undefined"),
          errorObj: dict
          ->Dict.get("errorObj")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeErrorObj(x)->Result.mapOr(None, x => Some(x))),
          estimatedDistance: getOptionFloat(dict, "estimatedDistance"),
          estimatedFare: getOptionFloat(dict, "estimatedFare"),
          id: getOptionString(dict, "id")->Option.getExn(~message="id not found"),
          merchantId: getOptionString(dict, "merchantId")->Option.getExn(
            ~message="merchantId not found",
          ),
          merchantOperatingCityId: getOptionString(dict, "merchantOperatingCityId")->Option.getExn(
            ~message="merchantOperatingCityId not found",
          ),
          oldEstimatedDistance: getOptionFloat(dict, "oldEstimatedDistance"),
          oldEstimatedFare: getOptionFloat(dict, "oldEstimatedFare")->Option.getExn(
            ~message="oldEstimatedFare not found",
          ),
          status: BookingUpdateRequestStatus.decodeBookingUpdateRequestStatusResult(
            dict,
            "status",
          )->Utils.getResultExn(~message="status is coming as undefined"),
          totalDistance: getOptionFloat(dict, "totalDistance"),
          travelledDistance: getOptionFloat(dict, "travelledDistance"),
          updatedAt: getOptionString(dict, "updatedAt")->Option.getExn(
            ~message="updatedAt not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("BookingUpdateRequest ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: bookingUpdateRequest) => {
  req->asJson
}
