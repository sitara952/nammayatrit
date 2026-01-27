open BookingUpdateRequest
open Utils

@genType
type editLocationResultAPIResp = {bookingUpdateRequestDetails: bookingUpdateRequest}

let decodeEditLocationResultAPIResp = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          bookingUpdateRequestDetails: dict
          ->Dict.get("bookingUpdateRequestDetails")
          ->Option.getExn(~message="bookingUpdateRequestDetails is not found")
          ->decodeBookingUpdateRequest
          ->Utils.getResultExn(~message="bookingUpdateRequestDetails is coming as undefined"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("EditLocationResultAPIResp ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: editLocationResultAPIResp) => {
  req->asJson
}
