open PriceAPIEntity
open Utils

@genType
type nightShiftInfoAPIEntity = {
  nightShiftCharge: int,
  nightShiftChargeWithCurrency: priceAPIEntity,
  nightShiftEnd: string,
  nightShiftStart: string,
  oldNightShiftCharge: option<float>,
}

let decodeNightShiftInfoAPIEntity = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          nightShiftCharge: getOptionInt(dict, "nightShiftCharge")->Option.getExn(
            ~message="nightShiftCharge not found",
          ),
          nightShiftChargeWithCurrency: dict
          ->Dict.get("nightShiftChargeWithCurrency")
          ->Option.getExn(~message="nightShiftChargeWithCurrency is not found")
          ->decodePriceAPIEntity
          ->Utils.getResultExn(~message="nightShiftChargeWithCurrency is coming as undefined"),
          nightShiftEnd: getOptionString(dict, "nightShiftEnd")->Option.getExn(
            ~message="nightShiftEnd not found",
          ),
          nightShiftStart: getOptionString(dict, "nightShiftStart")->Option.getExn(
            ~message="nightShiftStart not found",
          ),
          oldNightShiftCharge: getOptionFloat(dict, "oldNightShiftCharge"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("NightShiftInfoAPIEntity ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: nightShiftInfoAPIEntity) => {
  req->asJson
}
