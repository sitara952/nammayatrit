open Enums
open Utils

@genType
type riderLocationRequest = {
  city: City.city,
  riderLat: float,
  riderLon: float,
  locationAccuracy: option<float>,
}

let decodeRiderLocationRequest = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          city: City.decodeCityResult(dict, "city")->Utils.getResultExn(
            ~message="city is coming as undefined",
          ),
          riderLat: getOptionFloat(dict, "riderLat")->Option.getExn(~message="riderLat not found"),
          riderLon: getOptionFloat(dict, "riderLon")->Option.getExn(~message="riderLon not found"),
          locationAccuracy: getOptionFloat(dict, "locationAccuracy"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("RiderLocationRequest ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: riderLocationRequest) => {
  req->asJson
}
