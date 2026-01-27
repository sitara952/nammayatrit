open DeliveryDetails
open PriceAPIEntity
open Utils

@genType
type dSelectReq = {
  autoAssignEnabled: bool,
  autoAssignEnabledV2: option<bool>,
  customerExtraFee: option<int>,
  customerExtraFeeWithCurrency: option<priceAPIEntity>,
  deliveryDetails: option<deliveryDetails>,
  isAdvancedBookingEnabled: option<bool>,
  otherSelectedEstimates: option<array<string>>,
  paymentMethodId: option<string>,
}

let decodeDSelectReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          autoAssignEnabled: getOptionBool(dict, "autoAssignEnabled")->Option.getExn,
          autoAssignEnabledV2: getOptionBool(dict, "autoAssignEnabledV2"),
          customerExtraFee: getOptionInt(dict, "customerExtraFee"),
          customerExtraFeeWithCurrency: Some(
            dict
            ->Dict.get("customerExtraFeeWithCurrency")
            ->Option.getExn
            ->decodePriceAPIEntity
            ->Result.getExn,
          ),
          deliveryDetails: Some(
            dict
            ->Dict.get("deliveryDetails")
            ->Option.getExn
            ->decodeDeliveryDetails
            ->Result.getExn,
          ),
          isAdvancedBookingEnabled: getOptionBool(dict, "isAdvancedBookingEnabled"),
          otherSelectedEstimates: getOptionStrArrayFromDict(dict, "otherSelectedEstimates"),
          paymentMethodId: getOptionString(dict, "paymentMethodId"),
        }
      ),
    )
  } catch {
  | err => Error(err)
  }
}

let toJson = (req: dSelectReq) => {
  req->asJson
}
