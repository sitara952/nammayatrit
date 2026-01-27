open Enums
open Utils

@genType
type purchasedPassTransactionAPIEntity = {
  amount: float,
  endDate: string,
  passName: option<string>,
  passCode: string,
  createdAt: string,
  startDate: string,
  status: MultimodalPassListStatus.multimodalPassListStatus,
}

let decodePurchasedPassTransactionAPIEntity = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          amount: getOptionFloat(dict, "amount")->Option.getExn(~message="amount not found"),
          endDate: getOptionString(dict, "endDate")->Option.getExn(~message="endDate not found"),
          startDate: getOptionString(dict, "startDate")->Option.getExn(
            ~message="startDate not found",
          ),
          passName: getOptionString(dict, "passName"),
          passCode: getOptionString(dict, "passCode")->Option.getExn(~message="passCode not found"),
          createdAt: getOptionString(dict, "createdAt")->Option.getExn(
            ~message="createdAt not found",
          ),
          status: MultimodalPassListStatus.decodeMultimodalPassListStatusResult(
            dict,
            "status",
          )->Utils.getResultExn(~message="status is coming as undefined"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("PurchasedPassTransactionAPIEntity ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: purchasedPassTransactionAPIEntity) => {
  req->asJson
}
