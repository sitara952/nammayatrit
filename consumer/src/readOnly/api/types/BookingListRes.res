open BookingAPIEntity
open Utils

@genType
type bookingListRes = {list: array<bookingAPIEntity>}

let decodeBookingListRes = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          list: dict
          ->Dict.get("list")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="list is not of array")
          ->Array.map(x =>
            decodeBookingAPIEntity(x)->Utils.getResultExn(~message="list is coming as undefined")
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("BookingListRes ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: bookingListRes) => {
  req->asJson
}
