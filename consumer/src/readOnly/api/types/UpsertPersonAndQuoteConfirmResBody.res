open FRFSTicketBookingStatusAPIRes
open Utils

@genType
type upsertPersonAndQuoteConfirmResBody = {
  bookingInfo: fRFSTicketBookingStatusAPIRes,
  token: string,
}

let decodeUpsertPersonAndQuoteConfirmResBody = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          bookingInfo: dict
          ->Dict.get("bookingInfo")
          ->Option.getExn(~message="bookingInfo is not found")
          ->decodeFRFSTicketBookingStatusAPIRes
          ->Utils.getResultExn(~message="bookingInfo is coming as undefined"),
          token: getOptionString(dict, "token")->Option.getExn(~message="token not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("UpsertPersonAndQuoteConfirmResBody ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: upsertPersonAndQuoteConfirmResBody) => {
  req->asJson
}
