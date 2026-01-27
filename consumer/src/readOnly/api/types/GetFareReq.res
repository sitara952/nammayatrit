open Enums
open Utils

@genType
type getFareReq = {
  fromStationCode: string,
  identifierType: IdentifierType.identifierType,
  mobileCountryCode: string,
  mobileNumber: string,
  numberOfPassengers: int,
  partnerOrgTransactionId: option<string>,
  routeCode: option<string>,
  toStationCode: string,
}

let decodeGetFareReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          fromStationCode: getOptionString(dict, "fromStationCode")->Option.getExn(
            ~message="fromStationCode not found",
          ),
          identifierType: IdentifierType.decodeIdentifierTypeResult(
            dict,
            "identifierType",
          )->Utils.getResultExn(~message="identifierType is coming as undefined"),
          mobileCountryCode: getOptionString(dict, "mobileCountryCode")->Option.getExn(
            ~message="mobileCountryCode not found",
          ),
          mobileNumber: getOptionString(dict, "mobileNumber")->Option.getExn(
            ~message="mobileNumber not found",
          ),
          numberOfPassengers: getOptionInt(dict, "numberOfPassengers")->Option.getExn(
            ~message="numberOfPassengers not found",
          ),
          partnerOrgTransactionId: getOptionString(dict, "partnerOrgTransactionId"),
          routeCode: getOptionString(dict, "routeCode"),
          toStationCode: getOptionString(dict, "toStationCode")->Option.getExn(
            ~message="toStationCode not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("GetFareReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: getFareReq) => {
  req->asJson
}
