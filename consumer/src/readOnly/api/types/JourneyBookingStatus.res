open Enums
open BookingStatus
open EstimateStatus
open FRFSTicketBookingStatus
open FRFSTicketStatus
open FeedbackStatus
open InitialStatus
open RideStatus
open Utils

@genType
type journeyBookingStatus =
  | TaxiEstimate(estimateStatus)
  | TaxiBooking(bookingStatus)
  | TaxiRide(rideStatus)
  | FRFSBooking(fRFSTicketBookingStatus)
  | FRFSTicket(fRFSTicketStatus)
  | Feedback(feedbackStatus)
  | Initial(initialStatus)

let decodeJourneyBookingStatus = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          switch getOptionString(dict, "tag") {
          | Some("TaxiEstimate") =>
            dict
            ->Dict.get("contents")
            ->Option.getExn(~message="contents is not found")
            ->decodeEstimateStatus
            ->Result.map(x => TaxiEstimate(x))
            ->Utils.getResultExn(~message="contents is coming as undefined")
          | Some("TaxiBooking") =>
            dict
            ->Dict.get("contents")
            ->Option.getExn(~message="contents is not found")
            ->decodeBookingStatus
            ->Result.map(x => TaxiBooking(x))
            ->Utils.getResultExn(~message="contents is coming as undefined")
          | Some("TaxiRide") =>
            dict
            ->Dict.get("contents")
            ->Option.getExn(~message="contents is not found")
            ->decodeRideStatus
            ->Result.map(x => TaxiRide(x))
            ->Utils.getResultExn(~message="contents is coming as undefined")
          | Some("FRFSBooking") =>
            dict
            ->Dict.get("contents")
            ->Option.getExn(~message="contents is not found")
            ->decodeFRFSTicketBookingStatus
            ->Result.map(x => FRFSBooking(x))
            ->Utils.getResultExn(~message="contents is coming as undefined")
          | Some("FRFSTicket") =>
            dict
            ->Dict.get("contents")
            ->Option.getExn(~message="contents is not found")
            ->decodeFRFSTicketStatus
            ->Result.map(x => FRFSTicket(x))
            ->Utils.getResultExn(~message="contents is coming as undefined")
          | Some("Feedback") =>
            dict
            ->Dict.get("contents")
            ->Option.getExn(~message="contents is not found")
            ->decodeFeedbackStatus
            ->Result.map(x => Feedback(x))
            ->Utils.getResultExn(~message="contents is coming as undefined")
          | Some("Initial") =>
            dict
            ->Dict.get("contents")
            ->Option.getExn(~message="contents is not found")
            ->decodeInitialStatus
            ->Result.map(x => Initial(x))
            ->Utils.getResultExn(~message="contents is coming as undefined")
          | _ => Js.Exn.raiseError("Invalid tag value")
          }
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("JourneyBookingStatus ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: journeyBookingStatus) => {
  req->asJson
}
