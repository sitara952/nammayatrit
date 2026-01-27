open TicketBookingCategoryReq
open Utils

@genType
type ticketBookingServicesReq = {
  businessHourId: string,
  categories: array<ticketBookingCategoryReq>,
  serviceId: string,
}

let decodeTicketBookingServicesReq = data => {
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
          categories: dict
          ->Dict.get("categories")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="categories is not of array")
          ->Array.map(x =>
            decodeTicketBookingCategoryReq(x)->Utils.getResultExn(
              ~message="categories is coming as undefined",
            )
          ),
          serviceId: getOptionString(dict, "serviceId")->Option.getExn(
            ~message="serviceId not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("TicketBookingServicesReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: ticketBookingServicesReq) => {
  req->asJson
}
