open TicketBookingServicesReq
open Utils

@genType
type ticketBookingReq = {
  services: array<ticketBookingServicesReq>,
  ticketSubPlaceId: option<string>,
  visitDate: string,
}

let decodeTicketBookingReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          services: dict
          ->Dict.get("services")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="services is not of array")
          ->Array.map(x =>
            decodeTicketBookingServicesReq(x)->Utils.getResultExn(
              ~message="services is coming as undefined",
            )
          ),
          ticketSubPlaceId: getOptionString(dict, "ticketSubPlaceId"),
          visitDate: getOptionString(dict, "visitDate")->Option.getExn(
            ~message="visitDate not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("TicketBookingReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: ticketBookingReq) => {
  req->asJson
}
