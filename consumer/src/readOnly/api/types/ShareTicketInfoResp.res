open Enums
open FRFSStationAPI
open FRFSTicketAPI
open Utils

@genType
type shareTicketInfoResp = {
  bookingPrice: float,
  city: City.city,
  fromStation: fRFSStationAPI,
  partnerOrgTransactionId: option<string>,
  paymentStatus: FRFSBookingPaymentStatusAPI.fRFSBookingPaymentStatusAPI,
  returnType: FRFSQuoteType.fRFSQuoteType,
  tickets: array<fRFSTicketAPI>,
  toStation: fRFSStationAPI,
}

let decodeShareTicketInfoResp = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          bookingPrice: getOptionFloat(dict, "bookingPrice")->Option.getExn(
            ~message="bookingPrice not found",
          ),
          city: City.decodeCityResult(dict, "city")->Utils.getResultExn(
            ~message="city is coming as undefined",
          ),
          fromStation: dict
          ->Dict.get("fromStation")
          ->Option.getExn(~message="fromStation is not found")
          ->decodeFRFSStationAPI
          ->Utils.getResultExn(~message="fromStation is coming as undefined"),
          partnerOrgTransactionId: getOptionString(dict, "partnerOrgTransactionId"),
          paymentStatus: FRFSBookingPaymentStatusAPI.decodeFRFSBookingPaymentStatusAPIResult(
            dict,
            "paymentStatus",
          )->Utils.getResultExn(~message="paymentStatus is coming as undefined"),
          returnType: FRFSQuoteType.decodeFRFSQuoteTypeResult(
            dict,
            "returnType",
          )->Utils.getResultExn(~message="returnType is coming as undefined"),
          tickets: dict
          ->Dict.get("tickets")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="tickets is not of array")
          ->Array.map(x =>
            decodeFRFSTicketAPI(x)->Utils.getResultExn(~message="tickets is coming as undefined")
          ),
          toStation: dict
          ->Dict.get("toStation")
          ->Option.getExn(~message="toStation is not found")
          ->decodeFRFSStationAPI
          ->Utils.getResultExn(~message="toStation is coming as undefined"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("ShareTicketInfoResp ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: shareTicketInfoResp) => {
  req->asJson
}
