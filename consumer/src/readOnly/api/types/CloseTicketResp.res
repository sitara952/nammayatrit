open Utils

@genType
type closeTicketResp = {
  rideId: option<string>,
  ticketId: string,
  updatedAt: string,
}

let decodeCloseTicketResp = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          rideId: getOptionString(dict, "rideId"),
          ticketId: getOptionString(dict, "ticketId")->Option.getExn(~message="ticketId not found"),
          updatedAt: getOptionString(dict, "updatedAt")->Option.getExn(
            ~message="updatedAt not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("CloseTicketResp ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: closeTicketResp) => {
  req->asJson
}
