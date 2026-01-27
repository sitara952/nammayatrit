open Enums
open Utils

@genType
type getFareReqV2 = {
  cityId: string,
  fromStationCode: string,
  partnerOrgTransactionId: option<string>,
  routeCode: option<string>,
  toStationCode: string,
  vehicleType: option<VehicleCategory.vehicleCategory>,
}

let decodeGetFareReqV2 = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          cityId: getOptionString(dict, "cityId")->Option.getExn(~message="cityId not found"),
          fromStationCode: getOptionString(dict, "fromStationCode")->Option.getExn(
            ~message="fromStationCode not found",
          ),
          partnerOrgTransactionId: getOptionString(dict, "partnerOrgTransactionId"),
          routeCode: getOptionString(dict, "routeCode"),
          toStationCode: getOptionString(dict, "toStationCode")->Option.getExn(
            ~message="toStationCode not found",
          ),
          vehicleType: VehicleCategory.decodeVehicleCategoryResult(
            dict,
            "vehicleType",
          )->Result.mapOr(None, x => Some(x)),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("GetFareReqV2 ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: getFareReqV2) => {
  req->asJson
}
