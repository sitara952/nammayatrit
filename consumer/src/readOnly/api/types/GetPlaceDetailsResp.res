open LatLong
open Utils

@genType
type getPlaceDetailsResp = {location: latLong}

let decodeGetPlaceDetailsResp = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          location: dict
          ->Dict.get("location")
          ->Option.getExn(~message="location is not found")
          ->decodeLatLong
          ->Utils.getResultExn(~message="location is coming as undefined"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("GetPlaceDetailsResp ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: getPlaceDetailsResp) => {
  req->asJson
}
