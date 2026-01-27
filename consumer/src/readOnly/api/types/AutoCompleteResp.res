open Prediction
open Utils

@genType
type autoCompleteResp = {predictions: array<prediction>}

let decodeAutoCompleteResp = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          predictions: dict
          ->Dict.get("predictions")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="predictions is not of array")
          ->Array.map(x =>
            decodePrediction(x)->Utils.getResultExn(~message="predictions is coming as undefined")
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("AutoCompleteResp ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: autoCompleteResp) => {
  req->asJson
}
