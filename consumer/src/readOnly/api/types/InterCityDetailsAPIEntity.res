open Distance
open NightShiftInfoAPIEntity
open PriceAPIEntity
open Utils

@genType
type interCityDetailsAPIEntity = {
  baseFare: priceAPIEntity,
  deadKmFare: priceAPIEntity,
  kmPerPlannedExtraHour: distance,
  nightShiftInfo: option<nightShiftInfoAPIEntity>,
  perDayMaxAllowanceInMins: option<int>,
  perDayMaxHourAllowance: int,
  perExtraKmRate: priceAPIEntity,
  perExtraMinRate: priceAPIEntity,
  perHourCharge: priceAPIEntity,
  plannedPerKmRateOneWay: priceAPIEntity,
  plannedPerKmRateRoundTrip: priceAPIEntity,
  quoteId: string,
  roundTrip: option<bool>,
  tollCharges: option<priceAPIEntity>,
}

let decodeInterCityDetailsAPIEntity = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          baseFare: dict
          ->Dict.get("baseFare")
          ->Option.getExn(~message="baseFare is not found")
          ->decodePriceAPIEntity
          ->Utils.getResultExn(~message="baseFare is coming as undefined"),
          deadKmFare: dict
          ->Dict.get("deadKmFare")
          ->Option.getExn(~message="deadKmFare is not found")
          ->decodePriceAPIEntity
          ->Utils.getResultExn(~message="deadKmFare is coming as undefined"),
          kmPerPlannedExtraHour: dict
          ->Dict.get("kmPerPlannedExtraHour")
          ->Option.getExn(~message="kmPerPlannedExtraHour is not found")
          ->decodeDistance
          ->Utils.getResultExn(~message="kmPerPlannedExtraHour is coming as undefined"),
          nightShiftInfo: dict
          ->Dict.get("nightShiftInfo")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x =>
            decodeNightShiftInfoAPIEntity(x)->Result.mapOr(None, x => Some(x))
          ),
          perDayMaxAllowanceInMins: getOptionInt(dict, "perDayMaxAllowanceInMins"),
          perDayMaxHourAllowance: getOptionInt(dict, "perDayMaxHourAllowance")->Option.getExn(
            ~message="perDayMaxHourAllowance not found",
          ),
          perExtraKmRate: dict
          ->Dict.get("perExtraKmRate")
          ->Option.getExn(~message="perExtraKmRate is not found")
          ->decodePriceAPIEntity
          ->Utils.getResultExn(~message="perExtraKmRate is coming as undefined"),
          perExtraMinRate: dict
          ->Dict.get("perExtraMinRate")
          ->Option.getExn(~message="perExtraMinRate is not found")
          ->decodePriceAPIEntity
          ->Utils.getResultExn(~message="perExtraMinRate is coming as undefined"),
          perHourCharge: dict
          ->Dict.get("perHourCharge")
          ->Option.getExn(~message="perHourCharge is not found")
          ->decodePriceAPIEntity
          ->Utils.getResultExn(~message="perHourCharge is coming as undefined"),
          plannedPerKmRateOneWay: dict
          ->Dict.get("plannedPerKmRateOneWay")
          ->Option.getExn(~message="plannedPerKmRateOneWay is not found")
          ->decodePriceAPIEntity
          ->Utils.getResultExn(~message="plannedPerKmRateOneWay is coming as undefined"),
          plannedPerKmRateRoundTrip: dict
          ->Dict.get("plannedPerKmRateRoundTrip")
          ->Option.getExn(~message="plannedPerKmRateRoundTrip is not found")
          ->decodePriceAPIEntity
          ->Utils.getResultExn(~message="plannedPerKmRateRoundTrip is coming as undefined"),
          quoteId: getOptionString(dict, "quoteId")->Option.getExn(~message="quoteId not found"),
          roundTrip: getOptionBool(dict, "roundTrip"),
          tollCharges: dict
          ->Dict.get("tollCharges")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodePriceAPIEntity(x)->Result.mapOr(None, x => Some(x))),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("InterCityDetailsAPIEntity ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: interCityDetailsAPIEntity) => {
  req->asJson
}
