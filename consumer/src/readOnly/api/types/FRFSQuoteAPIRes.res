open Enums
open CategoryInfoResponse
open FRFSDiscountRes
open FRFSRouteStationsAPI
open FRFSStationAPI
open PriceAPIEntity
open Utils

@genType
type fRFSQuoteAPIRes = {
  _type: FRFSQuoteType.fRFSQuoteType,
  categories: array<categoryInfoResponse>,
  discountedTickets: option<int>,
  discounts: option<array<fRFSDiscountRes>>,
  eventDiscountAmount: option<float>,
  integratedBppConfigId: string,
  price: float,
  priceWithCurrency: priceAPIEntity,
  quantity: int,
  quoteId: string,
  routeStations: option<array<fRFSRouteStationsAPI>>,
  serviceTierDescription: option<string>,
  serviceTierLongName: option<string>,
  serviceTierShortName: option<string>,
  serviceTierType: option<ServiceTierType.serviceTierType>,
  stations: array<fRFSStationAPI>,
  validTill: string,
  vehicleType: VehicleCategory.vehicleCategory,
}

let decodeFRFSQuoteAPIRes = data => {
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
          categories: dict
          ->Dict.get("categories")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="categories is not of array")
          ->Array.map(x =>
            decodeCategoryInfoResponse(x)->Utils.getResultExn(
              ~message="categories is coming as undefined",
            )
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
          integratedBppConfigId: getOptionString(dict, "integratedBppConfigId")->Option.getExn(
            ~message="integratedBppConfigId not found",
          ),
          price: getOptionFloat(dict, "price")->Option.getExn(~message="price not found"),
          priceWithCurrency: dict
          ->Dict.get("priceWithCurrency")
          ->Option.getExn(~message="priceWithCurrency is not found")
          ->decodePriceAPIEntity
          ->Utils.getResultExn(~message="priceWithCurrency is coming as undefined"),
          quantity: getOptionInt(dict, "quantity")->Option.getExn(~message="quantity not found"),
          quoteId: getOptionString(dict, "quoteId")->Option.getExn(~message="quoteId not found"),
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
          serviceTierDescription: getOptionString(dict, "serviceTierDescription"),
          serviceTierLongName: getOptionString(dict, "serviceTierLongName"),
          serviceTierShortName: getOptionString(dict, "serviceTierShortName"),
          serviceTierType: ServiceTierType.decodeServiceTierTypeResult(
            dict,
            "serviceTierType",
          )->Result.mapOr(None, x => Some(x)),
          stations: dict
          ->Dict.get("stations")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="stations is not of array")
          ->Array.map(x =>
            decodeFRFSStationAPI(x)->Utils.getResultExn(~message="stations is coming as undefined")
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
      Console.log2("FRFSQuoteAPIRes ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: fRFSQuoteAPIRes) => {
  req->asJson
}
