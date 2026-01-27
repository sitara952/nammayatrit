open LegRouteInfo
open LegSplitInfo
open Utils
open CategoryInfoResponse

@genType
type metroLegExtraInfo = {
  bookingId: option<string>,
  categories: option<array<categoryInfoResponse>>,
  providerName: option<string>,
  refund: option<legSplitInfo>,
  routeInfo: array<legRouteInfo>,
  ticketNo: option<array<string>>,
  ticketValidity: option<array<string>>,
  tickets: option<array<string>>,
  ticketsCreatedAt: option<array<string>>,
}

let decodeMetroLegExtraInfo = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          bookingId: getOptionString(dict, "bookingId"),
          providerName: getOptionString(dict, "providerName"),
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
          ticketNo: getOptionStrArrayFromDict(dict, "ticketNo"),
          ticketValidity: getOptionStrArrayFromDict(dict, "ticketValidity"),
          tickets: getOptionStrArrayFromDict(dict, "tickets"),
          ticketsCreatedAt: getOptionStrArrayFromDict(dict, "ticketsCreatedAt"),
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
          )
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("MetroLegExtraInfo ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: metroLegExtraInfo) => {
  req->asJson
}
