open Utils

@genType
type ticketBookingUpdateSeatsReq = {
  businessHourId: string,
  categoryId: string,
  date: string,
  ticketServiceId: string,
  updatedBookedSeats: int,
}

let decodeTicketBookingUpdateSeatsReq = data => {
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
          categoryId: getOptionString(dict, "categoryId")->Option.getExn(
            ~message="categoryId not found",
          ),
          date: getOptionString(dict, "date")->Option.getExn(~message="date not found"),
          ticketServiceId: getOptionString(dict, "ticketServiceId")->Option.getExn(
            ~message="ticketServiceId not found",
          ),
          updatedBookedSeats: getOptionInt(dict, "updatedBookedSeats")->Option.getExn(
            ~message="updatedBookedSeats not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("TicketBookingUpdateSeatsReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: ticketBookingUpdateSeatsReq) => {
  req->asJson
}
