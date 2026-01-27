open PayoutItem
open Utils

@genType
type payoutHistory = {history: array<payoutItem>}

let decodePayoutHistory = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          history: dict
          ->Dict.get("history")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="history is not of array")
          ->Array.map(x =>
            decodePayoutItem(x)->Utils.getResultExn(~message="history is coming as undefined")
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("PayoutHistory ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: payoutHistory) => {
  req->asJson
}
