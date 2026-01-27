open TicketBookingServicePeopleCategoryCancelReq
open Utils

@genType
type ticketBookingServiceCategoryCancelReq = {
  id: string,
  peopleCategory: array<ticketBookingServicePeopleCategoryCancelReq>,
  serviceCategoryId: string,
  visitDate: string,
}

let decodeTicketBookingServiceCategoryCancelReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          id: getOptionString(dict, "id")->Option.getExn(~message="id not found"),
          peopleCategory: dict
          ->Dict.get("peopleCategory")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="peopleCategory is not of array")
          ->Array.map(x =>
            decodeTicketBookingServicePeopleCategoryCancelReq(x)->Utils.getResultExn(
              ~message="peopleCategory is coming as undefined",
            )
          ),
          serviceCategoryId: getOptionString(dict, "serviceCategoryId")->Option.getExn(
            ~message="serviceCategoryId not found",
          ),
          visitDate: getOptionString(dict, "visitDate")->Option.getExn(
            ~message="visitDate not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("TicketBookingServiceCategoryCancelReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: ticketBookingServiceCategoryCancelReq) => {
  req->asJson
}
