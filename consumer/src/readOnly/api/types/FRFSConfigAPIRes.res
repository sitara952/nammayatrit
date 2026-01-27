open Utils

@genType
type fRFSConfigAPIRes = {
  bookingEndTime: string,
  bookingStartTime: string,
  customDates: array<string>,
  customEndTime: string,
  discount: int,
  freeTicketInterval: option<int>,
  isCancellationAllowed: bool,
  isEventOngoing: bool,
  maxFreeTicketCashback: option<int>,
  metroStationTtl: int,
  oneWayTicketLimit: int,
  roundTripTicketLimit: int,
  ticketsBookedInEvent: int,
}

let decodeFRFSConfigAPIRes = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          bookingEndTime: getOptionString(dict, "bookingEndTime")->Option.getExn(
            ~message="bookingEndTime not found",
          ),
          bookingStartTime: getOptionString(dict, "bookingStartTime")->Option.getExn(
            ~message="bookingStartTime not found",
          ),
          customDates: getOptionStrArrayFromDict(dict, "customDates")->Option.getExn(
            ~message="customDates not found",
          ),
          customEndTime: getOptionString(dict, "customEndTime")->Option.getExn(
            ~message="customEndTime not found",
          ),
          discount: getOptionInt(dict, "discount")->Option.getExn(~message="discount not found"),
          freeTicketInterval: getOptionInt(dict, "freeTicketInterval"),
          isCancellationAllowed: getOptionBool(dict, "isCancellationAllowed")->Option.getExn(
            ~message="isCancellationAllowed not found",
          ),
          isEventOngoing: getOptionBool(dict, "isEventOngoing")->Option.getExn(
            ~message="isEventOngoing not found",
          ),
          maxFreeTicketCashback: getOptionInt(dict, "maxFreeTicketCashback"),
          metroStationTtl: getOptionInt(dict, "metroStationTtl")->Option.getExn(
            ~message="metroStationTtl not found",
          ),
          oneWayTicketLimit: getOptionInt(dict, "oneWayTicketLimit")->Option.getExn(
            ~message="oneWayTicketLimit not found",
          ),
          roundTripTicketLimit: getOptionInt(dict, "roundTripTicketLimit")->Option.getExn(
            ~message="roundTripTicketLimit not found",
          ),
          ticketsBookedInEvent: getOptionInt(dict, "ticketsBookedInEvent")->Option.getExn(
            ~message="ticketsBookedInEvent not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("FRFSConfigAPIRes ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: fRFSConfigAPIRes) => {
  req->asJson
}
