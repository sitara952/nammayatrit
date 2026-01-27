open Enums
open PriceAPIEntity
open Refunds
open TicketBookingServiceDetails
open Utils

@genType
type ticketBookingDetails = {
  amount: float,
  amountWithCurrency: priceAPIEntity,
  lat: float,
  lon: float,
  personId: string,
  refundDetails: array<refunds>,
  services: array<ticketBookingServiceDetails>,
  status: TicketBookingStatus.ticketBookingStatus,
  ticketPlaceId: string,
  ticketPlaceName: string,
  ticketShortId: string,
  visitDate: string,
}

let decodeTicketBookingDetails = data => {
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
          lat: getOptionFloat(dict, "lat")->Option.getExn(~message="lat not found"),
          lon: getOptionFloat(dict, "lon")->Option.getExn(~message="lon not found"),
          personId: getOptionString(dict, "personId")->Option.getExn(~message="personId not found"),
          refundDetails: dict
          ->Dict.get("refundDetails")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="refundDetails is not of array")
          ->Array.map(x =>
            decodeRefunds(x)->Utils.getResultExn(~message="refundDetails is coming as undefined")
          ),
          services: dict
          ->Dict.get("services")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="services is not of array")
          ->Array.map(x =>
            decodeTicketBookingServiceDetails(x)->Utils.getResultExn(
              ~message="services is coming as undefined",
            )
          ),
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
      Console.log2("TicketBookingDetails ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: ticketBookingDetails) => {
  req->asJson
}
