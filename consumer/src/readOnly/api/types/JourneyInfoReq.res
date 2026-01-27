open JourneyLegsReq
open Utils

@genType
type journeyInfoReq = {legsReq: array<journeyLegsReq>}

let decodeJourneyInfoReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          legsReq: dict
          ->Dict.get("legsReq")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="legsReq is not of array")
          ->Array.map(x =>
            decodeJourneyLegsReq(x)->Utils.getResultExn(~message="legsReq is coming as undefined")
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("JourneyInfoReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: journeyInfoReq) => {
  req->asJson
}
