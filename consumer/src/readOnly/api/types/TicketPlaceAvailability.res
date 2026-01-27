open Utils

@genType
type ticketPlaceAvailability = {
  closedDays: array<int>,
  month: int,
}

let decodeTicketPlaceAvailability = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          closedDays: getOptionIntArrayFromDict(dict, "closedDays")->Option.getExn(
            ~message="closedDays not found",
          ),
          month: getOptionInt(dict, "month")->Option.getExn(~message="month not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("TicketPlaceAvailability ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: ticketPlaceAvailability) => {
  req->asJson
}
