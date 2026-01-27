open LegRouteInfo
open LegServiceTier
open LegSplitInfo
open Utils
open CategoryInfoResponse

@genType
type subwayLegExtraInfo = {
  bookingId: option<string>,
  deviceId: option<string>,
  providerName: option<string>,
  providerRouteId: option<string>,
  categories: option<array<categoryInfoResponse>>,
  refund: option<legSplitInfo>,
  routeInfo: array<legRouteInfo>,
  sdkToken: option<string>,
  selectedServiceTier: option<legServiceTier>,
  ticketNo: option<array<string>>,
  ticketTypeCode: option<string>,
  ticketValidity: option<array<string>>,
  ticketValidityHours: array<int>,
  tickets: option<array<string>>,
  ticketsCreatedAt: option<array<string>>,
}

let decodeSubwayLegExtraInfo = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          bookingId: getOptionString(dict, "bookingId"),
          deviceId: getOptionString(dict, "deviceId"),
          providerName: getOptionString(dict, "providerName"),
          providerRouteId: getOptionString(dict, "providerRouteId"),
          refund: dict
          ->Dict.get("refund")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeLegSplitInfo(x)->Result.mapOr(None, x => Some(x))),
          routeInfo: dict
          ->Dict.get("routeInfo")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="routeInfo is not of array")
          ->Array.map(x =>
            decodeLegRouteInfo(x)->Utils.getResultExn(~message="routeInfo is coming as undefined")
          ),
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
          sdkToken: getOptionString(dict, "sdkToken"),
          selectedServiceTier: dict
          ->Dict.get("selectedServiceTier")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeLegServiceTier(x)->Result.mapOr(None, x => Some(x))),
          ticketNo: getOptionStrArrayFromDict(dict, "ticketNo"),
          ticketTypeCode: getOptionString(dict, "ticketTypeCode"),
          ticketValidity: getOptionStrArrayFromDict(dict, "ticketValidity"),
          ticketValidityHours: getOptionIntArrayFromDict(
            dict,
            "ticketValidityHours",
          )->Option.getExn(~message="ticketValidityHours not found"),
          tickets: getOptionStrArrayFromDict(dict, "tickets"),
          ticketsCreatedAt: getOptionStrArrayFromDict(dict, "ticketsCreatedAt"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("SubwayLegExtraInfo ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: subwayLegExtraInfo) => {
  req->asJson
}
