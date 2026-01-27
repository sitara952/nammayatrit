open Enums
open Rule
open Utils

@genType
type ticketSubPlace = {
  createdAt: string,
  description: option<string>,
  enforcedTicketPlaceId: option<string>,
  id: string,
  isActive: bool,
  merchantId: option<string>,
  merchantOperatingCityId: option<string>,
  name: string,
  rules: option<array<rule>>,
  subPlaceType: SubPlaceType.subPlaceType,
  ticketPlaceId: string,
  updatedAt: string,
}

let decodeTicketSubPlace = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          createdAt: getOptionString(dict, "createdAt")->Option.getExn(
            ~message="createdAt not found",
          ),
          description: getOptionString(dict, "description"),
          enforcedTicketPlaceId: getOptionString(dict, "enforcedTicketPlaceId"),
          id: getOptionString(dict, "id")->Option.getExn(~message="id not found"),
          isActive: getOptionBool(dict, "isActive")->Option.getExn(~message="isActive not found"),
          merchantId: getOptionString(dict, "merchantId"),
          merchantOperatingCityId: getOptionString(dict, "merchantOperatingCityId"),
          name: getOptionString(dict, "name")->Option.getExn(~message="name not found"),
          rules: dict
          ->Dict.get("rules")
          ->Option.flatMap(jsonNullToOption)
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.map(arr =>
            arr->Array.map(x =>
              decodeRule(x)->Utils.getResultExn(~message="rules is coming as undefined")
            )
          ),
          subPlaceType: SubPlaceType.decodeSubPlaceTypeResult(
            dict,
            "subPlaceType",
          )->Utils.getResultExn(~message="subPlaceType is coming as undefined"),
          ticketPlaceId: getOptionString(dict, "ticketPlaceId")->Option.getExn(
            ~message="ticketPlaceId not found",
          ),
          updatedAt: getOptionString(dict, "updatedAt")->Option.getExn(
            ~message="updatedAt not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("TicketSubPlace ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: ticketSubPlace) => {
  req->asJson
}
