open LegStatus
open Utils

@genType
type journeyStatus = {legs: array<legStatus>}

let decodeJourneyStatus = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
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
      Console.log2("JourneyStatus ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: journeyStatus) => {
  req->asJson
}
