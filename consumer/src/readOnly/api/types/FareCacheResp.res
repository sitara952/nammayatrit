open IntercitySearchResp
open RentalsSearchResp
open Utils

@genType
type fareCacheResp = {
  interCityMinimumFareResp: option<array<intercitySearchResp>>,
  rentalsMininumFareResp: option<array<rentalsSearchResp>>,
}

let decodeFareCacheResp = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          interCityMinimumFareResp: dict
          ->Dict.get("interCityMinimumFareResp")
          ->Option.flatMap(jsonNullToOption)
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.map(arr =>
            arr->Array.map(x =>
              decodeIntercitySearchResp(x)->Utils.getResultExn(
                ~message="interCityMinimumFareResp is coming as undefined",
              )
            )
          ),
          rentalsMininumFareResp: dict
          ->Dict.get("rentalsMininumFareResp")
          ->Option.flatMap(jsonNullToOption)
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.map(arr =>
            arr->Array.map(x =>
              decodeRentalsSearchResp(x)->Utils.getResultExn(
                ~message="rentalsMininumFareResp is coming as undefined",
              )
            )
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("FareCacheResp ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: fareCacheResp) => {
  req->asJson
}
