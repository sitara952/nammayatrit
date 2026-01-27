open Distance
open LocationAPIEntity
open Utils

@genType
type interCityBookingAPIDetails = {
  estimatedDistance: float,
  estimatedDistanceWithUnit: distance,
  otpCode: option<string>,
  stops: array<locationAPIEntity>,
  toLocation: locationAPIEntity,
}

let decodeInterCityBookingAPIDetails = data => {
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
          otpCode: getOptionString(dict, "otpCode"),
          stops: dict
          ->Dict.get("stops")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="stops is not of array")
          ->Array.map(x =>
            decodeLocationAPIEntity(x)->Utils.getResultExn(~message="stops is coming as undefined")
          ),
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
      Console.log2("InterCityBookingAPIDetails ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: interCityBookingAPIDetails) => {
  req->asJson
}
