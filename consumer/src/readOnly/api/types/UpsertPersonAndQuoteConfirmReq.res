open Enums
open Utils

@genType
type upsertPersonAndQuoteConfirmReq = {
  identifierType: IdentifierType.identifierType,
  mobileCountryCode: string,
  mobileNumber: string,
  numberOfPassengers: int,
  quoteId: string,
  searchId: string,
}

let decodeUpsertPersonAndQuoteConfirmReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
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
          quoteId: getOptionString(dict, "quoteId")->Option.getExn(~message="quoteId not found"),
          searchId: getOptionString(dict, "searchId")->Option.getExn(~message="searchId not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("UpsertPersonAndQuoteConfirmReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: upsertPersonAndQuoteConfirmReq) => {
  req->asJson
}
