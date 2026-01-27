open Enums
open CustomTab
open Faq
open Fee
open Metadata
open Rule
open Utils

@genType
type ticketPlace = {
  allowSameDayBooking: bool,
  assignTicketToBpp: bool,
  closeTimings: option<string>,
  createdAt: string,
  customTabs: option<array<customTab>>,
  description: option<string>,
  endDate: option<string>,
  faqs: option<array<faq>>,
  gallery: array<string>,
  iconUrl: option<string>,
  id: string,
  isClosed: bool,
  isRecurring: bool,
  lat: option<float>,
  lon: option<float>,
  mapImageUrl: option<string>,
  merchantId: option<string>,
  merchantOperatingCityId: string,
  metadata: option<array<metadata>>,
  name: string,
  openTimings: option<string>,
  placeType: PlaceType.placeType,
  platformFee: option<fee>,
  platformFeeVendor: option<string>,
  pricingOnwards: option<int>,
  priority: int,
  recommend: bool,
  rules: option<array<rule>>,
  shortDesc: string,
  startDate: option<string>,
  status: PlaceStatus.placeStatus,
  termsAndConditions: array<string>,
  termsAndConditionsUrl: option<string>,
  ticketMerchantId: option<string>,
  updatedAt: string,
  venue: option<string>,
}

let decodeTicketPlace = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          allowSameDayBooking: getOptionBool(dict, "allowSameDayBooking")->Option.getExn(
            ~message="allowSameDayBooking not found",
          ),
          assignTicketToBpp: getOptionBool(dict, "assignTicketToBpp")->Option.getExn(
            ~message="assignTicketToBpp not found",
          ),
          closeTimings: getOptionString(dict, "closeTimings"),
          createdAt: getOptionString(dict, "createdAt")->Option.getExn(
            ~message="createdAt not found",
          ),
          customTabs: dict
          ->Dict.get("customTabs")
          ->Option.flatMap(jsonNullToOption)
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.map(arr =>
            arr->Array.map(x =>
              decodeCustomTab(x)->Utils.getResultExn(~message="customTabs is coming as undefined")
            )
          ),
          description: getOptionString(dict, "description"),
          endDate: getOptionString(dict, "endDate"),
          faqs: dict
          ->Dict.get("faqs")
          ->Option.flatMap(jsonNullToOption)
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.map(arr =>
            arr->Array.map(x =>
              decodeFaq(x)->Utils.getResultExn(~message="faqs is coming as undefined")
            )
          ),
          gallery: getOptionStrArrayFromDict(dict, "gallery")->Option.getExn(
            ~message="gallery not found",
          ),
          iconUrl: getOptionString(dict, "iconUrl"),
          id: getOptionString(dict, "id")->Option.getExn(~message="id not found"),
          isClosed: getOptionBool(dict, "isClosed")->Option.getExn(~message="isClosed not found"),
          isRecurring: getOptionBool(dict, "isRecurring")->Option.getExn(
            ~message="isRecurring not found",
          ),
          lat: getOptionFloat(dict, "lat"),
          lon: getOptionFloat(dict, "lon"),
          mapImageUrl: getOptionString(dict, "mapImageUrl"),
          merchantId: getOptionString(dict, "merchantId"),
          merchantOperatingCityId: getOptionString(dict, "merchantOperatingCityId")->Option.getExn(
            ~message="merchantOperatingCityId not found",
          ),
          metadata: dict
          ->Dict.get("metadata")
          ->Option.flatMap(jsonNullToOption)
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.map(arr =>
            arr->Array.map(x =>
              decodeMetadata(x)->Utils.getResultExn(~message="metadata is coming as undefined")
            )
          ),
          name: getOptionString(dict, "name")->Option.getExn(~message="name not found"),
          openTimings: getOptionString(dict, "openTimings"),
          placeType: PlaceType.decodePlaceTypeResult(dict, "placeType")->Utils.getResultExn(
            ~message="placeType is coming as undefined",
          ),
          platformFee: dict
          ->Dict.get("platformFee")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeFee(x)->Result.mapOr(None, x => Some(x))),
          platformFeeVendor: getOptionString(dict, "platformFeeVendor"),
          pricingOnwards: getOptionInt(dict, "pricingOnwards"),
          priority: getOptionInt(dict, "priority")->Option.getExn(~message="priority not found"),
          recommend: getOptionBool(dict, "recommend")->Option.getExn(
            ~message="recommend not found",
          ),
          rules: dict
          ->Dict.get("rules")
          ->Option.flatMap(jsonNullToOption)
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.map(arr =>
            arr->Array.map(x =>
              decodeRule(x)->Utils.getResultExn(~message="rules is coming as undefined")
            )
          ),
          shortDesc: getOptionString(dict, "shortDesc")->Option.getExn(
            ~message="shortDesc not found",
          ),
          startDate: getOptionString(dict, "startDate"),
          status: PlaceStatus.decodePlaceStatusResult(dict, "status")->Utils.getResultExn(
            ~message="status is coming as undefined",
          ),
          termsAndConditions: getOptionStrArrayFromDict(dict, "termsAndConditions")->Option.getExn(
            ~message="termsAndConditions not found",
          ),
          termsAndConditionsUrl: getOptionString(dict, "termsAndConditionsUrl"),
          ticketMerchantId: getOptionString(dict, "ticketMerchantId"),
          updatedAt: getOptionString(dict, "updatedAt")->Option.getExn(
            ~message="updatedAt not found",
          ),
          venue: getOptionString(dict, "venue"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("TicketPlace ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: ticketPlace) => {
  req->asJson
}
