open Utils

@genType
type bookingData = {
  bookingId: string,
  isRoundTrip: bool,
  ticketData: array<string>,
}

let decodeBookingData = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          bookingId: getOptionString(dict, "bookingId")->Option.getExn(
            ~message="bookingId not found",
          ),
          isRoundTrip: getOptionBool(dict, "isRoundTrip")->Option.getExn(
            ~message="isRoundTrip not found",
          ),
          ticketData: getOptionStrArrayFromDict(dict, "ticketData")->Option.getExn(
            ~message="ticketData not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("BookingData ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: bookingData) => {
  req->asJson
}
