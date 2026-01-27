open Utils

type waitingForOfferStatus = {
  validTill: string,
  estimateId: string,
  providerId: option<string>,
}
type driverOfferedQuoteStatus = {
  bookingId: string,
  validTill: string,
  fareProductType: option<string>,
}
module FlowStatusType = {
  type flowStatus =
    | IDLE
    | WAITING_FOR_DRIVER_ASSIGNMENT(driverOfferedQuoteStatus)
    | WAITING_FOR_DRIVER_OFFERS(waitingForOfferStatus)
}

let getWaitingForOfferStatus = dict => {
  {
    validTill: getString(dict, "validTill", ""),
    estimateId: getString(dict, "estimateId", ""),
    providerId: getOptionString(dict, "providerId"),
  }
}
let getDriverOfferedQuoteStatus = dict => {
  {
    bookingId: getString(dict, "bookingId", ""),
    validTill: getString(dict, "validTill", ""),
    fareProductType: getOptionString(dict, "fareProductType"),
  }
}
open FlowStatusType

type flowStatusRes = {
  currentStatus: flowStatus,
  isValueAddNP: option<bool>,
}

let getCurrentStatus = (dict, key) => {
  switch dict
  ->Dict.get(key)
  ->Option.flatMap(JSON.Decode.object) {
  | Some(currentStatus) =>
    switch currentStatus
    ->Dict.get("status")
    ->Option.flatMap(JSON.Decode.string) {
    | Some(status) =>
      switch status {
      | "IDLE" => IDLE
      | "WAITING_FOR_DRIVER_OFFERS" =>
        WAITING_FOR_DRIVER_OFFERS(getWaitingForOfferStatus(currentStatus))
      | "WAITING_FOR_DRIVER_ASSIGNMENT" =>
        WAITING_FOR_DRIVER_ASSIGNMENT(getDriverOfferedQuoteStatus(currentStatus))
      | _ => IDLE
      }
    | None => IDLE
    }
  | None => IDLE
  }
}

let itemToObjectMapper = dict => {
  {
    currentStatus: getCurrentStatus(dict, "currentStatus"),
    isValueAddNP: getOptionBool(dict, "isValueAddNP"),
  }
}
