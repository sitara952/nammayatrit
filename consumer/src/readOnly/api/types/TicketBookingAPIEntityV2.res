open Enums
open PeopleTicketQuantity
open PriceAPIEntity
open Utils

@genType
type ticketBookingAPIEntityV2 = {
  amount: float,
  amountWithCurrency: priceAPIEntity,
  iconUrl: option<string>,
  peopleTicketQuantity: option<array<peopleTicketQuantity>>,
  personId: string,
  placeType: option<PlaceType.placeType>,
  status: TicketBookingStatus.ticketBookingStatus,
  ticketPlaceId: string,
  ticketPlaceName: string,
  ticketShortId: string,
  visitDate: string,
}

let decodeTicketBookingAPIEntityV2 = data => {
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
          iconUrl: getOptionString(dict, "iconUrl"),
          peopleTicketQuantity: dict
          ->Dict.get("peopleTicketQuantity")
          ->Option.flatMap(jsonNullToOption)
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.map(arr =>
            arr->Array.map(x =>
              decodePeopleTicketQuantity(x)->Utils.getResultExn(
                ~message="peopleTicketQuantity is coming as undefined",
              )
            )
          ),
          personId: getOptionString(dict, "personId")->Option.getExn(~message="personId not found"),
          placeType: PlaceType.decodePlaceTypeResult(dict, "placeType")->Result.mapOr(
            None,
            x => Some(x),
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
      Console.log2("TicketBookingAPIEntityV2 ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: ticketBookingAPIEntityV2) => {
  req->asJson
}
