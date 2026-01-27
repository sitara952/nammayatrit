open PlaceName
open Utils

@genType
type placeNameArray = array<placeName>

let decodePlaceNameArray = data => {
  try {
    Ok(
      data
      ->Js.Json.decodeArray
      ->Utils.getOptionExn(~message="response type is not array")
      ->Array.map(x =>
        decodePlaceName(x)->Utils.getResultExn(~message="error in parsing placeName")
      ),
    )
  } catch {
  | err => {
      Console.log2("PlaceNameArray ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: placeNameArray) => {
  req->asJson
}
