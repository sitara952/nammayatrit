open BookingAPIEntity
open Utils

@genType
type flowStatusACTIVEBookings = {list: option<array<bookingAPIEntity>>}

let decodeFlowStatusACTIVEBookings = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          list: dict
          ->Dict.get("list")
          ->Option.flatMap(jsonNullToOption)
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.map(arr =>
            arr->Array.map(x =>
              decodeBookingAPIEntity(x)->Utils.getResultExn(~message="list is coming as undefined")
            )
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("FlowStatusACTIVEBookings ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: flowStatusACTIVEBookings) => {
  req->asJson
}
