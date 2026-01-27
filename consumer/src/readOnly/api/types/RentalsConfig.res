open Utils

@genType
type rentalsConfig = {
  rentalDistance: int,
  rentalDuration: int,
  rentalImageUrl: option<string>,
  rentalPriority: int,
}

let decodeRentalsConfig = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          rentalDistance: getOptionInt(dict, "rentalDistance")->Option.getExn(
            ~message="rentalDistance not found",
          ),
          rentalDuration: getOptionInt(dict, "rentalDuration")->Option.getExn(
            ~message="rentalDuration not found",
          ),
          rentalImageUrl: getOptionString(dict, "rentalImageUrl"),
          rentalPriority: getOptionInt(dict, "rentalPriority")->Option.getExn(
            ~message="rentalPriority not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("RentalsConfig ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: rentalsConfig) => {
  req->asJson
}
