open DriverProfileRes
open Utils

@genType
type driverProfileResponse = {response: option<driverProfileRes>}

let decodeDriverProfileResponse = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          response: dict
          ->Dict.get("response")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeDriverProfileRes(x)->Result.mapOr(None, x => Some(x))),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("DriverProfileResponse ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: driverProfileResponse) => {
  req->asJson
}
