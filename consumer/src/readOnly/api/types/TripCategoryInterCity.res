open Enums
open Utils

@genType
type tripCategoryInterCity = {
  city: option<string>,
  contents: OneWayMode.oneWayMode,
}

let decodeTripCategoryInterCity = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          city: getOptionString(dict, "city"),
          contents: OneWayMode.decodeOneWayModeResult(dict, "contents")->Utils.getResultExn(
            ~message="contents is coming as undefined",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("TripCategoryInterCity ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: tripCategoryInterCity) => {
  req->asJson
}
