open Distance
open NightShiftInfoAPIEntity
open PriceAPIEntity
open Utils

@genType
type rentalDetailsAPIEntity = {
  baseFare: int,
  baseFareWithCurrency: priceAPIEntity,
  deadKmFare: priceAPIEntity,
  includedDistancePerHrWithUnit: distance,
  includedKmPerHr: int,
  nightShiftInfo: option<nightShiftInfoAPIEntity>,
  perExtraKmRate: int,
  perExtraKmRateWithCurrency: priceAPIEntity,
  perExtraMinRate: int,
  perExtraMinRateWithCurrency: priceAPIEntity,
  perHourCharge: int,
  perHourChargeWithCurrency: priceAPIEntity,
  plannedPerKmRate: int,
  plannedPerKmRateWithCurrency: priceAPIEntity,
  tollCharges: option<priceAPIEntity>,
}

let decodeRentalDetailsAPIEntity = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          baseFare: getOptionInt(dict, "baseFare")->Option.getExn(~message="baseFare not found"),
          baseFareWithCurrency: dict
          ->Dict.get("baseFareWithCurrency")
          ->Option.getExn(~message="baseFareWithCurrency is not found")
          ->decodePriceAPIEntity
          ->Utils.getResultExn(~message="baseFareWithCurrency is coming as undefined"),
          deadKmFare: dict
          ->Dict.get("deadKmFare")
          ->Option.getExn(~message="deadKmFare is not found")
          ->decodePriceAPIEntity
          ->Utils.getResultExn(~message="deadKmFare is coming as undefined"),
          includedDistancePerHrWithUnit: dict
          ->Dict.get("includedDistancePerHrWithUnit")
          ->Option.getExn(~message="includedDistancePerHrWithUnit is not found")
          ->decodeDistance
          ->Utils.getResultExn(~message="includedDistancePerHrWithUnit is coming as undefined"),
          includedKmPerHr: getOptionInt(dict, "includedKmPerHr")->Option.getExn(
            ~message="includedKmPerHr not found",
          ),
          nightShiftInfo: dict
          ->Dict.get("nightShiftInfo")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x =>
            decodeNightShiftInfoAPIEntity(x)->Result.mapOr(None, x => Some(x))
          ),
          perExtraKmRate: getOptionInt(dict, "perExtraKmRate")->Option.getExn(
            ~message="perExtraKmRate not found",
          ),
          perExtraKmRateWithCurrency: dict
          ->Dict.get("perExtraKmRateWithCurrency")
          ->Option.getExn(~message="perExtraKmRateWithCurrency is not found")
          ->decodePriceAPIEntity
          ->Utils.getResultExn(~message="perExtraKmRateWithCurrency is coming as undefined"),
          perExtraMinRate: getOptionInt(dict, "perExtraMinRate")->Option.getExn(
            ~message="perExtraMinRate not found",
          ),
          perExtraMinRateWithCurrency: dict
          ->Dict.get("perExtraMinRateWithCurrency")
          ->Option.getExn(~message="perExtraMinRateWithCurrency is not found")
          ->decodePriceAPIEntity
          ->Utils.getResultExn(~message="perExtraMinRateWithCurrency is coming as undefined"),
          perHourCharge: getOptionInt(dict, "perHourCharge")->Option.getExn(
            ~message="perHourCharge not found",
          ),
          perHourChargeWithCurrency: dict
          ->Dict.get("perHourChargeWithCurrency")
          ->Option.getExn(~message="perHourChargeWithCurrency is not found")
          ->decodePriceAPIEntity
          ->Utils.getResultExn(~message="perHourChargeWithCurrency is coming as undefined"),
          plannedPerKmRate: getOptionInt(dict, "plannedPerKmRate")->Option.getExn(
            ~message="plannedPerKmRate not found",
          ),
          plannedPerKmRateWithCurrency: dict
          ->Dict.get("plannedPerKmRateWithCurrency")
          ->Option.getExn(~message="plannedPerKmRateWithCurrency is not found")
          ->decodePriceAPIEntity
          ->Utils.getResultExn(~message="plannedPerKmRateWithCurrency is coming as undefined"),
          tollCharges: dict
          ->Dict.get("tollCharges")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodePriceAPIEntity(x)->Result.mapOr(None, x => Some(x))),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("RentalDetailsAPIEntity ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: rentalDetailsAPIEntity) => {
  req->asJson
}
