open MultimodalTransitOptionData
open Utils

@genType
type multimodalTransitOptionsResp = {options: array<multimodalTransitOptionData>}

let decodeMultimodalTransitOptionsResp = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          options: dict
          ->Dict.get("options")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="options is not of array")
          ->Array.map(x =>
            decodeMultimodalTransitOptionData(x)->Utils.getResultExn(
              ~message="options is coming as undefined",
            )
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("MultimodalTransitOptionsResp ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: multimodalTransitOptionsResp) => {
  req->asJson
}
