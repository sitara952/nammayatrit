open PriceAPIEntity
open TicketBookingPeopleCategoryDetails
open Utils

@genType
type ticketBookingCategoryDetails = {
  amount: float,
  amountToRefund: option<float>,
  amountWithCurrency: priceAPIEntity,
  bookedSeats: int,
  cancelledSeats: option<int>,
  id: string,
  name: string,
  peopleCategories: array<ticketBookingPeopleCategoryDetails>,
  serviceCategoryId: option<string>,
}

let decodeTicketBookingCategoryDetails = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          amount: getOptionFloat(dict, "amount")->Option.getExn(~message="amount not found"),
          amountToRefund: getOptionFloat(dict, "amountToRefund"),
          amountWithCurrency: dict
          ->Dict.get("amountWithCurrency")
          ->Option.getExn(~message="amountWithCurrency is not found")
          ->decodePriceAPIEntity
          ->Utils.getResultExn(~message="amountWithCurrency is coming as undefined"),
          bookedSeats: getOptionInt(dict, "bookedSeats")->Option.getExn(
            ~message="bookedSeats not found",
          ),
          cancelledSeats: getOptionInt(dict, "cancelledSeats"),
          id: getOptionString(dict, "id")->Option.getExn(~message="id not found"),
          name: getOptionString(dict, "name")->Option.getExn(~message="name not found"),
          peopleCategories: dict
          ->Dict.get("peopleCategories")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="peopleCategories is not of array")
          ->Array.map(x =>
            decodeTicketBookingPeopleCategoryDetails(x)->Utils.getResultExn(
              ~message="peopleCategories is coming as undefined",
            )
          ),
          serviceCategoryId: getOptionString(dict, "serviceCategoryId"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("TicketBookingCategoryDetails ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: ticketBookingCategoryDetails) => {
  req->asJson
}
