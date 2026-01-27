open Utils

@genType
type getFareResponse = {
  estimatedMaxFare: float,
  estimatedMinFare: float,
}

let decodeGetFareResponse = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          estimatedMaxFare: getOptionFloat(dict, "estimatedMaxFare")->Option.getExn(
            ~message="estimatedMaxFare not found",
          ),
          estimatedMinFare: getOptionFloat(dict, "estimatedMinFare")->Option.getExn(
            ~message="estimatedMinFare not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("GetFareResponse ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: getFareResponse) => {
  req->asJson
}
