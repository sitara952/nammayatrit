open Enums
open PassDetailsAPIEntity
open PurchasedPassTransactionAPIEntity
open Utils

@genType
type purchasedPassAPIEntity = {
  daysToExpire: int,
  deviceMismatch: bool,
  deviceSwitchAllowed: bool,
  expiryDate: string,
  id: string,
  lastVerifiedVehicleNumber: option<string>,
  passEntity: passDetailsAPIEntity,
  passNumber: string,
  profilePicture: option<string>,
  purchaseDate: string,
  startDate: string,
  status: MultimodalPassListStatus.multimodalPassListStatus,
  tripsLeft: option<int>,
  isAutoVerified: bool,
  futureRenewals: array<purchasedPassTransactionAPIEntity>,
} 

let decodePurchasedPassAPIEntity = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          daysToExpire: getOptionInt(dict, "daysToExpire")->Option.getExn(
            ~message="daysToExpire not found",
          ),
          deviceMismatch: getOptionBool(dict, "deviceMismatch")->Option.getExn(
            ~message="deviceMismatch not found",
          ),
          deviceSwitchAllowed: getOptionBool(dict, "deviceSwitchAllowed")->Option.getExn(
            ~message="deviceSwitchAllowed not found",
          ),
          expiryDate: getOptionString(dict, "expiryDate")->Option.getExn(
            ~message="expiryDate not found",
          ),
          id: getOptionString(dict, "id")->Option.getExn(~message="id not found"),
          lastVerifiedVehicleNumber: getOptionString(dict, "lastVerifiedVehicleNumber"),
          passEntity: dict
          ->Dict.get("passEntity")
          ->Option.getExn(~message="passEntity is not found")
          ->decodePassDetailsAPIEntity
          ->Utils.getResultExn(~message="passEntity is coming as undefined"),
          passNumber: getOptionString(dict, "passNumber")->Option.getExn(
            ~message="passNumber not found",
          ),
          purchaseDate: getOptionString(dict, "purchaseDate")->Option.getExn(
            ~message="purchaseDate not found",
          ),
          startDate: getOptionString(dict, "startDate")->Option.getExn(
            ~message="startDate not found",
          ),
          status: MultimodalPassListStatus.decodeMultimodalPassListStatusResult(
            dict,
            "status",
          )->Utils.getResultExn(~message="status is coming as undefined"),
          tripsLeft: getOptionInt(dict, "tripsLeft"),
          profilePicture: getOptionString(dict, "profilePicture"),
          isAutoVerified: switch getOptionBool(dict, "isAutoVerified") {
          | Some(v) => v
          | None =>
            switch getOptionBool(dict, "isAutoActivated") {
            | Some(v) => v
            | None => false
            }
          },
          futureRenewals: switch dict->Dict.get("futureRenewals") {
          | Some(value) =>
            switch value->Js.Json.decodeArray {
            | Some(arr) =>
              arr->Array.filterMap(x =>
                switch decodePurchasedPassTransactionAPIEntity(x) {
                | Ok(item) => Some(item)
                | Error(_) => None
                }
              )
            | None => []
            }
          | None => []
          },
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("PurchasedPassAPIEntity ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: purchasedPassAPIEntity) => {
  req->asJson
}
