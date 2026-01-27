open BookingAPIEntity
open JourneyInfoResp
open Utils

@genType
type bookingAPIEntityV2 = Ride(bookingAPIEntity) | MultiModalRide(journeyInfoResp)

let decodeBookingAPIEntityV2 = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          switch getOptionString(dict, "tag") {
          | Some("Ride") =>
            dict
            ->Dict.get("contents")
            ->Option.getExn(~message="contents is not found")
            ->decodeBookingAPIEntity
            ->Result.map(x => Ride(x))
            ->Utils.getResultExn(~message="contents is coming as undefined")
          | Some("MultiModalRide") =>
            dict
            ->Dict.get("contents")
            ->Option.getExn(~message="contents is not found")
            ->decodeJourneyInfoResp
            ->Result.map(x => MultiModalRide(x))
            ->Utils.getResultExn(~message="contents is coming as undefined")
          | _ => Js.Exn.raiseError("Invalid tag value")
          }
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("BookingAPIEntityV2 ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: bookingAPIEntityV2) => {
  req->asJson
}
