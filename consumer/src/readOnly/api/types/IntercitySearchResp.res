open IntercitySearchLocation
open Utils

@genType
type intercitySearchResp = {
  destinationItem: option<intercitySearchLocation>,
  minimumFare: option<float>,
}

let decodeIntercitySearchResp = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          destinationItem: dict
          ->Dict.get("destinationItem")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x =>
            decodeIntercitySearchLocation(x)->Result.mapOr(None, x => Some(x))
          ),
          minimumFare: getOptionFloat(dict, "minimumFare"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("IntercitySearchResp ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: intercitySearchResp) => {
  req->asJson
}
