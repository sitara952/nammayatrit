open TicketPlace
open Utils

@genType
type ticketPlaceArray = array<ticketPlace>

let decodeTicketPlaceArray = data => {
  try {
    Ok(
      data
      ->Js.Json.decodeArray
      ->Utils.getOptionExn(~message="response type is not array")
      ->Array.map(x =>
        decodeTicketPlace(x)->Utils.getResultExn(~message="error in parsing ticketPlace")
      ),
    )
  } catch {
  | err => {
      Console.log2("TicketPlaceArray ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: ticketPlaceArray) => {
  req->asJson
}
