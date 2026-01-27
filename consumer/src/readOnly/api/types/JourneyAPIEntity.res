open Enums
open JourneyLocation
open PriceAPIEntity
open Utils

@genType
type journeyAPIEntity = {
  createdAt: string,
  fare: priceAPIEntity,
  fromLocation: journeyLocation,
  id: string,
  startTime: option<string>,
  status: JourneyStatus.journeyStatus,
  toLocation: journeyLocation,
}

let decodeJourneyAPIEntity = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          createdAt: getOptionString(dict, "createdAt")->Option.getExn(
            ~message="createdAt not found",
          ),
          fare: dict
          ->Dict.get("fare")
          ->Option.getExn(~message="fare is not found")
          ->decodePriceAPIEntity
          ->Utils.getResultExn(~message="fare is coming as undefined"),
          fromLocation: dict
          ->Dict.get("fromLocation")
          ->Option.getExn(~message="fromLocation is not found")
          ->decodeJourneyLocation
          ->Utils.getResultExn(~message="fromLocation is coming as undefined"),
          id: getOptionString(dict, "id")->Option.getExn(~message="id not found"),
          startTime: getOptionString(dict, "startTime"),
          status: JourneyStatus.decodeJourneyStatusResult(dict, "status")->Utils.getResultExn(
            ~message="status is coming as undefined",
          ),
          toLocation: dict
          ->Dict.get("toLocation")
          ->Option.getExn(~message="toLocation is not found")
          ->decodeJourneyLocation
          ->Utils.getResultExn(~message="toLocation is coming as undefined"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("JourneyAPIEntity ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: journeyAPIEntity) => {
  req->asJson
}
