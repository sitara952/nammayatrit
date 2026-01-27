open Enums
open Utils

@genType
type payoutItem = {
  amount: float,
  orderId: string,
  payoutAt: string,
  payoutStatus: PayoutStatus.payoutStatus,
  vpa: option<string>,
}

let decodePayoutItem = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          amount: getOptionFloat(dict, "amount")->Option.getExn(~message="amount not found"),
          orderId: getOptionString(dict, "orderId")->Option.getExn(~message="orderId not found"),
          payoutAt: getOptionString(dict, "payoutAt")->Option.getExn(~message="payoutAt not found"),
          payoutStatus: PayoutStatus.decodePayoutStatusResult(
            dict,
            "payoutStatus",
          )->Utils.getResultExn(~message="payoutStatus is coming as undefined"),
          vpa: getOptionString(dict, "vpa"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("PayoutItem ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: payoutItem) => {
  req->asJson
}
