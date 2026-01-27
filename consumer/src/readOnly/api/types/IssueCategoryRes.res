open Enums
open Utils

@genType
type issueCategoryRes = {
  allowedRideStatuses: option<array<RideStatus.rideStatus>>,
  category: string,
  categoryType: CategoryType.categoryType,
  isRideRequired: bool,
  isTicketRequired: bool,
  issueCategoryId: string,
  label: string,
  logoUrl: string,
  maxAllowedRideAge: option<int>,
}

let decodeIssueCategoryRes = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          allowedRideStatuses: dict
          ->Dict.get("allowedRideStatuses")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.map(arr =>
            arr->Array.map(x =>
              RideStatus.decodeRideStatus(x)->Utils.getResultExn(
                ~message="allowedRideStatuses is coming as undefined",
              )
            )
          ),
          category: getOptionString(dict, "category")->Option.getExn(~message="category not found"),
          categoryType: CategoryType.decodeCategoryTypeResult(
            dict,
            "categoryType",
          )->Utils.getResultExn(~message="categoryType is coming as undefined"),
          isRideRequired: getOptionBool(dict, "isRideRequired")->Option.getExn(
            ~message="isRideRequired not found",
          ),
          isTicketRequired: getOptionBool(dict, "isTicketRequired")->Option.getExn(
            ~message="isTicketRequired not found",
          ),
          issueCategoryId: getOptionString(dict, "issueCategoryId")->Option.getExn(
            ~message="issueCategoryId not found",
          ),
          label: getOptionString(dict, "label")->Option.getExn(~message="label not found"),
          logoUrl: getOptionString(dict, "logoUrl")->Option.getExn(~message="logoUrl not found"),
          maxAllowedRideAge: getOptionInt(dict, "maxAllowedRideAge"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("IssueCategoryRes ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: issueCategoryRes) => {
  req->asJson
}
