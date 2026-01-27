open Enums
open PriceAPIEntity
open TicketBookingCategoryDetails
open Utils

@genType
type ticketBookingServiceDetails = {
  allowCancellation: bool,
  amount: float,
  amountWithCurrency: priceAPIEntity,
  businessHourId: option<string>,
  categories: array<ticketBookingCategoryDetails>,
  expiryDate: option<string>,
  noteInfo: option<string>,
  slot: option<string>,
  status: ServiceStatus.serviceStatus,
  ticketServiceName: string,
  ticketServiceShortId: string,
  verificationCount: int,
}

let decodeTicketBookingServiceDetails = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          allowCancellation: getOptionBool(dict, "allowCancellation")->Option.getExn(
            ~message="allowCancellation not found",
          ),
          amount: getOptionFloat(dict, "amount")->Option.getExn(~message="amount not found"),
          amountWithCurrency: dict
          ->Dict.get("amountWithCurrency")
          ->Option.getExn(~message="amountWithCurrency is not found")
          ->decodePriceAPIEntity
          ->Utils.getResultExn(~message="amountWithCurrency is coming as undefined"),
          businessHourId: getOptionString(dict, "businessHourId"),
          categories: dict
          ->Dict.get("categories")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="categories is not of array")
          ->Array.map(x =>
            decodeTicketBookingCategoryDetails(x)->Utils.getResultExn(
              ~message="categories is coming as undefined",
            )
          ),
          expiryDate: getOptionString(dict, "expiryDate"),
          noteInfo: getOptionString(dict, "noteInfo"),
          slot: getOptionString(dict, "slot"),
          status: ServiceStatus.decodeServiceStatusResult(dict, "status")->Utils.getResultExn(
            ~message="status is coming as undefined",
          ),
          ticketServiceName: getOptionString(dict, "ticketServiceName")->Option.getExn(
            ~message="ticketServiceName not found",
          ),
          ticketServiceShortId: getOptionString(dict, "ticketServiceShortId")->Option.getExn(
            ~message="ticketServiceShortId not found",
          ),
          verificationCount: getOptionInt(dict, "verificationCount")->Option.getExn(
            ~message="verificationCount not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("TicketBookingServiceDetails ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: ticketBookingServiceDetails) => {
  req->asJson
}
