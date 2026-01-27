open EstimateBreakup
open Utils

@genType
type estimateDetailsRes = {estimateBreakup: array<estimateBreakup>}

let decodeEstimateDetailsRes = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          estimateBreakup: dict
          ->Dict.get("estimateBreakup")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="estimateBreakup is not of array")
          ->Array.map(x =>
            decodeEstimateBreakup(x)->Utils.getResultExn(
              ~message="estimateBreakup is coming as undefined",
            )
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("EstimateDetailsRes ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: estimateDetailsRes) => {
  req->asJson
}
