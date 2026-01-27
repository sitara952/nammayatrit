open Distance
open LocationAPIEntity
open Utils

@genType
type ambulanceBookingAPIDetails = {
  estimatedDistance: float,
  estimatedDistanceWithUnit: distance,
  toLocation: locationAPIEntity,
}

let decodeAmbulanceBookingAPIDetails = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          estimatedDistance: getOptionFloat(dict, "estimatedDistance")->Option.getExn(
            ~message="estimatedDistance not found",
          ),
          estimatedDistanceWithUnit: dict
          ->Dict.get("estimatedDistanceWithUnit")
          ->Option.getExn(~message="estimatedDistanceWithUnit is not found")
          ->decodeDistance
          ->Utils.getResultExn(~message="estimatedDistanceWithUnit is coming as undefined"),
          toLocation: dict
          ->Dict.get("toLocation")
          ->Option.getExn(~message="toLocation is not found")
          ->decodeLocationAPIEntity
          ->Utils.getResultExn(~message="toLocation is coming as undefined"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("AmbulanceBookingAPIDetails ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: ambulanceBookingAPIDetails) => {
  req->asJson
}
