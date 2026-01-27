open Enums
open CategoriesResp
open OperationalDate
open Utils

@genType
type businessHourResp = {
  categories: array<categoriesResp>,
  endTime: option<string>,
  id: string,
  operationalDate: option<operationalDate>,
  operationalDays: array<string>,
  slot: option<string>,
  specialDayDescription: option<string>,
  specialDayType: option<SpecialDayType.specialDayType>,
  startTime: option<string>,
}

let decodeBusinessHourResp = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          categories: dict
          ->Dict.get("categories")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="categories is not of array")
          ->Array.map(x =>
            decodeCategoriesResp(x)->Utils.getResultExn(
              ~message="categories is coming as undefined",
            )
          ),
          endTime: getOptionString(dict, "endTime"),
          id: getOptionString(dict, "id")->Option.getExn(~message="id not found"),
          operationalDate: dict
          ->Dict.get("operationalDate")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeOperationalDate(x)->Result.mapOr(None, x => Some(x))),
          operationalDays: getOptionStrArrayFromDict(dict, "operationalDays")->Option.getExn(
            ~message="operationalDays not found",
          ),
          slot: getOptionString(dict, "slot"),
          specialDayDescription: getOptionString(dict, "specialDayDescription"),
          specialDayType: SpecialDayType.decodeSpecialDayTypeResult(
            dict,
            "specialDayType",
          )->Result.mapOr(None, x => Some(x)),
          startTime: getOptionString(dict, "startTime"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("BusinessHourResp ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: businessHourResp) => {
  req->asJson
}
