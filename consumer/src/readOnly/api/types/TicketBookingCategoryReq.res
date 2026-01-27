open TicketBookingPeopleCategoryReq
open Utils

@genType
type ticketBookingCategoryReq = {
  categoryId: string,
  peopleCategories: array<ticketBookingPeopleCategoryReq>,
}

let decodeTicketBookingCategoryReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          categoryId: getOptionString(dict, "categoryId")->Option.getExn(
            ~message="categoryId not found",
          ),
          peopleCategories: dict
          ->Dict.get("peopleCategories")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="peopleCategories is not of array")
          ->Array.map(x =>
            decodeTicketBookingPeopleCategoryReq(x)->Utils.getResultExn(
              ~message="peopleCategories is coming as undefined",
            )
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("TicketBookingCategoryReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: ticketBookingCategoryReq) => {
  req->asJson
}
