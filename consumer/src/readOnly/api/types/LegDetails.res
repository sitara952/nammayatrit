open Price
open Utils

@genType
type legDetails = {
  legFare: price,
  legOrder: int,
}

let decodeLegDetails = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          legFare: dict
          ->Dict.get("legFare")
          ->Option.getExn(~message="legFare is not found")
          ->decodePrice
          ->Utils.getResultExn(~message="legFare is coming as undefined"),
          legOrder: getOptionInt(dict, "legOrder")->Option.getExn(~message="legOrder not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("LegDetails ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: legDetails) => {
  req->asJson
}
