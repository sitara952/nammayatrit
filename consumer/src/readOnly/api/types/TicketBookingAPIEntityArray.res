open TicketBookingAPIEntity
open Utils

@genType
type ticketBookingAPIEntityArray = array<ticketBookingAPIEntity>

let decodeTicketBookingAPIEntityArray = data => {
  try {
    Ok(
      data
      ->Js.Json.decodeArray
      ->Utils.getOptionExn(~message="response type is not array")
      ->Array.map(x =>
        decodeTicketBookingAPIEntity(x)->Utils.getResultExn(
          ~message="error in parsing ticketBookingAPIEntity",
        )
      ),
    )
  } catch {
  | err => {
      Console.log2("TicketBookingAPIEntityArray ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: ticketBookingAPIEntityArray) => {
  req->asJson
}
