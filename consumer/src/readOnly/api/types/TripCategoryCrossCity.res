open Enums
open Utils

@genType
type tripCategoryCrossCity = {
  city: option<string>,
  contents: OneWayMode.oneWayMode,
}

let decodeTripCategoryCrossCity = data => {
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
      Console.log2("TripCategoryCrossCity ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: tripCategoryCrossCity) => {
  req->asJson
}
