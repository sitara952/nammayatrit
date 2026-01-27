open BookingAPIEntity
open FlowStatusACTIVEBookings
open FlowStatusACTIVEJourneys
open FlowStatusWaitingForDriverAssignment
open FlowStatusWaitingForDriverOffers
open Utils

@genType
type flowStatus =
  | IDLE
  | WAITING_FOR_DRIVER_OFFERS(flowStatusWaitingForDriverOffers)
  | WAITING_FOR_DRIVER_ASSIGNMENT(flowStatusWaitingForDriverAssignment)
  | ACTIVE_BOOKINGS(flowStatusACTIVEBookings)
  | ACTIVE_JOURNEYS(flowStatusACTIVEJourneys)
  | FEEDBACK_PENDING(bookingAPIEntity)

let decodeFlowStatus = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          switch getOptionString(dict, "status") {
          | Some("IDLE") => IDLE
          | Some("WAITING_FOR_DRIVER_OFFERS") =>
            data
            ->decodeFlowStatusWaitingForDriverOffers
            ->Result.map(x => WAITING_FOR_DRIVER_OFFERS(x))
            ->Utils.getResultExn(~message="info is coming as undefined")
          | Some("WAITING_FOR_DRIVER_ASSIGNMENT") =>
            data
            ->decodeFlowStatusWaitingForDriverAssignment
            ->Result.map(x => WAITING_FOR_DRIVER_ASSIGNMENT(x))
            ->Utils.getResultExn(~message="info is coming as undefined")
          | Some("ACTIVE_BOOKINGS") =>
            data
            ->decodeFlowStatusACTIVEBookings
            ->Result.map(x => ACTIVE_BOOKINGS(x))
            ->Utils.getResultExn(~message="info is coming as undefined")
          | Some("ACTIVE_JOURNEYS") =>
            data
            ->decodeFlowStatusACTIVEJourneys
            ->Result.map(x => ACTIVE_JOURNEYS(x))
            ->Utils.getResultExn(~message="info is coming as undefined")
          | Some("FEEDBACK_PENDING") =>
            dict
            ->Dict.get("info")
            ->Option.getExn(~message="info is not found")
            ->decodeBookingAPIEntity
            ->Result.map(x => FEEDBACK_PENDING(x))
            ->Utils.getResultExn(~message="info is coming as undefined")
          | _ => Js.Exn.raiseError("Invalid status value")
          }
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("FlowStatus ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: flowStatus) => {
  req->asJson
}
