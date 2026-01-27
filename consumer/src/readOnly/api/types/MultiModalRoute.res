open Distance
open MultiModalLeg
open Utils

@genType
type multiModalRoute = {
  distance: distance,
  duration: int,
  endTime: option<string>,
  legs: array<multiModalLeg>,
  relevanceScore: option<float>,
  startTime: option<string>,
}

let decodeMultiModalRoute = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          distance: dict
          ->Dict.get("distance")
          ->Option.getExn(~message="distance is not found")
          ->decodeDistance
          ->Utils.getResultExn(~message="distance is coming as undefined"),
          duration: getOptionInt(dict, "duration")->Option.getExn(~message="duration not found"),
          endTime: getOptionString(dict, "endTime"),
          legs: dict
          ->Dict.get("legs")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="legs is not of array")
          ->Array.map(x =>
            decodeMultiModalLeg(x)->Utils.getResultExn(~message="legs is coming as undefined")
          ),
          relevanceScore: getOptionFloat(dict, "relevanceScore"),
          startTime: getOptionString(dict, "startTime"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("MultiModalRoute ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: multiModalRoute) => {
  req->asJson
}
