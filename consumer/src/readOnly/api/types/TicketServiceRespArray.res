open TicketServiceResp
open Utils

@genType
type ticketServiceRespArray = array<ticketServiceResp>

let decodeTicketServiceRespArray = data => {
  try {
    Ok(
      data
      ->Js.Json.decodeArray
      ->Utils.getOptionExn(~message="response type is not array")
      ->Array.map(x =>
        decodeTicketServiceResp(x)->Utils.getResultExn(
          ~message="error in parsing ticketServiceResp",
        )
      ),
    )
  } catch {
  | err => {
      Console.log2("TicketServiceRespArray ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: ticketServiceRespArray) => {
  req->asJson
}
