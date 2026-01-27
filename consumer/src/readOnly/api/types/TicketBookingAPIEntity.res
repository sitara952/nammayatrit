open Enums
open PriceAPIEntity
open Utils

@genType
type ticketBookingAPIEntity = {
  amount: float,
  amountWithCurrency: priceAPIEntity,
  personId: string,
  status: TicketBookingStatus.ticketBookingStatus,
  ticketPlaceId: string,
  ticketPlaceName: string,
  ticketShortId: string,
  visitDate: string,
}

let decodeTicketBookingAPIEntity = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          amount: getOptionFloat(dict, "amount")->Option.getExn(~message="amount not found"),
          amountWithCurrency: dict
          ->Dict.get("amountWithCurrency")
          ->Option.getExn(~message="amountWithCurrency is not found")
          ->decodePriceAPIEntity
          ->Utils.getResultExn(~message="amountWithCurrency is coming as undefined"),
          personId: getOptionString(dict, "personId")->Option.getExn(~message="personId not found"),
          status: TicketBookingStatus.decodeTicketBookingStatusResult(
            dict,
            "status",
          )->Utils.getResultExn(~message="status is coming as undefined"),
          ticketPlaceId: getOptionString(dict, "ticketPlaceId")->Option.getExn(
            ~message="ticketPlaceId not found",
          ),
          ticketPlaceName: getOptionString(dict, "ticketPlaceName")->Option.getExn(
            ~message="ticketPlaceName not found",
          ),
          ticketShortId: getOptionString(dict, "ticketShortId")->Option.getExn(
            ~message="ticketShortId not found",
          ),
          visitDate: getOptionString(dict, "visitDate")->Option.getExn(
            ~message="visitDate not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("TicketBookingAPIEntity ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: ticketBookingAPIEntity) => {
  req->asJson
}
