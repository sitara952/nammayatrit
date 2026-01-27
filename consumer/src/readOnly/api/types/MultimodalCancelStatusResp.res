open Enums
open Utils

@genType
type multimodalCancelStatusResp = {
  bookingStatus: FRFSTicketBookingStatus.fRFSTicketBookingStatus,
  cancellationCharges: option<float>,
  isCancellable: option<bool>,
  refundAmount: option<float>,
}

let decodeMultimodalCancelStatusResp = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          bookingStatus: FRFSTicketBookingStatus.decodeFRFSTicketBookingStatusResult(
            dict,
            "bookingStatus",
          )->Utils.getResultExn(~message="bookingStatus is coming as undefined"),
          cancellationCharges: getOptionFloat(dict, "cancellationCharges"),
          isCancellable: getOptionBool(dict, "isCancellable"),
          refundAmount: getOptionFloat(dict, "refundAmount"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("MultimodalCancelStatusResp ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: multimodalCancelStatusResp) => {
  req->asJson
}
