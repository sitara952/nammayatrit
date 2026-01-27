open Enums
open Utils

@genType
type generateInvoiceReq = {
  billingCategories: option<array<BillingCategory.billingCategory>>,
  bookingId: option<string>,
  email: option<string>,
  endDate: string,
  rideTypes: option<array<RideType.rideType>>,
  startDate: string,
}

let decodeGenerateInvoiceReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          billingCategories: dict
          ->Dict.get("billingCategories")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.map(arr =>
            arr->Array.map(x =>
              BillingCategory.decodeBillingCategory(x)->Utils.getResultExn(
                ~message="billingCategories is coming as undefined",
              )
            )
          ),
          bookingId: getOptionString(dict, "bookingId"),
          email: getOptionString(dict, "email"),
          endDate: getOptionString(dict, "endDate")->Option.getExn(~message="endDate not found"),
          rideTypes: dict
          ->Dict.get("rideTypes")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.map(arr =>
            arr->Array.map(x =>
              RideType.decodeRideType(x)->Utils.getResultExn(
                ~message="rideTypes is coming as undefined",
              )
            )
          ),
          startDate: getOptionString(dict, "startDate")->Option.getExn(
            ~message="startDate not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("GenerateInvoiceReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: generateInvoiceReq) => {
  req->asJson
}
