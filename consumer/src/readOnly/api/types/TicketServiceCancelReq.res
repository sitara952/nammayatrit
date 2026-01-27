open Utils

@genType
type ticketServiceCancelReq = {
  businessHourId: string,
  date: string,
  description: option<string>,
  ticketServiceCategoryId: string,
  ticketServiceId: string,
}

let decodeTicketServiceCancelReq = data => {
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
          date: getOptionString(dict, "date")->Option.getExn(~message="date not found"),
          description: getOptionString(dict, "description"),
          ticketServiceCategoryId: getOptionString(dict, "ticketServiceCategoryId")->Option.getExn(
            ~message="ticketServiceCategoryId not found",
          ),
          ticketServiceId: getOptionString(dict, "ticketServiceId")->Option.getExn(
            ~message="ticketServiceId not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("TicketServiceCancelReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: ticketServiceCancelReq) => {
  req->asJson
}
