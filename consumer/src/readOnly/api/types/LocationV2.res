open LatLngV2
open Utils

@genType
type locationV2 = {latLng: latLngV2}

let decodeLocationV2 = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          latLng: dict
          ->Dict.get("latLng")
          ->Option.getExn(~message="latLng is not found")
          ->decodeLatLngV2
          ->Utils.getResultExn(~message="latLng is coming as undefined"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("LocationV2 ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: locationV2) => {
  req->asJson
}
