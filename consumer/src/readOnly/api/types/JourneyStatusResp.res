open Enums
open LegStatus
open Utils

@genType
type journeyStatusResp = {
  journeyChangeLogCounter: int,
  journeyPaymentStatus: option<FRFSBookingPaymentStatusAPI.fRFSBookingPaymentStatusAPI>,
  journeyStatus: JourneyStatus.journeyStatus,
  legs: array<legStatus>,
}

let decodeJourneyStatusResp = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          journeyChangeLogCounter: getOptionInt(dict, "journeyChangeLogCounter")->Option.getExn(
            ~message="journeyChangeLogCounter not found",
          ),
          journeyPaymentStatus: FRFSBookingPaymentStatusAPI.decodeFRFSBookingPaymentStatusAPIResult(
            dict,
            "journeyPaymentStatus",
          )->Result.mapOr(None, x => Some(x)),
          journeyStatus: JourneyStatus.decodeJourneyStatusResult(
            dict,
            "journeyStatus",
          )->Utils.getResultExn(~message="journeyStatus is coming as undefined"),
          legs: dict
          ->Dict.get("legs")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="legs is not of array")
          ->Array.map(x =>
            decodeLegStatus(x)->Utils.getResultExn(~message="legs is coming as undefined")
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("JourneyStatusResp ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: journeyStatusResp) => {
  req->asJson
}
