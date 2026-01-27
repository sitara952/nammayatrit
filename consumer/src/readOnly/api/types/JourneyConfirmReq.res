open JourneyConfirmReqElement
open Utils

@genType
type journeyConfirmReq = {
  journeyConfirmReqElements: array<journeyConfirmReqElement>,
  enableOffer: option<bool>,
}

let decodeJourneyConfirmReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          journeyConfirmReqElements: dict
          ->Dict.get("journeyConfirmReqElements")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="journeyConfirmReqElements is not of array")
          ->Array.map(x =>
            decodeJourneyConfirmReqElement(x)->Utils.getResultExn(
              ~message="journeyConfirmReqElements is coming as undefined",
            )
          ),
          enableOffer: getOptionBool(dict, "enableOffer"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("JourneyConfirmReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: journeyConfirmReq) => {
  req->asJson
}
