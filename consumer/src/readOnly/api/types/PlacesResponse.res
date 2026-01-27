open MultiModalLocation
open Utils

@genType
type placesResponse = {
  popularLocations: array<multiModalLocation>,
  recentLocations: array<multiModalLocation>,
}

let decodePlacesResponse = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          popularLocations: dict
          ->Dict.get("popularLocations")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="popularLocations is not of array")
          ->Array.map(x =>
            decodeMultiModalLocation(x)->Utils.getResultExn(
              ~message="popularLocations is coming as undefined",
            )
          ),
          recentLocations: dict
          ->Dict.get("recentLocations")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="recentLocations is not of array")
          ->Array.map(x =>
            decodeMultiModalLocation(x)->Utils.getResultExn(
              ~message="recentLocations is coming as undefined",
            )
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("PlacesResponse ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: placesResponse) => {
  req->asJson
}
