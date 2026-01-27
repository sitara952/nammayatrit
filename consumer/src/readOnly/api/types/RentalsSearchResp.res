open RentalsConfig
open Utils

@genType
type rentalsSearchResp = {
  minimumFare: option<float>,
  rentalElement: rentalsConfig,
}

let decodeRentalsSearchResp = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          minimumFare: getOptionFloat(dict, "minimumFare"),
          rentalElement: dict
          ->Dict.get("rentalElement")
          ->Option.getExn(~message="rentalElement is not found")
          ->decodeRentalsConfig
          ->Utils.getResultExn(~message="rentalElement is coming as undefined"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("RentalsSearchResp ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: rentalsSearchResp) => {
  req->asJson
}
