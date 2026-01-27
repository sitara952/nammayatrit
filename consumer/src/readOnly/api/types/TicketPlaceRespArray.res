open TicketPlaceResp
open Utils

@genType
type ticketPlaceRespArray = array<ticketPlaceResp>

let decodeTicketPlaceRespArray = data => {
  try {
    Ok(
      data
      ->Js.Json.decodeArray
      ->Utils.getOptionExn(~message="response type is not array")
      ->Array.map(x =>
        decodeTicketPlaceResp(x)->Utils.getResultExn(~message="error in parsing ticketPlaceResp")
      ),
    )
  } catch {
  | err => {
      Console.log2("TicketPlaceRespArray ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: ticketPlaceRespArray) => {
  req->asJson
}
