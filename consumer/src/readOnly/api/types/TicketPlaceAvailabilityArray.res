open TicketPlaceAvailability
open Utils

@genType
type ticketPlaceAvailabilityArray = array<ticketPlaceAvailability>

let decodeTicketPlaceAvailabilityArray = data => {
  try {
    Ok(
      data
      ->Js.Json.decodeArray
      ->Utils.getOptionExn(~message="response type is not array")
      ->Array.map(x =>
        decodeTicketPlaceAvailability(x)->Utils.getResultExn(
          ~message="error in parsing ticketPlaceAvailability",
        )
      ),
    )
  } catch {
  | err => {
      Console.log2("TicketPlaceAvailabilityArray ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: ticketPlaceAvailabilityArray) => {
  req->asJson
}
