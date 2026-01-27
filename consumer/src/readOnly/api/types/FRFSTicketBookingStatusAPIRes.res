open Enums
open FRFSBookingPaymentAPI
open FRFSDiscountRes
open FRFSRouteStationsAPI
open FRFSStationAPI
open FRFSTicketAPI
open PriceAPIEntity
open Utils

@genType
type fRFSTicketBookingStatusAPIRes = {
  _type: FRFSQuoteType.fRFSQuoteType,
  bookingId: string,
  city: string,
  createdAt: string,
  discountedTickets: option<int>,
  discounts: option<array<fRFSDiscountRes>>,
  eventDiscountAmount: option<float>,
  googleWalletJWTUrl: option<string>,
  integratedBppConfigId: string,
  isFareChanged: option<bool>,
  payment: option<fRFSBookingPaymentAPI>,
  price: float,
  priceWithCurrency: priceAPIEntity,
  quantity: int,
  routeStations: option<array<fRFSRouteStationsAPI>>,
  stations: array<fRFSStationAPI>,
  status: FRFSTicketBookingStatus.fRFSTicketBookingStatus,
  tickets: array<fRFSTicketAPI>,
  updatedAt: string,
  validTill: string,
  vehicleType: VehicleCategory.vehicleCategory,
}

let decodeFRFSTicketBookingStatusAPIRes = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          _type: FRFSQuoteType.decodeFRFSQuoteTypeResult(dict, "_type")->Utils.getResultExn(
            ~message="_type is coming as undefined",
          ),
          bookingId: getOptionString(dict, "bookingId")->Option.getExn(
            ~message="bookingId not found",
          ),
          city: getOptionString(dict, "city")->Option.getExn(~message="city not found"),
          createdAt: getOptionString(dict, "createdAt")->Option.getExn(
            ~message="createdAt not found",
          ),
          discountedTickets: getOptionInt(dict, "discountedTickets"),
          discounts: dict
          ->Dict.get("discounts")
          ->Option.flatMap(jsonNullToOption)
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.map(arr =>
            arr->Array.map(x =>
              decodeFRFSDiscountRes(x)->Utils.getResultExn(
                ~message="discounts is coming as undefined",
              )
            )
          ),
          eventDiscountAmount: getOptionFloat(dict, "eventDiscountAmount"),
          googleWalletJWTUrl: getOptionString(dict, "googleWalletJWTUrl"),
          integratedBppConfigId: getOptionString(dict, "integratedBppConfigId")->Option.getExn(
            ~message="integratedBppConfigId not found",
          ),
          isFareChanged: getOptionBool(dict, "isFareChanged"),
          payment: dict
          ->Dict.get("payment")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x =>
            decodeFRFSBookingPaymentAPI(x)->Result.mapOr(None, x => Some(x))
          ),
          price: getOptionFloat(dict, "price")->Option.getExn(~message="price not found"),
          priceWithCurrency: dict
          ->Dict.get("priceWithCurrency")
          ->Option.getExn(~message="priceWithCurrency is not found")
          ->decodePriceAPIEntity
          ->Utils.getResultExn(~message="priceWithCurrency is coming as undefined"),
          quantity: getOptionInt(dict, "quantity")->Option.getExn(~message="quantity not found"),
          routeStations: dict
          ->Dict.get("routeStations")
          ->Option.flatMap(jsonNullToOption)
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.map(arr =>
            arr->Array.map(x =>
              decodeFRFSRouteStationsAPI(x)->Utils.getResultExn(
                ~message="routeStations is coming as undefined",
              )
            )
          ),
          stations: dict
          ->Dict.get("stations")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="stations is not of array")
          ->Array.map(x =>
            decodeFRFSStationAPI(x)->Utils.getResultExn(~message="stations is coming as undefined")
          ),
          status: FRFSTicketBookingStatus.decodeFRFSTicketBookingStatusResult(
            dict,
            "status",
          )->Utils.getResultExn(~message="status is coming as undefined"),
          tickets: dict
          ->Dict.get("tickets")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="tickets is not of array")
          ->Array.map(x =>
            decodeFRFSTicketAPI(x)->Utils.getResultExn(~message="tickets is coming as undefined")
          ),
          updatedAt: getOptionString(dict, "updatedAt")->Option.getExn(
            ~message="updatedAt not found",
          ),
          validTill: getOptionString(dict, "validTill")->Option.getExn(
            ~message="validTill not found",
          ),
          vehicleType: VehicleCategory.decodeVehicleCategoryResult(
            dict,
            "vehicleType",
          )->Utils.getResultExn(~message="vehicleType is coming as undefined"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("FRFSTicketBookingStatusAPIRes ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: fRFSTicketBookingStatusAPIRes) => {
  req->asJson
}
