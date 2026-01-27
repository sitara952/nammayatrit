open Enums
open Utils

@genType
type legSplitInfo = {
  amount: float,
  status: RefundStatus.refundStatus,
}

let decodeLegSplitInfo = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          amount: getOptionFloat(dict, "amount")->Option.getExn(~message="amount not found"),
          status: RefundStatus.decodeRefundStatusResult(dict, "status")->Utils.getResultExn(
            ~message="status is coming as undefined",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("LegSplitInfo ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: legSplitInfo) => {
  req->asJson
}
