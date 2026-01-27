open TicketBookingAPIEntityV2
open Utils

@genType
type ticketBookingAPIEntityV2Array = array<ticketBookingAPIEntityV2>

let decodeTicketBookingAPIEntityV2Array = data => {
  try {
    Ok(
      data
      ->Js.Json.decodeArray
      ->Utils.getOptionExn(~message="response type is not array")
      ->Array.map(x =>
        decodeTicketBookingAPIEntityV2(x)->Utils.getResultExn(
          ~message="error in parsing ticketBookingAPIEntityV2",
        )
      ),
    )
  } catch {
  | err => {
      Console.log2("TicketBookingAPIEntityV2Array ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: ticketBookingAPIEntityV2Array) => {
  req->asJson
}
