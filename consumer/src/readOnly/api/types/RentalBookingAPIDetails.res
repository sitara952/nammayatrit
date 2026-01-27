open LocationAPIEntity
open Utils

@genType
type rentalBookingAPIDetails = {
  otpCode: option<string>,
  stopLocation: option<locationAPIEntity>,
}

let decodeRentalBookingAPIDetails = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          otpCode: getOptionString(dict, "otpCode"),
          stopLocation: dict
          ->Dict.get("stopLocation")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeLocationAPIEntity(x)->Result.mapOr(None, x => Some(x))),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("RentalBookingAPIDetails ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: rentalBookingAPIDetails) => {
  req->asJson
}
