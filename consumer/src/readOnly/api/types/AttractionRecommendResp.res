open Attraction
open Utils

@genType
type attractionRecommendResp = {attractions: array<attraction>}

let decodeAttractionRecommendResp = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          attractions: dict
          ->Dict.get("attractions")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="attractions is not of array")
          ->Array.map(x =>
            decodeAttraction(x)->Utils.getResultExn(~message="attractions is coming as undefined")
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("AttractionRecommendResp ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: attractionRecommendResp) => {
  req->asJson
}
