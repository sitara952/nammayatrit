open Enums
open DeliveryDetails
open PriceAPIEntity
open Utils

@genType
type dSelectReq = {
  autoAssignEnabled: bool,
  autoAssignEnabledV2: option<bool>,
  billingCategory: option<BillingCategory.billingCategory>,
  customerExtraFee: option<int>,
  customerExtraFeeWithCurrency: option<priceAPIEntity>,
  deliveryDetails: option<deliveryDetails>,
  isAdvancedBookingEnabled: option<bool>,
  otherSelectedEstimates: option<array<string>>,
  paymentMethodId: option<string>,
  isPetRide: option<bool>,
}

let decodeDSelectReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          autoAssignEnabled: getOptionBool(dict, "autoAssignEnabled")->Option.getExn(
            ~message="autoAssignEnabled not found",
          ),
          autoAssignEnabledV2: getOptionBool(dict, "autoAssignEnabledV2"),
          billingCategory: BillingCategory.decodeBillingCategoryResult(
            dict,
            "billingCategory",
          )->Result.mapOr(None, x => Some(x)),
          customerExtraFee: getOptionInt(dict, "customerExtraFee"),
          customerExtraFeeWithCurrency: dict
          ->Dict.get("customerExtraFeeWithCurrency")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodePriceAPIEntity(x)->Result.mapOr(None, x => Some(x))),
          deliveryDetails: dict
          ->Dict.get("deliveryDetails")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeDeliveryDetails(x)->Result.mapOr(None, x => Some(x))),
          isAdvancedBookingEnabled: getOptionBool(dict, "isAdvancedBookingEnabled"),
          otherSelectedEstimates: getOptionStrArrayFromDict(dict, "otherSelectedEstimates"),
          paymentMethodId: getOptionString(dict, "paymentMethodId"),
          isPetRide: getOptionBool(dict, "isPetRide"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("DSelectReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: dSelectReq) => {
  req->asJson
}
