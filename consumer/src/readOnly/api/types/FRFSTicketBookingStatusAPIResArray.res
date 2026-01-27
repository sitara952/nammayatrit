open FRFSTicketBookingStatusAPIRes
open Utils

@genType
type fRFSTicketBookingStatusAPIResArray = array<fRFSTicketBookingStatusAPIRes>

let decodeFRFSTicketBookingStatusAPIResArray = data => {
  try {
    Ok(
      data
      ->Js.Json.decodeArray
      ->Utils.getOptionExn(~message="response type is not array")
      ->Array.map(x =>
        decodeFRFSTicketBookingStatusAPIRes(x)->Utils.getResultExn(
          ~message="error in parsing fRFSTicketBookingStatusAPIRes",
        )
      ),
    )
  } catch {
  | err => {
      Console.log2("FRFSTicketBookingStatusAPIResArray ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: fRFSTicketBookingStatusAPIResArray) => {
  req->asJson
}
