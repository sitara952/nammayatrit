open Distance
open Utils

@genType
type prediction = {
  description: string,
  distance: option<int>,
  distanceWithUnit: option<distance>,
  placeId: option<string>,
  types: option<array<string>>,
}

let decodePrediction = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          description: getOptionString(dict, "description")->Option.getExn(
            ~message="description not found",
          ),
          distance: getOptionInt(dict, "distance"),
          distanceWithUnit: dict
          ->Dict.get("distanceWithUnit")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeDistance(x)->Result.mapOr(None, x => Some(x))),
          placeId: getOptionString(dict, "placeId"),
          types: getOptionStrArrayFromDict(dict, "types"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("Prediction ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: prediction) => {
  req->asJson
}
