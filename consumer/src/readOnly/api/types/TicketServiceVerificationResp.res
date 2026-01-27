open Enums
open PriceAPIEntity
open TicketBookingCategoryDetails
open Utils

@genType
type ticketServiceVerificationResp = {
  amount: option<float>,
  amountWithCurrency: option<priceAPIEntity>,
  categories: array<ticketBookingCategoryDetails>,
  endTime: option<string>,
  message: string,
  startTime: option<string>,
  status: TicketVerificationStatus.ticketVerificationStatus,
  ticketServiceName: option<string>,
  ticketServiceShortId: option<string>,
  validTill: option<string>,
  verificationCount: option<int>,
  visitDate: option<string>,
}

let decodeTicketServiceVerificationResp = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          amount: getOptionFloat(dict, "amount"),
          amountWithCurrency: dict
          ->Dict.get("amountWithCurrency")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodePriceAPIEntity(x)->Result.mapOr(None, x => Some(x))),
          categories: dict
          ->Dict.get("categories")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="categories is not of array")
          ->Array.map(x =>
            decodeTicketBookingCategoryDetails(x)->Utils.getResultExn(
              ~message="categories is coming as undefined",
            )
          ),
          endTime: getOptionString(dict, "endTime"),
          message: getOptionString(dict, "message")->Option.getExn(~message="message not found"),
          startTime: getOptionString(dict, "startTime"),
          status: TicketVerificationStatus.decodeTicketVerificationStatusResult(
            dict,
            "status",
          )->Utils.getResultExn(~message="status is coming as undefined"),
          ticketServiceName: getOptionString(dict, "ticketServiceName"),
          ticketServiceShortId: getOptionString(dict, "ticketServiceShortId"),
          validTill: getOptionString(dict, "validTill"),
          verificationCount: getOptionInt(dict, "verificationCount"),
          visitDate: getOptionString(dict, "visitDate"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("TicketServiceVerificationResp ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: ticketServiceVerificationResp) => {
  req->asJson
}
