open Utils

@genType
type activeTicketsRes = {
  rideId: option<string>,
  ticketId: string,
}

let decodeActiveTicketsRes = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          rideId: getOptionString(dict, "rideId"),
          ticketId: getOptionString(dict, "ticketId")->Option.getExn(~message="ticketId not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("ActiveTicketsRes ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: activeTicketsRes) => {
  req->asJson
}
