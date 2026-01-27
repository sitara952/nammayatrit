open TicketBookingServiceCategoryCancelReq
open Utils

@genType
type ticketBookingServiceCancelReq = {
  businessHourId: string,
  serviceCategory: array<ticketBookingServiceCategoryCancelReq>,
  shortId: string,
}

let decodeTicketBookingServiceCancelReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          businessHourId: getOptionString(dict, "businessHourId")->Option.getExn(
            ~message="businessHourId not found",
          ),
          serviceCategory: dict
          ->Dict.get("serviceCategory")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="serviceCategory is not of array")
          ->Array.map(x =>
            decodeTicketBookingServiceCategoryCancelReq(x)->Utils.getResultExn(
              ~message="serviceCategory is coming as undefined",
            )
          ),
          shortId: getOptionString(dict, "shortId")->Option.getExn(~message="shortId not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("TicketBookingServiceCancelReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: ticketBookingServiceCancelReq) => {
  req->asJson
}
