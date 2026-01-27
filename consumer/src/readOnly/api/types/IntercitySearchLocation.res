open LatLong
open Utils

@genType
type intercitySearchLocation = {
  destination: option<latLong>,
  destinationCity: option<string>,
  destinationCityBannerImageUrl: option<string>,
  destinationCityButtonImageUrl: option<string>,
}

let decodeIntercitySearchLocation = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          destination: dict
          ->Dict.get("destination")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeLatLong(x)->Result.mapOr(None, x => Some(x))),
          destinationCity: getOptionString(dict, "destinationCity"),
          destinationCityBannerImageUrl: getOptionString(dict, "destinationCityBannerImageUrl"),
          destinationCityButtonImageUrl: getOptionString(dict, "destinationCityButtonImageUrl"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("IntercitySearchLocation ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: intercitySearchLocation) => {
  req->asJson
}
