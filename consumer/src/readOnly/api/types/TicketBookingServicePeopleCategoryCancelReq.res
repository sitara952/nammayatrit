open Utils

@genType
type ticketBookingServicePeopleCategoryCancelReq = {
  id: string,
  quantity: int,
}

let decodeTicketBookingServicePeopleCategoryCancelReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          id: getOptionString(dict, "id")->Option.getExn(~message="id not found"),
          quantity: getOptionInt(dict, "quantity")->Option.getExn(~message="quantity not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("TicketBookingServicePeopleCategoryCancelReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: ticketBookingServicePeopleCategoryCancelReq) => {
  req->asJson
}
