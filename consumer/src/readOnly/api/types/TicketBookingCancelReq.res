open TicketBookingServiceCancelReq
open Utils

@genType
type ticketBookingCancelReq = {
  ticketBookingServices: array<ticketBookingServiceCancelReq>,
  ticketBookingShortId: string,
}

let decodeTicketBookingCancelReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          ticketBookingServices: dict
          ->Dict.get("ticketBookingServices")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="ticketBookingServices is not of array")
          ->Array.map(x =>
            decodeTicketBookingServiceCancelReq(x)->Utils.getResultExn(
              ~message="ticketBookingServices is coming as undefined",
            )
          ),
          ticketBookingShortId: getOptionString(dict, "ticketBookingShortId")->Option.getExn(
            ~message="ticketBookingShortId not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("TicketBookingCancelReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: ticketBookingCancelReq) => {
  req->asJson
}
