open Enums
open Utils

@genType
type distance = {
  unit: DistanceUnit.distanceUnit,
  value: float,
}

let decodeDistance = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          unit: DistanceUnit.decodeDistanceUnitResult(dict, "unit")->Utils.getResultExn(
            ~message="unit is coming as undefined",
          ),
          value: getOptionFloat(dict, "value")->Option.getExn(~message="value not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("Distance ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: distance) => {
  req->asJson
}
