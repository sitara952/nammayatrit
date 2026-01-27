open BookingAPIEntityV2
open Utils

@genType
type bookingListResV2 = {
  bookingOffset: option<int>,
  journeyOffset: option<int>,
  list: array<bookingAPIEntityV2>,
}

let decodeBookingListResV2 = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          bookingOffset: getOptionInt(dict, "bookingOffset"),
          journeyOffset: getOptionInt(dict, "journeyOffset"),
          list: dict
          ->Dict.get("list")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="list is not of array")
          ->Array.map(x =>
            decodeBookingAPIEntityV2(x)->Utils.getResultExn(~message="list is coming as undefined")
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("BookingListResV2 ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: bookingListResV2) => {
  req->asJson
}
