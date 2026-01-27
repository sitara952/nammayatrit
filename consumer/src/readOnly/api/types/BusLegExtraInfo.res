open Enums
open CategoryInfoResponse
open FRFSDiscountRes
open FRFSStationAPI
open LegServiceTier
open LegSplitInfo
open Utils

@genType
type busLegExtraInfo = {
  alternateShortNames: array<string>,
  bookingId: option<string>,
  categories: option<array<categoryInfoResponse>>,
  destinationStop: fRFSStationAPI,
  discounts: option<array<fRFSDiscountRes>>,
  fleetNo: option<string>,
  frequency: option<int>,
  originStop: fRFSStationAPI,
  providerName: option<string>,
  refund: option<legSplitInfo>,
  routeCode: string,
  routeName: option<string>,
  selectedServiceTier: option<legServiceTier>,
  busConductorId: option<string>,
  busDriverId: option<string>,
  ticketNo: option<array<string>>,
  ticketValidity: option<array<string>>,
  tickets: option<array<string>>,
  ticketsCreatedAt: option<array<string>>,
  trackingStatus: option<TrackingStatus.trackingStatus>,
  trackingStatusLastUpdatedAt: option<string>,
}

let decodeBusLegExtraInfo = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          alternateShortNames: getOptionStrArrayFromDict(
            dict,
            "alternateShortNames",
          )->Option.getExn(~message="alternateShortNames not found"),
          bookingId: getOptionString(dict, "bookingId"),
          categories: dict
          ->Dict.get("categories")
          ->Option.flatMap(jsonNullToOption)
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.map(arr =>
            arr->Array.map(x =>
              decodeCategoryInfoResponse(x)->Utils.getResultExn(
                ~message="categories is coming as undefined",
              )
            )
          ),
          destinationStop: dict
          ->Dict.get("destinationStop")
          ->Option.getExn(~message="destinationStop is not found")
          ->decodeFRFSStationAPI
          ->Utils.getResultExn(~message="destinationStop is coming as undefined"),
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
          fleetNo: getOptionString(dict, "fleetNo"),
          frequency: getOptionInt(dict, "frequency"),
          originStop: dict
          ->Dict.get("originStop")
          ->Option.getExn(~message="originStop is not found")
          ->decodeFRFSStationAPI
          ->Utils.getResultExn(~message="originStop is coming as undefined"),
          providerName: getOptionString(dict, "providerName"),
          refund: dict
          ->Dict.get("refund")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeLegSplitInfo(x)->Result.mapOr(None, x => Some(x))),
          routeCode: getOptionString(dict, "routeCode")->Option.getExn(
            ~message="routeCode not found",
          ),
          routeName: getOptionString(dict, "routeName"),
          selectedServiceTier: dict
          ->Dict.get("selectedServiceTier")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeLegServiceTier(x)->Result.mapOr(None, x => Some(x))),
          busConductorId: getOptionString(dict, "busConductorId"),
          busDriverId: getOptionString(dict, "busDriverId"),
          ticketNo: getOptionStrArrayFromDict(dict, "ticketNo"),
          ticketValidity: getOptionStrArrayFromDict(dict, "ticketValidity"),
          tickets: getOptionStrArrayFromDict(dict, "tickets"),
          ticketsCreatedAt: getOptionStrArrayFromDict(dict, "ticketsCreatedAt"),
          trackingStatus: TrackingStatus.decodeTrackingStatusResult(
            dict,
            "trackingStatus",
          )->Result.mapOr(None, x => Some(x)),
          trackingStatusLastUpdatedAt: getOptionString(dict, "trackingStatusLastUpdatedAt"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("BusLegExtraInfo ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: busLegExtraInfo) => {
  req->asJson
}
